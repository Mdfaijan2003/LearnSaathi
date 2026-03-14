import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateOtp } from "../utils/generateOtp.js";


/* Verify OTP */

export const verifyOtp = asyncHandler(async(req,res)=>{

  const {email,phoneNumber,otp} = req.body;

  if(!email && !phoneNumber){
    throw new ApiError(400,"Either email or phone number is required");
  }

  const otpDoc = await OTP.findOne({
    $or:[{email: email || ""},
      {phoneNumber: phoneNumber || ""}
    ],
    otp,
    purpose:"register",
    isUsed:false
  });

  console.log("OTP DOC:", otpDoc);

  if(!otpDoc){
    throw new ApiError(400,"Invalid OTP or OTP already used");
  }

  if(otpDoc.expiresAt < new Date()){
    throw new ApiError(400,"OTP expired");
  }

  // if(otpDoc.otp !== otp){
  //   throw new ApiError(400,"Invalid OTP");
  // }

  const tempUser = otpDoc.tempUser;

  if(!tempUser){
    throw new ApiError(400,"Invalid registration data. Please register again.");
  }

  const existingUser = await User.findOne({
    $or: [{ email: tempUser.email }, { phoneNumber: tempUser.phoneNumber }]
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    username: tempUser.username,
    email: tempUser.email,
    password: tempUser.password,
    fullName: tempUser.fullName,
    phoneNumber: tempUser.phoneNumber,
    role: "student",
    authProvider: "local",
    isEmailVerified: true
  });


  otpDoc.isUsed = true;
  await otpDoc.save();

  //  await OTP.deleteOne({ _id: otpDoc._id });

  // if(tempUser.email){
  //   await User.findOneAndUpdate(
  //     {email: tempUser.email},
  //     {isEmailVerified:true}
  //   );
  // }

  // if(tempUser.phoneNumber){
  //   await User.findOneAndUpdate(
  //     {phoneNumber: tempUser.phoneNumber},
  //     {isPhoneVerified:true}
  //   );
  // }

  return res.status(200).json(
    new ApiResponse(200,{},"Account created successfully. You can now log in.")
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

  await OTP.deleteMany({
    $or:[{email},{phoneNumber}],
    purpose
  });

  await OTP.create({
    email,
    phoneNumber,
    otp,
    purpose,
    expiresAt:expires
  });

  console.log("Resend OTP:",otp);

  return res.status(200).json(
    new ApiResponse(200,{},"OTP resent successfully")
  );

});