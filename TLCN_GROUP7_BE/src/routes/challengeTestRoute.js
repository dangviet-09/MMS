const express = require('express');
const router = express.Router();
const ChallengeTestController = require('../controllers/challengeTestController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// Public: list and detail
router.get('/', ChallengeTestController.getAll);
router.get('/:id', ChallengeTestController.getById);

// Protected routes: require login
router.use(AuthMiddleware.verifyToken);
// Only COMPANY & ADMIN can manage challenge tests
router.use(RoleMiddleware.checkRole(['COMPANY', 'ADMIN']));

router.post('/', uploadMiddleware.uploadFields, uploadMiddleware.validateMagicBytes, ChallengeTestController.create);
router.put('/:id', uploadMiddleware.uploadFields, uploadMiddleware.validateMagicBytes, ChallengeTestController.update);
router.delete('/:id', ChallengeTestController.delete);

module.exports = router;
