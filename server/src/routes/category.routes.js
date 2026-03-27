import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();


/* -------------------- PUBLIC / OPTIONAL AUTH -------------------- */

// Optional auth (admin gets extra data)
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);


/* -------------------- ADMIN ONLY -------------------- */

router.post(
  "/",
  verifyJWT,
  allowRoles("admin"),
  createCategory
);

router.patch(
  "/:id",
  verifyJWT,
  allowRoles("admin"),
  updateCategory
);

router.delete(
  "/:id",
  verifyJWT,
  allowRoles("admin"),
  deleteCategory
);

export default router;