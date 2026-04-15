import { apiClient } from "../services/apiClient";
import { CareerTest, CreateCareerTestPayload } from "../types/types";

export const getAllCareerTests = async (): Promise<CareerTest[]> => {
    const response = await apiClient.get<CareerTest[]>('/career-paths');
    return Array.isArray(response) ? response : (response as any).data || [];
};

export const getMyCareerTests = async (): Promise<CareerTest[]> => {
    const response = await apiClient.get<CareerTest[]>('/career-paths/my-courses');
    return Array.isArray(response) ? response : (response as any).data || [];
};

export const getCareerTestById = async (testId: string): Promise<CareerTest> => {
    return apiClient.get<CareerTest>(`/career-paths/${testId}`);
};

export const createCareerTest = async (payload: CreateCareerTestPayload): Promise<CareerTest> => {
    const formData = new FormData();

    formData.append('title', payload.title);

    if (payload.description) {
        formData.append('description', payload.description);
    }

    if (payload.images) {
        formData.append('images', payload.images);
    }

    return apiClient.postFormData<CareerTest>('/career-paths', formData);
};


export const updateCareerTest = async (
    testId: string,
    payload: Partial<CreateCareerTestPayload>
): Promise<CareerTest> => {
    const formData = new FormData();

    if (payload.title) {
        formData.append('title', payload.title);
    }

    if (payload.description !== undefined) {
        formData.append('description', payload.description);
    }

    if (payload.images) {
        formData.append('image', payload.images);
    }

    return apiClient.putFormData<CareerTest>(`/career-paths/${testId}`, formData);
};

export const deleteCareerTest = async (testId: string): Promise<void> => {
    await apiClient.delete(`/career-paths/${testId}`);
};
