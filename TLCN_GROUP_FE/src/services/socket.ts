import { io, Socket } from "socket.io-client";
import { Notification, Comment } from "../types/types";

let socket: Socket | null = null;

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

export const connectSocket = (userId: string) => {
  if (socket) return socket;
  const base = getBaseUrl();
  socket = io(base, { withCredentials: true });

  socket.on('connect', () => {
    console.log('Socket connected', socket?.id);
    if (userId) {
      socket?.emit('join', { userId });
      socket?.emit('join_notifications', userId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  try {
    socket.disconnect();
  } finally {
    socket = null;
  }
};

export const joinConversationRoom = (conversationId: string) => {
  if (!socket) return;
  socket.emit('join_conversation', conversationId);
};

export const leaveConversationRoom = (conversationId: string) => {
  if (!socket) return;
  socket.emit('leave_conversation', conversationId);
};

export const onNewMessage = (cb: (payload: any) => void) => {
  if (!socket) return;
  socket.on('new_message', cb);
  return () => socket?.off('new_message', cb);
};

export const onNewNotification = (cb: (notification: Notification) => void) => {
  if (!socket) return;
  socket.on('new_notification', cb);
  return () => socket?.off('new_notification', cb);
};

export const onNotificationsRead = (cb: (payload: { notificationIds: string[], newUnreadCount: number }) => void) => {
  if (!socket) return;
  socket.on('notifications_read', cb);
  return () => socket?.off('notifications_read', cb);
};

// Blog-specific events
export const joinBlogRoom = (blogId: string) => {
  if (!socket) return;
  socket.emit('join_blog', blogId);
};

export const leaveBlogRoom = (blogId: string) => {
  if (!socket) return;
  socket.emit('leave_blog', blogId);
};

export const onNewComment = (cb: (payload: { blogId: string, comment: Comment }) => void) => {
  if (!socket) return;
  socket.on('new_comment', cb);
  return () => socket?.off('new_comment', cb);
};

// Like-specific events
export const joinBlogLikeRoom = (blogId: string) => {
  if (!socket) return;
  socket.emit('join_blog_like_room', { blogId });
};

export const leaveBlogLikeRoom = (blogId: string) => {
  if (!socket) return;
  socket.emit('leave_blog_like_room', { blogId });
};

export const onBlogLikeUpdate = (cb: (payload: { blogId: string, liked: boolean, count: number, userId: string, timestamp: number }) => void) => {
  if (!socket) return;
  socket.on('blog_like_updated', cb);
  return () => socket?.off('blog_like_updated', cb);
};

export default {
  connectSocket,
  disconnectSocket,
  joinConversationRoom,
  leaveConversationRoom,
  onNewMessage,
  onNewNotification,
  onNotificationsRead,
  joinBlogRoom,
  leaveBlogRoom,
  onNewComment,
  joinBlogLikeRoom,
  leaveBlogLikeRoom,
  onBlogLikeUpdate,
};
