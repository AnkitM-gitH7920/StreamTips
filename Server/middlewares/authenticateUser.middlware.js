// File imports
import APIResponse from "../utilities/APIResponse.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import APIError from "../utilities/APIError.js";
import GuestUser from "../database/guestUsers.databases.js";
import { genAccessAndRefreshTokens } from "../utilities/jwtOperations.js";

// Library imports
import jwt from "jsonwebtoken";

// Constant Variables
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const DEPLOYED_FRONTEND_URL = process.env.DEPLOYED_FRONTEND_URL;

async function verifyRefreshToken(refreshToken, tokenObject) {
     if (tokenObject.loginType === "guest") {
          try {
               await jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

               const guestUser = await GuestUser.findOne({ guestID: tokenObject.guestID });
               if (!GuestUser) return "USER_NOT_FOUND";

               const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await genAccessAndRefreshToken(
                    {
                         guestID: tokenObject.guestID,
                         loggedInOn: tokenObject.loggedInOn,
                         loginType: tokenObject.loginType,
                    },
                    "15d",
                    "30d",
               );

               if (!newAccessToken || !newRefreshToken) return "SERVER_ERROR";

               guestUser.refreshToken = newRefreshToken;
               await guestUser.save();

               return {
                    tokenRefreshed: true,
                    newAccessToken,
                    newRefreshToken,
               };
          } catch (error) {
               if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") return "TOKEN_ERROR";
               if (error.name === "TokenExpiredError") {
                    const deletedGuestDoc = await GuestUser.findOneAndDelete({ guestID: tokenObject.guestID });
                    if (!deletedGuestDoc) return "USER_NOT_FOUND";

                    return {
                         guestAccountExpired: true,
                         deletedGuest: deletedGuestDoc,
                    };
               }
               return "SERVER_ERROR";
          }
     }

     if (tokenObject.loginType === "magicLink" || tokenObject.loginType === "google") {
     }
}

const authenticateUser = asyncHandler(async (req, res, next) => {
     const accessToken = req.cookies.user_session_A;
     const refreshToken = req.cookies.user_session_R;
     if (!accessToken || !refreshToken) return next()

     let decodedAccessToken = jwt.decode(accessToken);
     let decodedRefreshToken = jwt.decode(refreshToken);

     if (
          decodedAccessToken.loginType !== decodedRefreshToken.loginType &&
          decodedAccessToken.guestID !== decodedRefreshToken.guestID
     )
          throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORIZED_ACCESS" });

     console.log(decodedAccessToken);
     if (decodedAccessToken.loginType === "guest" && decodedRefreshToken.loginType === "guest") {
          console.log("Guest user, verification");

          try {
               decodedAccessToken = await jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
               const storedGuestUser = await GuestUser.findOne({ guestID: decodedAccessToken.guestID });
               if (!storedGuestUser) {
                    return res
                         .status(404)
                         .clearCookie("user_session_A")
                         .clearCookie("user_session_R")
                         .json({
                              statusCode: 404,
                              message: "User not found",
                              success: false,
                              data: {
                                   error: "USER_NOT_FOUND",
                              },
                         });
               }

               const queryResponse = {
                    createdOn: storedGuestUser.createdOn,
                    fullName: storedGuestUser.fullName,
                    guestID: storedGuestUser.guestID,
               };
               return res.status(200).json(new APIResponse(200, "Guest user verified successfully", queryResponse));
          } catch (error) {
               console.log(error.name);
               if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError")
                    throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
               if (error.name === "TokenExpiredError") {
                    const refreshTokenVerification = await verifyRefreshToken(refreshToken, decodedRefreshToken);
                    if (refreshTokenVerification === "SERVER_ERROR")
                         throw new APIError(500, "Something went wrong, please try again later", {
                              error: refreshTokenVerification,
                         });
                    if (refreshTokenVerification === "TOKEN_ERROR" || refreshTokenVerification === "USER_NOT_FOUND") {
                         return res
                              .status(401)
                              .clearCookie("user_session_A")
                              .clearCookie("user_session_R")
                              .json({
                                   statusCode: 401,
                                   message: "Cannot continue at the moment",
                                   success: false,
                                   data: {
                                        error: "UNAUTHORIZED_ACCESS",
                                   },
                              });
                    }
                    if (refreshTokenVerification.guestAccountExpired) {
                         return res
                              .status(200)
                              .json(
                                   new APIResponse(201, "Guest account has been deleted for inactivity", {
                                        ...refreshTokenVerification.deletedGuest,
                                   }),
                              );
                    }
                    if (refreshTokenVerification.accountRefreshed) {
                         return res
                              .status(200)
                              .cookie(
                                   "user_session_A",
                                   refreshTokenVerification.newAccessToken,
                                   issueCookieOptions("access"),
                              )
                              .cookie(
                                   "user_session_R",
                                   refreshTokenVerification.newRefreshToken,
                                   issueCookieOptions("refresh"),
                              );
                    }
               }
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }
     }
});

export { authenticateUser };
