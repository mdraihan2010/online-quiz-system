const express = require("express");

const router = express.Router();

// ========================================
// IMPORT CONTROLLER FUNCTIONS
// ========================================

const {
  getAdminUsers,
  updateUserStatus,
} = require("../controllers/adminUserController");

// ========================================
// IMPORT AUTHENTICATION MIDDLEWARE
// ========================================

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ========================================
// VALIDATE IMPORTED FUNCTIONS
// ========================================

const requiredHandlers = {
  getAdminUsers,
  updateUserStatus,
  protect,
  authorize,
};

for (const [name, handler] of Object.entries(requiredHandlers)) {
  if (typeof handler !== "function") {
    throw new TypeError(
      `adminUserRoutes.js: "${name}" must be a function. ` +
      `Check its export in the corresponding controller or middleware file.`
    );
  }
}

// ========================================
// ADMIN USER MANAGEMENT ROUTES
// Base URL: /api/v1/admin/users
// Access: Admin only
// ========================================

// GET /api/v1/admin/users
// Get users with search, filters and pagination

router.get(
  "/",
  protect,
  authorize("admin"),
  getAdminUsers
);

// PATCH /api/v1/admin/users/:userId/status
// Activate or deactivate a user

router.patch(
  "/:userId/status",
  protect,
  authorize("admin"),
  updateUserStatus
);

// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;