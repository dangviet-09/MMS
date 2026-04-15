const searchService = require('../services/searchService');
const ApiResponse = require('../utils/apiResponse');

class SearchController {

  async search(req, res) {
    try {
      const { q: query, type = 'all', limit = 10 } = req.query;

      if (!query || query.trim().length === 0) {
        return ApiResponse.success(res, 'Empty query', {
          users: [],
          companies: [],
          courses: [],
          blogs: [],
          total: 0
        });
      }

      const limitNum = Math.min(parseInt(limit) || 10, 50); // Max 50 results

      let results;

      switch (type) {
        case 'users':
          results = {
            users: await searchService.searchUsers(query, limitNum),
            companies: [],
            courses: [],
            blogs: [],
            total: 0
          };
          results.total = results.users.length;
          break;

        case 'companies':
          results = {
            users: [],
            companies: await searchService.searchCompanies(query, limitNum),
            courses: [],
            blogs: [],
            total: 0
          };
          results.total = results.companies.length;
          break;

        case 'courses':
          results = {
            users: [],
            companies: [],
            courses: await searchService.searchCourses(query, limitNum),
            blogs: [],
            total: 0
          };
          results.total = results.courses.length;
          break;

        case 'blogs':
          results = {
            users: [],
            companies: [],
            courses: [],
            blogs: await searchService.searchBlogs(query, limitNum),
            total: 0
          };
          results.total = results.blogs.length;
          break;

        case 'all':
        default:
          results = await searchService.searchAll(query, limitNum);
          break;
      }

      return ApiResponse.success(res, 'Search successful', results);
    } catch (error) {
      console.error('Search error:', error);
      return ApiResponse.error(res, error.message || 'Search failed', 500);
    }
  }


  async searchUsers(req, res) {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || query.trim().length === 0) {
        return ApiResponse.success(res, 'Empty query', []);
      }

      const users = await searchService.searchUsers(query, Math.min(parseInt(limit) || 10, 50));

      return ApiResponse.success(res, 'Search users successful', users);
    } catch (error) {
      console.error('Search users error:', error);
      return ApiResponse.error(res, error.message || 'Search users failed', 500);
    }
  }


  async searchCompanies(req, res) {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || query.trim().length === 0) {
        return ApiResponse.success(res, 'Empty query', []);
      }

      const companies = await searchService.searchCompanies(query, Math.min(parseInt(limit) || 10, 50));

      return ApiResponse.success(res, 'Search companies successful', companies);
    } catch (error) {
      console.error('Search companies error:', error);
      return ApiResponse.error(res, error.message || 'Search companies failed', 500);
    }
  }


  async searchCourses(req, res) {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || query.trim().length === 0) {
        return ApiResponse.success(res, 'Empty query', []);
      }

      const courses = await searchService.searchCourses(query, Math.min(parseInt(limit) || 10, 50));

      return ApiResponse.success(res, 'Search courses successful', courses);
    } catch (error) {
      console.error('Search courses error:', error);
      return ApiResponse.error(res, error.message || 'Search courses failed', 500);
    }
  }

  async searchBlogs(req, res) {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || query.trim().length === 0) {
        return ApiResponse.success(res, 'Empty query', []);
      }

      const blogs = await searchService.searchBlogs(query, Math.min(parseInt(limit) || 10, 50));

      return ApiResponse.success(res, 'Search blogs successful', blogs);
    } catch (error) {
      console.error('Search blogs error:', error);
      return ApiResponse.error(res, error.message || 'Search blogs failed', 500);
    }
  }
}

module.exports = new SearchController();
