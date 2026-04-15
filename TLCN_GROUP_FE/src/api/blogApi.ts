import { apiClient } from "../services/apiClient";

export type Blog = {
    id: string;
    title?: string; // Optional since backend doesn't have title field
    content: string;
    author: string | {
        id: string;
        username: string;
        avatar?: string;
    };
    images?: string[];
    media?: Array<{
        id: string;
        url: string | null;
        type: 'image' | 'file';
        status: 'pending' | 'uploaded' | 'error';
    }>;
    createdAt: string;
}

export type CreateBlogPayLoad = {
    content: string;
    images?: File[];
}

const transformBlog = (blog: any): Blog => {
    if (blog.images && Array.isArray(blog.images)) {
        return blog as Blog;
    }

    if (blog.media && Array.isArray(blog.media)) {
        const imageUrls = blog.media
            .filter((m: any) => m.type === 'image' && m.status === 'uploaded' && m.url)
            .map((m: any) => m.url);

        return {
            ...blog,
            images: imageUrls.length > 0 ? imageUrls : undefined,
            media: undefined
        };
    }

    return blog as Blog;
};

const transformBlogs = (blogs: any[]): Blog[] => {
    return blogs.map(transformBlog);
};

export const blogApi = {
    getAll: async (forceRefresh = false): Promise<Blog[]> => {
        try {
            const headers: any = {};
            if (forceRefresh) {
                headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                headers['Pragma'] = 'no-cache';
                headers['Expires'] = '0';
            }

            const response = await apiClient.get<any>('/blogs', { headers });

            let blogs: Blog[] = [];

            if (response && response.blogs && Array.isArray(response.blogs)) {
                blogs = transformBlogs(response.blogs);
            } else if (Array.isArray(response)) {
                blogs = transformBlogs(response);
            } else {
                console.warn('Unexpected response format:', typeof response, response);
                localStorage.removeItem('blogs_cache');
                return [];
            }
            localStorage.setItem('blogs_cache', JSON.stringify(blogs));
            localStorage.setItem('blogs_last_fetch', Date.now().toString());
            return blogs;
        } catch (error) {
            console.error('blogApi.getAll error:', error);
            if (!forceRefresh) {
                const cached = localStorage.getItem('blogs_cache');
                const lastFetch = localStorage.getItem('blogs_last_fetch');
                const cacheAge = lastFetch ? Date.now() - parseInt(lastFetch) : Infinity;

                if (cached && cacheAge < 300000) {
                    const cachedBlogs = JSON.parse(cached);
                    return transformBlogs(cachedBlogs);
                }
            }

            localStorage.removeItem('blogs_cache');
            localStorage.removeItem('blogs_last_fetch');
            return [];
        }
    },

    getById: async (id: string): Promise<Blog | null> => {
        try {
            const response = await apiClient.get<any>(`/blogs/${id}`);
            return transformBlog(response);
        } catch (error) {
            console.error('blogApi.getById error:', error);
            return null;
        }
    },

    create: async (data: CreateBlogPayLoad): Promise<Blog> => {
        try {
            if (data.images && data.images.length > 0) {
                const formData = new FormData();
                formData.append('content', data.content);

                data.images.forEach((image) => {
                    formData.append('images', image);
                });

                const response = await apiClient.postFormData<any>('/blogs', formData);

                const transformedBlog = transformBlog(response);
                const cached = localStorage.getItem('blogs_cache');
                const blogs = cached ? JSON.parse(cached) : [];
                const updatedBlogs = [transformedBlog, ...blogs];
                localStorage.setItem('blogs_cache', JSON.stringify(updatedBlogs));

                return transformedBlog;
            } else {
                const response = await apiClient.post<any>('/blogs', { content: data.content });

                const transformedBlog = transformBlog(response);
                const cached = localStorage.getItem('blogs_cache');
                const blogs = cached ? JSON.parse(cached) : [];
                const updatedBlogs = [transformedBlog, ...blogs];
                localStorage.setItem('blogs_cache', JSON.stringify(updatedBlogs));

                return transformedBlog;
            }
        } catch (error) {
            console.error('blogApi.create error:', error);

            const errorObj = error as any;
            if (errorObj?.message?.includes('Network Error') || errorObj?.code === 'ECONNREFUSED') {
                const mockBlog: Blog = {
                    id: 'temp_' + Date.now(),
                    title: 'Untitled',
                    content: data.content,
                    author: 'You',
                    createdAt: new Date().toISOString()
                };

                const cached = localStorage.getItem('blogs_cache');
                const blogs = cached ? JSON.parse(cached) : [];
                const updatedBlogs = [mockBlog, ...blogs];
                localStorage.setItem('blogs_cache', JSON.stringify(updatedBlogs));

                return mockBlog;
            }

            throw error;
        }
    },

    update: async (id: string, data: { content: string }): Promise<Blog> => {
        try {
            const response = await apiClient.put<any>(`/blogs/${id}`, data);
            return transformBlog(response);
        } catch (error) {
            console.error('blogApi.update error:', error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/blogs/${id}`);
        } catch (error) {
            console.error('blogApi.delete error:', error);
            throw error;
        }
    },

    clearCache: () => {
        localStorage.removeItem('blogs_cache');
    },

    getCachedBlogs: (): Blog[] => {
        const cached = localStorage.getItem('blogs_cache');
        if (!cached) return [];
        const cachedBlogs = JSON.parse(cached);
        return transformBlogs(cachedBlogs);
    }
}