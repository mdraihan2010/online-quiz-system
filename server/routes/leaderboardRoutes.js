const express = require("express");
const router = express.Router();

const {
  getLeaderboard,
} = require("../controllers/leaderboardController");

const { protect } = require("../middleware/authMiddleware");

// ========================================
// LEADERBOARD ROUTES
// ========================================

// GET /api/v1/leaderboard
// Retrieve the leaderboard for the authenticated user.
router.get("/", protect, getLeaderboard);

module.exports = router;