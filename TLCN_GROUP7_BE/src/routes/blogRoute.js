const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const { uploadBlogImages, validateMagicBytes } = require("../middlewares/uploadMiddleware");
const RoleMiddleware = require('../middlewares/RoleMiddleware');

router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);

router.use(AuthMiddleware.verifyToken);
router.use(RoleMiddleware.checkRole(["ADMIN", "COMPANY"]));
router.post('/', ...uploadBlogImages, validateMagicBytes, blogController.create); // upload.array('images', 10)
router.put('/:id', ...uploadBlogImages, validateMagicBytes, blogController.update);
router.delete('/:id', blogController.delete);

module.exports = router
