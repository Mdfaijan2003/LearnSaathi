import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {generateOtp} from "../utils/generateOtp.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { getPublicId } from "../utils/cloudinaryHelpers.js";
import jwt from "jsonwebtoken";


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

export const registerUser = asyncHandler(async(req,res)=>{

  const {username,email,password,fullName,phoneNumber,role} = req.body;

  if(
    [username,email,password,fullName,phoneNumber,role].some((field) => field?.trim() === "")
  ){
    throw new ApiError(400,"All fields are required and cannot be empty");
  }

  const allowedRoles = ["student","teacher"];

  const userRole = role && allowedRoles.includes(role) ? role : "student";

  if(role && !allowedRoles.includes(role)){
    throw new ApiError(400,"Invalid role");
  }

  const existedUser = await User.findOne({
    $or:[{username},{email},{phoneNumber}]
  });

  if(existedUser){
    throw new ApiError(409,"User already exists");
  }
  // console.log(req.files);

  // const user = await User.create({
  //   username: username.toLowerCase(),
  //   email,
  //   password,
  //   fullName,
  //   phoneNumber,
  //   role: "student",
  //   authProvider: "local"
  // });

  // const createdUser = await User.findById(user.id).select("-password -refreshToken");

  // if(!createdUser){
  //   throw new ApiError(500,"User creation failed");
  // }

  /* Generate OTP */
  console.log("Register OTP:");
  const otp = generateOtp();
  console.log("Register OTP:",otp);
  const expires = new Date(Date.now() + 5*60*1000);
  console.log("Hello");

  // await OTP.deleteMany({email});
  await OTP.deleteMany({
    $or: [{ email }, { phoneNumber }]
  });

  await OTP.create({
    email,
    phoneNumber,
    otp,
    purpose:"register",
    expiresAt:expires,

    // store temporary user data
    tempUser: {
      username,
      email,
      password,
      fullName,
      phoneNumber,
      role: userRole
    }
  });
  

  console.log("Register OTP:",otp);

  return res.status(201).json(
    new ApiResponse(201,{},"OTP sent. Please verify to complete registration")
  );

});


/* Login */

export const loginUser = asyncHandler(async(req,res)=>{

  const {email, phoneNumber, password} = req.body;

  if(!email && !phoneNumber){
    throw new ApiError(400,"Either email or phone number is required");
  }

  if(!password){
    throw new ApiError(400,"Password is required");
  }

  const user = await User.findOne({
    $or: [{email}, {phoneNumber}]
  }).select("+password");

  if(!user){
    throw new ApiError(404,"User not found");
  }

  if(!user.isEmailVerified){
    throw new ApiError(401,"Verify email first");
  }


  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid password");
  }

  if (user.role === "teacher" && user.teacherStatus !== "approved") {
    throw new ApiError(403, "Teacher not approved yet");
  }

  // const accessToken = user.generateAccessToken();
  // const refreshToken = user.generateRefreshToken();

  // user.refreshToken = refreshToken;
  // await user.save({validateBeforeSave:false});

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findOne(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,{
      user: loggedInUser,
      accessToken,
      refreshToken
    },"User Logged in successful")
  );

});


export const approveTeacher = asyncHandler(async (req, res) => {

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { teacherStatus: "approved" },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, user, "Teacher approved")
  );
});

export const getPendingTeachers = asyncHandler(async (req, res) => {

  const teachers = await User.find({
    role: "teacher",
    teacherStatus: "pending"
  }).select("-password");

  return res.status(200).json(
    new ApiResponse(200, teachers, "Pending teachers")
  );
});


export const logoutUser = asyncHandler(async (req, res) => {

  const userId = req.user?._id;

  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined
      }
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User logged out successfully")
    );
});


export const refreshAccessToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decoded?._id).select("+refreshToken");
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or already used");
    }
  
    // const accessToken = user.generateAccessToken();
    // const refreshToken = user.generateRefreshToken();
  
    // user.refreshToken = refreshToken;
    // await user.save({ validateBeforeSave: false });
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    const options = {
      httpOnly: true,
      secure: true
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});


export const uploadAvatarController = asyncHandler(async (req, res) => {

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

  await user.save({validateBeforeSave: false});

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  );

});


export const forgotPassword = asyncHandler(async (req, res) => {

  const { email, phoneNumber} = req.body;

  if(!email && !phoneNumber){
    throw new ApiError(400,"Either email or phone number is required");
  }

  const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = generateOtp();

  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.deleteMany({ email, purpose: "reset_password" });

  await OTP.create({
    email,
    otp,
    purpose: "reset_password",
    expiresAt: expires
  });

  console.log("Reset Password OTP:", otp);

  return res.status(200).json(
    new ApiResponse(200, {}, "OTP sent for password reset")
  );

});


export const resetPassword = asyncHandler(async (req, res) => {

  const { email, phoneNumber, otp, newPassword } = req.body;

  const otpDoc = await OTP.findOne({
    $or: [{ email }, { phoneNumber }],
    otp,
    purpose: "reset_password",
    isUsed: false
  });

  if (!otpDoc) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpDoc.expiresAt < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  const user = await User.findOne({ $or: [{ email }, { phoneNumber }] }).select("+password");

  user.password = newPassword;

  await user.save();

  otpDoc.isUsed = true;
  await otpDoc.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset successful")
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

  const user = req.user;

  // const accessToken = user.generateAccessToken();
  // const refreshToken = user.generateRefreshToken();

  // user.refreshToken = refreshToken;

  // await user.save({ validateBeforeSave: false });
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findOne(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  // return res.status(200).json(
  //   new ApiResponse(
  //     200,
  //     {
  //       accessToken,
  //       refreshToken,
  //       user
  //     },
  //     "Google login successful"
  //   )
  // );
  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,{
      user: loggedInUser,
      accessToken,
      refreshToken
    },"Google login successful")
  );

});