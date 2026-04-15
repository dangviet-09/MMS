import React, { useState, useEffect } from "react";
import { TestResult } from "../../../api/careerTestApi";
import CareerTestModal from "../CareerTestModal";
import TestResultModal from "../TestResultModal";
import { Button } from "../../atoms/Button/Button";
import { User, FileText, Clock } from "lucide-react";

type MajorCheckModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onHasMajor: () => void;
}

export const MajorCheckModal: React.FC<MajorCheckModalProps> = ({
  isOpen,
  onClose,
  onHasMajor
}) => {
  const [showCareerTest, setShowCareerTest] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldShowModal, setShouldShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Modal được mở từ MajorCheckWrapper, không cần check lại major
      setShouldShowModal(true);
      setLoading(false);
    }
  }, [isOpen]);

  const handleTakeTest = () => {
    setShowCareerTest(true);
  };

  const handleTestComplete = (result: TestResult) => {
    setShowCareerTest(false);
    setTestResult(result);
    setShowResult(true);
  };

  const handleCloseTest = () => {
    setShowCareerTest(false);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setTestResult(null);
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Don't render if we shouldn't show the modal (user already has major)
  if (!shouldShowModal && !loading) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Checking your profile...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Welcome to Our Platform!
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Let's help you find the perfect career path
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 mb-8">
                        <h3 className="text-xl font-medium text-gray-900 text-center mb-6">
                            Do you already have a career direction?
                        </h3>

                        {/* Options */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="w-12 h-12  rounded-lg flex items-center justify-center flex-shrink-0">
                                    <User className="w-6 h-6 " />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">Yes, I have a direction</h4>
                                    <p className="text-sm text-gray-600">Start exploring with your preferred field</p>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={onHasMajor}
                                    className="px-6"
                                >
                                    Continue
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="w-12 h-12  rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 " />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">Take career assessment</h4>
                                    <p className="text-sm text-gray-600">Discover your ideal career through our test</p>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={handleTakeTest}
                                    className="px-6"
                                >
                                    Take Test
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="w-12 h-12  rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">Maybe later</h4>
                                    <p className="text-sm text-gray-600">I'll set this up another time</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="px-6"
                                >
                                    Skip
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
        )}
      </div>

      {/* Career Test Modal */}
      <CareerTestModal
        isOpen={showCareerTest}
        onClose={handleCloseTest}
        onComplete={handleTestComplete}
      />

      {/* Test Result Modal */}
      <TestResultModal
        isOpen={showResult}
        onClose={handleCloseResult}
        result={testResult}
      />
    </>
  );
};export default MajorCheckModal;