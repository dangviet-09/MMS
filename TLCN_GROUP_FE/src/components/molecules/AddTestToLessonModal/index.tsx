import React from 'react';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';

type AddTestToLessonModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    isAddingLessonTest: boolean;
    testForm: {
        title: string;
        description: string;
        type: 'MINI' | 'FINAL_PATH';
        maxScore: number;
        content: string;
    };
    setTestForm: React.Dispatch<React.SetStateAction<{
        title: string;
        description: string;
        type: 'MINI' | 'FINAL_PATH';
        maxScore: number;
        content: string;
    }>>;
}

const AddTestToLessonModal: React.FC<AddTestToLessonModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isAddingLessonTest,
    testForm,
    setTestForm
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isAddingLessonTest ? 'text-green-600' : 'text-purple-600'}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            {isAddingLessonTest ? 'Add Mini Test to Lesson' : 'Add Final Test'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 ml-8">
                            {isAddingLessonTest 
                                ? 'Create a small test for this specific lesson' 
                                : 'Create a comprehensive test covering all lessons in this course'}
                        </p>
                    </div>
                    <Button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </Button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Test Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={testForm.title}
                                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                                placeholder="Enter test title"
                                className="text-lg"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <Textarea
                                value={testForm.description}
                                onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                                placeholder="Enter test description"
                                className="min-h-[100px] text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Maximum Score
                            </label>
                            <Input
                                type="number"
                                value={testForm.maxScore}
                                onChange={(e) => setTestForm({ ...testForm, maxScore: parseInt(e.target.value) || 100 })}
                                placeholder="100"
                                className="text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Test Type
                            </label>
                            <div className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
                                isAddingLessonTest 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-purple-100 text-purple-700'
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                {isAddingLessonTest ? 'MINI - Lesson Test' : 'FINAL_PATH - Final Test'}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Content (Plain Text)
                        </label>
                        <Textarea
                            value={testForm.content}
                            onChange={(e) => setTestForm({ ...testForm, content: e.target.value })}
                            placeholder=""
                            className="min-h-[200px] text-sm bg-gray-50"
                        />
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-700 font-medium mb-1">Content Guide:</p>
                            <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                                <li>Write test questions in plain text format</li>
                                <li>Can use Markdown formatting for better structure</li>
                                <li>Include questions, options, correct answers, and points</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                        <Button 
                            variant="secondary" 
                            onClick={onClose}
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={onSubmit}
                            className="px-6"
                        >
                            Add Test
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTestToLessonModal;
