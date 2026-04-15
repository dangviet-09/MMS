import { apiClient } from "../services/apiClient";
import { ConversationListItem, GetOrCreateConversationResponse, GetMessagesParams, Message, SendMessageResponse } from "../types/types";

export const conversationApi = {
  listConversations: async (): Promise<ConversationListItem[]> => {
    return apiClient.get<ConversationListItem[]>(`/conversations`);
  },

  getOrCreateConversation: async (otherUserId: string): Promise<GetOrCreateConversationResponse> => {
    return apiClient.get<GetOrCreateConversationResponse>(`/conversations/${otherUserId}`);
  },

  getMessages: async (conversationId: string, params?: GetMessagesParams): Promise<Message[]> => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.beforeId) qs.append('beforeId', params.beforeId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get<Message[]>(`/conversations/messages/${conversationId}${suffix}`);
  },

  sendMessage: async (conversationId: string, content: string): Promise<SendMessageResponse> => {
    return apiClient.post<SendMessageResponse>(`/conversations/messages/${conversationId}`, { content });
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    return apiClient.delete<void>(`/conversations/${conversationId}`);
  },
};

export default conversationApi;
