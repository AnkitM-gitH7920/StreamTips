import { asyncHandler } from "../../utilities/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../../utilities/jwtOperations.js";
import APIError from "../../utilities/APIError.js";
import APIResponse from "../../utilities/APIResponse.js";
import GuestUser from "../../database/guestUsers.databases.js";
import RegisteredUsers from "../../database/registeredUsers.databases.js";
import { issueCookieOptions } from "../../utilities/cookiesOptions.js";
import chalk from "chalk";
import jwt from "jsonwebtoken";

const allowedLoginTypes = ["google", "magicLink", "guest"];
const JWTAccessSecret = process.env.JWT_ACCESS_SECRET;
const JWTRefreshSecret = process.env.JWT_REFRESH_SECRET;

async function verifyRegisteredUserRefreshToken(data) {
     const { email, fullName, loginType, refreshToken } = data;
     try {
          await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          const storedUser = await RegisteredUsers.findOne({ refreshToken });
          if (!storedUser) return "USER_NOT_FOUND";

          const newAccessToken = await generateAccessToken("registered", { email, fullName, loginType }, "15d");
          const newRefreshToken = await generateRefreshToken("registered", { email, fullName, loginType }, "30d");
          if (!newAccessToken || !newRefreshToken) {
               console.log(chalk.red("Token generation error in verifyOAuthRefreshToken()"));
               return "SERVER_ERROR";
          }

          storedUser.refreshToken = newRefreshToken;
          await storedUser.save();

          return {
               refreshTokenUpdated: true,
               newAccessToken,
               newRefreshToken,
          };
     } catch (error) {
          console.log(chalk.red("Error in OAuth verifier function :-"));
          console.log(error);
          if (error.name === "TokenExpiredError") {
               const expiredUser = await RegisteredUsers.findOneAndUpdate(
                    { refreshToken },
                    { isLoggedOut: true, refreshToken: null },
                    { returnDocument: "after" },
               );
               if (!expiredUser) return "SERVER_ERROR";
               return { isSessionExpired: true };
          } else {
               console.log(chalk.red("Something went wrong in verifyRegisteredUserRefreshToken()"));
               return "SERVER_ERROR";
          }
     }
}
const verifyOAuthUser = asyncHandler(async (req, res, next) => {
     const OAuthAccessToken = req.cookies.OAuthAccessToken;
     const OAuthRefreshToken = req.cookies.OAuthRefreshToken;

     // No access and refresh Tokens
     if (!OAuthAccessToken && !OAuthRefreshToken) return next();

     // No access token but refresh token
     if (!OAuthAccessToken && OAuthRefreshToken) {
          const decodedUserInfo = jwt.decode(OAuthRefreshToken);
          if (!decodedUserInfo || decodedUserInfo.loginType !== "google" || !decodedUserInfo.email) {
               console.log(
                    chalk.red(
                         `Edited token provided by USERID :- ${decodedUserInfo?.email ? decodedUserInfo.email : "<TOKEN: EMAIL_NOT_FOUND>"}`,
                    ),
               );
               return res
                    .status(401)
                    .clearCookie("OAuthRefreshToken")
                    .json({
                         statusCode: 401,
                         message: "Cannot continue at the  moment",
                         success: false,
                         data: { error: "TOKEN_MALFORMED" },
                    });
          }

          try {
               const decodedUserRefreshToken = await jwt.verify(OAuthRefreshToken, process.env.JWT_REFRESH_SECRET);
               const storedUserInfo = await RegisteredUsers.findOne({ email: decodedUserRefreshToken.email });
               if (!storedUserInfo) {
                    console.log(
                         chalk.red(
                              `Got oAuth refresh token but user cannot be found in DB with EMAIL :- ${decodedUserInfo?.email}`,
                         ),
                    );
                    return res
                         .status(500)
                         .clearCookie("OAuthRefreshToken")
                         .json({
                              statusCode: 500,
                              message: "Something went wrong, please try again later",
                              success: false,
                              data: { error: "SERVER_ERROR" },
                         });
               }

               if (OAuthRefreshToken !== storedUserInfo.refreshToken) {
                    console.log(
                         chalk.red(
                              `O Auth provided token doenst match with database, provided by EMAIL :- ${decodedUserRefreshToken?.email}`,
                         ),
                    );
                    return res
                         .status(500)
                         .clearCookie("OAuthRefreshToken")
                         .json({
                              statusCode: 500,
                              message: "Cannoy continue at the moment",
                              data: {
                                   error: "TOKEN_MISMATCH",
                              },
                         });
               } else {
                    const newOAuthAccessToken = await generateAccessToken(
                         "registered",
                         { loginType: "google", fullName: decodedUserInfo?.name, email: decodedUserInfo?.email },
                         "15d",
                    );
                    const newOAuthRefreshToken = await generateRefreshToken(
                         "registered",
                         { loginType: "google", fullName: decodedUserInfo?.name, email: decodedUserInfo?.email },
                         "30d",
                    );
                    if (!newOAuthAccessToken || !newOAuthRefreshToken) {
                         console.log(chalk.red("Cannot generate new O auth access and refresh token"));
                         throw new APIError(500, "Something went wrong while verifying user session", {
                              error: "SERVER_ERROR",
                         });
                    }

                    const updatedOAuthUser = await RegisteredUsers.findOneAndUpdate(
                         { refreshToken: OAuthRefreshToken },
                         { refreshToken: newOAuthRefreshToken },
                         { returnDocument: "after" },
                    )
                         .select("email contactNumber fullName loggedInOn loginType")
                         .lean();
                    if (!updatedOAuthUser) {
                         console.log(chalk.red("Cannot update O auth user refresh token"));
                         throw new APIError(500, "Something went wrong, please try again later", {
                              error: "SERVER_ERROR",
                         });
                    }

                    return res
                         .status(200)
                         .cookie("OAuthAccessToken", newOAuthAccessToken, issueCookieOptions("access"))
                         .cookie("OAuthRefreshToken", newOAuthRefreshToken, issueCookieOptions("refresh"))
                         .json(
                              new APIResponse(200, "User session verified", {
                                   email: updatedOAuthUser.email,
                                   fullName: updatedOAuthUser.fullName,
                                   contactNumber: updatedOAuthUser.contactNumber,
                                   loggedInOn: updatedOAuthUser.loggedInOn,
                                   loginType: updatedOAuthUser.loginType,
                                   OAuthAccessToken: newOAuthAccessToken,
                              }),
                         );
               }
          } catch (error) {
               console.log(error);
               if (error.name === "TokenExpiredError") {
                    const loggedOutOAuthUser = await RegisteredUsers.findOneAndUpdate(
                         { email: decodedUserInfo.email },
                         { isLoggedOut: true },
                         { returnDocument: "after" },
                    );
                    if (!loggedOutOAuthUser) {
                         console.log(
                              chalk.red(
                                   `Cannot update expired oAuth user as LOGGEDOUT: true in database for email :- ${decodedUserInfo?.email}`,
                              ),
                         );
                         throw new APIError(500, "Something went wrong, please try again later", {
                              error: "SERVER_ERROR",
                         });
                    }

                    return res
                         .status(401)
                         .clearCookie("OAuthRefreshToken")
                         .json({
                              statusCode: 401,
                              message: "User session expired, please relogin",
                              success: false,
                              data: { error: "SESSION_EXPIRED" },
                         });
               }
          }
     }

     // Both access and refresh tokens are present
     if (OAuthAccessToken && OAuthRefreshToken) {
          const decodedOAuthAccessToken = jwt.decode(OAuthAccessToken);
          const decodedOAuthRefreshToken = jwt.decode(OAuthRefreshToken);

          try {
               await jwt.verify(OAuthAccessToken, process.env.JWT_ACCESS_SECRET);
               const storedOAuthUser = await RegisteredUsers.findOne({ refreshToken: OAuthRefreshToken })
                    .select("email fullName loggedInOn contactNumber loginType")
                    .select("-_id")
                    .lean();
               if (!storedOAuthUser) {
                    return res
                         .status(401)
                         .clearCookie("OAuthAccessToken")
                         .clearCookie("OAuthRefreshToken")
                         .json({
                              statusCode: 401,
                              message: "Cannot continue at the moment",
                              success: false,
                              data: { error: "SERVER_ERROR" },
                         });
               }

               return res.status(200).json(
                    new APIResponse(200, "User verified successfully", {
                         email: storedOAuthUser.email,
                         fullName: storedOAuthUser.fullName,
                         contactNumber: storedOAuthUser.contactNumber,
                         loginType: storedOAuthUser.loginType,
                         OAuthAccessToken: OAuthAccessToken,
                    }),
               );
          } catch (error) {
               console.log(error);
               if (error.name === "TokenExpiredError") {
                    const OAuthVerifyResult = await verifyRegisteredUserRefreshToken({
                         email: decodedOAuthAccessToken.email,
                         fullName: decodedOAuthAccessToken.fullName,
                         loginType: decodedOAuthAccessToken.loginType,
                         refreshToken: OAuthRefreshToken,
                    });

                    if (
                         OAuthVerifyResult === "USER_NOT_FOUND" ||
                         OAuthVerifyResult === "TOKEN_MISMATCH" ||
                         OAuthVerifyResult === "SERVER_ERROR"
                    ) {
                         throw new APIError(500, "Something went wrong, please try again later", {
                              error: OAuthVerifyResult,
                         });
                    } else if (OAuthVerifyResult.refreshTokenUpdated) {
                         return res
                              .status(200)
                              .cookie(
                                   "OAuthAccessToken",
                                   OAuthVerifyResult.newAccessToken,
                                   issueCookieOptions("access"),
                              )
                              .cookie(
                                   "OAuthRefreshToken",
                                   OAuthVerifyResult.newRefreshToken,
                                   issueCookieOptions("refresh"),
                              )
                              .json(
                                   new APIResponse(200, "Successfully generated new OAuth session", {
                                        OAuthAccessToken: OAuthVerifyResult.newAccessToken,
                                   }),
                              );
                    } else if (OAuthVerifyResult.isSessionExpired) {
                         return res
                              .status(401)
                              .clearCookie("OAuthAccessToken")
                              .clearCookie("OAuthRefreshToken")
                              .json(new APIResponse(401, "User session has been expired, please relogin", undefined));
                    }
               } else if (error.name === "NotBeforeError" || error.name === "JsonWebTokenError") {
                    console.log(chalk.red(`Malformed token provided by :- ${decodedOAuthAccessToken.email}`));
                    return res
                         .status(401)
                         .clearCookie("OAuthAccessToken")
                         .clearCookie("OAuthRefreshToken")
                         .json({
                              statusCode: 401,
                              message: "Cannot continue at the moment",
                              success: false,
                              data: { error: "TOKEN_MALFORMED" },
                         });
               } else {
                    console.log(chalk.red("Unknown error occured in catch block of verifying OAuth user"));
                    throw new APIError(500, "Something went wrong, please try again later", {
                         error: "SERVER_ERROR",
                    });
               }
          }
     }
});

export { verifyOAuthUser }