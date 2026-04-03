import express from "express";
import {
  startSession,
  resumeSession,
  submitSession,
  getSession
} from "../controllers/practice.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

/* 🔥 PRACTICE ROUTES */
router.post("/start", verifyJWT, startSession);
router.get("/resume", verifyJWT, resumeSession);
router.post("/submit/:id", verifyJWT, submitSession);
router.get("/:id", verifyJWT, getSession);

export default router;