// atoms/Avatar.tsx
import React from "react";

type AvatarProps = {
    name?: string;
    src?: string;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    className?: string;
    bgColor?: string;
    type?: "student" | "company";
};

const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-24 h-24 text-lg",
    xl: "w-32 h-32 text-xl",
    "2xl": "w-40 h-40 text-2xl",
};

export const Avatar: React.FC<AvatarProps> = ({
    name = "U",
    src,
    size = "md",
    className = "",
    bgColor = "bg-blue-500",
    type = "student",
}) => {
    const sizeClass = sizeClasses[size];

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizeClass} rounded-full object-cover border-4 border-white shadow-lg ${className}`}
            />
        );
    }

    return (
        <div
            className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${className}`}
        >
            {name[0]?.toUpperCase() || "U"}
        </div>
    );
};