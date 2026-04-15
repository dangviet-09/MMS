// services/careerTestService.js
const db = require('../models');

class CareerTestService {

  async getCareerTest() {
    const test = await db.CareerTest.findOne();

    if (!test) {
      throw new Error('Chưa có bài trắc nghiệm nghề nghiệp nào trong hệ thống');
    }

    return test;
  }

   async evaluateCareerTest(userId, answers) {
    if (!answers || !Array.isArray(answers)) {
      throw new Error('Định dạng đáp án không hợp lệ');
    }

    const scores = {
      BACKEND: 0,
      FRONTEND: 0,
      BA: 0,
      PM: 0
    };

    const mapping = {
      A: 'BACKEND', B: 'FRONTEND', C: 'BA', D: 'PM',
      '0': 'BACKEND', '1': 'FRONTEND', '2': 'BA', '3': 'PM'
    };

    // Duyệt qua từng đáp án để cộng điểm
    for (const ans of answers) {
      const career = mapping[ans.option];
      if (career) {
        scores[career]++;
      }
    }

    const bestCareer = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    const student = await db.Student.findOne({ where: { userId } });
    if (!student) throw new Error('Không tìm thấy sinh viên');

    student.careerInterest = bestCareer;
    student.major = bestCareer;
    await student.save();

    const result = {
      bestCareer,
      scores,
      message: this.getCareerDescription(bestCareer)
    };
    return result;
  }

  getCareerDescription(career) {
    const desc = {
      BACKEND: 'Bạn có tư duy logic, thích lập trình và giải quyết vấn đề kỹ thuật.',
      FRONTEND: 'Bạn có óc sáng tạo và khả năng thẩm mỹ tốt, phù hợp với thiết kế giao diện hoặc UI/UX.',
      BA: 'Bạn giao tiếp tốt, hiểu con người, phù hợp với lĩnh vực kinh doanh, marketing hoặc BA.',
      PM: 'Bạn có kỹ năng quản lý và phân tích, phù hợp với vai trò lãnh đạo hoặc quản trị dự án.'
    };
    return desc[career] || 'Không xác định';
  }

   async updatemajor(studentId, major) {
        const student = await db.Student.findOne({ where: { userId: studentId } });
        if (!student) throw new Error('Student not found');
        student.major = major;
        //student.careerInterest = major;
        await student.save();
        return student;
    }   

}

module.exports = new CareerTestService();
