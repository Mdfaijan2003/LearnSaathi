import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import { ApiError } from "../utils/ApiError.js";
import { redisClient } from "../utils/redis.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/* ================= COMMON HASH ================= */
const hash = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

/* ================= REGISTER ================= */
export const registerService = async (data) => {
  const { username, email, password, fullName, phoneNumber, role } = data;

  if (
    !username?.trim() ||
    !password?.trim() ||
    !fullName?.trim() ||
    (!email?.trim() && !phoneNumber?.trim())
  ) {
    throw new ApiError(400, "All required fields must be filled");
  }

  const key = `otp:${email || phoneNumber}`;

  // const exists = await redisClient.get(key);
  let exists = null;

  try {
    exists = await redisClient.get(key);
  } catch (err) {
    console.log("Redis error, skipping rate limit");
  }

  if (exists) {
    throw new ApiError(429, "Please wait before requesting OTP again");
  }
  // const existingUser = await User.findOne({
  //   $or: [{ email: tempUser.email }, { phoneNumber: tempUser.phoneNumber }]
  // });

  const conditions = [];

  if (username) conditions.push({ username });
  if (email) conditions.push({ email });
  if (phoneNumber) conditions.push({ phoneNumber });

  const existedUser = await User.findOne({ $or: conditions });

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

  // const existingUser = await User.findOne({
  //   $or: [{ email: tempUser.email }, { phoneNumber: tempUser.phoneNumber }]
  // });
  const conditions = [];

  if (tempUser.email) conditions.push({ email: tempUser.email });
  if (tempUser.phoneNumber) conditions.push({ phoneNumber: tempUser.phoneNumber });

  const existingUser = await User.findOne({ $or: conditions });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }
  console.log("TEMP USER PASSWORD:", tempUser.password);
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

  // const user = await User.findOne({
  //   $or: [{ email }, { phoneNumber }]
  // });

  const conditions = [];

  if (email) conditions.push({ email });
  if (phoneNumber) conditions.push({ phoneNumber });

  if (conditions.length !== 1) {
    throw new ApiError(400, "Provide either email OR phone number");
  }

  const user = await User.findOne(conditions[0]);

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

  const conditions = [];

  if (email) conditions.push({ email });
  if (phoneNumber) conditions.push({ phoneNumber });

  if (conditions.length !== 1) {
    throw new ApiError(400, "Provide either email OR phone number");
  }

  const user = await User.findOne(conditions[0]).select("+password");
  console.log("RESET USER ID:", user?._id);
  console.log("RESET EMAIL:", user?.email);
  console.log("RESET HASH:", user?.password);

  if (!user) throw new ApiError(404, "User not found");

  user.password = newPassword;
  // await user.setPassword(newPassword);
  console.log("AFTER SET HASH:", user.password);
  await user.save({ validateBeforeSave: false });
  console.log("AFTER SAVE HASH:", user.password);

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

  const conditions = [];

  if (email) conditions.push({ email });
  if (phoneNumber) conditions.push({ phoneNumber });

  if (conditions.length !== 1) {
    throw new ApiError(400, "Provide either email OR phone number");
  }

  const user = await User.findOne(conditions[0])
    .select("+password +sessions");
  console.log("LOGIN USER ID:", user?._id);
  console.log("LOGIN EMAIL:", user?.email);
  console.log("LOGIN HASH:", user?.password);

  if (!user) throw new ApiError(404, "User not found");
  console.log("User password", password);
  console.log("Hashed password", user.password);

  const isValid = await user.isPasswordCorrect(password);
  console.log("Entered password length:", password.length);
  console.log("Hashed password length:", user.password.length);
  console.log("Password match:", isValid);
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