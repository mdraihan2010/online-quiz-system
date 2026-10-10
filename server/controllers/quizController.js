const mongoose = require("mongoose");

const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");

// ========================================
// HELPERS
// ========================================

const isValidObjectId = (id) =>
  typeof id === "string" &&
  /^[0-9a-fA-F]{24}$/.test(id) &&
  mongoose.Types.ObjectId.isValid(id);

const handleServerError = (res, error, operation) => {
  console.error(`${operation} Error:`, error);

  if (
    ["CastError", "BSONError", "ValidationError"].includes(
      error.name
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID or data format.",
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate data detected.",
    });
  }

  return res.status(500).json({
    success: false,
    message: `${operation} failed due to a server error.`,
  });
};

const getQuestionCount = (quizId) =>
  Question.countDocuments({ quiz: quizId });

const hasActiveAttempt = (quizId) =>
  Attempt.exists({
    quiz: quizId,
    status: "in-progress",
  });

const hasAnyAttempt = (quizId) =>
  Attempt.exists({
    quiz: quizId,
  });

const parseOptionalDate = (value, field) => {
  if (value === undefined) {
    return { provided: false };
  }

  if (value === null || value === "") {
    return {
      provided: true,
      value: null,
    };
  }

  if (
    typeof value !== "string" &&
    !(value instanceof Date) &&
    typeof value !== "number"
  ) {
    return {
      error: `${field} must be a valid date.`,
    };
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return {
      error: `${field} is invalid.`,
    };
  }

  return {
    provided: true,
    value: parsed,
  };
};

// ========================================
// VALIDATE QUIZ BEFORE PUBLISHING
// ========================================

const validateQuizQuestions = async (quiz) => {
  const questions = await Question.find({
    quiz: quiz._id,
  })
    .select("+correctAnswer")
    .lean();

  if (questions.length === 0) {
    return {
      valid: false,
      message: "Cannot publish a quiz without questions.",
    };
  }

  let totalQuestionMarks = 0;

  for (let index = 0; index < questions.length; index++) {
    const question = questions[index];

    if (
      typeof question.questionText !== "string" ||
      !question.questionText.trim()
    ) {
      return {
        valid: false,
        message: `Question ${index + 1} contains invalid question text.`,
      };
    }

    if (
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      question.options.length > 6 ||
      question.options.some(
        (option) =>
          typeof option !== "string" ||
          !option.trim()
      )
    ) {
      return {
        valid: false,
        message: `Question ${index + 1} contains invalid answer options.`,
      };
    }

    if (
      !Number.isInteger(question.correctAnswer) ||
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length
    ) {
      return {
        valid: false,
        message: `Question ${index + 1} contains an invalid correct answer.`,
      };
    }

    if (
      !Number.isInteger(question.marks) ||
      question.marks <= 0
    ) {
      return {
        valid: false,
        message: `Question ${index + 1} must have positive integer marks.`,
      };
    }

    totalQuestionMarks += question.marks;
  }

  if (
    !Number.isInteger(quiz.totalMarks) ||
    quiz.totalMarks < 1 ||
    totalQuestionMarks !== quiz.totalMarks
  ) {
    return {
      valid: false,
      message:
        `Question marks total ${totalQuestionMarks}, ` +
        `but quiz totalMarks is ${quiz.totalMarks}.`,
    };
  }

  if (
    !Number.isInteger(quiz.passingMarks) ||
    quiz.passingMarks < 0 ||
    quiz.passingMarks > quiz.totalMarks
  ) {
    return {
      valid: false,
      message: "Passing marks must be between 0 and total marks.",
    };
  }

  if (
    !Number.isInteger(quiz.duration) ||
    quiz.duration < 1
  ) {
    return {
      valid: false,
      message: "Quiz duration must be a positive integer in minutes.",
    };
  }

  return {
    valid: true,
    questionCount: questions.length,
    totalQuestionMarks,
  };
};

// ========================================
// GET ALL QUIZZES
// GET /api/v1/quizzes
// ========================================

const getAllQuizzes = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";

    const filter = isAdmin
      ? {}
      : { isPublished: true };

    const quizzes = await Quiz.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => ({
        ...quiz,
        questionCount: await getQuestionCount(quiz._id),
      }))
    );

    return res.status(200).json({
      success: true,
      count: quizzesWithCounts.length,
      data: quizzesWithCounts,
    });
  } catch (error) {
    return handleServerError(res, error, "Get All Quizzes");
  }
};

// ========================================
// GET SINGLE QUIZ
// GET /api/v1/quizzes/:id
// ========================================

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz = await Quiz.findById(id)
      .populate("createdBy", "name email")
      .lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    // Students must not access draft quizzes.
    if (
      req.user?.role !== "admin" &&
      quiz.isPublished !== true
    ) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...quiz,
        questionCount: await getQuestionCount(quiz._id),
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Get Quiz");
  }
};

// ========================================
// CREATE QUIZ
// POST /api/v1/quizzes
// Admin only
// ========================================

const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description = "",
      category,
      difficulty,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      endDate,
    } = req.body || {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 100 ||
      typeof category !== "string" ||
      !category.trim() ||
      category.trim().length > 100 ||
      !["easy", "medium", "hard"].includes(difficulty) ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      !Number.isInteger(totalMarks) ||
      totalMarks < 1 ||
      !Number.isInteger(passingMarks) ||
      passingMarks < 0 ||
      passingMarks > totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide valid quiz details and marks.",
      });
    }

    if (
      typeof description !== "string" ||
      description.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Description must be text of at most 1000 characters.",
      });
    }

    const start = parseOptionalDate(startDate, "Start date");
    const end = parseOptionalDate(endDate, "End date");

    if (start.error || end.error) {
      return res.status(400).json({
        success: false,
        message: start.error || end.error,
      });
    }

    if (
      start.value &&
      end.value &&
      end.value <= start.value
    ) {
      return res.status(400).json({
        success: false,
        message: "End date must be later than start date.",
      });
    }

    const quizData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      difficulty,
      duration,
      totalMarks,
      passingMarks,
      createdBy: req.user.id,
      isPublished: false,
    };

    if (start.value) {
      quizData.startDate = start.value;
    }

    if (end.value) {
      quizData.endDate = end.value;
    }

    const quiz = await Quiz.create(quizData);

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully as a draft.",
      data: quiz,
    });
  } catch (error) {
    return handleServerError(res, error, "Create Quiz");
  }
};

// ========================================
// UPDATE QUIZ
// PATCH /api/v1/quizzes/:id
// Admin only
// ========================================

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const body = req.body || {};

    if (
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide fields to update.",
      });
    }

    const allowedFields = new Set([
      "title",
      "description",
      "category",
      "difficulty",
      "duration",
      "totalMarks",
      "passingMarks",
      "startDate",
      "endDate",
      "isPublished",
    ]);

    const unknownField = Object.keys(body).find(
      (field) => !allowedFields.has(field)
    );

    if (unknownField) {
      return res.status(400).json({
        success: false,
        message: `Unsupported update field: ${unknownField}.`,
      });
    }

    const updates = { ...body };

    // ------------------------------------
    // TEXT VALIDATION
    // ------------------------------------

    if (updates.title !== undefined) {
      if (
        typeof updates.title !== "string" ||
        !updates.title.trim() ||
        updates.title.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Title must contain 1–100 characters.",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      if (
        typeof updates.description !== "string" ||
        updates.description.length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 1000 characters.",
        });
      }

      updates.description = updates.description.trim();
    }

    if (updates.category !== undefined) {
      if (
        typeof updates.category !== "string" ||
        !updates.category.trim() ||
        updates.category.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Category must contain 1–100 characters.",
        });
      }

      updates.category = updates.category.trim();
    }

    // ------------------------------------
    // ENUM VALIDATION
    // ------------------------------------

    if (
      updates.difficulty !== undefined &&
      !["easy", "medium", "hard"].includes(updates.difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Difficulty must be easy, medium, or hard.",
      });
    }

    // ------------------------------------
    // NUMERIC VALIDATION
    // ------------------------------------

    if (
      updates.duration !== undefined &&
      (
        !Number.isInteger(updates.duration) ||
        updates.duration < 1
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive integer in minutes.",
      });
    }

    if (
      updates.totalMarks !== undefined &&
      (
        !Number.isInteger(updates.totalMarks) ||
        updates.totalMarks < 1
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Total marks must be a positive integer.",
      });
    }

    if (
      updates.passingMarks !== undefined &&
      (
        !Number.isInteger(updates.passingMarks) ||
        updates.passingMarks < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Passing marks must be a non-negative integer.",
      });
    }

    if (
      updates.isPublished !== undefined &&
      typeof updates.isPublished !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isPublished must be true or false.",
      });
    }

    // ------------------------------------
    // DATE VALIDATION
    // ------------------------------------

    for (const field of ["startDate", "endDate"]) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        const parsed = parseOptionalDate(
          updates[field],
          field === "startDate" ? "Start date" : "End date"
        );

        if (parsed.error) {
          return res.status(400).json({
            success: false,
            message: parsed.error,
          });
        }

        updates[field] = parsed.value;
      }
    }

    const finalTotalMarks =
      updates.totalMarks ?? quiz.totalMarks;

    const finalPassingMarks =
      updates.passingMarks ?? quiz.passingMarks;

    if (finalPassingMarks > finalTotalMarks) {
      return res.status(400).json({
        success: false,
        message: "Passing marks cannot exceed total marks.",
      });
    }

    const finalStartDate =
      Object.prototype.hasOwnProperty.call(updates, "startDate")
        ? updates.startDate
        : quiz.startDate;

    const finalEndDate =
      Object.prototype.hasOwnProperty.call(updates, "endDate")
        ? updates.endDate
        : quiz.endDate;

    if (
      finalStartDate &&
      finalEndDate &&
      new Date(finalEndDate) <= new Date(finalStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "End date must be later than start date.",
      });
    }

    // ------------------------------------
    // ATTEMPT PROTECTION
    // ------------------------------------

    const configurationFields = [
      "duration",
      "totalMarks",
      "passingMarks",
      "startDate",
      "endDate",
      "isPublished",
    ];

    const changesConfiguration = configurationFields.some(
      (field) =>
        Object.prototype.hasOwnProperty.call(updates, field)
    );

    if (
      changesConfiguration &&
      (await hasActiveAttempt(quiz._id))
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Quiz settings, schedule, and publication status cannot be changed while an attempt is active.",
      });
    }

    const existingAttempts = await hasAnyAttempt(quiz._id);

    const publishing =
      updates.isPublished === true && !quiz.isPublished;

    const marksChanged =
      updates.totalMarks !== undefined &&
      updates.totalMarks !== quiz.totalMarks;

    const passingMarksChanged =
      updates.passingMarks !== undefined &&
      updates.passingMarks !== quiz.passingMarks;

    const durationChanged =
      updates.duration !== undefined &&
      updates.duration !== quiz.duration;

    const scheduleChanged = [
      "startDate",
      "endDate",
    ].some(
      (field) =>
        Object.prototype.hasOwnProperty.call(updates, field) &&
        (
          updates[field] == null
            ? quiz[field] != null
            : !quiz[field] ||
              new Date(updates[field]).getTime() !==
                new Date(quiz[field]).getTime()
        )
    );

    // Preserve settings used by historical attempts.
    if (
      existingAttempts &&
      (
        marksChanged ||
        passingMarksChanged ||
        durationChanged ||
        scheduleChanged
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Quiz marks, duration, and schedule cannot be changed because historical attempts exist.",
      });
    }

    // ------------------------------------
    // PUBLISH VALIDATION
    // ------------------------------------

    if (publishing) {
      const validation = await validateQuizQuestions({
        ...quiz.toObject(),
        ...updates,
        _id: quiz._id,
        duration: updates.duration ?? quiz.duration,
        totalMarks: finalTotalMarks,
        passingMarks: finalPassingMarks,
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }
    }

    // Validate question marks when changing total marks
    // on a published quiz with no historical attempts.
    if (
      quiz.isPublished &&
      marksChanged &&
      !existingAttempts
    ) {
      const validation = await validateQuizQuestions({
        ...quiz.toObject(),
        ...updates,
        _id: quiz._id,
        duration: updates.duration ?? quiz.duration,
        totalMarks: finalTotalMarks,
        passingMarks: finalPassingMarks,
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }
    }

    // ------------------------------------
    // SAVE UPDATES
    // ------------------------------------

    for (const [field, value] of Object.entries(updates)) {
      if (
        (field === "startDate" || field === "endDate") &&
        value === null
      ) {
        quiz.set(field, undefined);
      } else {
        quiz.set(field, value);
      }
    }

    await quiz.save();

    const updatedQuiz = await Quiz.findById(quiz._id)
      .populate("createdBy", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      message: publishing
        ? "Quiz published successfully."
        : updates.isPublished === false
          ? "Quiz unpublished successfully."
          : "Quiz updated successfully.",
      data: {
        ...updatedQuiz,
        questionCount: await getQuestionCount(quiz._id),
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Update Quiz");
  }
};

// ========================================
// DELETE QUIZ
// DELETE /api/v1/quizzes/:id
// Admin only
// ========================================

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const hasAttempts = await hasAnyAttempt(quiz._id);

    if (hasAttempts) {
      return res.status(409).json({
        success: false,
        message:
          "This quiz has attempts and cannot be deleted. Keep it as a record instead.",
      });
    }

    await Question.deleteMany({
      quiz: quiz._id,
    });

    await quiz.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Quiz and its questions deleted successfully.",
    });
  } catch (error) {
    return handleServerError(res, error, "Delete Quiz");
  }
};

// ========================================
// GET QUIZ CATEGORIES
// GET /api/v1/quizzes/categories
// ========================================

const getQuizCategories = async (req, res) => {
  try {
    const filter =
      req.user?.role === "admin"
        ? {}
        : { isPublished: true };

    const categories = await Quiz.distinct("category", {
      ...filter,
      category: {
        $exists: true,
        $type: "string",
        $ne: "",
      },
    });

    const normalizedCategories = [
      ...new Set(
        categories
          .map((category) => category.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      count: normalizedCategories.length,
      data: normalizedCategories,
    });
  } catch (error) {
    return handleServerError(res, error, "Get Quiz Categories");
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  getAllQuizzes,
  getQuizById,
  getQuizCategories,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};