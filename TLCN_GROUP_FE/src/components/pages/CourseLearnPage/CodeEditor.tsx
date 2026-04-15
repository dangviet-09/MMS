import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { getLessonById, updateLesson } from '../../../api/lessonApi';
import { getTestById } from '../../../api/testApi';
import { submitTest } from '../../../api/studentApi';
import { Button } from '../../atoms/Button/Button';

type CodeEditorProps = {
    selectedItem: string;
    itemType: 'lesson' | 'test';
};

const CodeEditor: React.FC<CodeEditorProps> = ({ selectedItem, itemType }) => {
    const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, World!");');
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemData, setItemData] = useState<any>(null);

    useEffect(() => {
        const fetchItemData = async () => {
            if (!selectedItem) return;

            try {
                if (itemType === 'lesson') {
                    const lessonResponse = await getLessonById(selectedItem);
                    const lessonData = (lessonResponse as any).data || lessonResponse;
                    setItemData(lessonData);
                    setCode(lessonData.content || '// Write your code here\nconsole.log("Hello, World!");');
                } else if (itemType === 'test') {
                    const testResponse = await getTestById(selectedItem);
                    const testData = (testResponse as any).data || testResponse;
                    setItemData(testData);
                    setCode('// Write your code here\n');
                }
            } catch (error) {
                console.error('Error fetching item:', error);
            }
        };

        fetchItemData();
    }, [selectedItem, itemType]);

    const handleRunCode = () => {
        setIsRunning(true);
        setOutput('Running code...\n');

        setTimeout(() => {
            try {
                // Create a mock console.log capture
                const logs: string[] = [];
                const mockConsole = {
                    log: (...args: any[]) => {
                        logs.push(args.map(arg => String(arg)).join(' '));
                    }
                };

                // Execute code in isolated context
                const func = new Function('console', code);
                func(mockConsole);

                setOutput(logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)');
            } catch (error) {
                setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setIsRunning(false);
            }
        }, 500);
    };

    const handleSubmit = async () => {
        if (!selectedItem || !itemType) {
            alert('No item selected');
            return;
        }

        try {
            setIsSubmitting(true);

            if (itemType === 'lesson') {
                // PUT /lessons/:id
                await updateLesson(selectedItem, {
                    content: code,
                    title: itemData?.title,
                    order: itemData?.order
                });
                setOutput('✓ Lesson submitted successfully!');
            } else if (itemType === 'test') {
                // Student submits test answer - AI will grade it
                const answers = [{
                    questionId: '1', // Default for single question tests
                    answer: code
                }];

                const result = await submitTest(selectedItem, answers) as any;
                const resultData = result.data || result;

                setOutput(
                    `✓ Test submitted successfully!\n\n` +
                    `Score: ${resultData.score || 0}/100\n` +
                    `Status: ${resultData.passed ? 'PASSED ✓' : 'FAILED ✗'}\n\n` +
                    `Feedback: ${resultData.feedback || 'No feedback'}\n\n` +
                    `${resultData.suggestions ? `Suggestions: ${resultData.suggestions}` : ''}`
                );
            }
        } catch (error) {
            console.error('Failed to submit:', error);
            setOutput(`✗ Submit failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setCode('// Write your code here\nconsole.log("Hello, World!");');
        setOutput('');
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 bg-gray-900">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        automaticLayout: true,
                    }}
                />
            </div>

            {/* Output Panel */}
            {output && (
                <div className="border-t border-gray-200 bg-gray-800 px-6 py-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-300">Output:</h3>
                    <pre className="rounded-lg bg-gray-900 p-4 text-sm text-green-400 font-mono whitespace-pre-wrap">
                        {output}
                    </pre>
                </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        variant="unstyled"
                        className="flex items-center justify-center gap-2 rounded-lg bg-gray-700 px-6 py-3 min-w-[140px] h-[44px] text-white font-medium transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRunning ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Running...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                Run Code
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        variant="unstyled"
                        className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-6 py-3 min-w-[140px] h-[44px] text-white font-medium transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Submit
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleReset}
                        variant="unstyled"
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 min-w-[140px] h-[44px] text-gray-700 font-medium transition-all hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
