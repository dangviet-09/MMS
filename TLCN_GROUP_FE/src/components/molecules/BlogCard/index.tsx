import React, { useState, useEffect } from "react";
import { Blog } from "../../../api/blogApi";
import { commentApi } from "../../../api/commentApi";
import { likeApi } from "../../../api/likeApi";
import { Comment } from "../../../types/types.ts";
import { useAuth } from "../../../contexts/AuthContext";
import { canUserComment } from "../../../utils/userUtils.ts";
import { BlogHeader } from "../BlogHeader";
import { BlogContent } from "../BlogContent";
import { BlogStats } from "../BlogStats";
import { BlogActions } from "../BlogActions";
import { BlogModal } from "../BlogModal";
import { joinBlogRoom, leaveBlogRoom, onNewComment, joinBlogLikeRoom, leaveBlogLikeRoom, onBlogLikeUpdate } from "../../../services/socket";
import { Toast } from "../ToastNotification/index.tsx";

type BlogCardProps = {
    blog: Blog;
    onEdit?: (blog: Blog) => void;
    onDelete?: (id: string) => void;
};

type Reaction = {
    id: string;
    emoji: string;
    count: number;
    isLiked: boolean;
};

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onEdit, onDelete }) => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [reactions, setReactions] = useState<Reaction[]>([
        { id: "like", emoji: "", count: 0, isLiked: false },
    ]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [totalComments, setTotalComments] = useState(0);
    const [loadingComments, setLoadingComments] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    useEffect(() => {
        loadLikes();

        joinBlogLikeRoom(blog.id);

        const unsubscribeLike = onBlogLikeUpdate((payload) => {
            if (payload.blogId === blog.id) {
                if (payload.userId !== user?.id) {
                    setReactions([{
                        id: "like",
                        emoji: "",
                        count: payload.count,
                        isLiked: reactions.find(r => r.id === 'like')?.isLiked || false
                    }]);
                }
            }
        });

        return () => {
            leaveBlogLikeRoom(blog.id);
            unsubscribeLike?.();
        };
    }, [blog.id]);

    useEffect(() => {
        setComments([]);
        setTotalComments(0);
        loadComments();
    }, [blog.id]);

    useEffect(() => {
        if (showModal && comments.length === 0) {
            loadComments();
        }

        if (showModal) {
            joinBlogRoom(blog.id);

            const unsubscribe = onNewComment((payload) => {
                if (payload.blogId === blog.id && payload.comment) {
                    setComments(prev => {
                        const exists = prev.some(c => c.id === payload.comment.id);
                        if (exists) return prev;

                        if (payload.comment.parentId) {
                            return prev.map(comment => {
                                if (comment.id === payload.comment.parentId) {
                                    return {
                                        ...comment,
                                        replies: [...(comment.replies || []), payload.comment]
                                    };
                                }
                                return comment;
                            });
                        } else {
                            return [payload.comment, ...prev];
                        }
                    });
                    setTotalComments(prev => prev + 1);
                }
            });

            return () => {
                unsubscribe?.();
                leaveBlogRoom(blog.id);
            };
        }
    }, [showModal, blog.id]);

    const loadLikes = async () => {
        if (!user) {
            try {
                const likeInfo = await likeApi.getByBlogId(blog.id);
                setReactions([{
                    id: "like",
                    emoji: "",
                    count: likeInfo.count,
                    isLiked: false
                }]);
            } catch (error) {
                console.error('❌ Failed to load likes:', error);
            }
            return;
        }

        try {
            const likeInfo = await likeApi.getByBlogId(blog.id);
            setReactions([{
                id: "like",
                emoji: "",
                count: likeInfo.count,
                isLiked: likeInfo.liked
            }]);
        } catch (error) {
            console.error('Failed to load likes:', error);
            setReactions([{ id: "like", emoji: "", count: 0, isLiked: false }]);
        }
    };

    const loadComments = async () => {
        try {
            setLoadingComments(true);
            const { comments: blogComments, total } = await commentApi.getByBlogId(blog.id);
            setComments(blogComments);
            setTotalComments(total);
        } catch (error) {
            console.error('❌ Failed to load comments:', error);
            setComments([]);
            setTotalComments(0);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleReaction = async (reactionId: string) => {
        if (!user) {
            setToastMessage({ message: 'Please login to like this post', type: 'warning' });
            return;
        }

        if (reactionId !== 'like') return;

        const currentReaction = reactions.find(r => r.id === 'like');
        const wasLiked = currentReaction?.isLiked || false;

        setReactions([{
            id: "like",
            emoji: "",
            count: wasLiked ? (currentReaction?.count || 1) - 1 : (currentReaction?.count || 0) + 1,
            isLiked: !wasLiked
        }]);

        try {
            const likeInfo = await likeApi.toggleLike(blog.id);

            setReactions([{
                id: "like",
                emoji: "",
                count: likeInfo.count,
                isLiked: likeInfo.liked
            }]);
        } catch (error: any) {
            console.error('Failed to toggle like:', error);
            setReactions([{
                id: "like",
                emoji: "",
                count: currentReaction?.count || 0,
                isLiked: wasLiked
            }]);

            if (error.response?.status === 401) {
                setToastMessage({ message: 'Your session has expired. Please log in again.', type: 'error' });
            } else {
                setToastMessage({ message: 'Unable to like this post. Please try again.', type: 'error' });
            }
        }
    };

    const handleAddComment = async (content: string) => {
        if (!content.trim() || !user) return;

        try {
            const commentData = {
                blogId: blog.id,
                content: content
            };

            const newCommentResult = await commentApi.create(commentData);

            if (!showModal) {
                setComments(prev => [newCommentResult, ...prev]);
                setTotalComments(prev => prev + 1);
            }
        } catch (error: any) {
            console.error('Failed to add comment:', error);

            if (error.response?.status === 401) {
                setToastMessage({ message: 'Please login to comment', type: 'warning' });
            } else if (error.response?.status === 403) {
                setToastMessage({ message: 'You do not have permission to comment', type: 'error' });
            } else {
                setToastMessage({ message: 'Failed to add comment. Please try again.', type: 'error' });
            }
        }
    };

    const handleReplyComment = async (parentId: string, content: string) => {
        if (!content.trim() || !user) return;

        try {
            const replyData = {
                blogId: blog.id,
                content: content,
                parentId: parentId
            };

            const newReply = await commentApi.create(replyData);
            if (!showModal) {
                setComments(prev => {
                    const addReplyToComment = (comments: Comment[]): Comment[] => {
                        return comments.map(comment => {
                            if (comment.id === parentId) {
                                return {
                                    ...comment,
                                    replies: [...(comment.replies || []), newReply]
                                };
                            }
                            if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: addReplyToComment(comment.replies)
                                };
                            }
                            return comment;
                        });
                    };
                    return addReplyToComment(prev);
                });
                setTotalComments(prev => prev + 1);
            }
        } catch (error: any) {
            console.error('Failed to reply to comment:', error);
            setToastMessage({ message: 'Failed to reply. Please try again.', type: 'error' });
        }
    };

    const handleEditComment = async (commentId: string, newContent: string) => {
        if (!newContent.trim()) return;

        try {
            await commentApi.update(commentId, { content: newContent });
            setComments(prev => {
                const updateCommentContent = (comments: Comment[]): Comment[] => {
                    return comments.map(comment => {
                        if (comment.id === commentId) {
                            return { ...comment, content: newContent };
                        }
                        if (comment.replies && comment.replies.length > 0) {
                            return {
                                ...comment,
                                replies: updateCommentContent(comment.replies)
                            };
                        }
                        return comment;
                    });
                };
                return updateCommentContent(prev);
            });
        } catch (error: any) {
            console.error('Failed to edit comment:', error);
            setToastMessage({ message: 'Failed to edit comment. Please try again.', type: 'error' });
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await commentApi.delete(commentId);
            let deletedCount = 0;
            const countReplies = (c: Comment): number => {
                let count = 1;
                if (c.replies) {
                    c.replies.forEach(r => count += countReplies(r));
                }
                return count;
            };

            setComments(prev => {
                const removeComment = (comments: Comment[]): Comment[] => {
                    return comments.filter(comment => {
                        if (comment.id === commentId) {
                            deletedCount = countReplies(comment);
                            return false;
                        }
                        if (comment.replies && comment.replies.length > 0) {
                            comment.replies = removeComment(comment.replies);
                        }
                        return true;
                    });
                };
                return removeComment(prev);
            });

            // Update total count once after deletion
            setTotalComments(prev => Math.max(0, prev - deletedCount));
        } catch (error: any) {
            console.error('Failed to delete comment:', error);
            setToastMessage({ message: 'Failed to delete comment. Please try again.', type: 'error' });
        }
    };

    return (
        <div className="border rounded-lg p-4 shadow-sm bg-white mb-4">
            <BlogHeader
                blog={blog}
                currentUser={user}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            <div
                className="blog-card-clickable cursor-pointer"
                onClick={() => setShowModal(true)}
            >
                <BlogContent blog={blog} />
            </div>

            <BlogStats reactions={reactions} totalComments={totalComments} />

            <BlogActions
                reactions={reactions}
                onReaction={handleReaction}
                onToggleComments={() => setShowModal(true)}
            />

            <BlogModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                blog={blog}
                currentUser={user}
                reactions={reactions}
                totalComments={totalComments}
                comments={comments}
                loadingComments={loadingComments}
                canComment={canUserComment(user) && !!user}
                onReaction={handleReaction}
                onAddComment={handleAddComment}
                onReplyComment={handleReplyComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            {toastMessage && (
                <Toast
                    message={toastMessage.message}
                    type={toastMessage.type}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
};