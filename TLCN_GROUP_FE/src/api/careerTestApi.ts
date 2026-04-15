import { apiClient } from "../services/apiClient";

export type CareerTestQuestion = {
  questionIndex: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export type CareerTest = {
  id: string;
  questions: CareerTestQuestion[];
}

export type TestAnswer = {
  questionIndex: number;
  option: 'A' | 'B' | 'C' | 'D';
}

export type TestResult = {
  bestCareer: string;
  scores: {
    BACKEND: number;
    FRONTEND: number;
    BA: number;
    PM: number;
  };
  message: string;
}

export const careerTestApi = {
  // Lấy bài test
  getTest: async (): Promise<CareerTest> => {
    try {
      const response = await apiClient.get<any>('/career-test');
      return response as CareerTest;
    } catch (error: any) {
      console.error('[careerTestApi] getTest error:', error);
      throw error;
    }
  },

  // Nộp bài test
  submitTest: async (answers: TestAnswer[]): Promise<TestResult> => {
    try {
      const response = await apiClient.post<any>('/career-test/submit', { answers });
      return response as TestResult;
    } catch (error: any) {
      console.error('[careerTestApi] submitTest error:', error);
      throw error;
    }
  },

  // Cập nhật major
  updateMajor: async (major: string): Promise<any> => {
    try {
      const response = await apiClient.put<any>('/career-test/major', { major });
      return response;
    } catch (error: any) {
      console.error('[careerTestApi] updateMajor error:', error);
      throw error;
    }
  }
};