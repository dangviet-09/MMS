import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainTemplate from '../../templates/MainTemplate/MainTemplate';
import SidebarLessons from './SidebarLessons';
import CodeEditor from './CodeEditor';
import LessonViewer from './LessonViewer';
import TestViewer from './TestViewer';
import { getCareerTestById } from '../../../api/careerPathApi';
import { getLessonById } from '../../../api/lessonApi';
import { Lesson, Test } from '../../../types/types';

type ViewMode = 'lesson' | 'test';

const CourseLearnPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [viewMode, setViewMode] = useState<ViewMode>('lesson');
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [lessonTests, setLessonTests] = useState<Test[]>([]);
    const [finalTests, setFinalTests] = useState<Test[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await getCareerTestById(id);
                const courseData = (response as any).data || response;

                // Extract lessons from course data
                if (courseData.lessons && Array.isArray(courseData.lessons)) {
                    setLessons(courseData.lessons);
                    // Set first lesson as selected by default
                    if (courseData.lessons.length > 0) {
                        setSelectedItem(courseData.lessons[0].id);
                        setViewMode('lesson');
                    }
                }

                // Extract final test - backend returns single finalTest object or null
                if (courseData.finalTest) {
                    setFinalTests([courseData.finalTest]);
                } else {
                    setFinalTests([]);
                }
            } catch (error) {
                console.error('Failed to fetch course data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id]);

    // Load lesson details when a lesson is selected
    useEffect(() => {
        const loadLessonDetails = async () => {
            if (viewMode === 'lesson' && selectedItem) {
                try {
                    const response = await getLessonById(selectedItem) as any;
                    const lessonData = response.data || response;
                    setCurrentLesson(lessonData);
                    
                    // Extract mini tests for this lesson
                    if (lessonData.tests && Array.isArray(lessonData.tests)) {
                        const miniTests = lessonData.tests.filter((t: Test) => t.type === 'MINI');
                        setLessonTests(miniTests);
                    } else {
                        setLessonTests([]);
                    }
                } catch (error) {
                    console.error('Failed to load lesson details:', error);
                }
            }
        };

        loadLessonDetails();
    }, [selectedItem, viewMode]);

    const handleSelectLesson = (lessonId: string) => {
        setSelectedItem(lessonId);
        setViewMode('lesson');
    };

    const handleSelectTest = (testId: string) => {
        setSelectedItem(testId);
        setViewMode('test');
    };

    if (loading) {
        return (
            <MainTemplate>
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </MainTemplate>
        );
    }

    return (
        <MainTemplate>
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-[25%] border-r border-gray-200 bg-white">
                    <SidebarLessons
                        courseId={id || ''}
                        lessons={lessons}
                        lessonTests={lessonTests}
                        finalTests={finalTests}
                        selectedItem={selectedItem}
                        viewMode={viewMode}
                        onSelectLesson={handleSelectLesson}
                        onSelectTest={handleSelectTest}
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex">
                    {/* Left: Lesson/Test Content Viewer */}
                    <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
                        {viewMode === 'lesson' && currentLesson ? (
                            <LessonViewer 
                                lesson={currentLesson}
                                lessonTests={lessonTests}
                                onSelectTest={handleSelectTest}
                            />
                        ) : viewMode === 'test' && selectedItem ? (
                            <TestViewer testId={selectedItem} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Select a lesson or test to view content</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Code Editor */}
                    <div className="w-1/2 bg-gray-50">
                        {viewMode === 'test' && selectedItem ? (
                            <CodeEditor selectedItem={selectedItem} itemType="test" />
                        ) : viewMode === 'lesson' && selectedItem ? (
                            <CodeEditor selectedItem={selectedItem} itemType="lesson" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Select a test to start coding</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainTemplate>
    );
};

export default CourseLearnPage;
