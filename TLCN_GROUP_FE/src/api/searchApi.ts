import { apiClient } from '../services/apiClient';
import { SearchAllResponse, SearchCompany, SearchCourse, SearchParams, SearchUser } from '../types/types';

const searchApi = {
  searchAll: async (query: string, limit: number = 10): Promise<SearchAllResponse> => {
    try {
      const url = `/search?q=${encodeURIComponent(query)}&type=all&limit=${limit}`;
      const data = await apiClient.get<SearchAllResponse>(url);
      
      if (!data) {
        return {
          users: [],
          companies: [],
          courses: [],
          blogs: []
        };
      }
      
      return data;
    } catch (error: any) {
      return {
        users: [],
        companies: [],
        courses: [],
        blogs: []
      };
    }
  },

  search: async (params: SearchParams): Promise<SearchAllResponse> => {
    const { q, type = 'all', limit = 10 } = params;
    const response = await apiClient.get<SearchAllResponse>(
      `/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`
    );
    return response;
  },

  searchUsers: async (query: string, limit: number = 10): Promise<SearchUser[]> => {
    const response = await apiClient.get<SearchUser[]>(
      `/search/users?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response;
  },

  searchCompanies: async (query: string, limit: number = 10): Promise<SearchCompany[]> => {
    const response = await apiClient.get<SearchCompany[]>(
      `/search/companies?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response;
  },

  searchCourses: async (query: string, limit: number = 10): Promise<SearchCourse[]> => {
    const response = await apiClient.get<SearchCourse[]>(
      `/search/courses?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response;
  },
};

export default searchApi;
