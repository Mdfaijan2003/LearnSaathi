import express from "express";

import {

  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  publishQuiz

} from "../controllers/quiz.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

import { allowRoles } from "../middlewares/role.middleware.js";

import { requireApprovedTeacher } from "../middlewares/teacher.middleware.js";


const router = express.Router();


/* =====================================================
   PUBLIC ROUTES
===================================================== */

// 📚 Get all quizzes
router.get(
  "/",
  getQuizzes
);


// 📄 Get single quiz
router.get(
  "/:id",
  getQuizById
);


/* =====================================================
   PROTECTED ROUTES
===================================================== */

// 🔐 all below routes protected
router.use(verifyJWT);


/* =====================================================
   TEACHER / ADMIN ROUTES
===================================================== */

// 📝 Create quiz
router.post(
  "/create",
  allowRoles("teacher", "admin"),
  requireApprovedTeacher,
  createQuiz
);


// ✏️ Update quiz
router.patch(
  "/update/:id",
  allowRoles("teacher", "admin"),
  requireApprovedTeacher,
  updateQuiz
);


// 🚀 Publish / Unpublish quiz
router.patch(
  "/publish/:id",
  allowRoles("teacher", "admin"),
  requireApprovedTeacher,
  publishQuiz
);


// ❌ Delete quiz
router.delete(
  "/delete/:id",
  allowRoles("teacher", "admin"),
  requireApprovedTeacher,
  deleteQuiz
);


export default router;