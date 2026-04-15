import { apiClient } from '../services/apiClient';
import { FollowInfo, FollowersResponse, FollowingResponse } from '../types/types';

const followApi = {
  toggleFollow: async (targetUserId: string): Promise<FollowInfo> => {
    const response = await apiClient.post<FollowInfo>(`/follows/${targetUserId}`);
    return response;
  },

  getFollowInfo: async (targetUserId: string): Promise<FollowInfo> => {
    const response = await apiClient.get<FollowInfo>(`/follows/${targetUserId}`);
    return response;
  },

  getFollowers: async (
    targetUserId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<FollowersResponse> => {
    const response = await apiClient.get<FollowersResponse>(
      `/follows/${targetUserId}/followers?page=${page}&limit=${limit}`
    );
    return response;
  },

  getFollowing: async (
    targetUserId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<FollowingResponse> => {
    const response = await apiClient.get<FollowingResponse>(
      `/follows/${targetUserId}/following?page=${page}&limit=${limit}`
    );
    return response;
  },
};

export default followApi;
