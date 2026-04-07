import mongoose from "mongoose";
import crypto from "crypto";

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

/* 🔥 INDEXES */
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ phoneNumber: 1 });

// otpSchema.pre("save", function(next) {
//     if (!this.isModified("otp")) return;
//     this.otp = crypto
//     .createHash("sha256")
//     .update(this.otp)
//     .digest("hex");
// });

/* 🔐 VERIFY OTP METHOD */
otpSchema.methods.compareOtp = function (enteredOtp) {
  const hashed = crypto
    .createHash("sha256")
    .update(enteredOtp)
    .digest("hex");

  return this.otp === hashed;
};

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;