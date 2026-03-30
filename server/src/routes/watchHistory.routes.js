import express from "express";
import {
  updateWatchProgress,
  getContinueWatching,
  getAdvancedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations
} from "../controllers/watchHistory.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/progress", verifyJWT, updateWatchProgress);

router.get("/continue", verifyJWT, getContinueWatching);

router.get("/recommendations", verifyJWT, getAdvancedRecommendations);
router.get(
  "/collaborative",
  verifyJWT,
  getCollaborativeRecommendations
);

router.get(
  "/hybrid",
  verifyJWT,
  getHybridRecommendations
);
export default router;