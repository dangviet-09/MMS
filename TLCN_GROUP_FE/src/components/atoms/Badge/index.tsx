import React from "react";

type BadgeVariant = "course" | "fullcourse" | "combo" | "default";

type BadgeProps = {
	label: string;
	variant?: BadgeVariant;
	className?: string;
	icon?: React.ReactNode;
};

const variantClasses: Record<BadgeVariant, string> = {
	course: "bg-blue-50 text-blue-600",
	fullcourse: "bg-green-50 text-green-600",
	combo: "bg-purple-50 text-purple-600",
	default: "bg-gray-100 text-gray-600",
};

export const Badge: React.FC<BadgeProps> = ({
	label,
	variant = "default",
	className = "",
	icon,
}) => {
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}
		>
			{icon}
			{label}
		</span>
	);
};


