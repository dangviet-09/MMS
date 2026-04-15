import React, { useState } from "react";
import { Button } from "../../atoms/Button/Button";
import { Input } from "../../atoms/Input/Input";
import { Avatar } from "../../atoms/Avatar";
import { User } from "../../../types/types";
import { Send } from 'lucide-react';

type CommentInputProps = {
    user: User | null;
    onSubmit: (content: string) => void;
    disabled?: boolean;
};

export const CommentInput: React.FC<CommentInputProps> = ({
    user,
    onSubmit,
    disabled = false
}) => {
    const [comment, setComment] = useState("");

    const handleSubmit = () => {
        if (comment.trim() && !disabled) {
            onSubmit(comment.trim());
            setComment("");
        }
    };

    const getUserInitial = () => {
        if (!user) return 'U';
        return user?.fullName?.[0]?.toUpperCase() ||
            user?.username?.[0]?.toUpperCase() ||
            'U';
    };

    if (!user) {
        return (
            <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 text-center">
                    Please <a href="/signin" className="font-medium underline hover:text-yellow-900">sign in</a> to comment on posts.
                </p>
            </div>
        );
    }

    return (
        <div className="flex gap-2 mb-3">
            <Avatar
                src={user?.avatar}
                name={getUserInitial()}
                size="sm"
            />
            <div className="flex-1 relative">
                <Input
                    type="text"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    overrideDefaultStyles={true}
                    className="w-full pl-4 pr-20 py-2.5 border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={disabled}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!comment.trim() || disabled}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-white disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send comment"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div >
    );
};

