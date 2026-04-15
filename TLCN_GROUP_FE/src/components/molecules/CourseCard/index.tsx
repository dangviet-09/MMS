import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../atoms/Badge";

type CourseType = "course" | "combo" | "fullcourse";

	export type CourseCardProps = {
		id: string;
		title: string;
		thumbnail: string;
		author: string;
		rating?: number;
		type: CourseType;
		trending?: boolean;
	};

	const typeToLabel: Record<CourseType, string> = {
		course: "Khóa học",
		combo: "Combo",
		fullcourse: "Full Course",
	};

	const typeToVariant: Record<CourseType, "course" | "combo" | "fullcourse"> = {
		course: "course",
		combo: "combo",
		fullcourse: "fullcourse",
	};


export const CourseCard: React.FC<CourseCardProps> = ({
	id,
	title,
	thumbnail,
	author,
	type,
}) => {
	const navigate = useNavigate();

	const handleCardClick = () => {
		navigate(`/courses/${id}`);
	};	return (
		<div 
			onClick={handleCardClick}
			className="group flex flex-col rounded-xl bg-white shadow transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
		>
			<div className="relative overflow-hidden rounded-t-xl">
				<img
					src={thumbnail}
					alt={title}
					className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			</div>
			<div className="flex flex-1 flex-col space-y-4 p-5">
				<Badge
					label={typeToLabel[type]}
					variant={typeToVariant[type]}
					className="text-xs"
				/>
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
						{title}
					</h3>
					<p className="mt-1.5 text-sm font-medium text-gray-500">
						{author}
					</p>
				</div>
			</div>
		</div>
	);
};


