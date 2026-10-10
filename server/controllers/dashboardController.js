const mongoose = require("mongoose");

const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");

// ========================================
// GET USER DASHBOARD STATISTICS
// Route: GET /api/v1/dashboard
// Access: Authenticated users
// ========================================

const getUserDashboard = async (req, res) => {
  try {
    // 1. Count all published quizzes
    const availableQuizzes = await Quiz.countDocuments({
      isPublished: true,
    });

    // 2. Find the logged-in user's latest completed attempts
    const completedAttempts = await Attempt.find({
      user: req.user.id,
      status: "completed",
    })
      .populate("quiz", "title category difficulty")
      .sort({ submittedAt: -1 })
      .limit(5)
      .lean();

    // 3. Count completed attempts
    const completedQuizzes = await Attempt.countDocuments({
      user: req.user.id,
      status: "completed",
    });

    // 4. Calculate average percentage
    const averageResult = await Attempt.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          averagePercentage: {
            $avg: "$percentage",
          },
        },
      },
    ]);

    const averageScore =
      averageResult.length > 0
        ? Number(averageResult[0].averagePercentage.toFixed(2))
        : 0;

    // 5. Return dashboard statistics
    return res.status(200).json({
      success: true,
      data: {
        availableQuizzes,
        completedQuizzes,
        averageScore,
        recentAttempts: completedAttempts,
      },
    });
  } catch (error) {
    console.error("User Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data.",
    });
  }
};

// ========================================
// EXPORT CONTROLLER
// ========================================

module.exports = {
  getUserDashboard,
};