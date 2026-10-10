const express = require("express");

const router = express.Router();

const {
  getUserDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ========================================
// USER DASHBOARD
// ========================================

// Get dashboard statistics for authenticated users
router.get(
  "/",
  protect,
  authorize("user", "admin"),
  getUserDashboard
);

module.exports = router;