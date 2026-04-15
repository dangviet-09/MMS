import React from 'react';
import { Button } from '../../atoms/Button/Button';

type Lesson = {
    id: string;
    title: string;
};

type Test = {
    id: string;
    title: string;
    type?: string;
};

type SidebarLessonsProps = {
    courseId: string;
    lessons: Lesson[];
    lessonTests: Test[];
    finalTests: Test[];
    selectedItem: string;
    viewMode: 'lesson' | 'test';
    onSelectLesson: (id: string) => void;
    onSelectTest: (id: string) => void;
};

const SidebarLessons: React.FC<SidebarLessonsProps> = ({
    lessons,
    lessonTests,
    finalTests,
    selectedItem,
    viewMode,
    onSelectLesson,
    onSelectTest,
}) => {
    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
                <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
            </div>

            {/* Lessons List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {/* Lessons Section */}
                    <div className="mb-6">
                        <h3 className="mb-3 px-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Lessons
                        </h3>
                        {lessons.map((lesson, index) => (
                            <Button
                                key={lesson.id}
                                onClick={() => onSelectLesson(lesson.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                                    selectedItem === lesson.id && viewMode === 'lesson'
                                        ? 'bg-black text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                            selectedItem === lesson.id && viewMode === 'lesson'
                                                ? 'bg-white text-black'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium text-sm ${
                                            selectedItem === lesson.id && viewMode === 'lesson' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {lesson.title}
                                        </p>
                                    </div>
                                    {selectedItem === lesson.id && viewMode === 'lesson' && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-white"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            </Button>
                        ))}
                    </div>

                    {/* Mini Tests Section (for current lesson) */}
                    {lessonTests.length > 0 && (
                        <div className="mb-6">
                            <h3 className="mb-3 px-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                Current Lesson Tests
                            </h3>
                            {lessonTests.map((test, index) => (
                                <Button
                                    key={test.id}
                                    onClick={() => onSelectTest(test.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                                        selectedItem === test.id && viewMode === 'test'
                                            ? 'bg-black text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                                selectedItem === test.id && viewMode === 'test'
                                                    ? 'bg-white text-black'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            T{index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium text-sm ${
                                                selectedItem === test.id && viewMode === 'test' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {test.title}
                                            </p>
                                        </div>
                                        {selectedItem === test.id && viewMode === 'test' && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="text-white"
                                            >
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Final Tests Section */}
                    {finalTests.length > 0 && (
                        <div>
                            <h3 className="mb-3 px-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                Final Tests
                            </h3>
                            {finalTests.map((test) => (
                                <Button
                                    key={test.id}
                                    onClick={() => onSelectTest(test.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                                        selectedItem === test.id && viewMode === 'test'
                                            ? 'bg-black text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                selectedItem === test.id && viewMode === 'test'
                                                    ? 'bg-white text-black'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium text-sm ${
                                                selectedItem === test.id && viewMode === 'test' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {test.title}
                                            </p>
                                        </div>
                                        {selectedItem === test.id && viewMode === 'test' && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="text-white"
                                            >
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SidebarLessons;
