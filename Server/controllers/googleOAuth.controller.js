import { asyncHandler } from "../utilities/asyncHandler.js";
import APIError from "../utilities/APIError.js";
import APIResponse from "../utilities/APIResponse.js";
import { OAuth2Client } from "google-auth-library";
import { generateAccessToken, generateRefreshToken } from "../utilities/jwtOperations.js";
import axios from "axios";
import chalk from "chalk";
import { issueCookieOptions } from "../utilities/cookiesOptions.js";
import RegisteredUsers from "../database/registeredUsers.databases.js";

const googleOAuth = asyncHandler(async (req, res, next) => {
     const params = new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          response_type: "code",
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
     })

     res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)

})
const googleOAuthCallback = asyncHandler(async (req, res, next) => {
     const { code } = req.query;
     const createdOn = Date.now();

     if (!code) throw new APIError(500, "Something went wrong while authentication, please try again later")

     let data;
     try {
          let { data: axiosData } = await axios.post("https://oauth2.googleapis.com/token", {
               code,
               client_id: process.env.GOOGLE_CLIENT_ID,
               client_secret: process.env.GOOGLE_SECRET,
               redirect_uri: process.env.GOOGLE_REDIRECT_URI,
               grant_type: "authorization_code",
          })

          data = { ...axiosData };
     } catch (error) {
          console.log("Error in googleAuth: ");
          console.log(error)
          throw new APIError(500, "Something went wrong while authentication, please try again later");
     }

     const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
     const ticket = await client.verifyIdToken({
          idToken: data.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
     });

     const { email, name, email_verified, iat, exp } = ticket.getPayload();
     const OAuthAccessToken = await generateAccessToken("registered", { email, fullName: name, loginType: "google" }, "15d");
     const OAuthRefreshToken = await generateRefreshToken("registered", { email, fullName: name, loginType: "google" }, "30d");
     if (!OAuthAccessToken || !OAuthRefreshToken) {
          console.log(chalk.red("Cannot generate tokens in O auth user registeration"))
          throw new APIError(500, "Something went wrong while verification, please try again later", { error: "TOKEN_GENERATION_ERROR" });
     }


     const existingUser = await RegisteredUsers.findOne({ email });
     if(existingUser && existingUser.isLoggedOut){
          console.log(existingUser.loginType)
          if(existingUser.loginType !== "google") throw new APIError(409, "Email is already registered with a different login method", { error: "USER_EXISTS" });

          existingUser.refreshToken = OAuthRefreshToken;
          existingUser.isLoggedOut = false;

          const savedUserInfo = await existingUser.save();
          if(!savedUserInfo){
               console.log(chalk.red("Error updating returning user information in OAuth controller"));
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }

          return res
          .status(200)
          .cookie("OAuthAccessToken", OAuthAccessToken, issueCookieOptions("access"))
          .cookie("OAuthRefreshToken", OAuthRefreshToken, issueCookieOptions("refresh"))
          .json(new APIResponse(200, "User logged in successfully", "Data to be returned")) //return data here
     }

     try {
          const createdOAuthUser = await RegisteredUsers.create({
               email: email,
               fullName: name,
               loggedInOn: createdOn,
               isVerified: email_verified,
               loginType: "google",
               refreshToken: OAuthRefreshToken
          })
          if (!createdOAuthUser) {
               console.log(chalk.red("Failed to create OAuth user entry in database"));
               throw new APIError(500, "Something went wrong while registering the user, please try again later", { error: "SERVER_ERROR" });
          }

          return res
               .status(200)
               .cookie("OAuthAccessToken", OAuthAccessToken, issueCookieOptions("access"))
               .cookie("OAuthRefreshToken", OAuthRefreshToken, issueCookieOptions("refresh"))
               .json(new APIResponse(200, "User logged in successfully", {
                    email: email,
                    fullName: name,
                    loggedInOn: new Date(Number.parseInt(createdOn)),
                    loginType: "google",
                    OAuthAccessToken: OAuthAccessToken
               }))


     } catch (dbError) {
          if (dbError.code === 11000) throw new APIError(409, "Email is already registered", { error: "USER_EXISTS" });

          console.log(chalk.red("Error occured in function: googleOAuthCallback() caused by DBError"));
          console.log(dbError);
          throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });

     }
})


export {
     googleOAuth,
     googleOAuthCallback
}
