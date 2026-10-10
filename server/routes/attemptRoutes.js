const express = require("express");

const router = express.Router();

const {
  startQuiz,
  getAttempt,
  saveAnswers,
  submitAttempt,
  getAttemptHistory,
  reviewAttempt,
} = require("../controllers/attemptController");

const { protect } = require("../middleware/authMiddleware");

// ========================================
// START QUIZ
// POST /api/v1/attempts/start/:quizId
// ========================================

router.post("/start/:quizId", protect, startQuiz);

// ========================================
// GET USER QUIZ HISTORY
// GET /api/v1/attempts/history
// ========================================

// IMPORTANT: Keep this route before /:attemptId
router.get("/history", protect, getAttemptHistory);

// ========================================
// REVIEW COMPLETED QUIZ ANSWERS
// GET /api/v1/attempts/:attemptId/review
// ========================================

router.get("/:attemptId/review", protect, reviewAttempt);

// ========================================
// GET ATTEMPT QUESTIONS OR RESULT
// GET /api/v1/attempts/:attemptId
// ========================================

router.get("/:attemptId", protect, getAttempt);

// ========================================
// SAVE ANSWERS
// PATCH /api/v1/attempts/:attemptId/answers
// ========================================

router.patch("/:attemptId/answers", protect, saveAnswers);

// ========================================
// SUBMIT QUIZ
// POST /api/v1/attempts/:attemptId/submit
// ========================================

router.post("/:attemptId/submit", protect, submitAttempt);

module.exports = router;