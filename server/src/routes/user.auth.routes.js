import express from "express";

import {

  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  forgotPassword,
  resetPassword,
  updateAccountDetails,
  uploadCoverImage,
  deleteCoverImage,
  uploadAvatar,
  updateAvatar,
  updateCoverImage,
  googleLoginSuccess

} from "../controllers/user.auth.controller.js";

import {
  verifyOtp,
  resendOtp
} from "../controllers/otp.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

import { uploadImage } from "../middlewares/multer.middleware.js";

import passport from "passport";

const router = express.Router();


/* =====================================================
   AUTH
===================================================== */

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/logout",
  verifyJWT,
  logoutUser
);

router.post(
  "/refresh-token",
  refreshAccessToken
);


/* =====================================================
   OTP
===================================================== */

router.post(
  "/verify-otp",
  verifyOtp
);

router.post(
  "/resend-otp",
  resendOtp
);


/* =====================================================
   PASSWORD
===================================================== */

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);


/* =====================================================
   USER
===================================================== */

router.get(
  "/me",
  verifyJWT,
  getCurrentUser
);

router.post(
  "/change-password",
  verifyJWT,
  changeCurrentPassword
);

router.patch(
  "/update-account",
  verifyJWT,
  updateAccountDetails
);


/* =====================================================
   AVATAR
===================================================== */

router.post(
  "/upload-avatar",
  verifyJWT,
  uploadImage.single("avatar"),
  uploadAvatar
);

router.patch(
  "/update-avatar",
  verifyJWT,
  uploadImage.single("avatar"),
  updateAvatar
);


/* =====================================================
   COVER IMAGE
===================================================== */

router.post(
  "/upload-cover-image",
  verifyJWT,
  uploadImage.single("coverImage"),
  uploadCoverImage
);

router.patch(
  "/update-cover-image",
  verifyJWT,
  uploadImage.single("coverImage"),
  updateCoverImage
);

router.delete(
  "/delete-cover-image",
  verifyJWT,
  deleteCoverImage
);


/* =====================================================
   GOOGLE AUTH
===================================================== */

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login"
  }),
  googleLoginSuccess
);

export default router;