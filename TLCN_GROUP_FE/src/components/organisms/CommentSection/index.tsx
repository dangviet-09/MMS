import React from "react";
import { Comment } from "../../../types/types";
import { User } from "../../../types/types";
import { CommentItem } from "../../molecules/CommentItem";
import { CommentInput } from "../../molecules/CommentInput";

type CommentSectionProps = {
    comments: Comment[];
    loading: boolean;
    user: User | null;
    canComment: boolean;
    onAddComment: (content: string) => void;
    onReplyComment?: (parentId: string, content: string) => void;
    onEditComment?: (commentId: string, newContent: string) => void;
    onDeleteComment?: (commentId: string) => void;
};

export const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    loading,
    user,
    canComment,
    onAddComment,
    onReplyComment,
    onEditComment,
    onDeleteComment,
}) => {
    return (
        <div className="pt-3 border-t border-gray-100">
            <CommentInput
                user={user}
                onSubmit={onAddComment}
                disabled={!canComment}
            />

            <div className="space-y-3 rounded-lg p-3">
                {loading ? (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            user={user}
                            canComment={canComment}
                            onReply={onReplyComment}
                            onEdit={onEditComment}
                            onDelete={onDeleteComment}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 text-sm py-4">
                        There are no comments yet. Be the first to comment!
                    </p>
                )}
            </div>
        </div>
    );
};

