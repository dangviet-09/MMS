const { Op } = require('sequelize');
const db = require('../models');

class SearchService {

  async searchUsers(query, limit = 10) {
    if (!query || query.trim().length === 0) return [];


    const students = await db.Student.findAll({
      include: [
        {
          model: db.User,
          as: 'user',
          where: {
            [Op.or]: [
              { username: { [Op.like]: `%${query}%` } },
              { fullName: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } }
            ],
            isActive: true,
            role: 'STUDENT'
            // Tạm bỏ verifyStatus để test
          },
          attributes: ['id', 'username', 'fullName', 'email', 'avatar', 'verifyStatus', 'role'],
          required: true
        }
      ],
      limit,
      order: [['createdAt', 'DESC']]
    });

    // Transform to match frontend expectation
    const transformedUsers = students.map(student => ({
      id: student.user.id, // Use user ID, not student ID
      username: student.user.username,
      fullName: student.user.fullName,
      email: student.user.email,
      avatar: student.user.avatar,
      role: student.user.role,
      verifyStatus: student.user.verifyStatus,
      // Extra info from student
      major: student.major,
      school: student.school
    }));

    if (transformedUsers.length > 0) {
      console.log('First transformed result:', {
        id: transformedUsers[0].id,
        fullName: transformedUsers[0].fullName,
        role: transformedUsers[0].role,
        verifyStatus: transformedUsers[0].verifyStatus
      });
    }

    return transformedUsers;
  }

  /**
   * Tìm kiếm companies theo companyName
   */
  async searchCompanies(query, limit = 10) {
    if (!query || query.trim().length === 0) return [];

    const companies = await db.Company.findAll({
      where: {
        [Op.or]: [
          { companyName: { [Op.like]: `%${query}%` } },
          { industry: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatar'],
          where: { isActive: true, role: 'COMPANY' }
        }
      ],
      limit,
      order: [['companyName', 'ASC']]
    });


    // Transform to include user ID for linking
    const transformedCompanies = companies.map(company => ({
      id: company.id,
      companyName: company.companyName,
      industry: company.industry,
      avatar: company.user?.avatar,
      website: company.website,
      // Add user ID for linking to user profile
      userId: company.user?.id
    }));

    return transformedCompanies;
  }

  /**
   * Tìm kiếm blogs theo content/category/author
   */
  async searchBlogs(query, limit = 10) {
    if (!query || query.trim().length === 0) return [];

    const blogs = await db.Blog.findAll({
      where: {
        status: 'published',
        [Op.or]: [
          { content: { [Op.like]: `%${query}%` } },
          { category: { [Op.like]: `%${query}%` } },
          { '$author.username$': { [Op.like]: `%${query}%` } },
          { '$author.fullName$': { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatar'],
          required: false,
          where: { isActive: true }
        }
      ],
      subQuery: false,
      limit,
      order: [['createdAt', 'DESC']]
    });

    return blogs.map((blog) => ({
      id: blog.id,
      content: blog.content,
      category: blog.category,
      createdAt: blog.createdAt,
      author: blog.author
        ? {
          id: blog.author.id,
          username: blog.author.username,
          fullName: blog.author.fullName,
          avatar: blog.author.avatar
        }
        : null
    }));
  }

  /**
   * Tìm kiếm courses (CareerPath) theo title hoặc description
   */
  async searchCourses(query, limit = 10) {
    if (!query || query.trim().length === 0) return [];

    const courses = await db.CareerPath.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { title: { [Op.like]: `%${query}%` } },
              { description: { [Op.like]: `%${query}%` } }
            ]
          },
          { status: 'PUBLISHED' } // Chỉ tìm courses đã publish
        ]
      },
      include: [
        {
          model: db.Company,
          as: 'company',
          attributes: ['id', 'companyName', 'industry'],
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'username', 'fullName']
            }
          ]
        },
        {
          model: db.Lesson,
          as: 'lessons',
          attributes: ['id'],
          required: false
        }
      ],
      limit,
      order: [['createdAt', 'DESC']]
    });

    // Add lesson count
    const coursesWithCount = courses.map(course => {
      const courseData = course.toJSON();
      courseData.lessonCount = courseData.lessons?.length || 0;
      delete courseData.lessons;
      return courseData;
    });

    return coursesWithCount;
  }

  /**
   * Tìm kiếm tất cả (students, companies, courses)
   */
  async searchAll(query, limit = 5) {
    if (!query || query.trim().length === 0) {
      return {
        users: [],
        companies: [],
        courses: [],
        blogs: []
      };
    }

    const [users, companies, courses, blogs] = await Promise.all([
      this.searchUsers(query, limit),
      this.searchCompanies(query, limit),
      this.searchCourses(query, limit),
      this.searchBlogs(query, limit)
    ]);

    return {
      users,
      companies,
      courses,
      blogs,
      total: users.length + companies.length + courses.length + blogs.length
    };
  }
}

module.exports = new SearchService();
