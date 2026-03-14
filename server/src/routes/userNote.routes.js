import express from "express";
import {
  createUserNote,
  getMyNotes,
  getMyNotesByTopic,
  updateUserNote,
  deleteUserNote
} from "../controllers/userNote.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();


// create note
router.post("/", verifyJWT, createUserNote);


// get my notes
router.get("/my", verifyJWT, getMyNotes);


// notes for specific topic
router.get("/topic/:topicId", verifyJWT, getMyNotesByTopic);


// update note
router.patch("/:noteId", verifyJWT, updateUserNote);


// delete note
router.delete("/:noteId", verifyJWT, deleteUserNote);


export default router;