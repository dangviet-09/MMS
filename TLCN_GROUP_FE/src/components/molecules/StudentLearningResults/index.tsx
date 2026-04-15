import React, { useState, useEffect } from 'react';
import { getStudentLearningResults } from '../../../services/studentService';
import { StudentProgress, StudentTestResult } from '../../../types/types';
import { Toast } from '../ToastNotification';

export const StudentLearningResults: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [inProgressCourses, setInProgressCourses] = useState(0);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    fetchLearningResults();
  }, []);

  const fetchLearningResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await getStudentLearningResults();
      setProgress(results.progress);
      setTotalCourses(results.totalCourses);
      setCompletedCourses(results.completedCourses);
      setInProgressCourses(results.inProgressCourses);
    } catch (error) {
      console.error('Failed to load learning results', error);
      setError('Could not load learning results. Please try again!');
      setToast({ message: 'Could not load learning results. Please try again!', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'NOT_STARTED':
        return 'Not Started';
      default:
        return status;
    }
  };

  const toggleCourseDetails = (courseId: string) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  };

  const calculateAverageScore = (testResults?: StudentTestResult[]) => {
    if (!testResults || testResults.length === 0) return 0;
    const totalScore = testResults.reduce((sum, result) => sum + result.score, 0);
    return (totalScore / testResults.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Results</h3>
        <div className="text-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-red-400 mb-3"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-blue-900">{totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <p className="text-sm text-amber-700 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-amber-900">{inProgressCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900">{completedCourses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          Your Enrolled Courses
        </h4>

        {progress.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-3">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <p className="text-gray-600 font-medium">You haven't enrolled in any courses yet</p>
            <p className="text-sm text-gray-500 mt-1">Start learning by browsing available career paths</p>
          </div>
        ) : (
          <div className="space-y-4">
            {progress.map((courseProgress) => (
              <div
                key={courseProgress.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Course Header */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleCourseDetails(courseProgress.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="text-lg font-semibold text-gray-900">
                          {courseProgress.course?.title || courseProgress.careerPath?.title || 'Untitled Course'}
                        </h5>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(courseProgress.status)}`}>
                          {getStatusLabel(courseProgress.status)}
                        </span>
                      </div>
                      {(courseProgress.course?.company?.companyName || courseProgress.careerPath?.company?.companyName) && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                          {courseProgress.course?.company?.companyName || courseProgress.careerPath?.company?.companyName}
                        </p>
                      )}
                      {(courseProgress.course?.description || courseProgress.careerPath?.description) && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {courseProgress.course?.description || courseProgress.careerPath?.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {courseProgress.testResults && courseProgress.testResults.length > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Average Score</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {calculateAverageScore(courseProgress.testResults)}%
                          </p>
                        </div>
                      )}
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
                        className={`transform transition-transform ${expandedCourseId === courseProgress.id ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Test Results (Expandable) */}
                {expandedCourseId === courseProgress.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-5">
                    <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Test Results
                    </h6>
                    {courseProgress.testResults && courseProgress.testResults.length > 0 ? (
                      <div className="space-y-2">
                        {courseProgress.testResults.map((result) => (
                          <div
                            key={result.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {result.test?.title || 'Test'}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs px-2 py-1 rounded ${result.test?.type === 'FINAL_PATH'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                                  }`}>
                                  {result.test?.type === 'FINAL_PATH' ? 'Final Test' : 'Mini Test'}
                                </span>
                                {result.finishedAt && (
                                  <span className="text-xs text-gray-500">
                                    Completed: {new Date(result.finishedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${result.score >= 80 ? 'text-green-600' :
                                result.score >= 60 ? 'text-amber-600' :
                                  'text-red-600'
                                }`}>
                                {result.score}%
                              </p>
                              <p className="text-xs text-gray-500">
                                / {result.test?.maxScore || 100}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No test results available yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLearningResults;
