const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");

// ========================================
// ADMIN ANALYTICS CONTROLLER
// GET /api/v1/admin/analytics
// Access: Admin only
// ========================================

const getAdminAnalytics = async (req, res) => {
  try {
    // ========================================
    // 1. DATE CONFIGURATION
    // ========================================

    const currentYear = new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    // ========================================
    // 2. FETCH ANALYTICS DATA CONCURRENTLY
    // ========================================

    const [
      totalUsers,
      activeUsers,
      totalQuizzes,
      publishedQuizzes,
      totalAttempts,
      completedAttempts,
      overviewResult,
      popularQuizzes,
      recentAttempts,
      monthlyAttempts,
    ] = await Promise.all([
      // Total registered users
      User.countDocuments(),

      // Active users
      User.countDocuments({ isActive: true }),

      // Total quizzes
      Quiz.countDocuments(),

      // Published quizzes
      Quiz.countDocuments({ isPublished: true }),

      // Total attempts
      Attempt.countDocuments(),

      // Completed attempts
      Attempt.countDocuments({ status: "completed" }),

      // ========================================
      // OVERALL STATISTICS
      // ========================================

      Attempt.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,

            averagePercentage: {
              $avg: "$percentage",
            },

            passedAttempts: {
              $sum: {
                $cond: [
                  { $eq: ["$isPassed", true] },
                  1,
                  0,
                ],
              },
            },

            completedCount: {
              $sum: 1,
            },
          },
        },
      ]),

      // ========================================
      // QUIZ PERFORMANCE
      // Includes individual quiz pass rate
      // ========================================

      Attempt.aggregate([
        {
          $group: {
            _id: "$quiz",

            // Total attempts, including incomplete attempts
            totalAttempts: {
              $sum: 1,
            },

            // Completed attempts
            completedAttempts: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "completed"] },
                  1,
                  0,
                ],
              },
            },

            // Number of passed completed attempts
            passedAttempts: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "completed"] },
                      { $eq: ["$isPassed", true] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            // Average percentage of completed attempts
            averagePercentage: {
              $avg: {
                $cond: [
                  { $eq: ["$status", "completed"] },
                  "$percentage",
                  null,
                ],
              },
            },
          },
        },

        // Calculate failed attempts and pass rate
        {
          $addFields: {
            failedAttempts: {
              $subtract: [
                "$completedAttempts",
                "$passedAttempts",
              ],
            },

            passRate: {
              $cond: [
                { $gt: ["$completedAttempts", 0] },
                {
                  $multiply: [
                    {
                      $divide: [
                        "$passedAttempts",
                        "$completedAttempts",
                      ],
                    },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },

        // Get associated quiz information
        {
          $lookup: {
            from: Quiz.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "quiz",
          },
        },

        {
          $unwind: "$quiz",
        },

        // Select response fields
        {
          $project: {
            _id: 0,

            quizId: "$quiz._id",
            title: "$quiz.title",
            category: "$quiz.category",
            difficulty: "$quiz.difficulty",
            isPublished: "$quiz.isPublished",

            totalAttempts: 1,
            completedAttempts: 1,
            passedAttempts: 1,
            failedAttempts: 1,

            averagePercentage: {
              $round: [
                {
                  $ifNull: ["$averagePercentage", 0],
                },
                2,
              ],
            },

            passRate: {
              $round: ["$passRate", 2],
            },
          },
        },

        // Most attempted quizzes first
        {
          $sort: {
            totalAttempts: -1,
            title: 1,
          },
        },

        // Return top five quizzes
        {
          $limit: 5,
        },
      ]),

      // ========================================
      // RECENT ACTIVITY
      // ========================================

      Attempt.find()
        .select(
          "user quiz status score totalMarks percentage isPassed startedAt submittedAt createdAt"
        )
        .populate("user", "name email")
        .populate("quiz", "title category difficulty")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // ========================================
      // MONTHLY COMPLETED ATTEMPTS
      // Current calendar year
      // ========================================

      Attempt.aggregate([
        {
          $match: {
            status: "completed",
            submittedAt: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
          },
        },

        {
          $group: {
            _id: {
              $month: "$submittedAt",
            },

            attempts: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },

        {
          $project: {
            _id: 0,
            month: "$_id",
            attempts: 1,
          },
        },
      ]),
    ]);

    // ========================================
    // 3. CALCULATE OVERALL STATISTICS
    // ========================================

    const overview = overviewResult[0] || {
      averagePercentage: 0,
      passedAttempts: 0,
      completedCount: 0,
    };

    const averageScore = Number(
      (overview.averagePercentage || 0).toFixed(2)
    );

    const passRate =
      overview.completedCount > 0
        ? Number(
            (
              (overview.passedAttempts /
                overview.completedCount) *
              100
            ).toFixed(2)
          )
        : 0;

    // ========================================
    // 4. FILL MISSING MONTHS WITH ZERO
    // ========================================

    const monthMap = new Map(
      monthlyAttempts.map((item) => [
        item.month,
        item.attempts,
      ])
    );

    const attemptsByMonth = Array.from(
      { length: 12 },
      (_, index) => ({
        month: index + 1,
        attempts: monthMap.get(index + 1) || 0,
      })
    );

    // ========================================
    // 5. SEND ANALYTICS RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalQuizzes,
          publishedQuizzes,
          totalAttempts,
          completedAttempts,
          averageScore,
          passRate,
        },

        quizPerformance: popularQuizzes,

        recentActivity: recentAttempts,

        monthlyAttempts: attemptsByMonth,
      },
    });
  } catch (error) {
    console.error("Admin Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin analytics.",
    });
  }
};

// ========================================
// EXPORT CONTROLLER
// ========================================

module.exports = {
  getAdminAnalytics,
};