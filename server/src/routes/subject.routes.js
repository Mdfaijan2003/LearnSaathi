import express from "express";
import { createSubject, getSubjects } from "../controllers/subject.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createSubject);
router.get("/", getSubjects);

export default router;