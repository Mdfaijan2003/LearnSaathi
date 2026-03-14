import express from "express";
import { createChapter, getChapters } from "../controllers/chapter.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createChapter);
router.get("/", getChapters);

export default router;