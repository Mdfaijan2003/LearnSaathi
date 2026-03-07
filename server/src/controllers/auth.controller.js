import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password, fullName } = req.body;

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    const user = await User.create({
        username,
        email,
        password,
        fullName
    });

    return res.status(201).json({
        message: "User registered successfully",
        user
    });

});


export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      accessToken,
      refreshToken,
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};