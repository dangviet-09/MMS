const express = require("express");
const router = express.Router();
const ConversationController = require("../controllers/conversationController");
const Auth = require("../middlewares/AuthMiddleware");

// Tất cả require login
router.use(Auth.verifyToken);

// 0. Lấy danh sách conversation của user
router.get("/", ConversationController.listConversations);

// 1. Lấy hoặc tạo conversation
router.get("/:userId", ConversationController.getOrCreateConversation);

// 2. Lấy tin nhắn
router.get("/messages/:id", ConversationController.getMessages);

// 3. Gửi tin nhắn
router.post("/messages/:id", ConversationController.sendMessage);

// 4. Xóa tin nhắn
router.delete("/messages/:messageId", ConversationController.deleteMessage);

// 5. Xóa conversation
router.delete("/:conversationId", ConversationController.deleteConversation);

module.exports = router;
