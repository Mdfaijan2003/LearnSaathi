import express from "express";
import { rateVideo } from "../controllers/rating.controller.js";
import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, rateVideo);

export default router;