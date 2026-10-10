require("dotenv").config();

const mongoose = require("mongoose");
const Attempt = require("./models/Attempt");

async function checkLatestAttempt() {
  try {
    const uri =
      process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) throw new Error("MongoDB URI not found");

    await mongoose.connect(uri);

    const attempt = await Attempt.findOne({
      status: "completed",
    })
      .sort({ submittedAt: -1 })
      .select(
        "quiz score totalMarks percentage isPassed quizSnapshot questionSnapshots answers submittedAt"
      )
      .lean();

    if (!attempt) {
      console.log("No completed attempt found.");
      return;
    }

    console.log("\n===== LATEST ATTEMPT =====");
    console.log("Attempt ID:", attempt._id);
    console.log("Score:", attempt.score);
    console.log("Total Marks:", attempt.totalMarks);
    console.log("Percentage:", attempt.percentage);
    console.log("Passed:", attempt.isPassed);
    console.log(
      "Quiz Snapshot:",
      Boolean(attempt.quizSnapshot)
    );
    console.log(
      "Question Snapshots:",
      attempt.questionSnapshots?.length ?? 0
    );
    console.log(
      "Saved Answers:",
      attempt.answers?.length ?? 0
    );
    console.log("==========================\n");
  } catch (error) {
    console.error("Audit failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkLatestAttempt();