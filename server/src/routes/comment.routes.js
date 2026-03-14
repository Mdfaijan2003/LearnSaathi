import express from "express";
import {
  createComment,
  getVideoComments,
  getReplies,
  pinComment
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";

const router = express.Router();


// Add a comment or reply
router.post(
  "/",
  verifyJWT,
  createComment
);


// Get comments for a video
router.get(
  "/video/:videoId",
  getVideoComments
);


// Get replies for a comment
router.get(
  "/replies/:commentId",
  getReplies
);


router.patch(
  "/pin/:commentId",
  verifyJWT,
  pinComment
);


export default router;