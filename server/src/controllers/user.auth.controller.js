import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {generateOtp} from "../utils/generateOtp.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { getPublicId } from "../utils/cloudinaryHelpers.js";
import jwt from "jsonwebtoken";
import { 
  registerService, 
  loginService,
  refreshTokenService,
  forgotPasswordService,
  resetPasswordService
 } from "../services/auth.service.js";

import crypto from "crypto";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};


export const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave:false });

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access tokens");
    
  }
}

/* Register */

export const registerUser = asyncHandler(async (req, res) => {

  const result = await registerService(req.body);

  return res.status(201).json(
    new ApiResponse(201, result, "OTP sent")
  );

});


/* Login */

export const loginUser = asyncHandler(async (req, res) => {

  const result = await loginService(req.body);

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", result.accessToken, options)
    .cookie("refreshToken", result.refreshToken, options)
    .json(
      new ApiResponse(200, result, "Login successful")
    );
});



export const logoutUser = asyncHandler(async (req, res) => {

  const incomingToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingToken) {
    throw new ApiError(400, "Refresh token required for logout");
  }

  const hashed = hashToken(incomingToken);

  const user = await User.findById(req.user._id).select("+sessions");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 🔥 remove only current session
  user.sessions = user.sessions.filter(
    (session) => session.refreshToken !== hashed
  );

  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out from this device"));

});


export const refreshAccessToken = asyncHandler(async (req, res) => {

  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  const result = await refreshTokenService(token);

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .cookie("accessToken", result.accessToken, options)
    .cookie("refreshToken", result.refreshToken, options)
    .json(
      new ApiResponse(200, result, "Token refreshed")
    );
});



export const getCurrentUser = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id)
  .select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, user, "Current user fetched successfully")
  );

});


export const changeCurrentPassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Old password incorrect");
  }

  user.password = newPassword;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  );

});


export const forgotPassword = asyncHandler(async (req, res) => {

  const result = await forgotPasswordService(req.body);

  return res.status(200).json(
    new ApiResponse(200, result, "OTP sent")
  );

});


export const resetPassword = asyncHandler(async (req, res) => {

  const result = await resetPasswordService(req.body);

  return res.status(200).json(
    new ApiResponse(200, result, "Password reset successful")
  );

});


export const updateAccountDetails = asyncHandler(async (req, res) => {

  const { fullName } = req.body;

  if (!fullName) {
    throw new ApiError(400, "Full name is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullName }
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, user, "Account updated successfully")
  );

});

export const uploadAvatar = asyncHandler(async (req, res) => {

  const localFilePath = req.file?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadCloudinary(localFilePath);

  if (!avatar || !avatar.url) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      avatar: avatar.url
    },
    { new: true }
  ).select("-password -refreshToken");

  if(!user){
    throw new ApiError(500,"User not found after avatar upload");
  }

  return res.status(200).json({
    message: "Avatar uploaded successfully",
    user
  });

});

export const updateAvatar = asyncHandler(async (req, res) => {

  const localFilePath = req.file?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Avatar file required");
  }

  const avatar = await uploadCloudinary(localFilePath);

  if (!avatar || !avatar.url) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, user, "Avatar updated successfully")
  );

});

export const uploadCoverImage = asyncHandler(async (req, res) => {

  const localFilePath = req.file?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Cover image file required");
  }


  const coverImage = await uploadCloudinary(localFilePath);

  if (!coverImage || !coverImage.url) {
    throw new ApiError(500, "Failed to upload cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      coverImage: coverImage.url
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, user, "Cover image updated successfully")
  );

});

export const updateCoverImage = asyncHandler(async (req, res) => {

  const localFilePath = req.file?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Cover image file required");
  }

  const coverImage = await uploadCloudinary(localFilePath);

  if (!coverImage || !coverImage.url) {
    throw new ApiError(500, "Failed to upload cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, user, "Cover image updated successfully")
  );

});

export const deleteCoverImage = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id);

  if (!user.coverImage) {
    throw new ApiError(400, "No cover image found");
  }

  const publicId = getPublicId(user.coverImage);

  await deleteFromCloudinary(publicId);

  user.coverImage = undefined;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Cover image deleted successfully")
  );

});
export const googleLoginSuccess = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id).select("+sessions");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const hashed = hashToken(refreshToken);

  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  // 🔥 limit sessions
  if (user.sessions.length >= 2) {
    user.sessions.shift();
  }

  user.sessions.push({
    refreshToken: hashed,
    userAgent,
    ip,
    createdAt: new Date()
  });

  await user.save({ validateBeforeSave: false });

  const safeUser = user.toSafeObject();

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          accessToken,
          refreshToken
        },
        "Google login successful"
      )
    );
});