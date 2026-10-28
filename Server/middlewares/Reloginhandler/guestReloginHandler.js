import { asyncHandler } from "../../utilities/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../../utilities/jwtOperations.js";
import APIError from "../../utilities/APIError.js";
import APIResponse from "../../utilities/APIResponse.js";
import GuestUser from "../../database/guestUsers.databases.js";
import { issueCookieOptions } from "../../utilities/cookiesOptions.js";
import chalk from "chalk";
import jwt from "jsonwebtoken";

const allowedLoginTypes = ["google", "magicLink", "guest"];
const JWTAccessSecret = process.env.JWT_ACCESS_SECRET;
const JWTRefreshSecret = process.env.JWT_REFRESH_SECRET;

async function verifyGuestRefreshToken(refreshToken, decodedRefreshToken) {
     const { guestID, accountCreatedAt, loginType } = decodedRefreshToken;
     try {
          await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          const storedGuestUser = await GuestUser.findOne({ refreshToken });
          if (!storedGuestUser) return "NOT_FOUND";

          if (storedGuestUser.refreshToken !== refreshToken) return "UNAUTHORISED_ACCESS";
          const newAccessToken = await generateAccessToken({ guestID, accountCreatedAt, loginType }, "15d");
          const newRefreshToken = await generateRefreshToken({ guestID, accountCreatedAt, loginType }, "30d");
          if (!newAccessToken || !newRefreshToken) return "SERVER_ERROR";

          return {
               refreshTokenUpdated: true,
               accessToken: newAccessToken,
               refreshToken: newRefreshToken,
          };
     } catch (error) {
          if (error.name === "NotBeforeError") return "UNAUTHORISED_ACCESS";
          if (error.name === "JsonWebTokenError") return "UNAUTHORISED_ACCESS";
          if (error.name === "TokenExpiredError") {
               const deletedGuestUser = await GuestUser.findOneAndDelete({ refreshToken });
               if (!deletedGuestUser) return "SERVER_ERROR";
               return { accountDeleted: true };
          }
          return "SERVER_ERROR";
     }
}

const verifyGuestUser = asyncHandler(async (req, res, next) => {
     const accessToken = req.cookies.user_session_A;
     const refreshToken = req.cookies.user_session_R;

     if (!accessToken && !refreshToken) return next();

     if (!accessToken && refreshToken) {
          const decodedRefreshToken = jwt.decode(refreshToken);
          if (!allowedLoginTypes.includes(decodedRefreshToken.loginType)) {
               throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
          }

          try {
               const verifiedRefreshToken = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
               const newAccessToken = await generateAccessToken(
                    {
                         guestID: verifiedRefreshToken.guestID,
                         loginType: verifiedRefreshToken.loginType,
                         accountCreatedAt: verifiedRefreshToken.createdOn,
                    },
                    "15d",
               );
               const newRefreshToken = await generateRefreshToken(
                    {
                         guestID: verifiedRefreshToken.guestID,
                         loginType: verifiedRefreshToken.loginType,
                         accountCreatedAt: verifiedRefreshToken.createdOn,
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
                    { refreshToken: newRefreshToken }
               );
               if (!guestUser) {
                    console.log(guestUser)
                    throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
               }

               return res
                    .status(200)
                    .cookie("user_session_A", newAccessToken, issueCookieOptions("access"))
                    .cookie("user_session_R", newRefreshToken, issueCookieOptions("refresh"))
                    .redirect(`${process.env.DEPLOYED_FRONTEND_URL}/home/me`);
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
                              accountCreatedAt: decodedRefreshToken.createdOn,
                         },
                         "15d",
                    );
                    const newRefreshToken = await generateRefreshToken(
                         {
                              guestID: decodedRefreshToken.guestID,
                              loginType: decodedRefreshToken.loginType,
                              accountCreatedAt: decodedRefreshToken.createdOn,
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
                         .redirect(`${process.env.DEPLOYED_FRONTEND_URL}/home/me`);
               }
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }
     }

     // CASE 3 :- Both access and refresh tokens are present
     if (accessToken && refreshToken) {
          const decodedAccessToken = jwt.decode(accessToken);
          const decodedRefreshToken = jwt.decode(refreshToken);
          if (!allowedLoginTypes.includes(decodedAccessToken.loginType)) {
               throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
          }
          if (
               decodedAccessToken.loginType !== decodedRefreshToken.loginType ||
               decodedAccessToken.guestID !== decodedRefreshToken.guestID
          ) {
               throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
          }

          try {
               await jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

               const guestID = decodedAccessToken.guestID;
               const storedGuestUser = await GuestUser.findOne({ guestID });
               if (!storedGuestUser) {
                    return res
                         .status(404)
                         .clearCookie("user_session_A")
                         .clearCookie("user_session_R")
                         .json({
                              statusCode: 404,
                              message: "Guest account cannot be found",
                              success: false,
                              data: { error: "USER_NOT_FOUND" },
                         });
               }

               const newAccessToken = await generateAccessToken(
                    {
                         loginType: decodedAccessToken.loginType,
                         guestID: decodedAccessToken.guestID,
                         accountCreatedAt: decodedAccessToken.createdOn,
                    },
                    "15d",
               );
               const newRefreshToken = await generateRefreshToken(
                    {
                         loginType: decodedAccessToken.loginType,
                         guestID: decodedAccessToken.guestID,
                         accountCreatedAt: decodedAccessToken.createdOn,
                    },
                    "30d",
               );
               if (!newAccessToken || !newRefreshToken) {
                    throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
               }

               storedGuestUser.refreshToken = newRefreshToken;
               await storedGuestUser.save();

               return res
                    .status(200)
                    .cookie("user_session_A", newAccessToken, issueCookieOptions("access"))
                    .cookie("user_session_R", newRefreshToken, issueCookieOptions("refresh"))
                    .cookie("guest_id", decodedRefreshToken.guestID, issueCookieOptions(30 * 24 * 60 * 60 * 1000))
                    .redirect(`${process.env.DEPLOYED_FRONTEND_URL}/home/me`);
          } catch (error) {
               console.log(error.name)
               console.lg(error.message)
               if (error.name === "NotBeforeError") {
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
               }
               if (error.name === "JsonWebTokenError") {
                    throw new APIError(401, "Cannot continue at the moment", { error: "UNAUTHORISED_ACCESS" });
               }
               if (error.name === "TokenExpiredError") {
                    const refreshTokenVerification = await verifyGuestRefreshToken(refreshToken, decodedRefreshToken);
                    if (refreshTokenVerification === "SERVER_ERROR") {
                         throw new APIError(500, "Something went wrong, please try again later", {
                              error: refreshTokenVerification,
                         });
                    }
                    if (
                         refreshTokenVerification === "NOT_FOUND" ||
                         refreshTokenVerification === "UNAUTHORISED_ACCESS" ||
                         refreshTokenVerification.accountDeleted
                    ) {
                         return res
                              .status(
                                   refreshTokenVerification === "NOT_FOUND" ||
                                        refreshTokenVerification === "UNAUTHORISED_ACCESS"
                                        ? 401
                                        : 200,
                              )
                              .clearCookie("user_session_A")
                              .clearCookie("user_session_R");
                    }
                    if (refreshTokenVerification.refreshTokenUpdated) {
                         return res
                              .status(200)
                              .cookie(
                                   "user_session_A",
                                   refreshTokenVerification.accessToken,
                                   issueCookieOptions("access"),
                              )
                              .cookie(
                                   "user_session_R",
                                   refreshTokenVerification.refreshToken,
                                   issueCookieOptions("refresh"),
                              )
                              .cookie("guest_id", decodedRefreshToken.guestID, issueCookieOptions(30 * 24 * 60 * 60 * 1000))
                              .redirect(`${process.env.DEPLOYED_FRONTEND_URL}/home/me`);
                    }
               }
               throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
          }
     }
});

export { verifyGuestUser };
