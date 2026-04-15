const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');
const checkEmailMiddleware = require('../middlewares/checkEmailMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');


// CRUD routes
router.post('/',checkEmailMiddleware, UserController.create);
// áp dụng xác thực cho route phía dưới.
router.use(AuthMiddleware.verifyToken); 

router.put('/:id', UserController.update);
router.put('/:id/avatar', uploadMiddleware.uploadSingle('avatar'), UserController.updateAvatar);
router.put('/:id/role', UserController.updateRole);

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);

// áp dụng phân quyền cho route bên dưới.
router.use(RoleMiddleware.checkRole(["ADMIN"]));
router.delete('/:id', UserController.delete);

module.exports = router;
