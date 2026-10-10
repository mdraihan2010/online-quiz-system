const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

// ========================================
// ROUTE IMPORTS
// ========================================

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

// ========================================
// MIDDLEWARE IMPORTS
// ========================================

const {
  protect,
  authorize,
} = require("./middleware/authMiddleware");

// ========================================
// EXPRESS APP
// ========================================

const app = express();

app.disable("x-powered-by");

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://online-quiz-system-roan-zeta.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as
      // server-to-server requests and command-line tools.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ========================================
// GLOBAL MIDDLEWARE
// ========================================

app.use(express.json({ limit: "1mb" }));

// ========================================
// VALIDATE ROUTE EXPORTS
// ========================================

const routes = [
  { path: "/api/v1/auth", handler: authRoutes },
  { path: "/api/v1/dashboard", handler: dashboardRoutes },
  { path: "/api/v1/quizzes", handler: quizRoutes },
  { path: "/api/v1/questions", handler: questionRoutes },
  { path: "/api/v1/attempts", handler: attemptRoutes },
  { path: "/api/v1/leaderboard", handler: leaderboardRoutes },
  { path: "/api/v1/admin/analytics", handler: adminAnalyticsRoutes },
  { path: "/api/v1/admin/users", handler: adminUserRoutes },
];

for (const route of routes) {
  if (
    typeof route.handler !== "function" ||
    typeof route.handler.use !== "function"
  ) {
    throw new TypeError(
      `Invalid Express Router for "${route.path}". ` +
        "Check the corresponding route file and module.exports."
    );
  }
}

if (typeof protect !== "function") {
  throw new TypeError(
    'Invalid "protect" middleware. Check authMiddleware.js exports.'
  );
}

if (typeof authorize !== "function") {
  throw new TypeError(
    'Invalid "authorize" middleware. Check authMiddleware.js exports.'
  );
}

// ========================================
// API ROUTES
// ========================================

for (const route of routes) {
  app.use(route.path, route.handler);
}

// ========================================
// AUTHENTICATION TEST ROUTE
// GET /api/v1/auth/me
// ========================================

app.get("/api/v1/auth/me", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authentication successful!",
    user: req.user,
  });
});

// ========================================
// ADMIN TEST ROUTE
// GET /api/v1/admin/test
// ========================================

app.get(
  "/api/v1/admin/test",
  protect,
  authorize("admin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome, Admin! You have access to this resource.",
      user: req.user,
    });
  }
);

// ========================================
// ROOT ROUTE
// GET /
// ========================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "QuizMaster API is running!",
  });
});

// ========================================
// HANDLE UNKNOWN ROUTES
// ========================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Malformed JSON
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    Object.prototype.hasOwnProperty.call(error, "body")
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body. Please check your request format.",
    });
  }

  // CORS rejection
  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "This origin is not allowed to access the API.",
    });
  }

  console.error("Server Error:", error);

  const statusCode =
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 600
      ? error.status
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error."
        : "Request could not be processed.",
  });
});

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  try {
    await connectDB();

    const PORT = Number(process.env.PORT) || 5000;

    const server = app.listen(PORT, () => {
      console.log("====================================");
      console.log("QuizMaster API Started Successfully!");
      console.log(`Server running on port ${PORT}`);
      console.log("====================================");
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the other server first.`
        );
      } else {
        console.error("Server startup error:", error);
      }

      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();