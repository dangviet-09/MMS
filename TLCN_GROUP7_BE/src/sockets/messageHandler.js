const db = require('../models');
const ConversationService = require('../services/conversationService');
const NotificationService = require('../services/notificationService');

// In-memory map of userId -> socketId(s)
// If you run multiple server instances this must be replaced by a shared store (Redis)
const userSockets = new Map();

function addSocketForUser(userId, socketId) {
  const existing = userSockets.get(userId) || new Set();
  existing.add(socketId);
  userSockets.set(userId, existing);
}

function removeSocketForUser(userId, socketId) {
  const existing = userSockets.get(userId);
  if (!existing) return;
  existing.delete(socketId);
  if (existing.size === 0) userSockets.delete(userId);
  else userSockets.set(userId, existing);
}

function getSocketsForUser(userId) {
  return Array.from(userSockets.get(userId) || []);
}

module.exports = function messageHandler(io, socket) {
  // client notifies the server that a userId is associated with this socket
  socket.on('join', ({ userId }) => {
    if (!userId) return;
    addSocketForUser(userId, socket.id);
    socket.userId = userId;
    // notify others if needed
    io.emit('user_online', { userId });
  });

  socket.on('leave', ({ userId }) => {
    if (!userId) return;
    removeSocketForUser(userId, socket.id);
    io.emit('user_offline', { userId });
  });

  // join/leave conversation rooms so server can emit to rooms when messages arrive
  socket.on('join_conversation', (conversationId) => {
    if (!conversationId) return;
    try {
      socket.join(conversationId);
    } catch (e) {
      console.error('Failed to join conversation room', e);
    }
  });

  socket.on('leave_conversation', (conversationId) => {
    if (!conversationId) return;
    try {
      socket.leave(conversationId);
    } catch (e) {
      console.error('Failed to leave conversation room', e);
    }
  });

  // send_message: client asks server to persist a message and notify recipients
  // This handler delegates persistence to ConversationService so socket handler
  // does not directly manipulate models.
  socket.on('send_message', async (payload) => {
    try {
      // payload: { conversationId, senderId, content }
      const { conversationId, senderId, content } = payload || {};
      if (!conversationId || !senderId || !content) {
        socket.emit('error', { message: 'Invalid message payload' });
        return;
      }

      // Delegate saving message to service layer
      const savedMsg = await ConversationService.sendMessage(conversationId, senderId, content);

      // After saving, get participants from service (so socket handler doesn't access DB directly)
      const participants = await ConversationService.getParticipants(conversationId);
      const recipientIds = participants.map((p) => p.id);

      // load saved message with sender info for notification
      const messageWithSender = await db.Message.findByPk(savedMsg.id, {
        include: [{ model: db.User, as: 'sender', attributes: ['id', 'username', 'fullName', 'avatar'] }]
      });

      // Notify all participants (including sender's other sockets)
      const notifyIds = new Set(recipientIds);

      // Emit new_message to all participant sockets
      notifyIds.forEach((userId) => {
        const sockets = getSocketsForUser(userId);
        sockets.forEach((sid) => {
          io.to(sid).emit('new_message', { conversationId, message: messageWithSender });
        });
      });

      // Create persistent notifications for recipients (except sender) and emit notification events
      try {
        const recipients = recipientIds.filter((rid) => String(rid) !== String(senderId));
        if (recipients.length > 0) {
          const notifMessage = `${messageWithSender.sender.fullName || messageWithSender.sender.username}: ${messageWithSender.content}`;
          await NotificationService.createForRecipients(recipients, { message: notifMessage, type: 'SYSTEM' });

          // Emit notification event to recipient sockets
          recipients.forEach((userId) => {
            const sockets = getSocketsForUser(userId);
            sockets.forEach((sid) => {
              io.to(sid).emit('notification', { message: notifMessage });
            });
          });
        }
      } catch (nerr) {
        console.error('Failed to create/emit notifications in socket handler', nerr);
      }
    } catch (err) {
      console.error('send_message handler error', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Clean up when socket disconnects
  socket.on('disconnect', () => {
    const uid = socket.userId;
    if (uid) {
      removeSocketForUser(uid, socket.id);
      io.emit('user_offline', { userId: uid });
    }
  });
};
