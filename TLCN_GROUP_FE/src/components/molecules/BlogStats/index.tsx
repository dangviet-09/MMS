import React from "react";

type Reaction = {
    id: string;
    emoji: string;
    count: number;
    isLiked: boolean;
};

type BlogStatsProps = {
    reactions: Reaction[];
    totalComments: number;
};

export const BlogStats: React.FC<BlogStatsProps> = ({ reactions, totalComments }) => {
    const likeCount = reactions.find(r => r.id === 'like')?.count || 0;

    return (
        <div className="flex items-center justify-between py-2 px-1 text-sm">
            <div className="flex items-center gap-1">
                {likeCount > 0 && (
                    <span className="flex items-center gap-1 text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        <span>{likeCount}</span>
                    </span>
                )}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-gray-600">{totalComments} comments</span>
            </div>
        </div>
    );
};

