import express from "express";

import {
  updateWatchProgress,
  getContinueWatching,
  getWatchHistory,
  removeFromHistory,
  getAdvancedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations
} from "../controllers/watchHistory.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();


/* =========================================================
   WATCH PROGRESS
========================================================= */

// 🔥 update watch progress
router.post(
  "/progress",
  verifyJWT,
  updateWatchProgress
);


/* =========================================================
   WATCH HISTORY
========================================================= */

// 📜 full watch history
router.get(
  "/history",
  verifyJWT,
  getWatchHistory
);

// ❌ remove from history
router.delete(
  "/history/:videoId",
  verifyJWT,
  removeFromHistory
);


/* =========================================================
   CONTINUE WATCHING
========================================================= */

// ▶️ continue watching section
router.get(
  "/continue-watching",
  verifyJWT,
  getContinueWatching
);


/* =========================================================
   RECOMMENDATIONS
========================================================= */

// 🎯 content-based recommendations
router.get(
  "/recommendations",
  verifyJWT,
  getAdvancedRecommendations
);

// 👥 collaborative filtering
router.get(
  "/recommendations/collaborative",
  verifyJWT,
  getCollaborativeRecommendations
);

// 🧠 hybrid AI recommendations
router.get(
  "/recommendations/hybrid",
  verifyJWT,
  getHybridRecommendations
);


export default router;