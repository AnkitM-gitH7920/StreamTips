import { asyncHandler } from "../../utilities/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../../utilities/jwtOperations.js";
import APIError from "../../utilities/APIError.js";
import APIResponse from "../../utilities/APIResponse.js";
import RegisteredUsers from "../../database/registeredUsers.databases.js";
import { issueCookieOptions } from "../../utilities/cookiesOptions.js";
import chalk from "chalk";
import jwt from "jsonwebtoken";

const allowedLoginTypes = ["google", "magicLink", "guest"];
const JWTAccessSecret = process.env.JWT_ACCESS_SECRET;
const JWTRefreshSecret = process.env.JWT_REFRESH_SECRET;

const verifyMagicLinkUser = asyncHandler(async (req, res, next) => {
     const token = req.query.token;
     const accessToken = req.cookies?.user_session_A || req.headers.authorization?.replace("Bearer ", "");
     const refreshToken = req.cookies?.user_session_R || req.headers.authorization?.replace("Bearer ", "");

     if (!token) throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED" });
     if (!accessToken && !refreshToken && token) return next();

     if (refreshToken && !accessToken) {
          const decodedToken = jwt.decode(refreshToken);
          if (!allowedLoginTypes.includes(decodedToken.loginType)) {
               throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
          }

          try {
               const verifiedToken = await jwt.verify(refreshToken, JWTRefreshSecret);

               const storedUser = await RegisteredUsers.findOne({ refreshToken, loginType: "magicLink" });
               if (!storedUser) {
                    return res
                         .status(401)
                         .clearCookie("user_session_A")
                         .clearCookie("user_session_R")
                         .json({
                              statusCode: 401,
                              message: "Cannot continue at the moment",
                              success: false,
                              data: { error: "UNAUTHORISED_ACCESS" },
                         });
               }
               const newAccessToken = await generateAccessToken(
                    {
                         email: verifiedToken.email,
                         accountCreatedAt: verifiedToken.accountCreatedAt,
                         loginType: "magicLink",
                    },
                    "15d",
               );

               const newRefreshToken = await generateRefreshToken(
                    {
                         email: verifiedToken.email,
                         accountCreatedAt: verifiedToken.accountCreatedAt,
                         loginType: "magicLink",
                    },
                    "30d",
               );
               if (!newAccessToken || !newRefreshToken) {
                    return res.status(500).json({
                         statusCode: 500,
                         message: "Something went wrong, please try again later",
                         success: false,
                         data: { error: "SERVER_ERROR" },
                    });
               }

               return res
                    .status(200)
                    .cookie("user_session_A", newAccessToken, issueCookieOptions("access"))
                    .cookie("user_session_R", newRefreshToken, issueCookieOptions("access"));
          } catch (error) {
               console.log(
                    `${chalk.grey(`[${error.name}]`)}  ${chalk.blue(`${[error.message]}`)}[${decodedToken.email}]`,
               );
               if (error.name === "JsonWebTokenError")
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
               if (error.name === "NotBeforeError")
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
               if (error.name === "NotBeforeError") {
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
               }
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }
     }

     // When both access token and refresh tokens are present
     if (accessToken && refreshToken) {
          const decodedAccessToken = jwt.decode(accessToken);
          try {
               await jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
               const storedUser = await RegisteredUsers.findOne({ refreshToken })
                    .select("email fullName loggedInOn contactNumber loginType")
                    .select("-_id")
                    .lean();
               if (!storedUser) {
                    console.log(
                         chalk.red(
                              `Got both tokens, but user cant be found in db with EMAIL :- ${decodedAccessToken.email}`,
                         ),
                    );
                    return res
                         .status(401)
                         .clearCookie("accessToken")
                         .clearCookie("refreshToken")
                         .json({
                              statusCode: 401,
                              message: "Cannot continue at the moment",
                              success: false,
                              data: { error: "SERVER_ERROR" },
                         });
               }

               return res.status(200).json(
                    new APIResponse(200, "User verified successfully", {
                         email: storedUser.email,
                         fullName: storedUser.fullName,
                         contactNumber: storedUser.contactNumber,
                         loginType: storedUser.loginType,
                         accessToken: accessToken,
                    }),
               );
          } catch (error) {
               console.log(error);
               if (error.name === "TokenExpiredError") {
                    console.log(chalk.red(`accessToken expired for user :- ${decodedAccessToken?.email}`));
                    const tokenVerifyResult = await verifyRegisteredUserRefreshToken({
                         email: decodedAccessToken.email,
                         fullName: decodedAccessToken.fullName,
                         loginType: decodedAccessToken.loginType,
                         refreshToken,
                    });
                    if (
                         tokenVerifyResult === "USER_NOT_FOUND" ||
                         tokenVerifyResult === "TOKEN_MISMATCH" ||
                         tokenVerifyResult === "SERVER_ERROR"
                    ) {
                         throw new APIError(500, "Something went wrong, please try again later", {
                              error: "SERVER_ERROR",
                         });
                    } else if (tokenVerifyResult.refreshTokenUpdated) {
                         return res
                              .status(200)
                              .cookie("accessToken", tokenVerifyResult.newAccessToken, issueCookieOptions("access"))
                              .cookie("refreshToken", tokenVerifyResult.newRefreshToken, issueCookieOptions("refresh"))
                              .json(
                                   new APIResponse(200, "Successfully generated new OAuth session", {
                                        accessToken: tokenVerifyResult.newAccessToken,
                                   }),
                              );
                    } else if (tokenVerifyResult.isSessionExpired) {
                         return res
                              .status(401)
                              .clearCookie("accessToken")
                              .clearCookie("refreshToken")
                              .json(new APIResponse(401, "User session has been expired, please relogin", undefined));
                    }
               } else if (error.name === "NotBeforeError" || error.name === "JsonWebTokenError") {
                    console.log(chalk.red(`Malformed token provided by :- ${decodedAccessToken.email}`));
                    return res
                         .status(401)
                         .clearCookie("accessToken")
                         .clearCookie("refreshToken")
                         .json({
                              statusCode: 401,
                              message: "Cannot continue at the moment",
                              success: false,
                              data: { error: "TOKEN_MALFORMED" },
                         });
               } else {
                    throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
               }
          }
     }
});


export { verifyMagicLinkUser }