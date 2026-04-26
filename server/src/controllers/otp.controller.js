import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import { verifyOtpService } from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateOtp } from "../utils/generateOtp.js";


/* Verify OTP */

export const verifyOtp = asyncHandler(async (req, res) => {

  const result = await verifyOtpService(req.body);

  return res.status(200).json(
    new ApiResponse(200, result, "Account created")
  );

});



/* Resend OTP */

export const resendOtp = asyncHandler(async(req,res)=>{

  const {email,phoneNumber,purpose} = req.body;

  if(!email && !phoneNumber){
    throw new ApiError(400,"Either email or phone number is required");
  }

  const otp = generateOtp();

  const expires = new Date(Date.now() + 5*60*1000);

  // await OTP.deleteMany({
  //   $or:[{email},{phoneNumber}],
  //   purpose
  // });

  const conditions = [];

  if (email) conditions.push({ email });
  if (phoneNumber) conditions.push({ phoneNumber });

  await OTP.deleteMany({
    $or: conditions,
    purpose
  });

  const hash = (value) =>
    crypto.createHash("sha256").update(value).digest("hex");

  await OTP.create({
    email,
    phoneNumber,
    otp: hash(otp),
    purpose,
    expiresAt: expires
  });

  console.log("Resend OTP:",otp);

  return res.status(200).json(
    new ApiResponse(200,{},"OTP resent successfully")
  );

});