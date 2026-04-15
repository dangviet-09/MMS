const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const LikeController = require('../controllers/likeController');

router.use(AuthMiddleware.verifyToken);

router.post('/:blogId', LikeController.likeBlog);
router.get('/:blogId', LikeController.getBlogLikes);

module.exports = router;