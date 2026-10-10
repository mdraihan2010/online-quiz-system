const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();

// ========================================
// RATE LIMITERS
// ========================================

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many registration attempts. Please try again after 15 minutes.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many login attempts. Please try again after 15 minutes.",
  },
});

// ========================================
// REGISTER
// POST /api/v1/auth/register
// ========================================

router.post("/register", registerLimiter, registerUser);

// ========================================
// LOGIN
// POST /api/v1/auth/login
// ========================================

router.post("/login", loginLimiter, loginUser);

module.exports = router;