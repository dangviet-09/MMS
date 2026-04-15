const db = require("../models");
const { Op } = require("sequelize");

class ConversationService {

  // Tạo hoặc lấy conversation giữa 2 người
  async getOrCreateConversation(userId, otherUserId) {
    if (!otherUserId) throw new Error("otherUserId is required");
    // Tìm tất cả conversation PRIVATE mà user đang tham gia
    const userConvos = await db.Conversation.findAll({
      where: { type: "PRIVATE" },
      include: [
        {
          model: db.User,
          through: { attributes: [] },
          where: { id: userId },
        },
      ],
    });

    // Kiểm tra từng conversation xem có đúng 2 participant và có otherUserId
    for (const convo of userConvos) {
      const participants = await convo.getUsers({ attributes: ["id"] });
      const ids = participants.map((p) => p.id);
      if (ids.length === 2 && ids.includes(otherUserId)) {
        return convo;
      }
    }

    // Nếu chưa có → tạo mới
    const newConvo = await db.Conversation.create({ type: "PRIVATE" });

    await newConvo.addUsers([userId, otherUserId]);

    return newConvo;
  }

  // Lấy message (scroll)
  async getMessages(conversationId, limit = 20, beforeId = null) {
    const where = { conversationId };

    if (beforeId) {
      const beforeMsg = await db.Message.findByPk(beforeId);
      if (beforeMsg) {
        where.createdAt = { [Op.lt]: beforeMsg.createdAt };
      }
    }

    const messages = await db.Message.findAll({
      where,
      limit,
      order: [["createdAt", "DESC"]],
      include: [
        { model: db.User, as: "sender", attributes: ["id", "username", "avatar"] }
      ]
    });

    return messages.reverse(); 
  }

  // Lấy danh sách conversation của 1 user kèm lastMessage và participants
  async listConversations(userId) {
    if (!userId) throw new Error('userId is required');

    // Lấy conversation mà user tham gia
    const conversations = await db.Conversation.findAll({
      include: [
        {
          model: db.User,
          through: { attributes: [] },
          attributes: ["id", "username", "fullName", "avatar"],
          where: { id: userId },
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    // Đối với mỗi conversation lấy last message và participants
    const results = await Promise.all(
      conversations.map(async (convo) => {
        const lastMessage = await db.Message.findOne({
          where: { conversationId: convo.id },
          order: [["createdAt", "DESC"]],
          include: [{ model: db.User, as: "sender", attributes: ["id", "username", "avatar"] }],
        });

        // lấy tất cả user tham gia
        const participants = await convo.getUsers({ attributes: ["id", "username", "fullName", "avatar"] });

        return {
          conversation: convo,
          lastMessage,
          participants,
        };
      })
    );

    return results;
  }

  // Lấy participants của conversation
  async getParticipants(conversationId) {
    const convo = await db.Conversation.findByPk(conversationId);
    if (!convo) throw new Error('Conversation not found');
    const participants = await convo.getUsers({ attributes: ['id', 'username', 'fullName', 'avatar'] });
    return participants;
  }

  // Gửi tin nhắn
  async sendMessage(conversationId, senderId, content) {
    if (!content || !content.trim()) {
      throw new Error("Tin nhắn không được rỗng");
    }

    const msg = await db.Message.create({
      conversationId,
      senderId,
      content,
      type: "TEXT",
    });

    // Load message với sender info để trả về
    const messageWithSender = await db.Message.findByPk(msg.id, {
      include: [{ 
        model: db.User, 
        as: 'sender', 
        attributes: ['id', 'username', 'fullName', 'avatar'] 
      }]
    });

    return messageWithSender;
  }

  // Xóa tin nhắn
  async deleteMessage(messageId, userId) {
    const message = await db.Message.findByPk(messageId);
    
    if (!message) {
      throw new Error("Tin nhắn không tồn tại");
    }

    // Kiểm tra user có quyền truy cập conversation không
    const canAccess = await this.canAccessConversation(message.conversationId, userId);
    if (!canAccess) {
      throw new Error("Bạn không có quyền truy cập conversation này");
    }

    // Chỉ cho phép người gửi xóa tin nhắn của mình
    if (message.senderId !== userId) {
      throw new Error("Bạn chỉ có thể xóa tin nhắn của chính mình");
    }

    // Soft delete - cập nhật content thành đã xóa
    await message.update({
      content: "Tin nhắn đã được xóa",
      type: "DELETED"
    });

    // Reload message với sender info để trả về
    const deletedMessage = await db.Message.findByPk(messageId, {
      include: [
        { 
          model: db.User, 
          as: 'sender', 
          attributes: ['id', 'username', 'fullName', 'avatar'] 
        }
      ]
    });

    return {
      message: deletedMessage,
      conversationId: message.conversationId
    };
  }

  // Emit socket event cho message deleted
  async emitMessageDeleted(io, conversationId, messageId, deletedMessage) {
    if (!io) return;

    try {
      // Get conversation participants
      const participants = await this.getParticipants(conversationId);
      const participantIds = participants.map(p => String(p.id));

      // Emit to all participants
      const socketsMap = io.sockets && io.sockets.sockets;
      if (socketsMap && socketsMap.size > 0) {
        socketsMap.forEach((socket) => {
          try {
            const sockUserId = socket.userId ? String(socket.userId) : null;
            if (sockUserId && participantIds.includes(sockUserId)) {
              io.to(socket.id).emit('message_deleted', {
                conversationId: conversationId,
                messageId: messageId,
                message: deletedMessage
              });
            }
          } catch (inner) {
            console.error('Failed to emit to socket:', inner);
          }
        });
      }
    } catch (e) {
      console.error('Failed to emit message_deleted from service', e);
    }
  }

  // Emit socket event cho new message
  async emitNewMessage(io, conversationId, messageWithSender, senderId) {
    if (!io) return;

    try {
      const participants = await this.getParticipants(conversationId);
      const participantIds = participants.map(p => String(p.id));

      // Emit new message to all participants
      const socketsMap = io.sockets && io.sockets.sockets;
      if (socketsMap && socketsMap.size > 0) {
        socketsMap.forEach(socket => {
          try {
            const sockUserId = socket.userId ? String(socket.userId) : null;
            if (sockUserId && participantIds.includes(sockUserId)) {
              io.to(socket.id).emit('new_message', { 
                conversationId, 
                message: messageWithSender 
              });

              // Emit real-time notification to recipients (not sender) - UI level only
              if (sockUserId !== String(senderId)) {
                const notifMessage = `${messageWithSender.sender.fullName || messageWithSender.sender.username}: ${messageWithSender.content}`;
                io.to(socket.id).emit('message_notification', { 
                  message: notifMessage,
                  conversationId,
                  sender: messageWithSender.sender,
                  messageId: messageWithSender.id
                });
              }
            }
          } catch (inner) {
            console.error('Failed to emit message/notification to socket:', inner);
          }
        });
      }
    } catch (e) {
      console.error('Failed to emit new_message from service', e);
    }
  }

  // Kiểm tra quyền truy cập conversation
  async canAccessConversation(conversationId, userId) {
    const conversation = await db.Conversation.findByPk(conversationId, {
      include: [
        {
          model: db.User,
          through: { attributes: [] },
          where: { id: userId },
          required: true
        }
      ]
    });

    return !!conversation;
  }

  // Xóa conversation (chỉ người tham gia mới được xóa)
  async deleteConversation(conversationId, userId) {
    // Kiểm tra xem user có quyền truy cập conversation không
    const hasAccess = await this.canAccessConversation(conversationId, userId);
    if (!hasAccess) {
      throw new Error("Bạn không có quyền xóa cuộc hội thoại này");
    }

    // Xóa tất cả messages trong conversation trước
    await db.Message.destroy({
      where: { conversationId }
    });

    // Xóa conversation
    await db.Conversation.destroy({
      where: { id: conversationId }
    });

    return true;
  }
}

module.exports = new ConversationService();
