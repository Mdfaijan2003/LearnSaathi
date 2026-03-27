import express from "express";
import {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter
} from "../controllers/chapter.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getAllChapters);
router.get("/:id", getChapterById);

/* ADMIN */
router.post("/", verifyJWT, allowRoles("admin"), createChapter);
router.patch("/:id", verifyJWT, allowRoles("admin"), updateChapter);
router.delete("/:id", verifyJWT, allowRoles("admin"), deleteChapter);

export default router;