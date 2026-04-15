import { apiClient } from "../services/apiClient";
import { userApi } from "./userApi";
import { CommentAuthor, Comment, CreateCommentPayload, UpdateCommentPayload, CommentListResponse, RawCommentListResponse, RawComment, RawCommentAuthor } from "../types/types";

const avatarCache = new Map<string, string | undefined>();

const fetchUserAvatar = async (userId: string): Promise<string | undefined> => {
    if (avatarCache.has(userId)) {
        return avatarCache.get(userId);
    }

    try {
        const user = await userApi.getById(userId);
        const avatar = user?.avatar;
        avatarCache.set(userId, avatar);
        return avatar;
    } catch (error) {
        console.error(`Failed to fetch avatar for user ${userId}:`, error);
        avatarCache.set(userId, undefined);
        return undefined;
    }
};

const normalizeAuthor = async (raw: RawCommentAuthor | undefined): Promise<CommentAuthor> => {
    const userId = raw?.id ?? "";
    const avatar = userId ? await fetchUserAvatar(userId) : undefined;

    return {
        id: userId,
        username: raw?.username ?? "Unknown",
        fullName: raw?.fullName,
        avatar: avatar,
    };
};

const normalizeComment = async (raw: RawComment): Promise<Comment> => {
    const author = await normalizeAuthor(raw?.author ?? raw?.User);
    const replies = Array.isArray(raw?.replies)
        ? await Promise.all(raw.replies.map(normalizeComment))
        : [];

    return {
        id: raw?.id ?? "",
        blogId: raw?.blogId ?? raw?.postId ?? "",
        content: raw?.content ?? "",
        author: author,
        createdAt: raw?.createdAt ?? new Date().toISOString(),
        updatedAt: raw?.updatedAt,
        parentId: raw?.parentId ?? null,
        replies: replies,
    };
};

export const commentApi = {
    getByBlogId: async (blogId: string, params?: { page?: number; limit?: number }): Promise<CommentListResponse> => {
        try {
            const res = await apiClient.get<RawCommentListResponse>(`/comments/${blogId}`, { params });
            const normalizedComments = Array.isArray(res?.comments)
                ? await Promise.all(res.comments.map(normalizeComment))
                : [];

            return {
                total: res?.total ?? normalizedComments.length,
                comments: normalizedComments,
                currentPage: res?.currentPage ?? params?.page ?? 1,
                totalPages: res?.totalPages ?? 1,
            };
        } catch (error) {
            console.error("commentApi.getByBlogId error:", error);
            return {
                total: 0,
                comments: [],
                currentPage: params?.page ?? 1,
                totalPages: 0,
            };
        }
    },

    create: async (data: CreateCommentPayload): Promise<Comment> => {
        const response = await apiClient.post<RawComment>(`/comments`, data);
        return await normalizeComment(response);
    },

    update: async (commentId: string, data: UpdateCommentPayload): Promise<Comment> => {
        try {
            const response = await apiClient.put<RawComment>(`/comments/${commentId}`, data);
            return await normalizeComment(response);
        } catch (error: any) {
            console.error('commentApi.update error:', error);
            throw error;
        }
    },

    delete: async (commentId: string): Promise<void> => {
        try {
            await apiClient.delete(`/comments/${commentId}`);
        } catch (error: any) {
            console.error('commentApi.delete error:', error);
            throw error;
        }
    }
};