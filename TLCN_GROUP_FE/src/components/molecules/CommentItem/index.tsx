import React, { useState, useRef, useEffect } from "react";
import { Comment } from "../../../types/types";
import { Avatar } from "../../atoms/Avatar";
import ClickableAvatar from "../../atoms/Avatar/ClickableAvatar";
import { User } from "../../../types/types";
import { CommentInput } from "../CommentInput";
import { Button } from "../../atoms/Button/Button";

type CommentItemProps = {
    comment: Comment;
    user: User | null;
    canComment?: boolean;
    onReply?: (parentId: string, content: string) => void;
    onEdit?: (commentId: string, newContent: string) => void;
    onDelete?: (commentId: string) => void;
    depth?: number;
};

export const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    user,
    canComment = false,
    onReply,
    onEdit,
    onDelete,
    depth = 0
}) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const getAuthorName = () => {
        return comment.author?.fullName || comment.author?.username || 'Unknown';
    };

    const getAuthorInitial = () => {
        return comment.author?.username?.[0]?.toUpperCase() ||
            comment.author?.fullName?.[0]?.toUpperCase() ||
            'U';
    };

    const handleReply = (content: string) => {
        if (onReply) {
            onReply(comment.id, content);
            setShowReplyInput(false);
        }
    };

    const handleEdit = () => {
        if (onEdit && editContent.trim() && editContent !== comment.content) {
            onEdit(comment.id, editContent.trim());
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(comment.id);
        }
        setShowDropdown(false);
    };

    const isOwner = user && comment.author && user.id === comment.author.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const maxDepth = 3;

    return (
        <div className="flex gap-2">
                <ClickableAvatar
                    userId={comment.author?.id || ''}
                    username={comment.author?.username}
                    fullName={comment.author?.fullName}
                    avatarUrl={comment.author?.avatar}
                    size="sm"
                />
            <div className="flex-1">
                {isEditing ? (
                    <div className="bg-gray-100 rounded-2xl px-3 py-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <Button
                                onClick={handleEdit}
                                disabled={!editContent.trim()}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                            >
                                Save
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(comment.content);
                                }}
                                className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 relative group">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900">
                                    {getAuthorName()}
                                </p>
                                <p className="text-sm text-gray-800">{comment.content}</p>
                            </div>

                            {isOwner && (
                                <div className="relative ml-2" ref={dropdownRef}>
                                    <Button
                                        variant="icon"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 p-1 transition-opacity"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                        </svg>
                                    </Button>

                                    {showDropdown && (
                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                                            <Button
                                                variant="unstyled"
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-none"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                </svg>
                                                Edit
                                            </Button>
                                            <Button
                                                variant="unstyled"
                                                onClick={handleDelete}
                                                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-none"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                </svg>
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 mt-1 ml-3">
                    <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString('vi-VN')}
                    </span>

                    {canComment && depth < maxDepth && (
                        <Button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                            {showReplyInput ? 'Cancel' : 'Reply'}
                        </Button>
                    )}

                    {hasReplies && (
                        <Button
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                            {showReplies ? 'Ẩn' : 'Xem'} {comment.replies!.length} phản hồi
                        </Button>
                    )}
                </div>

                {showReplyInput && (
                    <div className="mt-2 ml-2">
                        <CommentInput
                            user={user}
                            onSubmit={handleReply}
                            disabled={!canComment}
                        />
                    </div>
                )}

                {hasReplies && showReplies && (
                    <div className="mt-3 ml-4 space-y-3">
                        {comment.replies!.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                user={user}
                                canComment={canComment}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


