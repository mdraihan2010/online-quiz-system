require("dotenv").config();

const mongoose = require("mongoose");
const Attempt = require("./models/Attempt");
const Quiz = require("./models/Quiz");
const Question = require("./models/Question");

async function auditAttempts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const attempts = await Attempt.find({
      status: "completed",
    }).lean();

    console.log("\n========== ATTEMPT–QUIZ RELATION AUDIT ==========");

    for (const attempt of attempts) {
      const quiz = await Quiz.findById(attempt.quiz)
        .select("title totalMarks passingMarks isPublished")
        .lean();

      const answerIds = (attempt.answers || []).map((answer) =>
        String(answer.question)
      );

      const existingQuestions = await Question.find({
        _id: { $in: answerIds },
      })
        .select("quiz")
        .lean();

      const sameQuiz = existingQuestions.filter(
        (question) =>
          String(question.quiz) === String(attempt.quiz)
      ).length;

      console.log("\nAttempt ID:", String(attempt._id));
      console.log("Quiz:", quiz?.title || "QUIZ NOT FOUND");
      console.log("Configured Total Marks:", quiz?.totalMarks ?? "N/A");
      console.log("Stored Total Marks:", attempt.totalMarks);
      console.log("Answer Records:", answerIds.length);
      console.log("Question IDs Found:", existingQuestions.length);
      console.log("Questions Belonging to This Quiz:", sameQuiz);
    }
  } catch (error) {
    console.error("Audit failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

auditAttempts();