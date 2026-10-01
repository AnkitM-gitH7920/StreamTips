import express from "express";

// Controller import
import { guestRegisterController } from "../controllers/guestRegister.controller.js";
import { magicLinkMailSendController, magicLinkMailVerifyController } from "../controllers/magicLinkRegister.controller.js";

//Middleware imports
import { verifyGuestUser } from "../middlewares/userReloginVerifier.middleware.js";
import { verifyMagicLinkUser } from "../middlewares/userReloginVerifier.middleware.js";

const authRouter = express.Router();

// Default login routes
authRouter.route("/magic-link/send").post(magicLinkMailSendController);
authRouter.route("/magic-link/verify").get(verifyMagicLinkUser, magicLinkMailVerifyController);

// Continue as Guest
authRouter.route("/guest").get(verifyGuestUser, guestRegisterController);

export default authRouter;
