const mongoose = require("mongoose");
const User = require("../models/User");
const Attempt = require("../models/Attempt");

// ========================================
// ADMIN USER MANAGEMENT CONTROLLER
// Access: Admin only
// ========================================

// ========================================
// GET /api/v1/admin/users
// Get users with search, filters and pagination
// ========================================

const getAdminUsers = async (req, res) => {
  try {
    // 1. Read query parameters
    const {
      search = "",
      role = "all",
      status = "all",
      page = 1,
      limit = 10,
    } = req.query;

    // 2. Validate pagination
    const currentPage = Math.max(
      1,
      Number.parseInt(page, 10) || 1
    );

    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    // 3. Build MongoDB filter
    const filter = {};

    // Search by name or email
    const searchText = String(search).trim();

    if (searchText) {
      // Escape special regex characters
      const escapedSearch = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    // 4. Filter by role
    const normalizedRole = String(role).toLowerCase();

    if (normalizedRole !== "all") {
      if (!["user", "admin"].includes(normalizedRole)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter.",
        });
      }

      filter.role = normalizedRole;
    }

    // 5. Filter by account status
    const normalizedStatus = String(status).toLowerCase();

    if (normalizedStatus !== "all") {
      if (!["active", "inactive"].includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter.",
        });
      }

      filter.isActive = normalizedStatus === "active";
    }

    // 6. Fetch users and statistics
    const skip = (currentPage - 1) * pageSize;

    const [
      users,
      filteredUsersCount,
      totalUsers,
      activeUsers,
      students,
      administrators,
    ] = await Promise.all([
      User.find(filter)
        .select("name email role isActive createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      User.countDocuments(filter),

      User.countDocuments(),

      User.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        role: "user",
      }),

      User.countDocuments({
        role: "admin",
      }),
    ]);

    // 7. Count completed quiz attempts
    const userIds = users.map((user) => user._id);

    const attemptCounts = userIds.length
      ? await Attempt.aggregate([
          {
            $match: {
              user: {
                $in: userIds,
              },
              status: "completed",
            },
          },
          {
            $group: {
              _id: "$user",
              quizzesCompleted: {
                $sum: 1,
              },
            },
          },
        ])
      : [];

    const attemptCountMap = new Map(
      attemptCounts.map((item) => [
        item._id.toString(),
        item.quizzesCompleted,
      ])
    );

    // 8. Format user data
    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name || "Unknown User",
      email: user.email || "",
      role: user.role,
      status: user.isActive ? "Active" : "Inactive",
      quizzes:
        attemptCountMap.get(user._id.toString()) || 0,
      joined: user.createdAt || null,
    }));

    // 9. Calculate pagination
    const totalPages = Math.ceil(
      filteredUsersCount / pageSize
    );

    // 10. Send response
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      data: {
        users: formattedUsers,

        statistics: {
          totalUsers,
          activeUsers,
          students,
          administrators,
        },

        pagination: {
          currentPage,
          pageSize,
          totalUsers: filteredUsersCount,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      },
    });
  } catch (error) {
    console.error("Admin Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};

// ========================================
// PATCH /api/v1/admin/users/:userId/status
// Activate or deactivate a user
// Access: Admin only
// ========================================

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // 1. Validate user ID
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // 2. Validate request body
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "Please provide isActive as true or false.",
      });
    }

    // 3. Prevent an admin from deactivating their own account
    const currentAdminId = req.user?._id?.toString();

    if (
      currentAdminId &&
      currentAdminId === userId &&
      isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    // 4. Find target user
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // 5. Update account status
    targetUser.isActive = isActive;

    await targetUser.save();

    // 6. Return updated user
    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
      data: {
        user: {
          id: targetUser._id.toString(),
          name: targetUser.name || "Unknown User",
          email: targetUser.email || "",
          role: targetUser.role,
          status: targetUser.isActive ? "Active" : "Inactive",
          joined: targetUser.createdAt || null,
        },
      },
    });
  } catch (error) {
    console.error("Update User Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  getAdminUsers,
  updateUserStatus,
};