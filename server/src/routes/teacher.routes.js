import express from "express";
import { getTeacherDashboard } from "../controllers/teacher.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { requireApprovedTeacher } from "../middlewares/teacher.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyJWT,
  allowRoles("teacher"),
  requireApprovedTeacher,
  getTeacherDashboard
);

export default router;