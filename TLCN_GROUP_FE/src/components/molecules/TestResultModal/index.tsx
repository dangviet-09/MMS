import React from "react";
import { Button } from "../../atoms/Button/Button";
import { TestResult } from "../../../api/careerTestApi";
import { CheckCircle, User, FileText, Users, Briefcase } from "lucide-react";

type TestResultModalProps = {
    isOpen: boolean;
    onClose: () => void;
    result: TestResult | null;
}

export const TestResultModal: React.FC<TestResultModalProps> = ({
    isOpen,
    onClose,
    result
}) => {
    if (!isOpen || !result) return null;

    const getCareerIcon = (career: string) => {
        switch (career) {
            case 'BACKEND':
                return <FileText className="w-6 h-6" />;
            case 'FRONTEND':
                return <User className="w-6 h-6" />;
            case 'BA':
                return <Users className="w-6 h-6" />;
            case 'PM':
                return <Briefcase className="w-6 h-6" />;
            default:
                return <FileText className="w-6 h-6" />;
        }
    };

    const getCareerTitle = (career: string) => {
        switch (career) {
            case 'BACKEND':
                return 'Backend Developer';
            case 'FRONTEND':
                return 'Frontend Developer';
            case 'BA':
                return 'Business Analyst';
            case 'PM':
                return 'Project Manager';
            default:
                return 'Unknown Career';
        }
    };

    const totalScore = Object.values(result.scores).reduce((sum, score) => sum + score, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="px-6 py-6 border-b border-gray-200 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Assessment Complete</h2>
                    <p className="text-gray-600">Here are your results</p>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {/* Best Career */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            {getCareerIcon(result.bestCareer)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {getCareerTitle(result.bestCareer)}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {result.message}
                        </p>
                    </div>

                    {/* Scores Breakdown */}
                    {totalScore > 0 && (
                        <div className="mb-6">
                            <h4 className="text-base font-medium text-gray-900 mb-3">
                                Score Breakdown
                            </h4>
                            <div className="space-y-3">
                                {Object.entries(result.scores).map(([career, score]) => {
                                    const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
                                    return (
                                        <div key={career} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                                                    {getCareerIcon(career)}
                                                </div>
                                                <span className="text-sm text-gray-700">
                                                    {getCareerTitle(career)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500 min-w-[40px] text-right">
                                                    {score}/{totalScore}
                                                </span>
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="text-center pt-4 border-t border-gray-200">
                        <Button
                            variant="primary"
                            onClick={onClose}
                            className="w-full"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestResultModal;