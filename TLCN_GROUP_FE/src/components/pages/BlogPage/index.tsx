import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainTemplate from "../../templates/MainTemplate/MainTemplate";
import PostModal from "../../molecules/PostModal";
import PostCreatorBar from "../../atoms/PostCreatorBar/index.tsx";
import { Blog, blogApi } from "../../../api/blogApi";
import { Toast } from "../../molecules/ToastNotification";
import { BlogFeed } from "../../organisms/BlogFeed";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserBlogPermissions } from "../../../utils/userUtils.ts";

const BlogPage: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

    const permissions = getUserBlogPermissions(user);

    useEffect(() => {
        fetchBlogs();
    }, []);

    // Handle scroll to specific blog from notification
    useEffect(() => {
        if (location.state?.scrollToBlogId && blogs.length > 0) {
            const blogId = location.state.scrollToBlogId;
            setTimeout(() => {
                const blogElement = document.getElementById(`blog-${blogId}`);
                if (blogElement) {
                    blogElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight the blog briefly
                    blogElement.style.border = '2px solid #3B82F6';
                    setTimeout(() => {
                        blogElement.style.border = '';
                    }, 3000);
                }
            }, 100);
        }
    }, [location.state, blogs]);

    const fetchBlogs = async (forceRefresh = true) => {
        try {
            setLoading(true);
            const response = await blogApi.getAll(forceRefresh);

            if (Array.isArray(response)) {
                setBlogs(response);

                // Nếu database trống, clear cache và set empty array
                if (response.length === 0) {
                    localStorage.removeItem('blogs_cache');
                }
            } else {
                console.warn('Expected array but got:', typeof response, response);
                setBlogs([]);
            }
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
            setToast({ message: "Failed to load blogs", type: "error" });
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPost = async (data: { content: string; images?: File[] }) => {
        if (!permissions.canCreate) {
            setToast({
                message: "You don't have permission to create posts. Only companies can create posts.",
                type: "error"
            });
            setShowModal(false);
            return;
        }

        try {
            const newBlog = await blogApi.create(data);

            setBlogs((prev) => {
                const currentBlogs = Array.isArray(prev) ? prev : [];
                return [newBlog, ...currentBlogs];
            });

            setToast({ message: "Post created successfully!", type: "success" });
        } catch (error) {
            console.error("Failed to create post:", error);
            setToast({ message: "Failed to create post", type: "error" });
        } finally {
            setShowModal(false);
        }
    };

    const handleBlogUpdate = () => {
        fetchBlogs();
    }

    return (
        <MainTemplate>
            <div className="max-w-2xl mx-auto mt-6 space-y-4">
                {user && user.role === 'STUDENT' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Student View:</strong> You can read and interact with posts, but only companies can create new posts.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {permissions.canCreate && (
                    <PostCreatorBar onOpen={() => setShowModal(true)} />
                )}

                {!user && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-yellow-800">
                            Please <a href="/signin" className="font-medium underline hover:text-yellow-900">sign in</a> to interact with posts.
                        </p>
                    </div>
                )}

                {showModal && (
                    <PostModal
                        onClose={() => setShowModal(false)}
                        onPost={handleAddPost}
                    />
                )}

                <BlogFeed
                    blogs={blogs}
                    onBlogUpdate={handleBlogUpdate}
                />
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </MainTemplate>
    );
};

export default BlogPage;