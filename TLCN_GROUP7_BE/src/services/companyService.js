const db = require('../models');

class CompanyService {
  async updateProfile(userId, data) {
    const company = await db.Company.findOne({ where: { userId } });
    if (!company) throw new Error('Company không tồn tại');

    const updateData = {};
    for (const key of ['companyName', 'taxCode', 'industry', 'website', 'description']) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    if (Object.keys(updateData).length > 0) {
      await company.update(updateData);
    }

    return company;
  }

  async getStudentsInCompanyCourses(companyId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // Lấy tất cả các khóa học của company
    const careerPaths = await db.CareerPath.findAll({
      where: { companyId },
      attributes: ['id', 'title']
    });
    
    if (careerPaths.length === 0) {
      return {
        students: [],
        total: 0,
        currentPage: page,
        totalPages: 0
      };
    }
    
    const careerPathIds = careerPaths.map(cp => cp.id);
    
    // Lấy danh sách học sinh đã tham gia các khóa học
    const { count, rows } = await db.StudentProgress.findAndCountAll({
      where: {
        careerPathId: careerPathIds
      },
      include: [
        {
          model: db.Student,
          as: 'student',
          attributes: ['id', 'studentId', 'fullName', 'email', 'major', 'school', 'address'],
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['username', 'avatar', 'createdAt']
            }
          ]
        },
        {
          model: db.CareerPath,
          as: 'careerPath',
          attributes: ['id', 'title', 'description']
        }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
      distinct: true
    });
    
    return {
      students: rows,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    };
  }
}

module.exports = new CompanyService();