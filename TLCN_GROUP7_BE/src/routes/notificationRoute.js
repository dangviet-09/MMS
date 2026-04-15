const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

// Apply auth to all notification routes
router.use(AuthMiddleware.verifyToken);

router.get('/', NotificationController.list);
router.get('/unread-count', NotificationController.getUnreadCount);
router.post('/mark-read', NotificationController.markRead);

module.exports = router;
