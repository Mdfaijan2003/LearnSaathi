import express from "express";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import {
  enrollCourse,
  getMyCourses
} from "../controllers/enrollment.controller.js";

const router = express.Router();

router.post("/", verifyJWT, enrollCourse);
router.get("/my", verifyJWT, getMyCourses);

export default router;