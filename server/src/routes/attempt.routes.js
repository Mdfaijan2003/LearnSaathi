import express from "express";
import {
  submitAttempt,
  getMyAttempts,
  getAttemptStats
} from "../controllers/attempt.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();


// submit answer
router.post("/", verifyJWT, submitAttempt);


// my attempts
router.get("/my", verifyJWT, getMyAttempts);


// stats
router.get("/stats", verifyJWT, getAttemptStats);


export default router;