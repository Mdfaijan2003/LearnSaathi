import express from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote
} from "../controllers/userNote.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

/* 🔐 Protected */

router.post("/createNote", verifyJWT, createNote);

router.get("/myNotes", verifyJWT, getNotes);

router.get("/note/:id", verifyJWT, getNoteById);

router.patch("/updateNote/:id", verifyJWT, updateNote);

router.delete("/deleteNote/:id", verifyJWT, deleteNote);

export default router;