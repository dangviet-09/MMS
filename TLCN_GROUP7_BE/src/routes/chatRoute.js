const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');

// All routes require STUDENT role
router.use(AuthMiddleware.verifyToken);
router.use(RoleMiddleware.checkRole(["STUDENT"]));

router.get('/session', ChatController.getOrCreateSession);

router.post('/message', ChatController.sendMessage);

router.delete('/history', ChatController.clearHistory);

router.get('/assessment', ChatController.getAssessment);

module.exports = router;
