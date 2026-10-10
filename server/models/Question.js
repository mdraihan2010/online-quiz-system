const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // Which quiz contains this question?
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz ID is required"],
      index: true,
    },

    // Question text
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      maxlength: [2000, "Question cannot exceed 2000 characters"],
    },

    // Answer options
    options: {
      type: [
        {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
      ],
      validate: {
        validator: function (options) {
          return options.length >= 2 && options.length <= 6;
        },
        message: "A question must have between 2 and 6 options",
      },
    },

    // Index of the correct option (0-based)
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer is required"],
      min: 0,
      validate: {
        validator: function (value) {
          return (
            Array.isArray(this.options) &&
            value < this.options.length
          );
        },
        message: "Correct answer must match an existing option",
      },
      select: false,
    },

    // Marks for this question
    marks: {
      type: Number,
      required: [true, "Question marks are required"],
      min: [1, "Marks must be at least 1"],
      default: 1,
    },

    // Optional explanation
    explanation: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Question order inside the quiz
    order: {
      type: Number,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ quiz: 1, order: 1 });

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;