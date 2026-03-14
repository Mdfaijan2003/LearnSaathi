import express from "express";
import {
  uploadNote,
  getNoteById,
  getNotesByTopic,
  getNotesByChapter,
  getNotesBySubject,
  searchNotes
} from "../controllers/note.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();


// upload note
router.post(
  "/upload",
  verifyJWT,
  upload.fields([{ name: "file", maxCount: 1 }]),
  uploadNote
);


// fetch notes
router.get("/:noteId", getNoteById);

router.get("/topic/:topicId", getNotesByTopic);

router.get("/chapter/:chapterId", getNotesByChapter);

router.get("/subject/:subjectId", getNotesBySubject);


// search
router.get("/search/query", searchNotes);


export default router;