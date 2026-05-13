import express from "express";

import {

  startQuizAttempt,
  submitQuizAttempt,
  getQuizResult,
  getMyAttempts

} from "../controllers/quizAttempt.controller.js";

import { verifyJWT }
from "../middlewares/user.auth.middleware.js";


const router = express.Router();


/* =====================================================
   ALL ROUTES PROTECTED
===================================================== */

router.use(verifyJWT);


/* =====================================================
   QUIZ ATTEMPTS
===================================================== */

// 🚀 Start quiz
router.post(
  "/start/:quizId",
  startQuizAttempt
);


// ✅ Submit quiz
router.post(
  "/submit/:quizId",
  submitQuizAttempt
);


// 📄 Get result
router.get(
  "/result/:attemptId",
  getQuizResult
);


// 📚 My attempts
router.get(
  "/my-attempts",
  getMyAttempts
);


export default router;