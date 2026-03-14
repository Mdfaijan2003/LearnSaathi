import express from "express";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";

import {
  startTest,
  saveAnswer,
  submitTest,
  getAttempt,
  getMyAttempts
} from "../controllers/test.controller.js";

const router = express.Router();

router.post("/start", verifyJWT, startTest);
router.post("/save-answer", verifyJWT, saveAnswer);
router.post("/submit", verifyJWT, submitTest);

router.get("/attempt/:id", verifyJWT, getAttempt);
router.get("/my", verifyJWT, getMyAttempts);

export default router;