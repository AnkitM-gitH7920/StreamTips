import express from "express";
// Controller imports 
import { provideCreatorData } from "../controllers/provideCreatorData.controller.js";

// Middlware imports
import { authorizeUser } from "../middlewares/authoriseUser.middleware.js";

const securedRouter = express.Router();

securedRouter.use(authorizeUser); //Protects all the routes with /s prefix

// Dashboard Routes
securedRouter.route("/me").get(provideCreatorData);


export default securedRouter;