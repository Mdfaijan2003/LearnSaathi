import express from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  uploadAvatarController,
  getCurrentUser,
  changeCurrentPassword,
  forgotPassword,
  resetPassword,
  updateAccountDetails,
  uploadCoverImage,
  deleteCoverImage,
  updateAvatar,
  updateCoverImage,
  googleLoginSuccess

} from "../controllers/user.auth.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import passport from "passport";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post(
  "/upload-avatar",
  verifyJWT,
  upload.single("avatar"),
  uploadAvatarController
);
router.get("/me", verifyJWT, getCurrentUser);

router.post("/change-password", verifyJWT, changeCurrentPassword);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.patch("/update-account", verifyJWT, updateAccountDetails);

router.post(
  "/upload-cover",
  verifyJWT,
  upload.single("coverImage"),
  uploadCoverImage
);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleLoginSuccess
);

router.patch(
	"/update-avatar",
	verifyJWT,
	upload.single("avatar"),
	updateAvatar
);

router.patch(
	"/update-cover-image",
	verifyJWT,
	upload.single("coverImage"),
	updateCoverImage
);

router.delete(
  "/delete-cover-image",
  verifyJWT,
  deleteCoverImage
);

export default router;