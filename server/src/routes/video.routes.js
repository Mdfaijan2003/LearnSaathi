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

import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();


/* -------------------- PUBLIC ROUTES -------------------- */

// 🔥 Get all videos (filter + pagination + sorting)
router.get("/view/", getVideos);

// 🔍 Search videos
router.get("/search", searchVideos);

// 📺 Get single video + related + increment views
router.get("/view/:id", getVideoById);


/* -------------------- PROTECTED ROUTES -------------------- */

// 🎥 Upload video (teacher/admin only)
router.post(
  "/upload",
  verifyJWT,
  allowRoles("teacher", "admin"),
  requireApprovedTeacher,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),   // for internal upload
  uploadVideo
);

router.delete(
  "/delete/:id",
  verifyJWT,
  allowRoles("admin", "teacher"),
  deleteVideo
);


export default router;