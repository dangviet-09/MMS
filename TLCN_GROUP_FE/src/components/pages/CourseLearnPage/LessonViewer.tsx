import React from 'react';
import { Lesson, Test } from '../../../types/types';

type LessonViewerProps = {
    lesson: Lesson;
    lessonTests: Test[];
    onSelectTest: (testId: string) => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, lessonTests, onSelectTest }) => {
    return (
        <div className="p-8">
            {/* Lesson Title */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                <div className="h-1 w-20 bg-black"></div>
            </div>

            {/* Content Section */}
            {lesson.content && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Content</h2>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {lesson.content}
                        </div>
                    </div>
                </div>
            )}

            {/* Mini Tests Section */}
            {lessonTests.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Mini Tests</h2>
                    <div className="space-y-3">
                        {lessonTests.map((test, index) => (
                            <div
                                key={test.id}
                                onClick={() => onSelectTest(test.id)}
                                className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer 
                                         hover:border-black hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Test Number Badge */}
                                    <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full 
                                                  flex items-center justify-center font-semibold">
                                        {index + 1}
                                    </div>

                                    {/* Test Info */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{test.title}</h3>
                                        {test.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {test.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                Max Score: {test.maxScore || 100}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Click to open in code editor →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State for Tests */}
            {lessonTests.length === 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Mini Tests</h2>
                    <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                        <p className="text-gray-500">No mini tests available for this lesson</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonViewer;
