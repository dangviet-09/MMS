const db = require("../models");
const { Test, Lesson, CareerPath } = db;

class TestService {

  async create(data) {
    const { title, description, type, content, maxScore, lessonId, careerPathId } = data;

    if (type === "MINI" && !lessonId) throw new Error("Bài test MINI phải thuộc về một Lesson");
    if (type === "FINAL_PATH" && !careerPathId) throw new Error("Bài test FINAL_PATH phải thuộc về một CareerPath");

    if (lessonId) {
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) throw new Error("Lesson không tồn tại");
    }

    if (careerPathId) {
      const careerPath = await CareerPath.findByPk(careerPathId);
      if (!careerPath) throw new Error("CareerPath không tồn tại");
    }

    return await Test.create({
      title,
      description,
      type,
      content,
      maxScore,
      lessonId: lessonId || null,
      careerPathId: careerPathId || null
    });
  }

  async getById(id) {
    const test = await Test.findByPk(id, {
      include: [
        { model: Lesson, as: 'lesson', attributes: ["id", "title"] },
        { model: CareerPath, as: 'careerPath', attributes: ["id", "title"] }
      ]
    });

    if (!test) throw new Error("Không tìm thấy bài test.");
    return test;
  }


  async update(id, data) {
    const test = await Test.findByPk(id);
    if (!test) throw new Error("Bài test không tồn tại");

    const { title, description, type, content, maxScore, lessonId, careerPathId } = data;

    if (type === "MINI" && !lessonId) throw new Error("Bài test MINI phải thuộc về một Lesson");
    if (type === "FINAL_PATH" && !careerPathId) throw new Error("Bài test FINAL_PATH phải thuộc về một CareerPath");

    if (lessonId) {
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) throw new Error("Lesson không tồn tại");
    }

    if (careerPathId) {
      const careerPath = await CareerPath.findByPk(careerPathId);
      if (!careerPath) throw new Error("CareerPath không tồn tại");
    }

    await test.update({
      title,
      description,
      type,
      content,
      maxScore,
      lessonId: lessonId || null,
      careerPathId: careerPathId || null
    });

    return test;
  }

  async delete(id) {
    const test = await Test.findByPk(id);
    if (!test) throw new Error("Bài test không tồn tại");

    await test.destroy();
    return true;
  }

  // ---------------------
  // Helpers
  async getTestsByLesson(lessonId) {
    return await Test.findAll({ where: { lessonId, type: "MINI" } });
  }

  async getFinalTestByCareerPath(careerPathId) {
    return await Test.findOne({ where: { careerPathId, type: "FINAL_PATH" } });
  }

  // ---------------------
  // AI Grading
  async submitAndGrade(userId, testId, answers) {
    const TestGradingService = require('./testGradingService');
    
    // Find student
    const student = await db.Student.findOne({ where: { userId } });
    if (!student) {
      throw new Error('Student not found');
    }

    // Get test
    const test = await Test.findByPk(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    // Grade with AI
    const gradingResult = await TestGradingService.gradeTest(testId, student.id, answers);

    // Determine if passed (e.g., score >= 50% of max)
    const maxScore = test.maxScore || (gradingResult.totalQuestions * 10);
    const passed = gradingResult.score >= (maxScore * 0.5);

    // Save result
    const result = await db.StudentTestResult.create({
      studentId: student.id,
      testId,
      score: gradingResult.score,
      answers,
      feedback: TestGradingService.generateDetailedFeedback(gradingResult),
      aiGrading: gradingResult,
      passed,
      completedAt: new Date()
    });

    return result;
  }

  async getResults(testId) {
    const results = await db.StudentTestResult.findAll({
      where: { testId },
      include: [
        {
          model: db.Student,
          as: 'student',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['fullName', 'email']
            }
          ]
        },
        {
          model: Test,
          as: 'test',
          attributes: ['id', 'title', 'type', 'maxScore']
        }
      ],
      order: [['completedAt', 'DESC']]
    });

    return results;
  }
}

module.exports = new TestService();
