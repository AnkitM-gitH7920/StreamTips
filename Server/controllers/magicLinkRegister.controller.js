import { asyncHandler } from "../utilities/asyncHandler.js";
import APIError from "../utilities/APIError.js";
import validator from "validator";
import redis from "../index.js";
import jwt from "jsonwebtoken";
import chalk from "chalk";
import APIResponse from "../utilities/APIResponse.js";
import { magicLinkMailer } from "../utilities/magicLinkMailer.js";
import { generateAccessToken, generateRefreshToken } from "../utilities/jwtOperations.js";
import RegisteredUsers from "../database/registeredUsers.databases.js";
import { issueCookieOptions } from "../utilities/cookiesOptions.js";

// API URLS
/*
POST /v1/auth/magic-link/send      → to send the emal body to user
GET  /v1/auth/magic-link/verify    → to verify the token on clicking the verify button in email
*/

const consumeMagicToken = async function (email, token) {
     const result = redis.eval(
          `
          local value = redis.call("GET", KEYS[1])

          if not value then
            return 0
          end

          if value ~= ARGV[1] then
             return -1
          end

          redis.call("DEL", KEYS[1])
          return 1
          `,
          1,
          email,
          token
     );

     return result;
}

const magicLinkMailSendController = asyncHandler(async (req, res, next) => {
     /*
     # STEPS:-
     1. generate token with email and creation timestamps(exp: 10minutes)
     2. store user in Cache (hash:token) (ttl: 10minutes)
     3. send mail to user
     */
     const email = req.body.email.trim().toLowerCase();
     if (!email) throw new APIError(400, "Email is required", { error: "UNPROCESSABLE_ENTITY" });

     const emailValidation = validator.isEmail(email);
     if (!emailValidation) throw new APIError(422, "Invalid email", { error: "UNPROCESSABLE_ENTITY" });

     const creationTimestamp = Math.floor(Date.now() / 1000);
     const expiresAt = creationTimestamp + (60 * 10);
     const token = await jwt.sign({
          email: email,
          generatedAt: creationTimestamp
     }, process.env.MAGIC_LINK_SESSION_KEY, { expiresIn: "10m" });

     // Handle caching operations
     try {
          const cacheUser = await redis.set(token, email, "EXAT", expiresAt);
          if (cacheUser !== "OK") {
               console.log(chalk.red(`Error Storing user in cache : ${email}`));
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }

     } catch (redisErr) {
          console.log(redisErr);
          throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
     }

     // Handle mailing service
     try { await magicLinkMailer(email, "Your login email has arrived", token) }
     catch (mailError) {
          console.log(mailError);
          await redis.del(token); //Invalidate recently stored user token
          throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" })
     }

     return res.status(200).json(new APIResponse(200, "Mail sent to user", { email: email, genAt: creationTimestamp, expAt: expiresAt }));
})

const magicLinkMailVerifyController = asyncHandler(async (req, res, next) => {
     const token = req.query.token;
     if (!token) throw new APIError(401, "Token not provided", { error: "UNAUTHORISED" });

     // Handle magic token verification
     let decodedToken;
     try { decodedToken = jwt.verify(token, process.env.MAGIC_LINK_SESSION_KEY) }
     catch (jwtError) {
          if (jwtError.name === "TokenExpiredError") {
               const cacheUser = await redis.get(token);
               if (cacheUser) {
                    await redis.del(token);
                    throw new APIError(401, "Your token has been expired, please relogin", { error: "UNAUTHORISED" });
               }
               throw new APIError(401, "Login link has been expired, please relogin", { error: "UNAUTHORISED" });
          }
          if (jwtError.name === "NotBeforeError") throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED" });
          if (jwtError.name === "JsonWebTokenError") throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED" });

          console.log(jwtError);
          throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
     }

     // Handle redis operations
     let storedUserEmail;
     try {
          storedUserEmail = await redis.get(token);
          if (!storedUserEmail) {
               return res
                    .status(401)
                    .json({
                         success: false,
                         message: "Invalid or expired token provided, please relogin",
                         statusCode: 401,
                         data: { error: "UNAUTHORISED" }
                    })
          }

          if (storedUserEmail !== decodedToken.email) {
               console.log(chalk.red(`Invalid token provided : ${decodedToken.email}`));
               return res
                    .status(401)
                    .json({
                         success: false,
                         message: "Invalid token provided",
                         statusCode: 401,
                         data: { error: "UNAUTHORISED" }
                    })
          }

          await redis.del(token); //Invalidate verified token

          // const result = await consumeMagicToken(storedUserEmail, token);
          // if (result === 0) {
          //      return res
          //           .status(401)
          //           .json({
          //                success: false,
          //                message: "Invalid or expired token provided, please relogin",
          //                statusCode: 401,
          //                data: { error: "UNAUTHORISED" }
          //           })
          // }
          // if (result === -1) {
          //      return res
          //           .status(401)
          //           .json({
          //                success: false,
          //                message: "Invalid token provided",
          //                statusCode: 401,
          //                data: { error: "UNAUTHORISED" }
          //           })
          // }

     } catch (redisError) {
          console.log(redisError);
          throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
     }

     // After verification :- Store user in main db
     const accessToken = await generateAccessToken("magicLink", { email: storedUserEmail }, "15d");
     const refreshToken = await generateRefreshToken("magicLink", { email: storedUserEmail }, "15d");
     if (!accessToken || !refreshToken) throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });

     let storeUser;
     try {
          const dbData = {
               email: storedUserEmail,
               contactNumber: undefined,
               fullName: undefined,
               isLoggedOut: false,
               isVerified: true,
               loginType: "magicLink",
               refreshToken: refreshToken
          };

          storeUser = await RegisteredUsers.create(dbData);
          if (!storeUser) {
               console.log(chalk.red(`Cannot create user in db : ${storedUserEmail}`));
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }

     } catch (dbError) {
          console.log(dbError);
          throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
     }

     // Start by creating middleware

     const { email, fullName, loggedInOn, contactNumber, loginType } = storeUser;
     return res
          .status(200)
          .cookie("accessToken", accessToken, issueCookieOptions("access"))
          .cookie("refreshToken", refreshToken, issueCookieOptions("refresh"))
          .json(new APIResponse(200, "User logged in successfully", { email, fullName, loggedInOn, contactNumber, loginType }))
})
export {
     magicLinkMailSendController,
     magicLinkMailVerifyController
}
