import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

/**
 * @DESC Send a message
 * @ROUTE /api/v1/messages
 * @method POST
 * @access Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  const senderId = req.me._id; // Assuming req.me contains the authenticated user's info

  if (!receiverId || !senderId || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if conversation exists
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    // Create a new conversation if it doesn't exist
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      lastMessage: null,
    });

    // Create the message
    if (!conversation) {
      return res.status(500).json({ message: "Conversation creation failed" });
    }
  }

  const conversationId = conversation._id;

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
  });

  // Update last message in conversation
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    updatedAt: new Date(),
  });

  const finalMessage = await Message.findById(message._id).populate(
    "sender",
    "name email profilePhoto"
  );

  res.status(201).json({
    message: "Message sent",
    data: finalMessage,
  });
});

/**
 * @DESC Get messages of a conversation
 * @ROUTE /api/v1/messages/:conversationId
 * @method GET
 * @access Private
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { otherParticipantId } = req.params;
  const userId = req.me._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, otherParticipantId] },
  });

  if (!conversation) {
    return res.status(200).json([]);
  }

  const messages = await Message.find({ conversation: conversation._id })
    .populate("sender", "name email profilePhoto")
    .sort({ createdAt: 1 });

  res.status(200).json(messages);
});
