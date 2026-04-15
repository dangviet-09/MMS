import React, { useEffect } from "react";
import { Blog } from "../../../api/blogApi";
import { Comment } from "../../../types/types";
import { BlogHeader } from "../BlogHeader";
import { BlogContent } from "../BlogContent";
import { BlogStats } from "../BlogStats";
import { BlogActions } from "../BlogActions";
import { CommentSection } from "../../organisms/CommentSection";
import { Button } from "../../atoms/Button/Button";

type Reaction = {
    id: string;
    emoji: string;
    count: number;
    isLiked: boolean;
};

type BlogModalProps = {
    isOpen: boolean;
    onClose: () => void;
    blog: Blog;
    currentUser: any;
    reactions: Reaction[];
    totalComments: number;
    comments: Comment[];
    loadingComments: boolean;
    canComment: boolean;
    onReaction: (reactionId: string) => void;
    onAddComment: (content: string) => void;
    onReplyComment: (parentId: string, content: string) => void;
    onEditComment: (commentId: string, content: string) => void;
    onDeleteComment: (commentId: string) => void;
    onEdit?: (blog: Blog) => void;
    onDelete?: (id: string) => void;
};



export const BlogModal: React.FC<BlogModalProps> = ({
    isOpen,
    onClose,
    blog,
    currentUser,
    reactions,
    totalComments,
    comments,
    loadingComments,
    canComment,
    onReaction,
    onAddComment,
    onReplyComment,
    onEditComment,
    onDeleteComment,
    onEdit,
    onDelete,
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
                {/* Header with Close Button */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {typeof blog.author === 'string'
                            ? blog.author
                            : (blog.author?.username || 'Unknown')}'s post
                    </h2>
                    <Button
                        variant="unstyled"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        <BlogHeader
                            blog={blog}
                            currentUser={currentUser}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />

                        <BlogContent blog={blog} />

                        <BlogStats reactions={reactions} totalComments={totalComments} />

                        <BlogActions
                            reactions={reactions}
                            onReaction={onReaction}
                            onToggleComments={() => { }} // Always show comments in modal
                        />

                        <div className="mt-4">
                            <CommentSection
                                comments={comments}
                                loading={loadingComments}
                                user={currentUser}
                                canComment={canComment}
                                onAddComment={onAddComment}
                                onReplyComment={onReplyComment}
                                onEditComment={onEditComment}
                                onDeleteComment={onDeleteComment}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
