const express = require("express");

const router = express.Router();

const {
  getAllQuizzes,
  getQuizById,
  getQuizCategories,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ========================================
// GET ALL QUIZZES
// GET /api/v1/quizzes
// ========================================

// Authenticated users can access this route.
router.get("/", protect, getAllQuizzes);

// ========================================
// GET QUIZ CATEGORIES
// GET /api/v1/quizzes/categories
// ========================================

// Retrieve all unique quiz categories.
// This route must be placed before /:id.
router.get("/categories", protect, getQuizCategories);

// ========================================
// GET SINGLE QUIZ
// GET /api/v1/quizzes/:id
// ========================================

router.get("/:id", protect, getQuizById);

// ========================================
// CREATE QUIZ
// POST /api/v1/quizzes
// ADMIN ONLY
// ========================================

router.post(
  "/",
  protect,
  authorize("admin"),
  createQuiz
);

// ========================================
// UPDATE QUIZ
// PATCH /api/v1/quizzes/:id
// ADMIN ONLY
// ========================================

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateQuiz
);

// ========================================
// DELETE QUIZ
// DELETE /api/v1/quizzes/:id
// ADMIN ONLY
// ========================================

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteQuiz
);

module.exports = router;