const express = require("express");
const router = express.Router();
const LessonController = require("../controllers/lessonController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const RoleMiddleware = require("../middlewares/RoleMiddleware");

// Public
router.get("/:id", LessonController.getById); // chi tiết Lesson kèm mini test

// Protected routes
router.use(AuthMiddleware.verifyToken);
router.use(RoleMiddleware.checkRole(["COMPANY", "ADMIN"]));

router.put("/:id", LessonController.update);
router.delete("/:id", LessonController.delete);

module.exports = router;
