import express from "express";
import {
  updateProgress,
  getTopicProgress,
  continueWatching
} from "../controllers/UserProgress.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/update", verifyJWT, updateProgress);
router.get("/topic/:topicId", verifyJWT, getTopicProgress);
router.get("/continue", verifyJWT, continueWatching);

export default router;