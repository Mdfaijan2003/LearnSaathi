import express from "express";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import {
  createModule,
  getModulesByCourse
} from "../controllers/courseModule.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createModule);
router.get("/course/:courseId", getModulesByCourse);

export default router;