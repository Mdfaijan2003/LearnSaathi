import express from "express";

import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  checkAnswer
} from "../controllers/question.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/* =====================================================
   🔥 PUBLIC ROUTES
===================================================== */

// Get all questions (filters + pagination)
router.get("/", getQuestions);

// Get single question (NO answers exposed)
router.get("/:id", getQuestionById);


/* =====================================================
   🔥 PRACTICE / ANSWER
===================================================== */

// Check answer (student use)
router.post("/answer/:id", verifyJWT, checkAnswer);


/* =====================================================
   🔥 PROTECTED (TEACHER / ADMIN)
===================================================== */

// Create question
router.post(
  "/create",
  verifyJWT,
  allowRoles("teacher", "admin"),
  createQuestion
);

// Update question
router.patch(
  "/update/:id",
  verifyJWT,
  allowRoles("teacher", "admin"),
  updateQuestion
);

// Delete (soft delete)
router.delete(
  "/delete/:id",
  verifyJWT,
  allowRoles("teacher", "admin"),
  deleteQuestion
);

export default router;