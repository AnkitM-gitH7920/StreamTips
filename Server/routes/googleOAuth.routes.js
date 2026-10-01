import express from "express";
import { googleOAuth, googleOAuthCallback } from "../controllers/googleOAuth.controller.js";
import { verifyOAuthUser } from "../middlewares/userReloginVerifier.middleware.js";

const googleOAuthRouter = express.Router();

googleOAuthRouter.route("/").get(verifyOAuthUser, googleOAuth);
googleOAuthRouter.route("/callback").get(googleOAuthCallback);


export default googleOAuthRouter;
