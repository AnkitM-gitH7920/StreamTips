import { asyncHandler } from "../utilities/asyncHandler.js";
import APIResponse from "../utilities/APIResponse.js";
import { generateAccessToken, generateRefreshToken } from "../utilities/jwtOperations.js";
import APIError from "../utilities/APIError.js";
import GuestUser from "../database/guestUsers.databases.js";
import crypto from "node:crypto";
import chalk from "chalk";
import { issueCookieOptions } from "../utilities/cookiesOptions.js";

const guestRegisterController = asyncHandler(async (req, res, next) => {
     const createdOn = Date.now(); //provides the timestamps
     const generatedUniqueGuestID = "guest_" + crypto.randomUUID();

     const guestAccessToken = await generateAccessToken("guest", { guestID: generatedUniqueGuestID, loginType: "guest" }, "15d"); //Access token
     const guestRefreshToken = await generateRefreshToken("guest", { guestID: generatedUniqueGuestID, loginType: "guest" }, "30d"); //Refresh token
     if (!guestAccessToken || !guestRefreshToken) {
          console.log(chalk.bgRed("Guest token generation error while registering guest user"));
          throw new APIError(500, "Something went wrong, please try again later", { error: "TOKEN_GENERATION_ERROR" });
     }

     try {
          const createdUser = await GuestUser.create({
               guestID: generatedUniqueGuestID,
               createdOn: createdOn,
               refreshToken: guestRefreshToken
          })
          if (!createdUser) {
               console.log(chalk.bgRed("DATABASE_ERROR: Cannot create guest user database document"))
               throw new APIError(500, "Something went wrong while logging in the user", { error: "SERVER_ERROR" });
          }

     } catch (mongoDBError) {
          console.log(chalk.bgRed("CATCHED DB ERROR"));
          console.log(mongoDBError)
          throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" })
     }

     console.log(chalk.green("Successfully created guest user"))
     return res
          .status(200)
          .cookie("guestAccessToken", guestAccessToken, issueCookieOptions("access"))
          .cookie("guestRefreshToken", guestRefreshToken, issueCookieOptions("refresh"))
          .json(new APIResponse(200, "Response", {
               message: "Guest account created successfully",
               guestID: generatedUniqueGuestID,
               guestAccessToken: guestAccessToken
          }))
})
export { guestRegisterController }
