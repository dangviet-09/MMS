import { apiClient } from "../services/apiClient";
import { Course, CourseListResponse, CourseListParams } from "../types/types";

const buildQueryString = (params?: CourseListParams) => {
	if (!params) return "";
	const searchParams = new URLSearchParams();
	if (params.page) searchParams.append("page", String(params.page));
	if (params.limit) searchParams.append("limit", String(params.limit));
	const query = searchParams.toString();
	return query ? `?${query}` : "";
};

export const courseApi = {
	async getAll(params?: CourseListParams): Promise<CourseListResponse> {
		const query = buildQueryString(params);
		return apiClient.get<CourseListResponse>(`/career-paths${query}`);
	},

	async getById(courseId: string): Promise<Course> {
		return apiClient.get<Course>(`/career-paths/${courseId}`);
	},

	async updateStatus(courseId: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<Course> {
		return apiClient.patch<Course>(`/career-paths/${courseId}/status`, { status });
	},

	async getMyCourses(params?: CourseListParams): Promise<CourseListResponse> {
		const query = buildQueryString(params);
		return apiClient.get<CourseListResponse>(`/career-paths/my-courses${query}`);
	},
};


