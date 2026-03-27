import express from "express";

import {
  uploadVideo,
  getVideos,
  getVideoById,
  searchVideos
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { requireApprovedTeacher } from "../middlewares/teacher.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();


/* -------------------- PUBLIC ROUTES -------------------- */

// 🔥 Get all videos (filter + pagination + sorting)
router.get("/", getVideos);

// 🔍 Search videos
router.get("/search", searchVideos);

// 📺 Get single video + related + increment views
router.get("/:id", getVideoById);


/* -------------------- PROTECTED ROUTES -------------------- */

// 🎥 Upload video (teacher/admin only)
router.post(
  "/upload",
  verifyJWT,
  allowRoles("teacher", "admin"),
  requireApprovedTeacher,
  upload.single("video"),   // for internal upload
  uploadVideo
);


export default router;