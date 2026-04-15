import React, { useEffect, useState } from "react";
import { blogApi, Blog } from "../../../api/blogApi";
import { BlogCard } from "../../molecules/BlogCard";
import PostModal from "../../molecules/PostModal";

type BlogFeedProps = {
    blogs: Blog[];
    onBlogUpdate?: () => void;
}

export const BlogFeed: React.FC<BlogFeedProps> = ({ blogs: externalBlogs, onBlogUpdate }) => {
    const [internalBlogs, setInternalBlogs] = useState<Blog[]>([]);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const blogs = externalBlogs || internalBlogs;

    const loadBlogs = async () => {
        if (!externalBlogs) {
            const data = await blogApi.getAll();
            setInternalBlogs(data);
        }
        onBlogUpdate?.();
    };

    useEffect(() => {
        if (!externalBlogs) {
            loadBlogs();
        }
    }, [externalBlogs]);

    const handleEdit = (blog: Blog) => {
        setEditingBlog(blog);
        setShowEditModal(true);
    };

    const handleUpdate = async (data: { content: string }) => {
        if (!editingBlog) return;
        await blogApi.update(editingBlog.id, data);
        setEditingBlog(null);
        setShowEditModal(false);
        await loadBlogs();
    };

    const handleDelete = async (id: string) => {
        await blogApi.delete(id);
        await loadBlogs();
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingBlog(null);
    };

    return (
        <div className="space-y-4">
            {showEditModal && editingBlog && (
                <PostModal
                    onClose={handleCloseEditModal}
                    onPost={handleUpdate}
                    initialData={editingBlog}
                    title="Edit Post"
                />
            )}

            {/* Danh sách bài viết */}
            {blogs.length > 0 ? (
                blogs.map((blog) => (
                    <div key={blog.id} id={`blog-${blog.id}`}>
                        <BlogCard
                            blog={blog}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <p>No blogs available</p>
                </div>
            )}
        </div>
    );
};