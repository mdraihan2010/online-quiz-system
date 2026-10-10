const mongoose = require("mongoose");

// ========================================
// ATTEMPT ANSWER SCHEMA
// ========================================

const attemptAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    selectedOption: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ========================================
// QUESTION SNAPSHOT SCHEMA
// Stores the question as it appeared
// when the attempt started.
// ========================================

const questionSnapshotSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    questionText: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
    },

    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
    },

    marks: {
      type: Number,
      required: true,
      min: 1,
    },

    explanation: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

// ========================================
// QUIZ SNAPSHOT SCHEMA
// ========================================

const quizSnapshotSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "General",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ========================================
// MAIN ATTEMPT SCHEMA
// ========================================

const attemptSchema = new mongoose.Schema(
  {
    // User who attempted the quiz
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // Quiz that was attempted
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz ID is required"],
      index: true,
    },

    // Attempt status
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
      index: true,
    },

    // Student answers
    answers: {
      type: [attemptAnswerSchema],
      default: [],
    },

    // Quiz configuration captured at start time
    quizSnapshot: {
      type: quizSnapshotSchema,
      default: undefined,
    },

    // Question data captured at start time
    questionSnapshots: {
      type: [questionSnapshotSchema],
      default: undefined,
    },

    // Result information
    score: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalMarks: {
      type: Number,
      min: 0,
      required: true,
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    isPassed: {
      type: Boolean,
      default: false,
    },

    // Timing information
    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    timeTakenSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// INDEXES
// ========================================

attemptSchema.index({
  user: 1,
  createdAt: -1,
});

attemptSchema.index({
  quiz: 1,
  status: 1,
});

attemptSchema.index({
  status: 1,
  submittedAt: -1,
});

// ========================================
// MODEL EXPORT
// ========================================

const Attempt = mongoose.model(
  "Attempt",
  attemptSchema
);

module.exports = Attempt;