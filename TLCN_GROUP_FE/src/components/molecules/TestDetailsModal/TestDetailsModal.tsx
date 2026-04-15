import React, { useEffect, useState } from 'react';
import { CareerTest, TestQuestion } from '../../../types/types';
import { getCareerTestById } from '../../../api/careerPathApi';
import { createLesson } from '../../../api/lessonApi';
import { createTest } from '../../../api/testApi';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';
import { Toast } from '../../molecules/ToastNotification';

type TestDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    testId: string | null;
}

export const TestDetailsModal: React.FC<TestDetailsModalProps> = ({ isOpen, onClose, testId }) => {
    const [test, setTest] = useState<CareerTest | null>(null);
    const [questions, setQuestions] = useState<TestQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const [showAddLessonModal, setShowAddLessonModal] = useState(false);
    const [showAddTestModal, setShowAddTestModal] = useState(false);
    const [isAddingLessonTest, setIsAddingLessonTest] = useState(false);

    const [lessonForm, setLessonForm] = useState({ title: '', order: 1, content: '' });
    const [testForm, setTestForm] = useState({ title: '', description: '', order: 1, type: 'MINI', maxScore: 100, content: '' });
    const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && testId) {
            loadTestDetails(testId);
        } else {
            setTest(null);
            setQuestions([]);
        }
    }, [isOpen, testId]);

    const loadTestDetails = async (id: string) => {
        try {
            setLoading(true);
            const data = await getCareerTestById(id);
            setTest(data);
            if ('questions' in data) {
                setQuestions((data as any).questions);
            }
        } catch (error) {
            console.error('Failed to load test details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLesson = async () => {
        if (!testId) return;
        try {
            const response = await createLesson(testId, {
                title: lessonForm.title,
                order: lessonForm.order,
                content: lessonForm.content
            });

            setToast({ message: 'Lesson added successfully!', type: 'success' });
            setShowAddLessonModal(false);

            if (confirm('Would you like to add a test for this lesson now?')) {
                setCurrentLessonId((response as any).data?.id || (response as any).id);
                setIsAddingLessonTest(true);
                setShowAddTestModal(true);
            }

            setLessonForm({ title: '', order: lessonForm.order + 1, content: '' });
        } catch (error) {
            console.error('Failed to add lesson:', error);
            setToast({ message: 'Failed to add lesson.', type: 'error' });
        }
    };

    const handleAddTest = async () => {
        try {
            if (isAddingLessonTest && currentLessonId) {
                await createTest({
                    lessonId: currentLessonId,
                    title: testForm.title,
                    order: testForm.order,
                    description: testForm.description,
                    type: 'MINI',
                    maxScore: testForm.maxScore,
                    content: testForm.content
                });
                setToast({ message: 'Test added to lesson successfully!', type: 'success' });
            } else {
                if (testId) {
                    await createTest({
                        careerPathId: testId,
                        title: testForm.title,
                        order: testForm.order,
                        description: testForm.description,
                        type: 'FINAL_PATH',
                        maxScore: testForm.maxScore,
                        content: testForm.content
                    });
                    setToast({ message: 'General test added successfully!', type: 'success' });
                }
            }
            setShowAddTestModal(false);
            setIsAddingLessonTest(false);
            setCurrentLessonId(null);
            setTestForm({ title: '', description: '', order: 1, type: 'MINI', maxScore: 100, content: '' });
        } catch (error) {
            console.error('Failed to add test:', error);
            setToast({ message: 'Failed to add test.', type: 'error' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                <div className="relative h-48 bg-gray-100 flex-shrink-0">
                    {test?.imageUrl ? (
                        <img
                            src={test.imageUrl}
                            alt={test.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                        </div>
                    )}
                    <Button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </Button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex justify-between items-end">
                        <h2 className="text-3xl font-bold text-white">{test?.title || 'Loading...'}</h2>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-8 py-5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                    <Button
                        variant="primary"
                        onClick={() => setShowAddLessonModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Add Lesson
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setIsAddingLessonTest(false);
                            setShowAddTestModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        Add Test
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : test ? (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    Description
                                </h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {test.description || 'No detailed description available.'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    List of Test ({questions.length})
                                </h3>

                                {questions.length > 0 ? (
                                    <div className="space-y-4">
                                        {questions.map((q, index) => (
                                            <div key={q.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="font-medium text-gray-900 mb-2">
                                                    Question {index + 1}: {q.question}
                                                </div>
                                                <div className="pl-4 space-y-1">
                                                    {q.options.map((opt, i) => (
                                                        <div key={i} className="text-gray-600 text-sm flex items-center gap-2">
                                                            <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">{String.fromCharCode(65 + i)}</span>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                                        <p className="text-gray-500">No questions have been added to this test yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            Test information not found.
                        </div>
                    )}
                </div>
            </div>

            {/* Add Lesson Modal */}
            {showAddLessonModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Add New Lesson</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                                <Input
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    placeholder="Enter lesson title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Content</label>
                                <Textarea
                                    value={lessonForm.content}
                                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                                    placeholder="Enter lesson content"
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                <Input
                                    type="number"
                                    value={lessonForm.order}
                                    onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                                    placeholder="Enter order"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="secondary" onClick={() => setShowAddLessonModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleAddLesson}>Add Lesson</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Test Modal */}
            {showAddTestModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4">
                            {isAddingLessonTest ? 'Add a test to the lesson' : 'Add a test'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test title</label>
                                <Input
                                    value={testForm.title}
                                    onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                                    placeholder="Enter test title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <Input
                                    value={testForm.description}
                                    onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                                    placeholder="Enter description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                <Input
                                    type="number"
                                    value={testForm.order}
                                    onChange={(e) => setTestForm({ ...testForm, order: parseInt(e.target.value) })}
                                    placeholder="Enter order"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                                <Input
                                    type="number"
                                    value={testForm.maxScore}
                                    onChange={(e) => setTestForm({ ...testForm, maxScore: parseInt(e.target.value) })}
                                    placeholder="Enter max score"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON)</label>
                                <Textarea
                                    value={testForm.content}
                                    onChange={(e) => setTestForm({ ...testForm, content: e.target.value })}
                                    placeholder='{"questions": []}'
                                    className="min-h-[100px] font-mono text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="secondary" onClick={() => setShowAddTestModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleAddTest}>Add Test</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
