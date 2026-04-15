const express = require("express");
const router = express.Router();
const studentController = require('../controllers/studentController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');

// Áp dụng xác thực cho tất cả các route bên dưới
router.use(AuthMiddleware.verifyToken);
router.use(RoleMiddleware.checkRole(["STUDENT"]));
router.post("/join", studentController.joinCareerPath);

// HS nộp bài test
router.post("/submit-test", studentController.submitTest);

// Lấy tiến độ theo CareerPath
router.get("/progress/:careerPathId", studentController.getCareerPathProgress);

// Lấy tất cả khóa học đang tham gia
router.get("/enrolled-courses", studentController.getEnrolledCourses);

// Lấy chi tiết 1 test result
router.get("/test-results/:testResultId", studentController.getTestResultDetail);

router.get("/profile", studentController.getProfile);
router.put("/profile", studentController.updateProfile);

module.exports = router;