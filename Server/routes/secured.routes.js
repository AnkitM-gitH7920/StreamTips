import express from "express";
// Controller imports 
import { provideCreatorData } from "../controllers/provideCreatorData.controller.js";

// Middlware imports
import { authenticateUser } from "../middlewares/authenticateUser.middlware.js";

const securedRouter = express.Router();

securedRouter.use(authenticateUser); //Protects all the routes with /s prefix

// Dashboard Routes
securedRouter.route("/me").get(provideCreatorData);


export default securedRouter;