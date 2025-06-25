import express from "express";

import tokenVerify from "../../middlewares/verifyToken.js";
import {
  createConversation,
  getUserConversations,
} from "../../controllers/conversationController.js";

const router = express.Router();

// Protect all routes
router.use(tokenVerify);

// Create or get a conversation between two users
router.post("/", createConversation);

// Get all conversations for a specific user
router.get("/", getUserConversations);

export default router;
