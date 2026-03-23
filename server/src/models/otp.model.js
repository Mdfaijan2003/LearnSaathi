import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
{
  email: {
    type: String
  },

  phoneNumber: {
    type: String
  },

  otp: {
    type: String,
    required: true
  },

  purpose: {
    type: String,
    enum: ["register", "login", "reset_password"],
    required: true
  },

  expiresAt: {
    type: Date,
    required: true
  },

  isUsed: {
    type: Boolean,
    default: false
  },

  // 🔹 temporary user data for registration
  tempUser: {
    username: String,
    email: String,
    password: String,
    fullName: String,
    phoneNumber: String,
    role: {
      type: String,
      enum: ["student","teacher"],
      default: "student"
    }
  }
},
{ timestamps: true }
);

/* Auto delete expired OTP */
otpSchema.index({expiresAt:1},{expireAfterSeconds:0});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;