import React, { useState, useEffect } from 'react';
import { getTestById } from '../../../api/testApi';
import { Test } from '../../../types/types';

type TestViewerProps =  {
    testId: string;
}

const TestViewer: React.FC<TestViewerProps> = ({ testId }) => {
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                setLoading(true);
                const response = await getTestById(testId) as any;
                const testData = response.data || response;
                setTest(testData);
            } catch (error) {
                console.error('Failed to load test:', error);
            } finally {
                setLoading(false);
            }
        };

        if (testId) {
            fetchTest();
        }
    }, [testId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Failed to load test information</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Test Type Badge */}
            <div className="mb-4">
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                    test.type === 'FINAL_PATH' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-900'
                }`}>
                    {test.type === 'FINAL_PATH' ? ' Final Test' : 'Mini Test'}
                </span>
            </div>
            {/* Test Title */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h1>
                <div className="h-1 w-20 bg-black"></div>
            </div>

            {/* Test Info */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Max Score</p>
                        <p className="text-lg font-semibold text-gray-900">{test.maxScore || 100} points</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Test Type</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {test.type === 'FINAL_PATH' ? 'Final Assessment' : 'Practice Test'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Description Section */}
            {test.description && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Instructions</h2>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {test.description}
                        </p>
                    </div>
                </div>
            )}

            {/* Content/Requirements Section */}
            {test.content && typeof test.content === 'string' && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3"> Requirements</h2>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {test.content}
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    How to Complete This Test
                </h3>
                <ul className="space-y-2 text-sm text-blue-900">
                    <li className="flex items-start gap-2">
                        <span className="font-semibold">1.</span>
                        <span>Read the instructions and requirements carefully</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-semibold">2.</span>
                        <span>Write your code in the editor on the right side</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-semibold">3.</span>
                        <span>Click "Run Code" to test your solution</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-semibold">4.</span>
                        <span>Click "Submit" when you're ready to submit your answer</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default TestViewer;
