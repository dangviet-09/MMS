import React from 'react';
import { Button } from '../../atoms/Button/Button';

type Lesson = {
  id: string;
  title: string;
  order: number;
  content?: string;
};

type CourseDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    lessons?: Lesson[];
  } | null;
  onLearnNow: () => void;
  isJoining?: boolean;
};

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  isOpen,
  onClose,
  course,
  onLearnNow,
  isJoining = false,
}) => {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl transform transition-all max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-900">Course Details</h3>
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Course Image */}
          {course.thumbnail && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Course Title */}
          <div>
            <h4 className="text-xl font-bold text-gray-900">{course.title}</h4>
          </div>

          {/* Description */}
          {course.description && (
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Description</h5>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Lessons List */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-3">
              Lessons ({course.lessons?.length || 0})
            </h5>
            <div className="space-y-2">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{lesson.title}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-sm">No lessons available</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="secondary"
            onClick={onClose}
            className="px-6"
          >
            Close
          </Button>
          <Button
            onClick={onLearnNow}
            disabled={isJoining}
            variant="unstyled"
            className="px-6 py-3 rounded-lg bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Learn now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
