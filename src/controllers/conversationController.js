import asyncHandler from "express-async-handler";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

/**
 * @DESC Create or Get a conversation between two users
 * @ROUTE /api/v1/conversations
 * @method POST
 * @access Private
 */
export const createConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;

  const senderId = req.me._id; // Assuming req.me contains the authenticated user's info

  if (!senderId || !receiverId) {
    return res
      .status(400)
      .json({ message: "Sender and Receiver are required" });
  }

  // Check if a conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  res.status(200).json({
    message: "Conversation found or created",
    conversation,
  });
});

/**
 * @DESC Get all conversations of a user
 * @ROUTE /api/v1/conversations/:userId
 * @method GET
 * @access Private
 */
export const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.me._id; // Assuming req.me contains the authenticated user's info

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "-password")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name email profilePhoto",
      },
    })
    .sort({ updatedAt: -1 });

  res.status(200).json(conversations);
});
