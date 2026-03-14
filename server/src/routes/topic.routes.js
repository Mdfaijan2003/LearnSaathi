import express from "express";
import { createTopic, getTopics } from "../controllers/topic.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createTopic);
router.get("/", getTopics);

export default router;