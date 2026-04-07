import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import { ApiError } from "../utils/ApiError.js";
import { redisClient } from "../utils/redis.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/* ================= COMMON HASH ================= */
const hash = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

/* ================= REGISTER ================= */
export const registerService = async (data) => {
  const { username, email, password, fullName, phoneNumber, role } = data;

  if (
    [username, email, password, fullName]
      .some((field) => typeof field === "string" && field.trim() === "")
  ) {
    throw new ApiError(400, "All required fields must be filled");
  }

  const key = `otp:${email || phoneNumber}`;

  const exists = await redisClient.get(key);
  if (exists) {
    throw new ApiError(429, "Please wait before requesting OTP again");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }, { phoneNumber }]
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const otp = generateOtp();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  // 🔥 IMPORTANT: use ONE identifier only
  const identifier = email ? { email } : { phoneNumber };

  await OTP.deleteMany(identifier);

  await OTP.create({
    ...identifier,
    otp: hash(otp),
    purpose: "register",
    expiresAt: expires,
    tempUser: {
      username,
      email,
      password,
      fullName,
      phoneNumber,
      role: role || "student"
    }
  });

  await redisClient.setEx(key, 60, "sent");

  console.log("Register OTP:", otp);

  return { message: "OTP sent successfully" };
};

/* ================= VERIFY OTP ================= */
export const verifyOtpService = async (data) => {
  const { email, phoneNumber, otp } = data;

  if (!email && !phoneNumber) {
    throw new ApiError(400, "Email or phone required");
  }

  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  const query = email
    ? { email, purpose: "register", isUsed: false }
    : { phoneNumber, purpose: "register", isUsed: false };

  const otpDoc = await OTP.findOne(query).sort({ createdAt: -1 });

  console.log("Entered OTP:", otp);
  console.log("Stored OTP:", otpDoc?.otp);

  if (!otpDoc) {
    throw new ApiError(400, "OTP not found");
  }

  if (otpDoc.otp !== hash(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpDoc.expiresAt < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  const tempUser = otpDoc.tempUser;

  const existingUser = await User.findOne({
    $or: [{ email: tempUser.email }, { phoneNumber: tempUser.phoneNumber }]
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  await User.create({
    ...tempUser,
    teacherStatus:
      tempUser.role === "teacher" ? "pending" : "approved",
    authProvider: "local",
    isEmailVerified: true
  });

  otpDoc.isUsed = true;
  await otpDoc.save();

  return { message: "Account created successfully" };
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPasswordService = async ({ email, phoneNumber }) => {
  if (!email && !phoneNumber) {
    throw new ApiError(400, "Email or phone required");
  }

  const user = await User.findOne({
    $or: [{ email }, { phoneNumber }]
  });

  if (!user) throw new ApiError(404, "User not found");

  const otp = generateOtp();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  const identifier = email ? { email } : { phoneNumber };

  await OTP.deleteMany(identifier);

  await OTP.create({
    ...identifier,
    otp: hash(otp),
    purpose: "reset_password",
    expiresAt: expires
  });

  console.log("Reset OTP:", otp);

  return { message: "OTP sent for password reset" };
};

/* ================= RESET PASSWORD ================= */
export const resetPasswordService = async ({email, phoneNumber, otp, newPassword }) => {
  const query = email
    ? { email, purpose: "reset_password", isUsed: false }
    : { phoneNumber, purpose: "reset_password", isUsed: false };

  const otpDoc = await OTP.findOne(query);

  if (!otpDoc || otpDoc.otp !== hash(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpDoc.expiresAt < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  const user = await User.findOne({
    $or: [{ email }, { phoneNumber }]
  }).select("+password");

  if (!user) throw new ApiError(404, "User not found");

  user.password = newPassword;
  await user.save();

  otpDoc.isUsed = true;
  await otpDoc.save();

  return { message: "Password reset successful" };
};

/* ================= LOGIN ================= */
export const loginService = async ({
  email,
  phoneNumber,
  password,
  userAgent,
  ip
}) => {
  if (!email && !phoneNumber) {
    throw new ApiError(401, "Email or phone required");
  }

  if (!password) {
    throw new ApiError(401, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { phoneNumber }]
  }).select("+password +sessions");

  if (!user) throw new ApiError(404, "User not found");

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) throw new ApiError(401, "Invalid password");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const hashed = hash(refreshToken);

  if (user.sessions.length >= 5) {
    user.sessions.shift();
  }

  user.sessions.push({
    refreshToken: hashed,
    userAgent,
    ip,
    createdAt: new Date()
  });

  await user.save({ validateBeforeSave: false });

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken
  };
};

/* ================= REFRESH TOKEN ================= */
export const refreshTokenService = async (incomingToken) => {
  if (!incomingToken) {
    throw new ApiError(401, "Refresh token required");
  }

  try {
    const decoded = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id).select("+sessions");

    if (!user) throw new ApiError(401, "Invalid token");

    const hashedIncoming = hash(incomingToken);

    const session = user.sessions.find(
      (s) => s.refreshToken === hashedIncoming
    );

    if (!session) {
      throw new ApiError(401, "Invalid session");
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    session.refreshToken = hash(newRefreshToken);

    await user.save({ validateBeforeSave: false });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };

  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};