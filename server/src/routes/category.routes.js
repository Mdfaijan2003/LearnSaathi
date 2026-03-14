import express from "express";
import { createCategory, getCategories } from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createCategory);
router.get("/", getCategories);

export default router;