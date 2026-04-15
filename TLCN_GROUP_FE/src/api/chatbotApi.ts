import { apiClient } from "../services/apiClient";
import { ChatSession, ChatMessage, StudentAssessment } from "../types/types";

export const chatbotApi = {
  getSession: async (): Promise<ChatSession> => {
    return apiClient.get<ChatSession>('/chat/session');
  },

  sendMessage: async (message: string): Promise<{
    sessionId: number;
    userMessage: ChatMessage;
    aiResponse: ChatMessage;
  }> => {
    return apiClient.post('/chat/message', { message });
  },

  clearHistory: async (): Promise<void> => {
    return apiClient.delete('/chat/history');
  },

  getAssessment: async (): Promise<StudentAssessment> => {
    return apiClient.get<StudentAssessment>('/chat/assessment');
  },
};

export default chatbotApi;
