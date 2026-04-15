import { apiClient } from "../services/apiClient";
import { CreateTestPayload } from "../types/types";

export const getLessonById = async (id: string) => {
    return apiClient.get(`/lessons/${id}`);
};

export const createLesson = async (careerPathId: string, payload: Omit<CreateTestPayload, 'careerPathId'>) => {
    return apiClient.post(`/career-paths/${careerPathId}/lessons`, payload);
};

export const updateLesson = async (id: string, payload: any) => {
    return apiClient.put(`/lessons/${id}`, payload);
};

export const deleteLesson = async (id: string) => {
    return apiClient.delete(`/lessons/${id}`);
};
