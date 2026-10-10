const mongoose = require("mongoose");

const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

// ========================================
// HELPER: VALIDATE OBJECT ID
// ========================================

const isValidObjectId = (id) =>
  typeof id === "string" &&
  /^[0-9a-fA-F]{24}$/.test(id) &&
  mongoose.Types.ObjectId.isValid(id);

// ========================================
// HELPER: CHECK QUIZ AVAILABILITY
// ========================================

const checkQuizAvailability = (quiz) => {
  const now = new Date();

  if (!quiz.isPublished) {
    return "This quiz is not published.";
  }

  if (quiz.startDate && now < new Date(quiz.startDate)) {
    return "This quiz is not available yet.";
  }

  if (quiz.endDate && now > new Date(quiz.endDate)) {
    return "This quiz is no longer available.";
  }

  return null;
};

// ========================================
// HELPER: GET ATTEMPT CONFIGURATION
// ========================================

const getAttemptConfig = (attempt, quiz) => {
  if (attempt.quizSnapshot) {
    const snapshot = attempt.quizSnapshot;

    return {
      title: snapshot.title,
      category: snapshot.category || "General",
      difficulty: snapshot.difficulty || "easy",
      duration: Number(snapshot.duration),
      totalMarks: Number(snapshot.totalMarks),
      passingMarks: Number(snapshot.passingMarks),
    };
  }

  if (!quiz) {
    throw new Error(
      "Quiz configuration is unavailable for this legacy attempt."
    );
  }

  return {
    title: quiz.title,
    category: quiz.category || "General",
    difficulty: quiz.difficulty || "easy",
    duration: Number(quiz.duration),
    totalMarks: Number(quiz.totalMarks),
    passingMarks: Number(quiz.passingMarks),
  };
};

// ========================================
// HELPER: CALCULATE DEADLINE
// ========================================

const getDeadline = (attempt, quiz) => {
  const config = getAttemptConfig(attempt, quiz);

  const startedAt = new Date(attempt.startedAt).getTime();

  if (
    !Number.isFinite(startedAt) ||
    !Number.isFinite(config.duration) ||
    config.duration <= 0
  ) {
    throw new Error(
      "Attempt timing configuration is invalid."
    );
  }

  return new Date(
    startedAt + config.duration * 60 * 1000
  );
};

// ========================================
// HELPER: FORMAT RESULT
// ========================================

const formatResult = (attempt) => ({
  attemptId: attempt._id,
  quizId: attempt.quiz,
  status: attempt.status,
  score: attempt.score,
  totalMarks: attempt.totalMarks,
  percentage: attempt.percentage,
  isPassed: attempt.isPassed,
  startedAt: attempt.startedAt,
  submittedAt: attempt.submittedAt,
  timeTakenSeconds: attempt.timeTakenSeconds,
});

// ========================================
// HELPER: GET USER ATTEMPT
// ========================================

const getUserAttempt = async (attemptId, userId) => {
  if (!isValidObjectId(attemptId)) {
    return {
      error: {
        status: 400,
        message: "Invalid attempt ID.",
      },
    };
  }

  const attempt = await Attempt.findOne({
    _id: attemptId,
    user: userId,
  });

  if (!attempt) {
    return {
      error: {
        status: 404,
        message: "Attempt not found.",
      },
    };
  }

  return { attempt };
};

// ========================================
// HELPER: HANDLE SERVER ERROR
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

  if (
    error.message &&
    (
      error.message.includes("configuration") ||
      error.message.includes("scoring") ||
      error.message.includes("timing")
    )
  ) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: `${operation} failed due to a server error.`,
  });
};

// ========================================
// HELPER: VALIDATE QUIZ QUESTIONS
// ========================================

const getValidatedQuizQuestions = async (quiz) => {
  const questions = await Question.find({
    quiz: quiz._id,
  })
    .select("+correctAnswer")
    .sort({ order: 1, createdAt: 1 })
    .lean();

  if (questions.length === 0) {
    return {
      error: "This quiz has no questions.",
    };
  }

  for (const question of questions) {
    if (
      typeof question.questionText !== "string" ||
      !question.questionText.trim()
    ) {
      return {
        error: "This quiz contains an invalid question.",
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
        error:
          "This quiz contains invalid answer options. Please contact an administrator.",
      };
    }

    if (
      !Number.isInteger(question.correctAnswer) ||
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length
    ) {
      return {
        error:
          "This quiz contains an invalid correct answer. Please contact an administrator.",
      };
    }

    if (
      !Number.isInteger(Number(question.marks)) ||
      Number(question.marks) <= 0
    ) {
      return {
        error:
          "This quiz contains invalid question marks. Please contact an administrator.",
      };
    }
  }

  const totalQuestionMarks = questions.reduce(
    (sum, question) => sum + Number(question.marks),
    0
  );

  if (
    !Number.isFinite(totalQuestionMarks) ||
    totalQuestionMarks !== Number(quiz.totalMarks)
  ) {
    return {
      error:
        `Quiz configuration error: question marks total ${totalQuestionMarks}, ` +
        `but quiz total marks are ${quiz.totalMarks}.`,
    };
  }

  return {
    questions,
    totalQuestionMarks,
  };
};

// ========================================
// HELPER: GET ATTEMPT QUESTIONS
// ========================================

const getAttemptQuestions = async (
  attempt,
  includeAnswers = false
) => {
  if (
    Array.isArray(attempt.questionSnapshots) &&
    attempt.questionSnapshots.length > 0
  ) {
    return attempt.questionSnapshots.map((question) => ({
      _id: question.question,
      questionText: question.questionText,
      options: question.options,
      marks: question.marks,
      order: question.order,
      explanation: question.explanation || "",
      ...(includeAnswers
        ? { correctAnswer: question.correctAnswer }
        : {}),
    }));
  }

  // Legacy attempts use their original Question references.
  const questionIds = attempt.answers.map(
    (answer) => answer.question
  );

  let query = Question.find({
    _id: { $in: questionIds },
    quiz: attempt.quiz,
  });

  if (includeAnswers) {
    query = query.select("+correctAnswer");
  } else {
    query = query.select("-correctAnswer");
  }

  return query
    .sort({ order: 1, createdAt: 1 })
    .lean();
};

// ========================================
// HELPER: FINALIZE ATTEMPT
// ========================================

const finalizeAttempt = async (attempt, quiz) => {
  if (attempt.status === "completed") {
    return attempt;
  }

  if (attempt.status !== "in-progress") {
    throw new Error("Attempt cannot be finalized.");
  }

  const config = getAttemptConfig(attempt, quiz);

  if (
    !Number.isFinite(config.totalMarks) ||
    config.totalMarks <= 0 ||
    !Number.isFinite(config.passingMarks) ||
    config.passingMarks < 0 ||
    config.passingMarks > config.totalMarks ||
    !Number.isFinite(config.duration) ||
    config.duration <= 0
  ) {
    throw new Error(
      "Attempt scoring configuration is invalid."
    );
  }

  const questions = await getAttemptQuestions(
    attempt,
    true
  );

  if (questions.length === 0) {
    throw new Error(
      "Attempt scoring configuration error: no questions are available."
    );
  }

  const questionMap = new Map(
    questions.map((question) => [
      question._id.toString(),
      question,
    ])
  );

  let earnedMarks = 0;
  let availableMarks = 0;

  // Validate the complete question set independently of
  // the number of answers submitted by the student.

  for (const question of questions) {
    const marks = Number(question.marks);

    if (
      !Number.isInteger(marks) ||
      marks <= 0 ||
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      question.options.length > 6 ||
      !Number.isInteger(question.correctAnswer) ||
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length
    ) {
      throw new Error(
        "Attempt scoring configuration error: a question contains invalid data."
      );
    }

    availableMarks += marks;
  }

  if (availableMarks !== config.totalMarks) {
    throw new Error(
      `Attempt scoring configuration mismatch: question marks total ${availableMarks}, ` +
      `but quiz total marks are ${config.totalMarks}.`
    );
  }

  // Reject corrupted answers that reference questions outside
  // this attempt's question set.

  for (const answer of attempt.answers) {
    const questionId = answer.question.toString();

    if (!questionMap.has(questionId)) {
      throw new Error(
        "Attempt scoring configuration error: an answer references a missing question."
      );
    }

    const question = questionMap.get(questionId);

    if (answer.selectedOption === null ||
        answer.selectedOption === undefined) {
      continue;
    }

    if (
      !Number.isInteger(answer.selectedOption) ||
      answer.selectedOption < 0 ||
      answer.selectedOption >= question.options.length
    ) {
      throw new Error(
        "Attempt scoring configuration error: a saved answer contains an invalid option."
      );
    }

    if (answer.selectedOption === question.correctAnswer) {
      earnedMarks += Number(question.marks);
    }
  }

  // Correct answers earn their assigned marks.
  // Unanswered and incorrect questions earn zero.

  const score = Math.round(earnedMarks * 100) / 100;

  const percentage =
    Math.round((score / config.totalMarks) * 10000) / 100;

  const submittedAt = new Date();

  const startedAt = new Date(attempt.startedAt).getTime();

  if (!Number.isFinite(startedAt)) {
    throw new Error(
      "Attempt timing configuration is invalid."
    );
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor(
      (submittedAt.getTime() - startedAt) / 1000
    )
  );

  const maximumSeconds = config.duration * 60;

  attempt.score = score;
  attempt.totalMarks = config.totalMarks;
  attempt.percentage = percentage;
  attempt.isPassed = score >= config.passingMarks;
  attempt.status = "completed";
  attempt.submittedAt = submittedAt;

  attempt.timeTakenSeconds = Math.min(
    elapsedSeconds,
    maximumSeconds
  );

  await attempt.save();

  return attempt;
};

// ========================================
// START QUIZ
// POST /api/v1/attempts/start/:quizId
// ========================================

const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!isValidObjectId(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    // Resume an existing attempt before checking publication.
    // This allows students to resume after unpublishing.

    const existingAttempt = await Attempt.findOne({
      user: req.user.id,
      quiz: quiz._id,
      status: "in-progress",
    });

    if (existingAttempt) {
      const deadline = getDeadline(existingAttempt, quiz);

      if (Date.now() < deadline.getTime()) {
        const config = getAttemptConfig(
          existingAttempt,
          quiz
        );

        return res.status(200).json({
          success: true,
          message: "You already have an active attempt.",
          data: {
            attemptId: existingAttempt._id,
            quizId: quiz._id,
            status: existingAttempt.status,
            startedAt: existingAttempt.startedAt,
            deadline,
            duration: config.duration,
          },
        });
      }

      const completedAttempt = await finalizeAttempt(
        existingAttempt,
        quiz
      );

      return res.status(200).json({
        success: true,
        message:
          "Your previous attempt reached its deadline and was automatically submitted.",
        data: {
          result: formatResult(completedAttempt),
        },
      });
    }

    const availabilityError = checkQuizAvailability(quiz);

    if (availabilityError) {
      return res.status(403).json({
        success: false,
        message: availabilityError,
      });
    }

    const validation = await getValidatedQuizQuestions(quiz);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const questions = validation.questions;

    const quizSnapshot = {
      title: quiz.title,
      category: quiz.category || "General",
      difficulty: quiz.difficulty || "easy",
      duration: Number(quiz.duration),
      totalMarks: Number(quiz.totalMarks),
      passingMarks: Number(quiz.passingMarks),
    };

    const questionSnapshots = questions.map(
      (question) => ({
        question: question._id,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        marks: Number(question.marks),
        explanation: question.explanation || "",
        order: Number(question.order),
      })
    );

    const startedAt = new Date();

    const attempt = await Attempt.create({
      user: req.user.id,
      quiz: quiz._id,
      status: "in-progress",
      answers: questions.map((question) => ({
        question: question._id,
        selectedOption: null,
      })),
      quizSnapshot,
      questionSnapshots,
      totalMarks: quizSnapshot.totalMarks,
      startedAt,
    });

    const deadline = getDeadline(attempt, quiz);

    return res.status(201).json({
      success: true,
      message: "Quiz started successfully.",
      data: {
        attemptId: attempt._id,
        quiz: {
          id: quiz._id,
          title: quizSnapshot.title,
          category: quizSnapshot.category,
          difficulty: quizSnapshot.difficulty,
          duration: quizSnapshot.duration,
          totalMarks: quizSnapshot.totalMarks,
          passingMarks: quizSnapshot.passingMarks,
        },
        questionCount: questionSnapshots.length,
        status: attempt.status,
        startedAt: attempt.startedAt,
        deadline,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Start Quiz");
  }
};

// ========================================
// GET ATTEMPT
// GET /api/v1/attempts/:attemptId
// ========================================

const getAttempt = async (req, res) => {
  try {
    const result = await getUserAttempt(
      req.params.attemptId,
      req.user.id
    );

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      });
    }

    const { attempt } = result;

    const quiz = await Quiz.findById(attempt.quiz).lean();

    if (!quiz && !attempt.quizSnapshot) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const config = getAttemptConfig(attempt, quiz);

    if (attempt.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Attempt result retrieved successfully.",
        data: {
          result: formatResult(attempt),
          quiz: {
            id: attempt.quiz,
            title: config.title,
            category: config.category,
            difficulty: config.difficulty,
            duration: config.duration,
            totalMarks: config.totalMarks,
            passingMarks: config.passingMarks,
          },
        },
      });
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "This attempt is no longer active.",
      });
    }

    const deadline = getDeadline(attempt, quiz);

    if (Date.now() >= deadline.getTime()) {
      const completedAttempt = await finalizeAttempt(
        attempt,
        quiz
      );

      return res.status(200).json({
        success: true,
        message:
          "Time expired. Your quiz was automatically submitted.",
        data: {
          result: formatResult(completedAttempt),
          quiz: {
            id: attempt.quiz,
            title: config.title,
            category: config.category,
            totalMarks: config.totalMarks,
          },
        },
      });
    }

    const questions = await getAttemptQuestions(
      attempt,
      false
    );

    const savedAnswers = new Map(
      attempt.answers.map((answer) => [
        answer.question.toString(),
        answer.selectedOption,
      ])
    );

    const safeQuestions = questions.map((question) => ({
      _id: question._id,
      questionText: question.questionText,
      options: question.options,
      marks: question.marks,
      order: question.order,
      selectedOption:
        savedAnswers.get(question._id.toString()) ?? null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        quiz: {
          id: attempt.quiz,
          title: config.title,
          category: config.category,
          difficulty: config.difficulty,
          duration: config.duration,
          totalMarks: config.totalMarks,
        },
        status: attempt.status,
        startedAt: attempt.startedAt,
        deadline,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Get Attempt");
  }
};

// ========================================
// SAVE ANSWERS
// PATCH /api/v1/attempts/:attemptId/answers
// ========================================

const saveAnswers = async (req, res) => {
  try {
    const result = await getUserAttempt(
      req.params.attemptId,
      req.user.id
    );

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      });
    }

    const { attempt } = result;

    const quiz = await Quiz.findById(attempt.quiz);

    if (!quiz && !attempt.quizSnapshot) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    if (attempt.status === "completed") {
      return res.status(409).json({
        success: false,
        message: "This attempt has already been submitted.",
        data: {
          result: formatResult(attempt),
        },
      });
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "This attempt is no longer active.",
      });
    }

    const deadline = getDeadline(attempt, quiz);

    if (Date.now() >= deadline.getTime()) {
      const completedAttempt = await finalizeAttempt(
        attempt,
        quiz
      );

      return res.status(200).json({
        success: true,
        message:
          "Time expired. Your quiz was automatically submitted.",
        data: {
          result: formatResult(completedAttempt),
        },
      });
    }

    const { answers } = req.body || {};

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one answer.",
      });
    }

    const attemptQuestions = await getAttemptQuestions(
      attempt,
      false
    );

    const questionMap = new Map(
      attemptQuestions.map((question) => [
        question._id.toString(),
        question,
      ])
    );

    const validatedAnswers = [];
    const seenQuestionIds = new Set();

    for (const item of answers) {
      if (
        !item ||
        !isValidObjectId(item.questionId) ||
        !Number.isInteger(item.selectedOption) ||
        item.selectedOption < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each answer must contain a valid questionId and non-negative selectedOption index.",
        });
      }

      if (seenQuestionIds.has(item.questionId)) {
        return res.status(400).json({
          success: false,
          message:
            "Duplicate answers for the same question are not allowed.",
        });
      }

      seenQuestionIds.add(item.questionId);

      const savedAnswer = attempt.answers.find(
        (answer) =>
          answer.question.toString() === item.questionId
      );

      if (!savedAnswer) {
        return res.status(400).json({
          success: false,
          message:
            "A question does not belong to this attempt.",
        });
      }

      const question = questionMap.get(item.questionId);

      if (
        !question ||
        item.selectedOption >= question.options.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Selected option is invalid.",
        });
      }

      validatedAnswers.push({
        savedAnswer,
        selectedOption: item.selectedOption,
      });
    }

    for (const item of validatedAnswers) {
      item.savedAnswer.selectedOption =
        item.selectedOption;
    }

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Answers saved successfully.",
      data: {
        attemptId: attempt._id,
        status: attempt.status,
        savedAnswerCount: validatedAnswers.length,
        deadline,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Save Answers");
  }
};

// ========================================
// SUBMIT ATTEMPT
// POST /api/v1/attempts/:attemptId/submit
// ========================================

const submitAttempt = async (req, res) => {
  try {
    const result = await getUserAttempt(
      req.params.attemptId,
      req.user.id
    );

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      });
    }

    const { attempt } = result;

    const quiz = await Quiz.findById(attempt.quiz);

    if (!quiz && !attempt.quizSnapshot) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    if (attempt.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "This quiz has already been submitted.",
        data: {
          result: formatResult(attempt),
        },
      });
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "This attempt cannot be submitted.",
      });
    }

    const deadline = getDeadline(attempt, quiz);
    const timeExpired = Date.now() >= deadline.getTime();

    const completedAttempt = await finalizeAttempt(
      attempt,
      quiz
    );

    return res.status(200).json({
      success: true,
      message: timeExpired
        ? "Time expired. Your quiz was automatically submitted."
        : "Quiz submitted successfully.",
      data: {
        result: formatResult(completedAttempt),
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Submit Quiz");
  }
};

// ========================================
// GET USER QUIZ HISTORY
// GET /api/v1/attempts/history
// ========================================

const getAttemptHistory = async (req, res) => {
  try {
    const attempts = await Attempt.find({
      user: req.user.id,
      status: "completed",
    })
      .populate(
        "quiz",
        "title category difficulty duration totalMarks"
      )
      .sort({ submittedAt: -1 })
      .lean();

    const history = attempts.map((attempt) => {
      const snapshot = attempt.quizSnapshot;

      const quiz =
        attempt.quiz && typeof attempt.quiz === "object"
          ? attempt.quiz
          : null;

      return {
        attemptId: attempt._id,
        quizId: quiz?._id || attempt.quiz,
        title:
          snapshot?.title ||
          quiz?.title ||
          "Deleted Quiz",
        category:
          snapshot?.category ||
          quiz?.category ||
          "General",
        difficulty:
          snapshot?.difficulty ||
          quiz?.difficulty ||
          "easy",
        duration:
          snapshot?.duration ??
          quiz?.duration ??
          0,
        score: attempt.score ?? 0,
        totalMarks:
          attempt.totalMarks ??
          snapshot?.totalMarks ??
          0,
        percentage: attempt.percentage ?? 0,
        isPassed: attempt.isPassed ?? false,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeTakenSeconds:
          attempt.timeTakenSeconds ?? 0,
      };
    });

    const totalAttempts = history.length;

    const passedAttempts = history.filter(
      (attempt) => attempt.isPassed
    ).length;

    const averageScore =
      totalAttempts > 0
        ? Math.round(
            (
              history.reduce(
                (sum, attempt) =>
                  sum + attempt.percentage,
                0
              ) / totalAttempts
            ) * 100
          ) / 100
        : 0;

    const bestScore =
      totalAttempts > 0
        ? Math.max(
            ...history.map(
              (attempt) => attempt.percentage
            )
          )
        : 0;

    const passRate =
      totalAttempts > 0
        ? Math.round(
            (passedAttempts / totalAttempts) * 10000
          ) / 100
        : 0;

    return res.status(200).json({
      success: true,
      count: totalAttempts,
      data: {
        history,
        statistics: {
          totalAttempts,
          averageScore,
          bestScore,
          passedAttempts,
          failedAttempts:
            totalAttempts - passedAttempts,
          passRate,
        },
      },
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Get Quiz History"
    );
  }
};

// ========================================
// REVIEW COMPLETED QUIZ
// GET /api/v1/attempts/:attemptId/review
// ========================================

const reviewAttempt = async (req, res) => {
  try {
    const attemptResult = await getUserAttempt(
      req.params.attemptId,
      req.user.id
    );

    if (attemptResult.error) {
      return res.status(attemptResult.error.status).json({
        success: false,
        message: attemptResult.error.message,
      });
    }

    const { attempt } = attemptResult;

    if (attempt.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "You can review answers only after submitting the quiz.",
      });
    }

    const quiz = await Quiz.findById(attempt.quiz).lean();

    if (!quiz && !attempt.quizSnapshot) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const config = getAttemptConfig(attempt, quiz);

    const questions = await getAttemptQuestions(
      attempt,
      true
    );

    const savedAnswers = new Map(
      attempt.answers.map((answer) => [
        answer.question.toString(),
        answer.selectedOption,
      ])
    );

    const reviewedQuestions = questions.map(
      (question) => {
        const questionId = question._id;

        const selectedOption =
          savedAnswers.get(questionId.toString()) ?? null;

        const correctOption = question.correctAnswer;

        const isCorrect =
          Number.isInteger(selectedOption) &&
          Number.isInteger(correctOption) &&
          selectedOption === correctOption;

        return {
          questionId,
          questionText: question.questionText,
          options: question.options,
          marks: question.marks,
          order: question.order,
          selectedOption,
          correctOption,

          selectedAnswer:
            Number.isInteger(selectedOption) &&
            selectedOption >= 0 &&
            selectedOption < question.options.length
              ? question.options[selectedOption]
              : null,

          correctAnswer:
            Number.isInteger(correctOption) &&
            correctOption >= 0 &&
            correctOption < question.options.length
              ? question.options[correctOption]
              : null,

          isCorrect,
          explanation: question.explanation || "",
        };
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Quiz answer review retrieved successfully.",
      data: {
        attemptId: attempt._id,

        quiz: {
          id: attempt.quiz,
          title: config.title,
          category: config.category,
          difficulty: config.difficulty,
          duration: config.duration,
          totalMarks: config.totalMarks,
          passingMarks: config.passingMarks,
        },

        result: formatResult(attempt),
        questions: reviewedQuestions,
      },
    });
  } catch (error) {
    return handleServerError(
      res,
      error,
      "Review Attempt"
    );
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  startQuiz,
  getAttempt,
  saveAnswers,
  submitAttempt,
  getAttemptHistory,
  reviewAttempt,
};