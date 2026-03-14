import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    phoneNumber: {
      type: String,
      unique: true,
    },

    avatar: {
      type: String
    },

    coverImage: {
      type: String
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      select: false
    },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student"
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    googleId: {
      type: String
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


// Password check method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// Access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
    }
  );
};


// Refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
    }
  );
};

const User = mongoose.model("User", userSchema);

export default User;