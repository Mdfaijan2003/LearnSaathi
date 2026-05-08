  import express from "express";

  import {
    uploadOfficialNote,
    getOfficialNotes,
    getOfficialNoteById,
    searchOfficialNotes,
    downloadOfficialNote,
    deleteOfficialNote
  } from "../controllers/officialNote.controller.js";

  import { verifyJWT } from "../middlewares/user.auth.middleware.js";

  import { allowRoles } from "../middlewares/role.middleware.js";

  import { requireApprovedTeacher } from "../middlewares/teacher.middleware.js";

  import {
    uploadDocument
  } from "../middlewares/multer.middleware.js";


  const router = express.Router();


  /* =====================================================
    PUBLIC ROUTES
  ===================================================== */

  // 📚 Get all official notes
  router.get(
    "/find/",
    getOfficialNotes
  );


  // 🔍 Search official notes
  router.get(
    "/search",
    searchOfficialNotes
  );


  // 📄 Get official note by ID
  router.get(
    "/find/:id",
    getOfficialNoteById
  );


  // ⬇️ Download official note
  router.get(
    "/download/:id",
    downloadOfficialNote
  );


  /* =====================================================
    PROTECTED ROUTES
  ===================================================== */

  // 📤 Upload official note
  router.post(
    "/upload",
    verifyJWT,
    allowRoles("admin", "teacher"),
    requireApprovedTeacher,
    uploadDocument.single("file"),
    uploadOfficialNote
  );


  // ❌ Delete official note
  router.delete(
    "/delete/:id",
    verifyJWT,
    allowRoles("admin", "teacher"),
    deleteOfficialNote
  );


  export default router;  