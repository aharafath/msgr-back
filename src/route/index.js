import express from "express";
import adminUserRouter from "./admin/user.js";
import authRouter from "./auth.js";
import adminRoleRouter from "./admin/role.js";
import singleUserRouter from "./user/user.js";
import conversationRouter from "./user/conversation.js";
import messageRouter from "./user/message.js";

const router = express.Router();

// Root route for test
router.get("/api/v1/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Messenger API",
  });
});

router.use("/api/v1/admin/user", adminUserRouter);
router.use("/api/v1/auth", authRouter);
router.use("/api/v1/admin/role", adminRoleRouter);
router.use("/api/v1/single-user", singleUserRouter);
router.use("/api/v1/user-conversation", conversationRouter);
router.use("/api/v1/conversation-message", messageRouter);

export default router;
