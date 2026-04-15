import { apiClient } from "../services/apiClient";
import { 
  NotificationListResponse, 
  UnreadCountResponse, 
  MarkAsReadPayload 
} from "../types/types";

export const notificationApi = {
    list: async (limit?: number, offset?: number): Promise<NotificationListResponse> => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());
        
        const url = params.toString() ? `/notifications?${params.toString()}` : '/notifications';
        return apiClient.get<NotificationListResponse>(url);
    },

    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        return apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    },

    markAsRead: async (notificationIds: string[]): Promise<{ success: boolean; message: string }> => {
        return apiClient.post<{ success: boolean; message: string }>('/notifications/mark-read', {
            ids: notificationIds,
        });
    },

    markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
        const response = await notificationApi.list();
        const unreadIds = response.notifications.filter(n => !n.isRead).map(n => n.id);

        if (unreadIds.length === 0) {
            return { success: true, message: 'No unread notifications' };
        }

        return notificationApi.markAsRead(unreadIds);
    },
};

export default notificationApi;
