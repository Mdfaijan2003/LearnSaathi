import express from "express";
import {
  markTopicComplete,
  getTopicProgress,
  getUserProgress
} from "../controllers/progress.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/topic", verifyJWT, markTopicComplete);

router.get("/topic/:topicId", verifyJWT, getTopicProgress);

router.get("/me", verifyJWT, getUserProgress);

export default router;