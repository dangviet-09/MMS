const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const FollowController = require('../controllers/followController');

router.use(AuthMiddleware.verifyToken);

// Toggle follow đối với user đích
router.post('/:targetUserId', FollowController.toggleFollow);

// Lấy thông tin follow (viewer có thể là chính người gọi)
router.get('/:targetUserId', FollowController.getFollowInfo);

// Danh sách followers của user đích
router.get('/:targetUserId/followers', FollowController.getFollowers);

// Danh sách following của user đích
router.get('/:targetUserId/following', FollowController.getFollowing);

module.exports = router;