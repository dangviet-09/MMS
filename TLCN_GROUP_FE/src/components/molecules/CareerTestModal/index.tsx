import React, { useState, useEffect } from "react";
import { Button } from "../../atoms/Button/Button";
import { careerTestApi, CareerTest, TestAnswer, TestResult } from "../../../api/careerTestApi";
import { Toast } from "../ToastNotification";
import TestResultModal from "../TestResultModal";
import { FileText } from "lucide-react";

type CareerTestModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (result: TestResult) => void;
}

export const CareerTestModal: React.FC<CareerTestModalProps> = ({
    isOpen,
    onClose,
    onComplete
}) => {
    const [test, setTest] = useState<CareerTest | null>(null);
    const [answers, setAnswers] = useState<TestAnswer[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [testResult, setTestResult] = useState<TestResult | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTest();
        }
    }, [isOpen]);

    const fetchTest = async () => {
        try {
            setLoading(true);
            const testData = await careerTestApi.getTest();
            setTest(testData);
            setAnswers([]);
            setCurrentQuestion(0);
        } catch (error) {
            setToast({ message: "Unable to load assessment. Please try again!", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (option: 'A' | 'B' | 'C' | 'D') => {
        if (!test) return;

        const newAnswers = [...answers];
        const existingIndex = newAnswers.findIndex(a => a.questionIndex === currentQuestion);

        if (existingIndex >= 0) {
            newAnswers[existingIndex] = { questionIndex: currentQuestion, option };
        } else {
            newAnswers.push({ questionIndex: currentQuestion, option });
        }

        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (!test || currentQuestion >= test.questions.length - 1) return;
        setCurrentQuestion(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentQuestion <= 0) return;
        setCurrentQuestion(prev => prev - 1);
    };

    const submitTest = async () => {
        if (!test || answers.length < test.questions.length) {
            setToast({ message: "Please answer all questions before submitting!", type: "warning" });
            return;
        }

        try {
            setSubmitting(true);
            const result = await careerTestApi.submitTest(answers);
            setToast({ message: "Assessment completed successfully!", type: "success" });
            setTestResult(result);
            setShowResult(true);
            if (onComplete) {
                onComplete(result);
            }
        } catch (error) {
            setToast({ message: "Failed to submit assessment. Please try again!", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseResult = () => {
        setShowResult(false);
        setTestResult(null);
        onClose();
    };

    const getCurrentAnswer = () => {
        return answers.find(a => a.questionIndex === currentQuestion)?.option;
    };

    const isAnswered = (questionIndex: number) => {
        return answers.some(a => a.questionIndex === questionIndex);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Career Assessment Test
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Answer the questions to discover your ideal career path
                    </p>
                </div>

                <div className="px-6 py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-600 text-lg">Loading assessment...</span>
                        </div>
                    ) : test ? (
                        <>
                            <div className="mb-8">
                                <div className="flex justify-between text-gray-600 mb-3">
                                    <span className="font-medium">Question {currentQuestion + 1} of {test.questions.length}</span>
                                    <span>{answers.length} / {test.questions.length} answered</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
                                    {test.questions[currentQuestion].question}
                                </h3>

                                <div className="space-y-4">
                                    {Object.entries(test.questions[currentQuestion].options).map(([key, value]) => {
                                        return (
                                        <Button
                                            key={key}
                                            onClick={() => handleAnswer(key as 'A' | 'B' | 'C' | 'D')}
                                            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${getCurrentAnswer() === key
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start">
                                                <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold mr-4 ${getCurrentAnswer() === key
                                                        ? 'border-blue-500 bg-blue-500 text-white'
                                                        : 'border-gray-300 text-gray-600'
                                                    }`}>
                                                    {key}
                                                </span>
                                                <span className="text-gray-900 text-lg">{value}</span>
                                            </div>
                                        </Button>
                                    )})}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-8">
                                {test.questions.map((_, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${index === currentQuestion
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : isAnswered(index)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {index + 1}
                                    </Button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">Unable to load assessment</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-200 flex justify-between">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentQuestion === 0}
                            className="px-6"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleNext}
                            disabled={!test || currentQuestion >= test.questions.length - 1}
                            className="px-6"
                        >
                            Next
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={submitTest}
                            disabled={!test || answers.length !== test.questions.length || submitting}
                            className="px-6"
                        >
                            {submitting ? "Submitting..." : "Submit Test"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Test Result Modal */}
            <TestResultModal
                isOpen={showResult}
                onClose={handleCloseResult}
                result={testResult}
            />
        </div>
    );
};

export default CareerTestModal;