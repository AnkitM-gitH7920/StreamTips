import express from "express";

// Controller import
import { registerController } from "../controllers/register.controller.js";
import { guestRegisterController } from "../controllers/guestRegister.controller.js";
import { magicLinkMailSendController, magicLinkMailVerifyController } from "../controllers/magicLinkRegister.controller.js";

//Middleware imports
import { verifyMagicLinkUser } from "../middlewares/Reloginhandler/magicLinkReloginHandler.js";
import { verifyGuestUser } from "../middlewares/Reloginhandler/guestReloginHandler.js";
import { authorizeUser } from "../middlewares/authoriseUser.middleware.js";

const authRouter = express.Router();

// Default login routes
authRouter.route("/register").post(registerController);
authRouter.route("/magic-link/send").post(magicLinkMailSendController);
authRouter.route("/magic-link/verify").get(verifyMagicLinkUser, magicLinkMailVerifyController);

// Continue as Guest
authRouter.route("/guest").get(authorizeUser, guestRegisterController);

export default authRouter;
