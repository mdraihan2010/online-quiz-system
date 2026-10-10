const express = require("express");

const router = express.Router();

const {
  getAdminAnalytics,
} = require("../controllers/adminAnalyticsController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ========================================
// ADMIN ANALYTICS ROUTE
// GET /api/v1/admin/analytics
// Access: Admin only
// ========================================

router.get(
  "/",
  protect,
  authorize("admin"),
  getAdminAnalytics
);

module.exports = router;