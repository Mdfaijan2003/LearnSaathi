import express from "express";
import {
  createQuestion,
  getQuestionsByTopic,
  getQuestionById
} from "../controllers/question.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();


// create question
router.post("/", verifyJWT, createQuestion);


// get by topic
router.get("/topic/:topicId", getQuestionsByTopic);


// get single question
router.get("/:questionId", getQuestionById);


export default router;