import { apiClient } from "../services/apiClient";
import { LikeInfo } from "../types/types";

export const likeApi = {
  getByBlogId: async (blogId: string): Promise<LikeInfo> => {
    try {
      const response = await apiClient.get<any>(`/likes/${blogId}`);
      if (response && typeof response === "object") {
        const liked = !!response.liked;
        const count = Number(response.count ?? 0);
        return { liked, count };
      }

      return { liked: false, count: 0 };
    } catch (error: any) {
      console.error("[likeApi] getByBlogId error:", error);
      throw error;
    }
  },

  toggleLike: async (blogId: string): Promise<LikeInfo> => {
    try {
      const response = await apiClient.post<any>(`/likes/${blogId}`);
      if (response && typeof response === "object") {
        const liked = !!response.liked;
        const count = Number(response.count ?? 0);
        return { liked, count };
      }

      return { liked: false, count: 0 };
    } catch (error: any) {
      console.error("[likeApi] toggleLike error:", error);
      throw error;
    }
  },
};

