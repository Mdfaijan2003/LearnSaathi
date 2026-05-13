import express from "express";
import {
  createAdmin, 
  getAdminDashboard,
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getUserGrowth
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/create-admin",
  verifyJWT,
  allowRoles("admin"),
  createAdmin
);

router.get(
  "/dashboard",
  verifyJWT,
  allowRoles("admin"),
  getAdminDashboard
);

router.get(
  "/teachers/pending",
  verifyJWT,
  allowRoles("admin"),
  getPendingTeachers
);

router.patch(
  "/teachers/approve/:id",
  verifyJWT,
  allowRoles("admin"),
  approveTeacher
);

router.patch(
  "/teachers/reject/:id",
  verifyJWT,
  allowRoles("admin"),
  rejectTeacher
);

router.get(
  "/analytics/user-growth",
  verifyJWT,
  allowRoles("admin"),
  getUserGrowth
);

export default router;