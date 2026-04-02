import express from "express";
import {
  toggleBookmark,
  getBookmarks,
  deleteBookmark
} from "../controllers/bookmark.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/toggle", verifyJWT, toggleBookmark);
router.get("/", verifyJWT, getBookmarks);
router.delete("/:id", verifyJWT, deleteBookmark);

export default router;