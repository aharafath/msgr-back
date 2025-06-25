import express from "express";

import tokenVerify from "../../middlewares/verifyToken.js";
import {
  getMessages,
  sendMessage,
} from "../../controllers/messageController.js";

const router = express.Router();

// Protect all routes
router.use(tokenVerify);

// Send a message
router.post("/", sendMessage);

// Get all messages in a conversation
router.get("/:otherParticipantId", getMessages);

export default router;
