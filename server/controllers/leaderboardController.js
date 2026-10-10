const Attempt = require("../models/Attempt");
const User = require("../models/User");
const Quiz = require("../models/Quiz");

// ========================================
// GET LEADERBOARD
// GET /api/v1/leaderboard
// ========================================

const getLeaderboard = async (req, res) => {
  try {
    const {
      period = "all",
      category = "all",
    } = req.query;

    // ========================================
    // VALIDATE PERIOD
    // ========================================

    const allowedPeriods = ["all", "month", "week"];

    if (!allowedPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use all, month, or week.",
      });
    }

    // ========================================
    // VALIDATE CATEGORY
    // ========================================

    if (
      typeof category !== "string" ||
      category.trim().length === 0 ||
      category.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    const normalizedCategory = category.trim();

    // ========================================
    // DATE FILTER
    // ========================================

    const now = new Date();

    let startDate = null;

    if (period === "month") {
      // First day of the current calendar month
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    } else if (period === "week") {
      // Rolling seven-day period
      startDate = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      );
    }

    // ========================================
    // MATCH COMPLETED ATTEMPTS
    // ========================================

    const matchConditions = {
      status: "completed",
      submittedAt: {
        $ne: null,
        $lte: now,
      },
    };

    if (startDate) {
      matchConditions.submittedAt.$gte = startDate;
    }

    // ========================================
    // AGGREGATION PIPELINE
    // ========================================

    const pipeline = [
      {
        $match: matchConditions,
      },

      // Join quiz information
      {
        $lookup: {
          from: Quiz.collection.name,
          localField: "quiz",
          foreignField: "_id",
          as: "quizInfo",
        },
      },

      // Remove attempts whose quiz no longer exists
      {
        $unwind: "$quizInfo",
      },
    ];

    // ========================================
    // CATEGORY FILTER
    // ========================================

    if (normalizedCategory.toLowerCase() !== "all") {
      // Escape regular-expression special characters
      const escapedCategory = normalizedCategory.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      pipeline.push({
        $match: {
          "quizInfo.category": {
            $regex: `^${escapedCategory}$`,
            $options: "i",
          },
        },
      });
    }

    // ========================================
    // GROUP ATTEMPTS BY USER
    // ========================================

    pipeline.push(
      {
        $group: {
          _id: "$user",

          // Number of completed attempts
          completedQuizzes: {
            $sum: 1,
          },

          // Sum of marks earned
          totalPoints: {
            $sum: {
              $ifNull: ["$score", 0],
            },
          },

          // Sum of attempt percentages
          totalPercentage: {
            $sum: {
              $ifNull: ["$percentage", 0],
            },
          },

          // Number of passed attempts
          passedQuizzes: {
            $sum: {
              $cond: [
                {
                  $eq: ["$isPassed", true],
                },
                1,
                0,
              ],
            },
          },

          // Most recent completed attempt
          lastAttemptAt: {
            $max: "$submittedAt",
          },
        },
      },

      // ========================================
      // CALCULATE AVERAGE PERCENTAGE
      // ========================================

      {
        $addFields: {
          averagePercentage: {
            $cond: [
              {
                $gt: ["$completedQuizzes", 0],
              },
              {
                $divide: [
                  "$totalPercentage",
                  "$completedQuizzes",
                ],
              },
              0,
            ],
          },
        },
      },

      // ========================================
      // JOIN USER INFORMATION
      // ========================================

      {
        $lookup: {
          from: User.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },

      {
        $unwind: "$userInfo",
      },

      // ========================================
      // EXCLUDE ADMINS AND INACTIVE USERS
      // ========================================

      {
        $match: {
          "userInfo.isActive": {
            $ne: false,
          },

          "userInfo.role": {
            $ne: "admin",
          },
        },
      },

      // ========================================
      // SORT LEADERBOARD
      // ========================================

      {
        $sort: {
          // Priority 1: Higher total points
          totalPoints: -1,

          // Priority 2: Higher average percentage
          averagePercentage: -1,

          // Priority 3: More completed attempts
          completedQuizzes: -1,

          // Priority 4: Earlier last completed attempt
          lastAttemptAt: 1,

          // Priority 5: Stable ordering by user ID
          _id: 1,
        },
      }
    );

    // ========================================
    // FETCH LEADERBOARD DATA
    // ========================================

    const results = await Attempt.aggregate(pipeline);

    // ========================================
    // IDENTIFY CURRENT USER
    // ========================================

    const currentUserId = req.user?._id
      ? req.user._id.toString()
      : req.user?.id
        ? req.user.id.toString()
        : null;

    // ========================================
    // FORMAT RESULTS AND ASSIGN RANKS
    // ========================================

    const leaderboard = results.map((item, index) => {
      const name = item.userInfo.name || "Unknown User";

      // Display username generated from the user's name.
      // This is not the user's actual account username.
      const username =
        "@" +
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");

      return {
        rank: index + 1,

        userId: item._id.toString(),

        name,

        username: username === "@" ? "@user" : username,

        completedQuizzes: item.completedQuizzes,

        points: item.totalPoints,

        averagePercentage: Number(
          item.averagePercentage.toFixed(2)
        ),

        passedQuizzes: item.passedQuizzes,

        lastAttemptAt: item.lastAttemptAt,

        isCurrentUser:
          currentUserId !== null &&
          item._id.toString() === currentUserId,
      };
    });

    // ========================================
    // CURRENT USER STATISTICS
    // ========================================

    const currentUserEntry = leaderboard.find(
      (item) => item.isCurrentUser
    );

    const totalParticipants = leaderboard.length;

    const currentUserStats = currentUserEntry
      ? {
          rank: currentUserEntry.rank,

          points: currentUserEntry.points,

          completedQuizzes:
            currentUserEntry.completedQuizzes,

          averagePercentage:
            currentUserEntry.averagePercentage,

          passedQuizzes: currentUserEntry.passedQuizzes,

          totalParticipants,
        }
      : {
          rank: null,
          points: 0,
          completedQuizzes: 0,
          averagePercentage: 0,
          passedQuizzes: 0,
          totalParticipants,
        };

    // ========================================
    // RESPONSE STATISTICS
    // ========================================

    const totalCompletedAttempts = results.reduce(
      (total, item) => total + item.completedQuizzes,
      0
    );

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      message: "Leaderboard retrieved successfully.",

      filters: {
        period,
        category: normalizedCategory,
      },

      statistics: {
        totalParticipants,
        totalCompletedAttempts,
      },

      currentUser: currentUserStats,

      leaderboard,
    });
  } catch (error) {
    console.error("Get Leaderboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve leaderboard.",
    });
  }
};

// ========================================
// EXPORT CONTROLLER
// ========================================

module.exports = {
  getLeaderboard,
};