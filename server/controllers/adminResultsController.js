const Attempt = require("../models/Attempt");

// GET /api/v1/admin/results
const getAdminResults = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({
      status: "completed",
    })
      .populate("user", "name email")
      .populate("quiz", "title")
      .sort({ submittedAt: -1 })
      .lean();

    const results = attempts.map((attempt) => ({
      id: attempt._id,
      user: attempt.user?.name || "Deleted User",
      email: attempt.user?.email || "N/A",
      quiz:
        attempt.quizSnapshot?.title ||
        attempt.quiz?.title ||
        "Deleted Quiz",
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      date: attempt.submittedAt,
      status: attempt.isPassed ? "Passed" : "Failed",
    }));

    const totalResults = results.length;
    const passed = results.filter(
      (result) => result.status === "Passed"
    ).length;
    const failed = totalResults - passed;

    const averageScore =
      totalResults > 0
        ? Number(
            (
              results.reduce(
                (sum, result) => sum + result.percentage,
                0
              ) / totalResults
            ).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        results,
        statistics: {
          totalResults,
          passed,
          failed,
          averageScore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminResults };