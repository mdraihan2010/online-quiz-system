const mongoose = require("mongoose");

const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");

// ========================================
// HELPER: VALIDATE OBJECT ID
// ========================================

const isValidObjectId = (id) =>
  typeof id === "string" &&
  /^[0-9a-fA-F]{24}$/.test(id) &&
  mongoose.Types.ObjectId.isValid(id);

// ========================================
// HELPER: CHECK ADMIN
// ========================================

const isAdmin = (req) => req.user?.role === "admin";

// ========================================
// HELPER: HANDLE SERVER ERRORS
// ========================================

const handleServerError = (res, error, operation) => {
  console.error(`${operation} Error:`, error);

  if (
    ["ValidationError", "CastError", "BSONError"].includes(
      error.name
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided.",
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

// ========================================
// HELPER: VALIDATE QUESTION TEXT
// ========================================

const validateQuestionText = (text) =>
  typeof text === "string" &&
  text.trim().length > 0 &&
  text.trim().length <= 2000;

// ========================================
// HELPER: VALIDATE OPTIONS
// ========================================

const validateOptions = (options) => {
  if (
    !Array.isArray(options) ||
    options.length < 2 ||
    options.length > 6
  ) {
    return "Provide between 2 and 6 options.";
  }

  for (const option of options) {
    if (
      typeof option !== "string" ||
      !option.trim() ||
      option.trim().length > 500
    ) {
      return (
        "Each option must be a non-empty string " +
        "of at most 500 characters."
      );
    }
  }

  const normalized = options.map((option) =>
    option.trim().toLowerCase()
  );

  if (new Set(normalized).size !== normalized.length) {
    return "Duplicate options are not allowed.";
  }

  return null;
};

// ========================================
// HELPER: VALIDATE CORRECT ANSWER
// ========================================

const isValidCorrectAnswer = (answer, options) =>
  Number.isInteger(answer) &&
  Array.isArray(options) &&
  answer >= 0 &&
  answer < options.length;

// ========================================
// HELPER: VALIDATE POSITIVE INTEGER
// ========================================

const isPositiveInteger = (value) =>
  Number.isInteger(value) && value >= 1;

// ========================================
// HELPER: GET EXISTING QUIZ
// ========================================

const getExistingQuiz = async (quizId) => {
  if (!isValidObjectId(quizId)) {
    return {
      error: {
        status: 400,
        message: "Invalid quiz ID.",
      },
    };
  }

  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return {
      error: {
        status: 404,
        message: "Quiz not found.",
      },
    };
  }

  return { quiz };
};

// ========================================
// HELPER: CHECK QUIZ ACCESS
// ========================================

const canAccessQuiz = (quiz, req) => {
  if (!quiz) return false;

  return isAdmin(req) || quiz.isPublished === true;
};

// ========================================
// HELPER: SAFE QUESTION RESPONSE
// ========================================

const getSafeQuestion = async (questionId) =>
  Question.findById(questionId)
    .select("-correctAnswer")
    .populate("quiz", "title category isPublished")
    .lean();

// ========================================
// HELPER: CHECK ACTIVE ATTEMPTS
// ========================================

const hasActiveAttempt = async (quizId) =>
  Boolean(
    await Attempt.exists({
      quiz: quizId,
      status: "in-progress",
    })
  );

// ========================================
// HELPER: CHECK HISTORICAL REFERENCES
// ========================================

const isQuestionReferencedByAttempt = async (questionId) =>
  Boolean(
    await Attempt.exists({
      "answers.question": questionId,
    })
  );

// ========================================
// HELPER: GET QUESTION MARKS TOTAL
// ========================================

const getQuestionMarksTotal = async (
  quizId,
  excludedQuestionId = null
) => {
  const filter = { quiz: quizId };

  if (excludedQuestionId) {
    filter._id = { $ne: excludedQuestionId };
  }

  const questions = await Question.find(filter)
    .select("marks")
    .lean();

  return questions.reduce(
    (total, question) => total + Number(question.marks),
    0
  );
};

// ========================================
// GET ALL QUESTIONS
// GET /api/v1/questions
// ========================================

const getAllQuestions = async (req, res) => {
  try {
    const { quizId, search } = req.query;
    const filter = {};

    if (quizId !== undefined) {
      if (!isValidObjectId(quizId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid quiz ID.",
        });
      }

      filter.quiz = new mongoose.Types.ObjectId(quizId);
    }

    if (search !== undefined) {
      if (typeof search !== "string") {
        return res.status(400).json({
          success: false,
          message: "Search must be a string.",
        });
      }

      const searchText = search.trim();

      if (searchText.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Search text is too long.",
        });
      }

      if (searchText) {
        const escapedSearch = searchText.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        filter.questionText = {
          $regex: escapedSearch,
          $options: "i",
        };
      }
    }

    if (!isAdmin(req)) {
      const publishedQuizIds = await Quiz.find({
        isPublished: true,
      }).distinct("_id");

      if (quizId !== undefined) {
        const isPublished = publishedQuizIds.some(
          (publishedId) =>
            publishedId.toString() === quizId
        );

        if (!isPublished) {
          return res.status(403).json({
            success: false,
            message: "This quiz is not available.",
          });
        }
      } else {
        filter.quiz = { $in: publishedQuizIds };
      }
    }

    const questions = await Question.find(filter)
      .select("-correctAnswer")
      .populate("quiz", "title category isPublished")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Get All Questions"
    );
  }
};

// ========================================
// GET SINGLE QUESTION
// GET /api/v1/questions/:id
// ========================================

const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    let query = Question.findById(id);

    query = isAdmin(req)
      ? query.select("+correctAnswer")
      : query.select("-correctAnswer");

    const question = await query
      .populate("quiz", "title category isPublished")
      .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    if (!canAccessQuiz(question.quiz, req)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this question.",
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    return handleServerError(res, error, "Get Question");
  }
};

// ========================================
// CREATE QUESTION
// POST /api/v1/questions
// ========================================

const createQuestion = async (req, res) => {
  try {
    const {
      quiz,
      quizId,
      questionText,
      options,
      correctAnswer,
      marks = 1,
      explanation = "",
      order = 1,
    } = req.body || {};

    const selectedQuizId = quizId ?? quiz;

    if (
      selectedQuizId === undefined ||
      selectedQuizId === null ||
      selectedQuizId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required.",
      });
    }

    const quizResult = await getExistingQuiz(
      selectedQuizId
    );

    if (quizResult.error) {
      return res.status(quizResult.error.status).json({
        success: false,
        message: quizResult.error.message,
      });
    }

    const selectedQuiz = quizResult.quiz;

    if (await hasActiveAttempt(selectedQuiz._id)) {
      return res.status(409).json({
        success: false,
        message:
          "Questions cannot be added while a student has an active attempt for this quiz.",
      });
    }

    if (!validateQuestionText(questionText)) {
      return res.status(400).json({
        success: false,
        message:
          "Question text is required and must not exceed 2000 characters.",
      });
    }

    const optionsError = validateOptions(options);

    if (optionsError) {
      return res.status(400).json({
        success: false,
        message: optionsError,
      });
    }

    const normalizedOptions = options.map((option) =>
      option.trim()
    );

    if (
      !isValidCorrectAnswer(
        correctAnswer,
        normalizedOptions
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Correct answer must be a valid option index.",
      });
    }

    if (!isPositiveInteger(marks)) {
      return res.status(400).json({
        success: false,
        message: "Marks must be a positive integer.",
      });
    }

    if (!isPositiveInteger(order)) {
      return res.status(400).json({
        success: false,
        message: "Order must be a positive integer.",
      });
    }

    if (
      typeof explanation !== "string" ||
      explanation.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Explanation must be a string of at most 1000 characters.",
      });
    }

    // Keep the quiz's configured total marks consistent.
    const existingMarks = await getQuestionMarksTotal(
      selectedQuiz._id
    );

    if (
      existingMarks + marks >
      Number(selectedQuiz.totalMarks)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Adding this question would increase the total question marks to ${existingMarks + marks}, ` +
          `exceeding the quiz total of ${selectedQuiz.totalMarks}.`,
      });
    }

    const question = await Question.create({
      quiz: selectedQuiz._id,
      questionText: questionText.trim(),
      options: normalizedOptions,
      correctAnswer,
      marks,
      explanation: explanation.trim(),
      order,
    });

    const safeQuestion = await getSafeQuestion(
      question._id
    );

    return res.status(201).json({
      success: true,
      message: "Question created successfully.",
      data: safeQuestion,
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Create Question"
    );
  }
};

// ========================================
// UPDATE QUESTION
// PATCH /api/v1/questions/:id
// ========================================

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const question = await Question.findById(id).select(
      "+correctAnswer"
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
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
        message: "Provide at least one field to update.",
      });
    }

    const allowedFields = new Set([
      "quiz",
      "quizId",
      "questionText",
      "options",
      "correctAnswer",
      "marks",
      "explanation",
      "order",
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

    const {
      quiz,
      quizId,
      questionText,
      options,
      correctAnswer,
      marks,
      explanation,
      order,
    } = body;

    const selectedQuizId = quizId ?? quiz;

    const quizResult =
      selectedQuizId !== undefined
        ? await getExistingQuiz(selectedQuizId)
        : { quiz: await Quiz.findById(question.quiz) };

    if (quizResult.error) {
      return res.status(quizResult.error.status).json({
        success: false,
        message: quizResult.error.message,
      });
    }

    if (!quizResult.quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const targetQuiz = quizResult.quiz;
    const originalQuizId = question.quiz.toString();
    const targetQuizId = targetQuiz._id.toString();

    const movingQuestion =
      originalQuizId !== targetQuizId;

    // Check both the source and target quiz.
    if (
      (await hasActiveAttempt(question.quiz)) ||
      (
        movingQuestion &&
        (await hasActiveAttempt(targetQuiz._id))
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This question cannot be changed or moved while its source or target quiz has an active attempt.",
      });
    }

    if (questionText !== undefined) {
      if (!validateQuestionText(questionText)) {
        return res.status(400).json({
          success: false,
          message:
            "Question text is required and must not exceed 2000 characters.",
        });
      }

      question.questionText = questionText.trim();
    }

    if (options !== undefined) {
      const optionsError = validateOptions(options);

      if (optionsError) {
        return res.status(400).json({
          success: false,
          message: optionsError,
        });
      }

      question.options = options.map((option) =>
        option.trim()
      );
    }

    if (correctAnswer !== undefined) {
      if (
        !isValidCorrectAnswer(
          correctAnswer,
          question.options
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Correct answer must be a valid option index.",
        });
      }

      question.correctAnswer = correctAnswer;
    } else if (
      options !== undefined &&
      question.correctAnswer >= question.options.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The correct answer is outside the updated options. Provide a valid correctAnswer index.",
      });
    }

    let finalMarks = question.marks;

    if (marks !== undefined) {
      if (!isPositiveInteger(marks)) {
        return res.status(400).json({
          success: false,
          message: "Marks must be a positive integer.",
        });
      }

      finalMarks = marks;
    }

    // Calculate the resulting total for the target quiz.
    const targetExistingMarks =
      await getQuestionMarksTotal(
        targetQuiz._id,
        movingQuestion ? null : question._id
      );

    const resultingTotal =
      targetExistingMarks + finalMarks;

    if (resultingTotal > Number(targetQuiz.totalMarks)) {
      return res.status(400).json({
        success: false,
        message:
          `The updated question marks would make the quiz total ${resultingTotal}, ` +
          `exceeding the configured total of ${targetQuiz.totalMarks}.`,
      });
    }

    question.marks = finalMarks;

    if (movingQuestion) {
      // Prevent moving a question that is already part of
      // a historical attempt, preserving its references.
      if (
        await isQuestionReferencedByAttempt(question._id)
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This question belongs to an existing attempt and cannot be moved to another quiz.",
        });
      }

      question.quiz = targetQuiz._id;
    }

    if (explanation !== undefined) {
      if (
        typeof explanation !== "string" ||
        explanation.length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Explanation must be a string of at most 1000 characters.",
        });
      }

      question.explanation = explanation.trim();
    }

    if (order !== undefined) {
      if (!isPositiveInteger(order)) {
        return res.status(400).json({
          success: false,
          message: "Order must be a positive integer.",
        });
      }

      question.order = order;
    }

    await question.save();

    const safeQuestion = await getSafeQuestion(
      question._id
    );

    return res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      data: safeQuestion,
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Update Question"
    );
  }
};

// ========================================
// DELETE QUESTION
// DELETE /api/v1/questions/:id
// ========================================

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    if (await hasActiveAttempt(question.quiz)) {
      return res.status(409).json({
        success: false,
        message:
          "This question cannot be deleted while a student has an active attempt for its quiz.",
      });
    }

    if (
      await isQuestionReferencedByAttempt(question._id)
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This question is linked to an existing attempt and cannot be deleted.",
      });
    }

    await Question.deleteOne({
      _id: question._id,
    });

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Delete Question"
    );
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};