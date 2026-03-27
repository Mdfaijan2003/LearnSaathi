import express from "express";
import {
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram
} from "../controllers/program.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();


/* -------------------- PUBLIC -------------------- */

router.get("/", getAllPrograms);
router.get("/:id", getProgramById);


/* -------------------- ADMIN -------------------- */

router.post(
  "/",
  verifyJWT,
  allowRoles("admin"),
  createProgram
);

router.patch(
  "/:id",
  verifyJWT,
  allowRoles("admin"),
  updateProgram
);

router.delete(
  "/:id",
  verifyJWT,
  allowRoles("admin"),
  deleteProgram
);

export default router;