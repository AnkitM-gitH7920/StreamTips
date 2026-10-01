import mongoose from "mongoose";

const registeredUsersSchema = new mongoose.Schema({
     email: {
          type: String,
          required: true,
          unique: true,
          trim: true,
          lowercase: true
     },
     contactNumber: {
          type: String,
          required: false,
          unique: true,
          trim: true
     },
     fullName: {
          type: String,
          required: false,
          default: undefined,
          trim: true
     },
     loggedInOn: {
          type: Date,
          required: true,
          default: Date.now
     },
     isLoggedOut: {
          type: Boolean,
          required: false,
          default: false
     },
     isVerified: {
          type: Boolean,
          default: false
     },
     loginType: {
          type: String,
          enum: ["google", "magicLink"],
          required: true,
     },
     refreshToken: { type: String }

}, { timestamps: true })

const RegisteredUsers = mongoose.model("registeredUsers", registeredUsersSchema);
export default RegisteredUsers;
