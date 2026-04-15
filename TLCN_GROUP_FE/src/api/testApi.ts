import { apiClient } from "../services/apiClient";
import { CreateTestPayload } from "../types/types";

export const getTestById = async (id: string) => {
    return apiClient.get(`/tests/${id}`);
};

export const createTest = async (payload: CreateTestPayload) => {
    return apiClient.post(`/tests`, payload);
};

export const updateTest = async (id: string, payload: any) => {
    return apiClient.put(`/tests/${id}`, payload);
};

export const deleteTest = async (id: string) => {
    return apiClient.delete(`/tests/${id}`);
};
