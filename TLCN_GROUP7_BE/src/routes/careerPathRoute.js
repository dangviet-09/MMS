const express = require("express");
const router = express.Router();
const CareerPathController = require("../controllers/careerPathController");
const LessonController = require("../controllers/lessonController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const RoleMiddleware = require("../middlewares/RoleMiddleware");
const { uploadFields, validateMagicBytes } = require("../middlewares/uploadMiddleware");

// Public routes
router.get("/", CareerPathController.getAll);

// Protected routes with specific paths (MUST be before /:id)
router.get("/my-courses", AuthMiddleware.verifyToken, RoleMiddleware.checkRole(["COMPANY", "ADMIN"]), CareerPathController.getMyCourses);

// Public route with ID param (AFTER specific paths) - optionalToken để check ownership
router.get("/:id", AuthMiddleware.optionalToken, CareerPathController.getById); // chi tiết CareerPath kèm lessons + final test (public hoặc owner)

// Protected CRUD operations
router.use(AuthMiddleware.verifyToken);
router.use(RoleMiddleware.checkRole(["COMPANY", "ADMIN"]));

router.post("/", uploadFields, validateMagicBytes, CareerPathController.create);

router.put("/:id", CareerPathController.update);
router.patch("/:id/status", CareerPathController.updateStatus);
router.delete("/:id", CareerPathController.delete);

// Create lesson under a career path
router.post("/:careerPathId/lessons", LessonController.create);

module.exports = router;
