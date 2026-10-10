import { Link, useParams } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";

function AdminResultDetails() {
  const { id } = useParams();

  // ========================================
  // SAMPLE RESULT DATA
  // ========================================

  const results = [
    {
      id: "1",
      user: "Raihan Ahmed",
      email: "raihan@example.com",
      quiz: "JavaScript Fundamentals",
      date: "Oct 9, 2026",
      status: "Passed",
      timeSpent: "12m 35s",

      questions: [
        {
          id: 1,
          question:
            "Which keyword is used to declare a variable in JavaScript?",
          userAnswer: "let",
          correctAnswer: "let",
          marks: 1,
          earnedMarks: 1,
          isCorrect: true,
        },
        {
          id: 2,
          question:
            "Which method is used to add an element to the end of an array?",
          userAnswer: "push()",
          correctAnswer: "push()",
          marks: 1,
          earnedMarks: 1,
          isCorrect: true,
        },
        {
          id: 3,
          question:
            "Which keyword is used to define a constant variable?",
          userAnswer: "var",
          correctAnswer: "const",
          marks: 1,
          earnedMarks: 0,
          isCorrect: false,
        },
        {
          id: 4,
          question:
            "Which method removes the last element from an array?",
          userAnswer: "pop()",
          correctAnswer: "pop()",
          marks: 1,
          earnedMarks: 1,
          isCorrect: true,
        },
        {
          id: 5,
          question:
            "Which symbol is used for strict equality in JavaScript?",
          userAnswer: "===",
          correctAnswer: "===",
          marks: 1,
          earnedMarks: 1,
          isCorrect: true,
        },
        {
          id: 6,
          question:
            "Which function converts JSON text into a JavaScript object?",
          userAnswer: "JSON.parse()",
          correctAnswer: "JSON.parse()",
          marks: 1,
          earnedMarks: 1,
          isCorrect: true,
        },
        {
          id: 7,
          question:
            "Which keyword is used to create a function?",
          userAnswer: "function",
          correctAnswer: "function",
          marks: 1,
          earnedMarks: 1,
          isCorrect: true,
        },
        {
          id: 8,
          question:
            "Which method joins array elements into a string?",
          userAnswer: "join()",
          correctAnswer: "join()",
          marks: 1,
          earnedMarks: 1,
          isCorrect: true,
        },
        {
          id: 9,
          question:
            "Which keyword refers to the current object?",
          userAnswer: "this",
          correctAnswer: "this",
          marks: 1,
          earnedMarks: 1,
          isCorrect: true,
        },
        {
          id: 10,
          question:
            "Which method creates a new array from an existing array?",
          userAnswer: "forEach()",
          correctAnswer: "map()",
          marks: 1,
          earnedMarks: 0,
          isCorrect: false,
        },
      ],
    },
  ];

  // ========================================
  // FIND RESULT BY ID
  // ========================================

  const result = results.find(
    (item) => item.id === id
  );

  // ========================================
  // RESULT NOT FOUND
  // ========================================

  if (!result) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">

        <div className="flex min-h-screen flex-col lg:flex-row">

          <AdminSidebar />

          <div className="flex w-full min-w-0 flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">

            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

              <div className="text-5xl">
                🔍
              </div>

              <h1 className="mt-5 text-2xl font-bold">
                Result Not Found
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                The result you are looking for does not exist.
              </p>

              <Link
                to="/admin/results"
                className="mt-6 inline-block rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium transition hover:bg-purple-700"
              >
                ← Back to Results
              </Link>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ========================================
  // CALCULATE PERFORMANCE
  // ========================================

  const totalMarks = result.questions.reduce(
    (total, question) =>
      total + question.marks,
    0
  );

  const earnedMarks = result.questions.reduce(
    (total, question) =>
      total + question.earnedMarks,
    0
  );

  const correctAnswers = result.questions.filter(
    (question) => question.isCorrect
  ).length;

  const wrongAnswers = result.questions.filter(
    (question) =>
      !question.isCorrect &&
      question.userAnswer
  ).length;

  const unansweredQuestions = result.questions.filter(
    (question) =>
      !question.userAnswer
  ).length;

  const percentage =
    totalMarks > 0
      ? Math.round(
          (earnedMarks / totalMarks) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* ========================================
            REUSABLE ADMIN SIDEBAR
        ======================================== */}

        <AdminSidebar />


        {/* ========================================
            MAIN AREA
        ======================================== */}

        <div className="w-full min-w-0 flex-1">

          {/* ========================================
              HEADER
          ======================================== */}

          <header className="border-b border-slate-800 bg-slate-950">

            <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">

              <div className="min-w-0">

                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  Result Details
                </h1>

                <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                  Review final quiz result and performance
                </p>

              </div>

              <Link
                to="/admin/results"
                className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
              >
                ← Back
              </Link>

            </div>

          </header>


          {/* ========================================
              MAIN CONTENT
          ======================================== */}

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

            {/* ========================================
                USER + QUIZ INFORMATION
            ======================================== */}

            <section className="grid gap-5 lg:grid-cols-2">

              {/* User Information */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <h2 className="text-lg font-semibold">
                  User Information
                </h2>

                <div className="mt-5 flex items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-600 text-lg font-semibold">
                    {result.user.charAt(0)}
                  </div>

                  <div className="min-w-0">

                    <p className="font-semibold">
                      {result.user}
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-500">
                      {result.email}
                    </p>

                  </div>

                </div>

              </div>


              {/* Quiz Information */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <h2 className="text-lg font-semibold">
                  Quiz Information
                </h2>

                <div className="mt-5 space-y-4">

                  <div className="flex items-start justify-between gap-5">

                    <span className="text-sm text-slate-500">
                      Quiz
                    </span>

                    <span className="max-w-[65%] text-right text-sm font-medium">
                      {result.quiz}
                    </span>

                  </div>

                  <div className="flex items-center justify-between gap-5">

                    <span className="text-sm text-slate-500">
                      Result Date
                    </span>

                    <span className="text-right text-sm">
                      {result.date}
                    </span>

                  </div>

                  <div className="flex items-center justify-between gap-5">

                    <span className="text-sm text-slate-500">
                      Status
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        result.status === "Passed"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {result.status}
                    </span>

                  </div>

                </div>

              </div>

            </section>


            {/* ========================================
                PERFORMANCE SUMMARY
            ======================================== */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Score */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <p className="text-sm text-slate-500">
                  Score
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-400">
                  {earnedMarks}/{totalMarks}
                </p>

              </div>


              {/* Percentage */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <p className="text-sm text-slate-500">
                  Percentage
                </p>

                <p
                  className={`mt-2 text-3xl font-bold ${
                    percentage >= 80
                      ? "text-green-400"
                      : percentage >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {percentage}%
                </p>

              </div>


              {/* Time Spent */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <p className="text-sm text-slate-500">
                  Time Spent
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {result.timeSpent}
                </p>

              </div>


              {/* Questions */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <p className="text-sm text-slate-500">
                  Questions
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {result.questions.length}
                </p>

              </div>

            </section>


            {/* ========================================
                ANSWER SUMMARY
            ======================================== */}

            <section className="mt-6 grid gap-4 sm:grid-cols-3">

              {/* Correct */}

              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">

                <p className="text-sm text-slate-400">
                  Correct Answers
                </p>

                <p className="mt-2 text-2xl font-bold text-green-400">
                  {correctAnswers}
                </p>

              </div>


              {/* Wrong */}

              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">

                <p className="text-sm text-slate-400">
                  Wrong Answers
                </p>

                <p className="mt-2 text-2xl font-bold text-red-400">
                  {wrongAnswers}
                </p>

              </div>


              {/* Unanswered */}

              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                <p className="text-sm text-slate-400">
                  Unanswered
                </p>

                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  {unansweredQuestions}
                </p>

              </div>

            </section>


            {/* ========================================
                QUESTION-WISE RESULT
            ======================================== */}

            <section className="mt-8">

              <div className="mb-5">

                <h2 className="text-2xl font-bold">
                  Question-wise Result
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review the user's answers and correct answers.
                </p>

              </div>


              <div className="space-y-4">

                {result.questions.map(
                  (question, index) => {

                    const isUnanswered =
                      !question.userAnswer;

                    return (
                      <div
                        key={question.id}
                        className={`rounded-2xl border p-5 sm:p-6 ${
                          isUnanswered
                            ? "border-yellow-500/20 bg-yellow-500/5"
                            : question.isCorrect
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-red-500/20 bg-red-500/5"
                        }`}
                      >

                        {/* Question Header */}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          <div className="flex min-w-0 gap-4">

                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                                isUnanswered
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : question.isCorrect
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div className="min-w-0">

                              <p className="font-medium leading-relaxed">
                                {question.question}
                              </p>

                            </div>

                          </div>


                          {/* Result Badge */}

                          <span
                            className={`self-start shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                              isUnanswered
                                ? "bg-yellow-500/10 text-yellow-400"
                                : question.isCorrect
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {isUnanswered
                              ? "Not Answered"
                              : question.isCorrect
                              ? "✓ Correct"
                              : "✕ Wrong"}
                          </span>

                        </div>


                        {/* Answers */}

                        <div className="mt-5 grid gap-4 md:grid-cols-2">

                          {/* User Answer */}

                          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">

                            <p className="text-xs text-slate-500">
                              User Answer
                            </p>

                            <p
                              className={`mt-2 break-words text-sm font-medium ${
                                isUnanswered
                                  ? "text-yellow-400"
                                  : question.isCorrect
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {question.userAnswer ||
                                "Not Answered"}
                            </p>

                          </div>


                          {/* Correct Answer */}

                          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">

                            <p className="text-xs text-slate-500">
                              Correct Answer
                            </p>

                            <p className="mt-2 break-words text-sm font-medium text-green-400">
                              {question.correctAnswer}
                            </p>

                          </div>

                        </div>


                        {/* Marks */}

                        <div className="mt-4 border-t border-slate-800 pt-4">

                          <p className="text-xs text-slate-500">

                            Marks:{" "}

                            <span className="font-medium text-slate-300">
                              {question.earnedMarks}/
                              {question.marks}
                            </span>

                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>


            {/* ========================================
                BOTTOM ACTION
            ======================================== */}

            <div className="mt-8 flex justify-start sm:justify-end">

              <Link
                to="/admin/results"
                className="w-full rounded-lg bg-purple-600 px-5 py-3 text-center text-sm font-semibold transition hover:bg-purple-700 sm:w-auto"
              >
                ← Back to Results
              </Link>

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}

export default AdminResultDetails;