import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {

  const { username, email, password, fullName, phoneNumber } = req.body;
  // if (username=== "") {
  //   throw new ApiError(400, "Username is required");
  // }
  // if (email=== "") {
  //   throw new ApiError(400, "Email is required");
  // }
  // if (password=== "") {
  //   throw new ApiError(400, "Password is required");
  // }
  // if (fullName=== "") {
  //   throw new ApiError(400, "Full name is required");
  // }
  // if (phoneNumber=== "") {
  //   throw new ApiError(400, "Phone number is required");
  // }

  if(
    [username, email, password, fullName, phoneNumber].some((field) => field?.trim() === "")
  ){
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }, { phoneNumber }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  // console.log(req.files);

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    phoneNumber
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if(!createdUser){
    throw new ApiError(500, "User registration failed");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );

});


export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        accessToken,
        refreshToken,
        user: loggedInUser
      }, "User logged in successfully")
    );

  } catch (error) {
    throw new ApiError(500, "Failed to login user");
  }
};


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