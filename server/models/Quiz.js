const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    // Quiz title
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      minlength: [3, "Quiz title must be at least 3 characters"],
      maxlength: [100, "Quiz title cannot exceed 100 characters"],
    },

    // Quiz description
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    // Quiz category
    category: {
      type: String,
      required: [true, "Quiz category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    // Quiz difficulty
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // Quiz duration in minutes
    duration: {
      type: Number,
      required: [true, "Quiz duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      validate: {
        validator: Number.isFinite,
        message: "Duration must be a valid number",
      },
    },

    // Total marks
    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: [1, "Total marks must be at least 1"],
      validate: {
        validator: Number.isFinite,
        message: "Total marks must be a valid number",
      },
    },

    // Passing marks
    passingMarks: {
      type: Number,
      required: [true, "Passing marks are required"],
      min: [0, "Passing marks cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Passing marks must be a valid number",
      },
    },

    // Admin who created the quiz
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Quiz creator is required"],
      index: true,
    },

    // Quiz publication status
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Quiz availability dates
    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validate passing marks
quizSchema.pre("validate", function () {
  if (
    this.totalMarks != null &&
    this.passingMarks != null &&
    this.passingMarks > this.totalMarks
  ) {
    this.invalidate(
      "passingMarks",
      "Passing marks cannot exceed total marks"
    );
  }

  // Validate quiz availability dates
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalidate(
      "endDate",
      "End date must be later than start date"
    );
  }
});

// Indexes for common quiz queries and analytics
quizSchema.index({ createdAt: -1 });
quizSchema.index({ category: 1, isPublished: 1 });
quizSchema.index({ isPublished: 1, createdAt: -1 });

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;