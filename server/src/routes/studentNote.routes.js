import express from "express";
import {
  createStudentNote,
  getStudentNotes,
  getStudentNoteById,
  updateStudentNote,
  deleteStudentNote,
  togglePinNote,
  archiveStudentNote,
  searchStudentNotes,
  getVideoTimestampNotes
} from "../controllers/studentNote.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();


/* =====================================================
   ALL ROUTES PROTECTED
===================================================== */

router.use(verifyJWT);


/* =====================================================
   CREATE NOTE
===================================================== */

// 📝 create student note
router.post(
  "/create",
  createStudentNote
);


/* =====================================================
   GET NOTES
===================================================== */

// 📚 get all student notes
router.get(
  "/get/",
  getStudentNotes
);


// 🔍 search student notes
router.get(
  "/search",
  searchStudentNotes
);


// 📄 get single note
router.get(
  "/get/:id",
  getStudentNoteById
);


/* =====================================================
   UPDATE NOTE
===================================================== */

// ✏️ update student note
router.patch(
  "/update/:id",
  updateStudentNote
);


/* =====================================================
   DELETE NOTE
===================================================== */

// ❌ soft delete note
router.delete(
  "/delete/:id",
  deleteStudentNote
);


/* =====================================================
   PIN NOTE
===================================================== */

// 📌 pin/unpin note
router.patch(
  "/pin/:id",
  togglePinNote
);


/* =====================================================
   ARCHIVE NOTE
===================================================== */

// 🗂 archive/unarchive note
router.patch(
  "/archive/:id",
  archiveStudentNote
);


/* =====================================================
   VIDEO TIMESTAMP NOTES
===================================================== */

// 🎥 get notes linked to video timeline
router.get(
  "/video/:videoId",
  getVideoTimestampNotes
);


export default router;