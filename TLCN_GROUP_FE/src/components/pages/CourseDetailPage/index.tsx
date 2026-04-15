import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCareerTestById } from "../../../api/careerPathApi";
import { joinCareerPath } from "../../../api/studentApi";
import { Button } from "../../atoms/Button/Button";
import MainTemplate from "../../templates/MainTemplate/MainTemplate";
import { useAuth } from "../../../contexts/AuthContext";

type Lesson = {
  id: string;
  title: string;
  order: number;
  content?: string;
};

type CourseDetail = {
  id: string;
  title: string;
  description?: string;
  images?: string;
  lessons?: Lesson[];
};

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const details = await getCareerTestById(id);
        setCourse(details);
      } catch (error) {
        console.error('Failed to load course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  const handleJoinCourse = async () => {
    if (!id || isJoining) return;

    try {
      setIsJoining(true);
      await joinCareerPath(id);
      navigate(`/courses/${id}/learn`);
    } catch (error) {
      console.error('Failed to join course:', error);
      alert('Failed to join course. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <MainTemplate>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading course details...</p>
          </div>
        </div>
      </MainTemplate>
    );
  }

  if (!course) {
    return (
      <MainTemplate>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-gray-600">Course not found</p>
            <Button onClick={() => navigate('/courses')} className="mt-4">
              Back to Courses
            </Button>
          </div>
        </div>
      </MainTemplate>
    );
  }

  return (
    <MainTemplate>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {course.images && (
            <div className="w-full h-96 bg-gray-200">
              <img
                src={course.images}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            
            {course.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Course Description
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {isStudent ? (
                <Button
                  onClick={handleJoinCourse}
                  disabled={isJoining}
                  variant="unstyled"
                  className="px-8 py-4 rounded-lg bg-yellow-400 text-gray-900 font-semibold text-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? 'Joining...' : 'Learn now'}
                </Button>
              ) : (
                <Button
                  disabled
                  variant="unstyled"
                  className="px-8 py-4 rounded-lg bg-gray-300 text-gray-500 font-semibold text-lg cursor-not-allowed"
                >
                  Learn now (Students only)
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate('/courses')}
                className="px-8 py-4 text-lg"
              >
                Back to Courses
              </Button>
            </div>
          </div>
        </div>

        {/* Lessons Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Course Curriculum ({course.lessons?.length || 0} Lessons)
          </h2>
          
          {course.lessons && course.lessons.length > 0 ? (
            <div className="space-y-3">
              {course.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-white font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {lesson.title}
                      </h3>
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-gray-400 shrink-0"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No lessons available for this course yet.
            </p>
          )}
        </div>
      </div>
    </MainTemplate>
  );
};

export default CourseDetailPage;
