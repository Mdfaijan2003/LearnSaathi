import express from "express";
import {
  updateWatchHistory,
  getVideoWatchProgress,
  getUserWatchHistory
} from "../controllers/watchHistory.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/update", verifyJWT, updateWatchHistory);

router.get("/video/:videoId", verifyJWT, getVideoWatchProgress);

router.get("/me", verifyJWT, getUserWatchHistory);

export default router;