const db = require("../models");
const TestService = require("./testService");

class LessonService {

  async createLesson(careerPathId, data) {
    if (!data.title) throw new Error("Lesson cần có tiêu đề");

    return await db.Lesson.create({
      title: data.title,
      content: data.content || null,
      order: data.order || 0,
      careerPathId
    });
  }

  async updateLesson(lessonId, data) {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) throw new Error("Lesson không tồn tại");

    await lesson.update({
      title: data.title ?? lesson.title,
      content: data.content ?? lesson.content,
      order: data.order ?? lesson.order
    });

    return lesson;
  }

  async deleteLesson(lessonId) {
    const lesson = await db.Lesson.findByPk(lessonId);
    if (!lesson) throw new Error("Lesson không tồn tại");

    await db.Lesson.destroy({ where: { id: lessonId } });
    return true;
  }

  async getAllLessons(careerPathId) {
    const lessons = await db.Lesson.findAll({
      where: { careerPathId },
      order: [["order", "ASC"]]
    });

    // Thêm miniTests cho mỗi lesson
    for (let lesson of lessons) {
      lesson.tests = await TestService.getTestsByLesson(lesson.id);
    }

    return lessons; // trả instance, có thêm field tests
  }

  async getLessonById(lessonId) {
    if (!lessonId) {
      throw new Error("Lesson ID không hợp lệ");
    }
    
    const lesson = await db.Lesson.findByPk(lessonId);
    
    if (!lesson) {

      throw new Error(`Lesson không tồn tại với ID: ${lessonId}`);
    }

    lesson.tests = await TestService.getTestsByLesson(lessonId);

    return lesson; // trả instance, có thêm field tests
  }
}

module.exports = new LessonService();
