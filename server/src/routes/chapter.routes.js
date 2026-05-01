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
router.get("/view/", getAllChapters);
router.get("/view/:id", getChapterById);

/* ADMIN */
router.post("/create/", verifyJWT, allowRoles("admin"), createChapter);
router.patch("/update/:id", verifyJWT, allowRoles("admin"), updateChapter);
router.delete("/delete/:id", verifyJWT, allowRoles("admin"), deleteChapter);

export default router;