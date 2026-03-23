import express from "express";
import {
  uploadVideo,
  getVideoById,
  getVideosByTopic,
  getVideosByChapter,
  getVideosBySubject,
  getVideosByProgram,
  searchVideos
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { requireApprovedTeacher } from "../middlewares/teacher.middleware.js";

const router = express.Router();


// Upload video
router.post(
  "/upload-video",
  verifyJWT,
  allowRoles("teacher","admin"),
  upload.fields([{ name: "video", maxCount: 1 }]),
  requireApprovedTeacher,
  uploadVideo
);


// Fetch videos
router.get("/:videoId", getVideoById);
router.get("/topic/:topicId", getVideosByTopic);
router.get("/chapter/:chapterId", getVideosByChapter);
router.get("/subject/:subjectId", getVideosBySubject);
router.get("/program/:programId", getVideosByProgram);


// Search
router.get("/search/query", searchVideos);


export default router;