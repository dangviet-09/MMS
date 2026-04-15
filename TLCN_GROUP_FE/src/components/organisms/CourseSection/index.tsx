import React, { useEffect, useMemo, useState, useRef, ReactNode } from "react";
import { CourseCard, CourseCardProps } from "../../molecules/CourseCard";
import { Button } from "../../atoms/Button/Button";

type CourseCategory = "all" | "combo" | "fullcourse";

const categoryLabels: Record<CourseCategory, string> = {
	all: "All",
	combo: "Combo",
	fullcourse: "Full Course",
};

const categoryIcons: Record<CourseCategory, ReactNode> = {
	all: (
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="3" y="3" width="7" height="7"></rect>
			<rect x="14" y="3" width="7" height="7"></rect>
			<rect x="14" y="14" width="7" height="7"></rect>
			<rect x="3" y="14" width="7" height="7"></rect>
		</svg>
	),
	combo: (
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
		</svg>
	),
	fullcourse: (
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
			<polyline points="2 17 12 22 22 17"></polyline>
			<polyline points="2 12 12 17 22 12"></polyline>
		</svg>
	),
};

type CourseSectionProps = {
	courses: CourseCardProps[];
	loading?: boolean;
	badgeText?: string;
	title?: string;
	subtitle?: string;
};

export const CourseSection: React.FC<CourseSectionProps> = ({
	courses,
	loading = false,
	badgeText = "Courses",
	title = "Featured Courses",
	subtitle = "Discover the learning path that's right for you",
}) => {
	const [selectedCategory, setSelectedCategory] = useState<CourseCategory>("all");
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const categories: CourseCategory[] = useMemo(() => {
		const uniqueTypes = Array.from(
			new Set(courses.map((course) => course.type))
		).filter((type) => type !== "course") as CourseCategory[];

		// Only include categories that exist in the courses
		const availableCategories: CourseCategory[] = ["all"];
		if (uniqueTypes.includes("combo")) availableCategories.push("combo");
		if (uniqueTypes.includes("fullcourse")) availableCategories.push("fullcourse");

		return availableCategories;
	}, [courses]);

	useEffect(() => {
		if (!categories.includes(selectedCategory)) {
			setSelectedCategory("all");
		}
	}, [categories, selectedCategory]);

	const filteredCourses = useMemo(() => {
		return courses.filter((course) => {
			return selectedCategory === "all" || course.type === selectedCategory;
		});
	}, [courses, selectedCategory]);

	const checkScrollButtons = () => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
		}
	};

	useEffect(() => {
		checkScrollButtons();
		const container = scrollContainerRef.current;
		if (container) {
			container.addEventListener('scroll', checkScrollButtons);
			return () => container.removeEventListener('scroll', checkScrollButtons);
		}
	}, [categories]);

	return (
		<section className="w-full py-12 bg-gradient-to-b  to-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header Section */}
				<div className="mb-10">
					<div className="flex items-center justify-between mb-6">
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
								<div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
								<span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
									{badgeText}
								</span>
							</div>
							<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{title}</h2>
							<p className="text-base text-gray-600">{subtitle}</p>
						</div>
						<div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
								<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
								<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
							</svg>
							<span className="text-2xl font-bold text-gray-900">{filteredCourses.length}</span>
							<span className="text-sm text-gray-500">courses</span>
						</div>
					</div>

					{/* Category Pills */}
					{categories.length > 1 && (
						<div className="relative">
							<div
								ref={scrollContainerRef}
								className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
								style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
							>
								{categories.map((category) => {
									const isActive = selectedCategory === category;
									return (
										<Button
											key={category}
											onClick={() => setSelectedCategory(category)}
											variant="unstyled"
											className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 ${isActive
													? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105"
													: "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md"
												}`}
										>
											<span className={isActive ? "text-white" : "text-gray-400"}>
												{categoryIcons[category]}
											</span>
											<span className="font-medium">{categoryLabels[category]}</span>
										</Button>
									);
								})}
							</div>

							{/* Scroll Indicators */}
							{canScrollLeft && (
								<div className="absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
							)}
							{canScrollRight && (
								<div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
							)}
						</div>
					)}
				</div>

				{/* Courses Grid */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{loading ? (
						<div className="col-span-full flex justify-center py-20">
							<div className="flex flex-col items-center gap-4">
								<div className="relative">
									<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
									<div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-blue-600 opacity-20" />
								</div>
								<p className="text-sm font-medium text-gray-600">Loading amazing courses...</p>
							</div>
						</div>
					) : filteredCourses.length > 0 ? (
						filteredCourses.map((course) => (
							<CourseCard key={course.id} {...course} />
						))
					) : (
						<div className="col-span-full">
							<div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
								<div className="flex flex-col items-center gap-4">
									<div className="relative">
										<div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
											<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
												<circle cx="11" cy="11" r="8"></circle>
												<path d="m21 21-4.35-4.35"></path>
											</svg>
										</div>
										<div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
											<span className="text-xs">!</span>
										</div>
									</div>
									<div className="space-y-1">
										<p className="text-lg font-semibold text-gray-900">No courses found</p>
										<p className="text-sm text-gray-500">Try selecting a different category to explore more courses</p>
									</div>
									<Button
										onClick={() => setSelectedCategory("all")}
										variant="outline"
										className="mt-2"
									>
										View All Courses
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};
