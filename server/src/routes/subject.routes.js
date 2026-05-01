import express from "express";
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} from "../controllers/subject.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();


/* -------------------- PUBLIC -------------------- */

router.get("/view/", getAllSubjects);
router.get("/view/:id", getSubjectById);


/* -------------------- ADMIN -------------------- */

router.post(
  "/create/",
  verifyJWT,
  allowRoles("admin"),
  createSubject
);

router.patch(
  "/update/:id",
  verifyJWT,
  allowRoles("admin"),
  updateSubject
);

router.delete(
  "/delete/:id",
  verifyJWT,
  allowRoles("admin"),
  deleteSubject
);

export default router;