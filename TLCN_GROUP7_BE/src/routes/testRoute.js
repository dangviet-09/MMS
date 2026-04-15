const express = require("express");
const router = express.Router();
const TestController = require("../controllers/testController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const RoleMiddleware = require("../middlewares/RoleMiddleware");

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// Student routes - must come before /:id to avoid matching
router.post("/:id/submit", RoleMiddleware.checkRole("STUDENT"), TestController.submitTest);

// Public authenticated routes
router.get("/:id", TestController.getById);

// Company/Admin routes
router.use(RoleMiddleware.checkRole(["COMPANY", "ADMIN"]));
router.post("/", TestController.create);    
router.put("/:id", TestController.update);
router.delete("/:id", TestController.delete);
router.get("/:id/results", TestController.getTestResults);

module.exports = router;
