import { asyncHandler } from "../utilities/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utilities/jwtOperations.js";
import APIError from "../utilities/APIError.js";
import APIResponse from "../utilities/APIResponse.js";
import GuestUser from "../database/guestUsers.databases.js";
import RegisteredUsers from "../database/registeredUsers.databases.js";
import { issueCookieOptions } from "../utilities/cookiesOptions.js";
import chalk from "chalk";
import jwt from "jsonwebtoken";

const allowedLoginTypes = ["google", "magicLink", "guest"];
// Async helper functions
async function verifyGuestRefreshToken(data, refreshToken) {
     const { guestID } = data;
     try {
          const decodedRefreshToken = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          const storedUser = await GuestUser.findOne({ guestID });
          if (!storedUser) {
               console.log(chalk.red("User not found in db using decoded access token data"));
               return "USER_NOT_FOUND";
          }
          console.log(storedUser);

          if (refreshToken !== storedUser.refreshToken) {
               console.log(chalk.red("Refresh token doesnt match"));
               return "TOKEN_MISMATCH";
          } else {
               const newGuestAccessToken = await generateAccessToken("guest", { guestID, loginType: "guest" }, "15d");
               const newGuestRefreshToken = await generateRefreshToken("guest", { guestID, loginType: "guest" }, "30d");
               if (!newGuestAccessToken || !newGuestRefreshToken) {
                    console.log(chalk.red("Token generation error in verifyGuestRefreshToken()"));
                    return "SERVER_ERROR";
               }

               storedUser.refreshToken = newGuestRefreshToken;
               await storedUser.save();

               return {
                    refreshTokenUpdated: true,
                    newAccessToken: newGuestAccessToken,
                    newRefreshToken: newGuestRefreshToken,
               };
          }
     } catch (error) {
          console.log(chalk.red("Error in verifier function :-"));
          console.log(error);
          if (error.name === "TokenExpiredError") {
               console.log("Guest Refresh token expired");
               const deletedUser = await GuestUser.findOneAndDelete({ guestID }).select("guestID createdOn fullName");
               if (!deletedUser) {
                    console.log(chalk.red(`User session expired, CANNOT DELETE USER with USERID :- ${userID}`));
                    return "SERVER_ERROR";
               } else {
                    return {
                         userDeleted: true,
                         deletedUserInfo: deletedUser,
                    };
               }
          } else {
               console.log(chalk.red("Something went wrong in verifyGuestRefreshToken()"));
               return "SERVER_ERROR";
          }
     }
}
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

// API controller functions
const verifyMagicLinkUser = asyncHandler(async (req, res, next) => {
     const token = req.query.token;
     const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
     const refreshToken = req.cookies?.refreshToken || req.headers.authorization?.replace("Bearer ", "");

     if (!token) throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED" });
     if (!accessToken && !refreshToken && token) return next();

     if (refreshToken && !accessToken) {
          let decodedToken;
          try {
               decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          } catch (jwtError) {
               console.log(jwtError);
               if (jwtError.name === "TokenExpiredError") {
                    const decodedToken = jwt.decode(refreshToken);
                    if (!decodedToken)
                         throw new APIError(500, "Something went wrong, try again later", { error: "SERVER_ERROR" });

                    const updatedUser = await RegisteredUsers.findOneAndUpdate(
                         { refreshToken },
                         { isLoggedOut: true, refreshToken: null },
                         { returnDocument: "after" },
                    );
                    if (!updatedUser)
                         throw new APIError(500, "Something went wrong, try again later", { error: "SERVER_ERROR" });

                    return res
                         .status(200)
                         .clearCookie("accessToken")
                         .clearCookie("refreshToken")
                         .json(
                              new APIResponse(200, "Session has been expired, please relogin", {
                                   error: "SESSION_EXPIRED",
                              }),
                         );
               }
               if (jwtError.name === "NotBeforeError")
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED" });
               if (jwtError.name === "JsonWebTokenError")
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED" });
               throw new APIError(500, "Something went wrong, try again later", { error: "SERVER_ERROR" });
          }

          let storedUser;
          try {
               storedUser = await RegisteredUsers.findOne({ refreshToken });
               if (!storedUser) {
                    return res.status(401).json({
                         statusCode: 401,
                         message: "Cannot continue at the moment",
                         data: {
                              error: "UNAUTHORISED",
                         },
                         success: false,
                    });
               }
          } catch (dbError) {
               console.log(dbError);
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }

          const newAccessToken = await generateAccessToken(
               "registered",
               { email: storedUser.email, loginType: storedUser.loginType, fullName: storedUser.fullName },
               "15d",
          );
          const newRefreshToken = await generateRefreshToken(
               "registered",
               { email: storedUser.email, loginType: storedUser.loginType, fullName: storedUser.fullName },
               "30d",
          );
          if (!newAccessToken || !newRefreshToken)
               throw new APIError(500, "Something went wrong, try again later", { error: "SERVER_ERROR" });

          storedUser.refreshToken = newRefreshToken;
          await storedUser.save();

          return res
               .status(200)
               .cookie("accessToken", newAccessToken, issueCookieOptions("access"))
               .cookie("refreshToken", newRefreshToken, issueCookieOptions("refresh"))
               .json(new APIResponse(200, "User verified successfully", null)); //data :- find user data and return from here
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

const verifyGuestUser = asyncHandler(async (req, res, next) => {
     const accessToken = req.cookies.user_session_A;
     const refreshToken = req.cookies.user_session_R;

     if (!accessToken && !refreshToken) return next();

     if (!accessToken && refreshToken) {
          const decodedRefreshToken = jwt.decode(refreshToken);
          console.log(decodedRefreshToken);
          if (!allowedLoginTypes.includes(decodedRefreshToken.loginType)) {
               throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
          }

          try {
               const verifiedRefreshToken = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
               const newAccessToken = await generateAccessToken(
                    {
                         guestID: verifiedRefreshToken.guestID,
                         loginType: verifiedRefreshToken.loginType,
                         accountyCreatedAt: verifiedRefreshToken.createdOn,
                    },
                    "15d",
               );
               const newRefreshToken = await generateRefreshToken(
                    {
                         guestID: verifiedRefreshToken.guestID,
                         loginType: verifiedRefreshToken.loginType,
                         accountyCreatedAt: verifiedRefreshToken.createdOn,
                    },
                    "30d",
               );
               if (!newAccessToken || !newRefreshToken) {
                    throw new APIError(500, "Something went wrong, please try again later", {
                         error: "SERVER_ERROR",
                    });
               }

               const guestUser = await GuestUser.findOneAndUpdate(
                    { guestID: verifiedRefreshToken.guestID },
                    { refreshToken: newRefreshToken },
                    { returnDocument: "after" },
               );
               if (!guestUser) {
                    throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
               }

               return res
                    .status(200)
                    .cookie("user_session_A", newAccessToken, issueCookieOptions("access"))
                    .cookie("user_session_R", newRefreshToken, issueCookieOptions("refresh"))
                    .redirect(`${process.env.DEPLOYED_FRONTEND_URL}/${verifiedRefreshToken.guestID}`);
          } catch (error) {
               console.log(error);
               if (error.name === "NotBeforeError") {
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
               }
               if (error.name === "JsonWebTokenError") {
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
               }
               if (error.name === "TokenExpiredError") {
                    const guestUser = await GuestUser.findOne({ guestID: decodedRefreshToken.guestID });
                    if (!guestUser) {
                         throw new APIError(404, "Guest account doesn't exist", { error: "USER_NOT_FOUND" });
                    }

                    if (guestUser.refreshToken !== refreshToken) {
                         throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
                    }

                    const newAccessToken = await generateAccessToken(
                         {
                              guestID: decodedRefreshToken.guestID,
                              loginType: decodedRefreshToken.loginType,
                              accountyCreatedAt: decodedRefreshToken.createdOn,
                         },
                         "15d",
                    );
                    const newRefreshToken = await generateRefreshToken(
                         {
                              guestID: decodedRefreshToken.guestID,
                              loginType: decodedRefreshToken.loginType,
                              accountyCreatedAt: decodedRefreshToken.createdOn,
                         },
                         "30d",
                    );
                    if (!newAccessToken || !newRefreshToken) {
                         throw new APIError(500, "Something went wrong, please try again later", {
                              error: "SERVER_ERROR",
                         });
                    }

                    guestUser.refreshToken = newRefreshToken;
                    await guestUser.save();

                    return res
                         .status(200)
                         .cookie("user_session_A", newAccessToken, issueCookieOptions("access"))
                         .cookie("user_session_R", newRefreshToken, issueCookieOptions("refresh"))
                         .redirect(`${process.env.DEPLOYED_FRONTEND_URL}/${guestUser.guestID}`);
               }
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }
     }
     // CASE 3 :- Both access and refresh tokens are present
     if (accessToken && refreshToken) {
          const decodedUserData = jwt.decode(accessToken);
          if (decodedUserData?.loginType !== "guest") {
               console.log(chalk.red("Edited Access token provided"));
               throw new APIError(401, "Cannot continue at the moment", { error: "TOKEN_MALFORMED" });
          }
          try {
               const decodedAccessToken = await jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
               const storedGuestUser = await GuestUser.findOne({ guestID: decodedUserData?.guestID })
                    .select("guestID fullName createdOn")
                    .select("-refreshToken -_id")
                    .lean();
               // const storedGuestUser = await GuestUser.findOne({ guestID: accessToken?.guestID }).select("guestID fullName createdOn").select("-refreshToken -_id").lean();
               if (!storedGuestUser) {
                    console.log(
                         chalk.red(
                              `Got both tokens but user cant be found in db GUESTID :- ${decodedUserData.guestID}`,
                         ),
                    );
                    return res
                         .status(500)
                         .clearCookie("guestAccessToken")
                         .clearCookie("guestRefreshToken")
                         .json({
                              statusCode: 500,
                              message: "Something went wrong, please try again later",
                              success: false,
                              data: { error: "SERVER_ERROR" },
                         });
               }

               return res.status(200).json(new APIResponse(200, "Guest user account verified", { ...storedGuestUser }));
          } catch (error) {
               if (error.name === "TokenExpiredError") {
                    console.log("User access token expired");
                    const refreshTokenVerifyResult = await verifyGuestRefreshToken(
                         { guestID: decodedUserData?.guestID },
                         guestRefreshToken,
                    );
                    if (
                         refreshTokenVerifyResult === "USER_NOT_FOUND" ||
                         refreshTokenVerifyResult === "TOKEN_MISMATCH" ||
                         refreshTokenVerifyResult === "SERVER_ERROR" ||
                         refreshTokenVerifyResult === "TOKEN_EXPIRED"
                    ) {
                         throw new APIError(500, "Cannot continue at the moment, please try again later", {
                              error: refreshTokenVerifyResult,
                         });
                    } else if (refreshTokenVerifyResult?.userDeleted) {
                         return res
                              .status(200)
                              .clearCookie("guestAccessToken")
                              .clearCookie("guestRefreshToken")
                              .json(
                                   new APIResponse(200, "User account has been deleted successfully", {
                                        deletedUser: refreshTokenVerifyResult.deletedUserInfo,
                                   }),
                              );
                    } else if (refreshTokenVerifyResult?.refreshTokenUpdated) {
                         return res
                              .status(200)
                              .cookie(
                                   "guestAccessToken",
                                   refreshTokenVerifyResult.newAccessToken,
                                   issueCookieOptions("access"),
                              )
                              .cookie(
                                   "guestRefreshToken",
                                   refreshTokenVerifyResult.newRefreshToken,
                                   issueCookieOptions("refresh"),
                              )
                              .json(
                                   new APIResponse(200, "Successfully generated new guest session", {
                                        guestAccessToken: refreshTokenVerifyResult.newAccessToken,
                                   }),
                              );
                    } else {
                         throw new APIError(500, "Something went wrong, please try again later", {
                              error: "SERVER_ERROR",
                         });
                    }
               }
               if (error.name === "NotBeforeError" || error.name === "JsonWebTokenError") {
                    console.log(chalk.red(`Token error caused by guest ID :- ${storedGuestUser.guestID}`));
                    throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
               }

               console.log(chalk.red(`UNEXPECTED ERROR :- ${error.name}`));
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }
     }

     return res.status(500).json({
          statusCode: 500,
          message: "Cannot continue at the moment, please try again later",
          success: false,
          data: {
               error: "SERVER_ERROR",
          },
     });
});

export { verifyGuestUser, verifyOAuthUser, verifyMagicLinkUser };
