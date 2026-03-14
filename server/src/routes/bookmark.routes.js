import express from "express";
import {
  addBookmark,
  removeBookmark,
  getMyBookmarks
} from "../controllers/bookmark.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, addBookmark);

router.delete("/", verifyJWT, removeBookmark);

router.get("/me", verifyJWT, getMyBookmarks);

export default router;