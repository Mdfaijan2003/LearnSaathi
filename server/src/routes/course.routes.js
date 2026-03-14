import express from "express";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  getFullCourse
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createCourse);
router.get("/", getCourses);
router.get("/:courseId", getCourseById);
router.get("/:courseId/full", getFullCourse);

export default router;