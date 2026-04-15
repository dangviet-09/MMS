const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');

router.use(AuthMiddleware.verifyToken);
router.use(RoleMiddleware.checkRole(["COMPANY"]));

router.get('/profile', CompanyController.getProfile);
router.put('/profile', CompanyController.updateProfile);
router.get('/students', CompanyController.getStudentsInCompanyCourses);

module.exports = router;