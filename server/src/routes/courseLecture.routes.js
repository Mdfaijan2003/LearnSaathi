import express from "express";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import {
  createLecture,
  getLecturesByModule
} from "../controllers/courseLecture.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createLecture);
router.get("/module/:moduleId", getLecturesByModule);

export default router;