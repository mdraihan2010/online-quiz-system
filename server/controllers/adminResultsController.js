
const Attempt = require("../models/Attempt");

// ========================================
// GET /api/v1/admin/results
// Get all completed quiz results and statistics
// ========================================

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
                (sum, result) =>
                  sum + (Number(result.percentage) || 0),
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

// ========================================
// GET /api/v1/admin/results/:attemptId
// Get one completed result with question-wise details
// ========================================

const getAdminResultDetails = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    if (!/^[a-f\d]{24}$/i.test(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      status: "completed",
    })
      .populate("user", "name email")
      .populate("quiz", "title")
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Completed result not found.",
      });
    }

    const snapshots = Array.isArray(attempt.questionSnapshots)
      ? attempt.questionSnapshots
      : [];

    const answers = Array.isArray(attempt.answers)
      ? attempt.answers
      : [];

    const questions = snapshots.map((snapshot, index) => {
      const savedAnswer = answers.find(
        (answer) =>
          String(answer.question) === String(snapshot.question)
      );

      const selectedOption =
        savedAnswer?.selectedOption ?? null;

      const isCorrect =
        selectedOption !== null &&
        selectedOption === snapshot.correctAnswer;

      const earnedMarks = isCorrect
        ? snapshot.marks
        : 0;

      return {
        id: String(snapshot.question || index),
        question: snapshot.questionText,
        options: snapshot.options || [],
        selectedOption,
        correctAnswer: snapshot.correctAnswer,
        marks: snapshot.marks,
        earnedMarks,
        isCorrect,
        explanation: snapshot.explanation || "",
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        result: {
          id: String(attempt._id),
          user: attempt.user?.name || "Deleted User",
          email: attempt.user?.email || "N/A",
          quiz:
            attempt.quizSnapshot?.title ||
            attempt.quiz?.title ||
            "Deleted Quiz",
          score: attempt.score,
          totalMarks:
            attempt.quizSnapshot?.totalMarks ??
            attempt.totalMarks,
          percentage: attempt.percentage,
          date: attempt.submittedAt,
          status: attempt.isPassed ? "Passed" : "Failed",
          timeTakenSeconds: attempt.timeTakenSeconds,
          questions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminResults,
  getAdminResultDetails,
};
