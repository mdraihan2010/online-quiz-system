const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// AUTHENTICATION MIDDLEWARE
// Verify JWT and authenticate the current user
// ========================================

const protect = async (req, res, next) => {
  try {
    // 1. Check JWT secret configuration
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error(
        "Authentication Error: JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
    }

    // 2. Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // 3. Validate Bearer token format
    const parts = authHeader.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer Token.",
      });
    }

    const token = parts[1];

    // 4. Verify JWT signature and expiration
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    // 5. Validate decoded user information
    if (
      !decoded ||
      typeof decoded.id !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(decoded.id) ||
      !["admin", "user"].includes(decoded.role)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // 6. Fetch the user's CURRENT account from MongoDB
    const user = await User.findById(decoded.id)
      .select("_id name email role isActive")
      .lean();

    // Reject tokens belonging to deleted accounts
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please log in again.",
      });
    }

    // 7. Check current account status
    // This also blocks previously issued tokens after deactivation.
    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact an administrator.",
      });
    }

    // 8. Ensure the role in the token matches the current database role.
    // This prevents a user's old token from retaining outdated privileges.
    if (decoded.role !== user.role) {
      return res.status(401).json({
        success: false,
        message: "Your account permissions have changed. Please log in again.",
      });
    }

    // 9. Attach current database user information to the request
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    // 10. Continue to the next middleware/controller
    return next();
  } catch (error) {
    // Handle expired token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    // Handle invalid JWT
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    // Log unexpected errors without exposing sensitive information
    console.error(
      "Authentication Middleware Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Authentication failed due to a server error.",
    });
  }
};

// ========================================
// ROLE-BASED AUTHORIZATION MIDDLEWARE
// ========================================

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Authentication must happen first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // Validate authorization configuration
    if (
      allowedRoles.length === 0 ||
      !allowedRoles.every((role) =>
        ["admin", "user"].includes(role)
      )
    ) {
      console.error(
        "Authorization Configuration Error: Invalid or missing roles."
      );

      return res.status(500).json({
        success: false,
        message: "Authorization is not configured correctly.",
      });
    }

    // Check the user's CURRENT role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  };
};

// ========================================
// EXPORT MIDDLEWARE
// ========================================

module.exports = {
  protect,
  authorize,
};