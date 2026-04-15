import React from "react";
import { Button } from "../../atoms/Button/Button";

type Reaction = {
    id: string;
    emoji: string;
    count: number;
    isLiked: boolean;
};

type BlogActionsProps = {
    reactions: Reaction[];
    onReaction: (reactionId: string) => void;
    onToggleComments: () => void;
};

export const BlogActions: React.FC<BlogActionsProps> = ({
    reactions,
    onReaction,
    onToggleComments
}) => {
    const isLiked = reactions.find(r => r.id === 'like')?.isLiked || false;

    return (
        <div className="border-t border-gray-200 pt-1">
            <div className="flex">
                <Button
                    variant="unstyled"
                    onClick={() => onReaction('like')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors ${isLiked ? 'text-blue-600' : 'text-gray-600'
                        }`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                            fill={isLiked ? 'currentColor' : 'none'} />
                    </svg>
                    <span className="text-sm font-medium">Like</span>
                </Button>

                <Button
                    variant="unstyled"
                    onClick={onToggleComments}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
                    </svg>
                    <span className="text-sm font-medium">Comment</span>
                </Button>
            </div>
        </div>
    );
};

