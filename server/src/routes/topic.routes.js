import express from "express";
import {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic
} from "../controllers/topic.controller.js";

import { verifyJWT } from "../middlewares/user.auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getAllTopics);
router.get("/:id", getTopicById);

/* ADMIN */
router.post("/", verifyJWT, allowRoles("admin"), createTopic);
router.patch("/:id", verifyJWT, allowRoles("admin"), updateTopic);
router.delete("/:id", verifyJWT, allowRoles("admin"), deleteTopic);

export default router;