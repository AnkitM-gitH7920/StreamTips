import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(express.static("public"));
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "public")));
app.use(cors({
     origin: process.env.DEPLOYED_FRONTEND_URL,
     credentials: true,
     Credential: true
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "10kb" }));

// Routes imports
import authRouter from "./routes/Authentication.routes.js";
import googleOAuthRouter from "./routes/googleOAuth.routes.js";

app.use("/v1/auth", authRouter);
app.use("/v1/auth/google", googleOAuthRouter);

app.use(errorHandler)

export default app;
