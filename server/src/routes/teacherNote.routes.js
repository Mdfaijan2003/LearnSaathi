import express from "express";

import {
  uploadNote,
  getNotes,
  getNoteById,
  downloadNote,
  deleteNote,
  searchNotes
} from "../controllers/teacherNote.controller.js";

// import { searchNotes } from "../controllers/teacherNote.search.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { requireApprovedTeacher } from "../middlewares/teacher.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

/* =========================================================
   🔥 PUBLIC ROUTES
========================================================= */

// 🔍 Search notes (YouTube-style)
router.get("/search", searchNotes);

// 📚 Get all notes (filter + pagination)
router.get("/", getNotes);

// 📄 Get single note (with view count)
router.get("/:id", getNoteById);

// ⬇️ Download note
router.get("/download/:id", downloadNote);


/* =========================================================
   🔐 PROTECTED ROUTES
========================================================= */

// 📤 Upload note (teacher/admin only)
router.post(
  "/upload",
  verifyJWT,
  allowRoles("teacher", "admin"),
  requireApprovedTeacher,
  upload.single("file"), // PDF upload
  uploadNote
);

// 🗑 Delete note
router.delete(
  "/delete/:id",
  verifyJWT,
  allowRoles("teacher", "admin"),
  deleteNote
);

export default router;