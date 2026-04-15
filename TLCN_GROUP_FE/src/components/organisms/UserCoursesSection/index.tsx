import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../atoms/Badge';
import { getEnrolledCourses } from '../../../api/studentApi';
import { courseApi } from '../../../api/courseApi';
import { userApi } from '../../../api/userApi';
import { Play } from 'lucide-react';

type CourseProgress = {
  id: string;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  progress?: number;
  enrolledStudents?: number;
};


type UserCoursesSectionProps = {
  userId?: string;
  className?: string;
  onCoursesLoaded?: (count: number) => void;
};

export const UserCoursesSection: React.FC<UserCoursesSectionProps> = ({
  userId,
  className = '',
  onCoursesLoaded,
}) => {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        let role = null;
        if (userId) {
          try {
            const userInfo = await userApi.getById(userId);
            role = userInfo.role;
            setUserRole(role);
          } catch (err) {
            console.error('Error fetching user info:', err);
          }
        }

        if (role === 'COMPANY') {
          const response = await courseApi.getMyCourses() as any;
          const data = response.data || response;

          const transformedCourses: CourseProgress[] = (data || []).map((item: any) => ({
            id: item.id || '',
            title: item.title || 'Untitled Course',
            status: item.status === 'PUBLISHED' ? 'COMPLETED' : 'IN_PROGRESS',
            progress: item.status === 'PUBLISHED' ? 100 : 50,
            enrolledStudents: item.enrolledStudents || 0,
          }));

          setCourses(transformedCourses);
          onCoursesLoaded?.(transformedCourses.length);
        } else {
          const response = await getEnrolledCourses() as any;
          const data = response.data || response;

          const transformedCourses: CourseProgress[] = (data.enrolledCourses || data.progress || data || [])
            .filter((item: any) => {
              // Filter out courses that have been deleted (careerPath or course is null)
              const courseData = item.course || item.careerPath || item;
              return courseData && courseData.id && courseData.title;
            })
            .map((item: any) => {
              const courseData = item.course || item.careerPath || item;
              let calculatedProgress = item.progress || 0;

              if (!item.progress && item.completedLessons !== undefined && item.totalLessons !== undefined && item.totalLessons > 0) {
                calculatedProgress = Math.round((item.completedLessons / item.totalLessons) * 100);
              }

              if (!calculatedProgress && item.progressPercentage !== undefined) {
                calculatedProgress = item.progressPercentage;
              }

              return {
                id: item.careerPathId || courseData.id || item.id || '',
                title: courseData.title || item.title || 'Untitled Course',
                status: item.status || 'NOT_STARTED',
                progress: calculatedProgress,
              };
            });


          setCourses(transformedCourses);
          onCoursesLoaded?.(transformedCourses.length);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);


  const getStatusVariant = (status: string): 'course' | 'combo' | 'fullcourse' => {
    switch (status) {
      case 'COMPLETED':
        return 'fullcourse';
      case 'IN_PROGRESS':
        return 'combo';
      default:
        return 'course';
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

  const handleCourseClick = (course: CourseProgress) => {
    // Chỉ cho phép navigate khi user là STUDENT và course đang IN_PROGRESS
    if (userRole === 'STUDENT' && course.status === 'IN_PROGRESS') {
      // Navigate đến trang học để tiếp tục
      navigate(`/courses/${course.id}/learn`);
    } else if (userRole === 'STUDENT' && course.status === 'COMPLETED') {
      // Có thể navigate đến trang chi tiết hoặc review
      navigate(`/career-paths/${course.id}`);
    } else if (userRole === 'COMPANY') {
      // Company xem chi tiết career path của mình
      navigate(`/career-paths/${course.id}`);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-8 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{userRole === 'COMPANY' ? 'Created Courses' : 'Enrolled Courses'}</h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 mt-3">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-8 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{userRole === 'COMPANY' ? 'Created Courses' : 'Enrolled Courses'}</h3>
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

  if (courses.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-8 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{userRole === 'COMPANY' ? 'Created Courses' : 'Enrolled Courses'}</h3>
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
            className="mx-auto text-gray-400 mb-3"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <p className="text-gray-500">{userRole === 'COMPANY' ? 'No courses created yet' : 'No courses enrolled yet'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {userRole === 'COMPANY' ? 'Created Courses' : 'Enrolled Courses'} ({courses.length})
      </h3>
      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => handleCourseClick(course)}
            className={`bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden ${
              (userRole === 'STUDENT' && course.status === 'IN_PROGRESS') || 
              (userRole === 'STUDENT' && course.status === 'COMPLETED') ||
              userRole === 'COMPANY'
                ? 'cursor-pointer hover:shadow-md hover:bg-gray-100'
                : 'cursor-default'
            }`}
            title={
              userRole === 'STUDENT' && course.status === 'IN_PROGRESS'
                ? 'Click to continue learning'
                : userRole === 'STUDENT' && course.status === 'COMPLETED'
                ? 'Click to view course details'
                : userRole === 'COMPANY'
                ? 'Click to view course details'
                : ''
            }
          >
            {/* Course Header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    {userRole === 'COMPANY' && course.enrolledStudents !== undefined}
                  </div>
                  {course.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    label={getStatusLabel(course.status)}
                    variant={getStatusVariant(course.status)}
                    className="text-xs shrink-0"
                  />
                  {userRole === 'STUDENT' && course.status === 'IN_PROGRESS' && (
                    <Play className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
