import express from "express";
import { createProgram, getPrograms } from "../controllers/program.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createProgram);
router.get("/", getPrograms);

export default router;