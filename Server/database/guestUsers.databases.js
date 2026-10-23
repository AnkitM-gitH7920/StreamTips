import mongoose from "mongoose";

const guestUserSchema = new mongoose.Schema({
     guestID: {
          type: String,
          required: true,
          trim: true
     },
     createdOn: {
          type: Date,
          default: Date.now,
          required: true
     },
     fullName: {
          type: String,
          trim: true,
          required: false,
          default: null
     },
     refreshToken: { type: String }
}, { timestamps: true });

guestUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const GuestUser = mongoose.model("GuestUsers", guestUserSchema);
export default GuestUser
