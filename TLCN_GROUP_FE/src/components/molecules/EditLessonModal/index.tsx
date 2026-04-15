import React from 'react';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';

type EditLessonModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    lessonForm: {
        title: string;
        order: number;
        content: string;
    };
    setLessonForm: React.Dispatch<React.SetStateAction<{
        title: string;
        order: number;
        content: string;
    }>>;
}

const EditLessonModal: React.FC<EditLessonModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    lessonForm,
    setLessonForm
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit Lessons
                    </h3>
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
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lesson Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                            placeholder="Nhập tiêu đề bài học"
                            className="text-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lesson Content <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            value={lessonForm.content}
                            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                            placeholder="Enter detailed lesson content..."
                            className="min-h-[200px] text-base"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Order
                        </label>
                        <Input
                            type="number"
                            value={lessonForm.order}
                            onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 1 })}
                            placeholder="Enter order"
                            className="text-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Determines the display order of this lesson</p>
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
                            Update
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditLessonModal;
