import { asyncHandler } from "../utilities/asyncHandler.js";
import APIResponse from "../utilities/APIResponse.js";
import APIError from "../utilities/APIError.js";
import validator from "validator";
import RegisteredUsers from "../database/registeredUsers.databases.js";

const registerController = asyncHandler(async (req, res, next) => {
     const { fullName, email, phoneNumber } = req.body;
     if (!fullName || !email || !phoneNumber) throw new APIError(400, "Please provide the required information", null);

     if (!fullName.length) throw new APIError(400, "Full name is required", { error: "UNPROCESSABLE_ENTITY" });
     const isEmail = validator.isEmail(email);
     if (!isEmail) throw new APIError(400, "Enter a valid email address", { error: "UNPROCESSABLE_ENTITY" });
     if (!phoneNumber.length) throw new APIError(400, "Phone number is required", { error: "UNPROCESSABLE_ENTITY" });

     try {
          const user = await RegisteredUsers.create({
               email,
               phoneNumber,
               fullName,
               loggedInOn,
               isVerified,
               loginType,
               refreshToken
          });
          console.log(user);
     } catch (error) {
          console.log(error);
          throw new APIError(500, "Something went wrong, please try again later", { error: "SERVER_ERROR" });
     }
});

export { registerController };
