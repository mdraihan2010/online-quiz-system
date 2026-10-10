const express = require("express");
const router = express.Router();

const {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ========================================
// QUESTION ROUTES
// ========================================

// Get all questions
router.get("/", protect, getAllQuestions);

// Get a single question
router.get("/:id", protect, getQuestionById);

// Create a question (Admin only)
router.post(
  "/",
  protect,
  authorize("admin"),
  createQuestion
);

// Update a question (Admin only)
router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateQuestion
);

// Delete a question (Admin only)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteQuestion
);

module.exports = router;