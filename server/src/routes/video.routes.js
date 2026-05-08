import express from "express";

import {
  uploadVideo,
  getVideos,
  getVideoById,
  searchVideos,
  deleteVideo
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

import { allowRoles } from "../middlewares/role.middleware.js";

import { requireApprovedTeacher } from "../middlewares/teacher.middleware.js";

import { uploadCourseVideo } from "../middlewares/multer.middleware.js";

const router = express.Router();


/* =====================================================
   PUBLIC ROUTES
===================================================== */

// 🎥 Get all videos
router.get(
  "/",
  getVideos
);

// 🔍 Search videos
router.get(
  "/search",
  searchVideos
);

// 📺 Get single video
router.get(
  "/:id",
  getVideoById
);


/* =====================================================
   PROTECTED ROUTES
===================================================== */

// 🎬 Upload video
router.post(
  "/upload",
  verifyJWT,
  allowRoles("teacher", "admin"),
  requireApprovedTeacher,
  uploadCourseVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  uploadVideo
);


// ❌ Delete video
router.delete(
  "/:id",
  verifyJWT,
  allowRoles("admin", "teacher"),
  deleteVideo
);


export default router;