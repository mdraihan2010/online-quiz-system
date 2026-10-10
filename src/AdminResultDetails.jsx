
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

function AdminResultDetails() {
  const { id } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchResult = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/admin/results/${encodeURIComponent(id)}`
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to load result."
          );
        }

        if (active) {
          setResult(response.data.data.result);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load result details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchResult();

    return () => {
      active = false;
    };
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "N/A"
      : parsed.toLocaleString();
  };

  const formatTime = (seconds) => {
    const value = Number(seconds);

    if (!Number.isFinite(value) || value < 0) return "N/A";

    const minutes = Math.floor(value / 60);
    const remainingSeconds = value % 60;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderPageMessage = (title, message) => (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-3 break-words text-sm text-slate-400">
              {message}
            </p>

            <Link
              to="/admin/results"
              className="mt-6 inline-block rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium hover:bg-purple-700"
            >
              ← Back to Results
            </Link>
          </div>
        </main>
      </div>
    </div>
  );

  if (loading) {
    return renderPageMessage(
      "Loading Result...",
      "Fetching result details from the database."
    );
  }

  if (error || !result) {
    return renderPageMessage(
      "Result Not Found",
      error || "The requested result could not be found."
    );
  }

  const questions = Array.isArray(result.questions)
    ? result.questions
    : [];

  const totalMarks = Number(result.totalMarks) || 0;
  const earnedMarks = Number(result.score) || 0;

  const percentage =
    Number.isFinite(Number(result.percentage))
      ? Number(result.percentage)
      : totalMarks > 0
        ? Math.round((earnedMarks / totalMarks) * 100)
        : 0;

  const correctAnswers = questions.filter(
    (question) => question.isCorrect
  ).length;

  const wrongAnswers = questions.filter(
    (question) =>
      question.selectedOption !== null &&
      question.selectedOption !== undefined &&
      !question.isCorrect
  ).length;

  const unansweredQuestions = questions.filter(
    (question) =>
      question.selectedOption === null ||
      question.selectedOption === undefined
  ).length;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <div className="w-full min-w-0 flex-1">
          <header className="border-b border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>
                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  Result Details
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Review quiz performance and submitted answers.
                </p>
              </div>

              <Link
                to="/admin/results"
                className="shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                ← Back
              </Link>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <h2 className="text-lg font-semibold">
                  User Information
                </h2>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-lg font-semibold">
                    {(result.user || "U").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold">
                      {result.user || "Unknown User"}
                    </p>
                    <p className="mt-1 break-all text-sm text-slate-500">
                      {result.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <h2 className="text-lg font-semibold">
                  Quiz Information
                </h2>

                <div className="mt-5 space-y-4">
                  <InfoRow label="Quiz" value={result.quiz} />
                  <InfoRow
                    label="Result Date"
                    value={formatDate(result.date)}
                  />

                  <div className="flex items-center justify-between gap-4">
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

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Score"
                value={`${earnedMarks}/${totalMarks}`}
                color="text-purple-400"
              />
              <StatCard
                label="Percentage"
                value={`${percentage}%`}
                color={
                  percentage >= 60
                    ? "text-green-400"
                    : "text-red-400"
                }
              />
              <StatCard
                label="Time Spent"
                value={formatTime(result.timeTakenSeconds)}
              />
              <StatCard
                label="Questions"
                value={questions.length}
              />
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Correct Answers"
                value={correctAnswers}
                color="text-green-400"
              />
              <StatCard
                label="Wrong Answers"
                value={wrongAnswers}
                color="text-red-400"
              />
              <StatCard
                label="Unanswered"
                value={unansweredQuestions}
                color="text-yellow-400"
              />
            </section>

            <section className="mt-8">
              <div className="mb-5">
                <h2 className="text-2xl font-bold">
                  Question-wise Result
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review saved answers and correct answers.
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">
                  Question snapshots are not available for this attempt.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const unanswered =
                      question.selectedOption === null ||
                      question.selectedOption === undefined;

                    const isCorrect = question.isCorrect;

                    const statusClass = unanswered
                      ? "border-yellow-500/20 bg-yellow-500/5"
                      : isCorrect
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-red-500/20 bg-red-500/5";

                    const selectedOption = unanswered
                      ? "Not Answered"
                      : question.options?.[question.selectedOption] ??
                        `Option ${question.selectedOption + 1}`;

                    const correctAnswer =
                      question.options?.[question.correctAnswer] ??
                      `Option ${question.correctAnswer + 1}`;

                    return (
                      <article
                        key={question.id || `${index}`}
                        className={`rounded-2xl border p-5 sm:p-6 ${statusClass}`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold">
                              {index + 1}
                            </div>

                            <p className="font-medium leading-relaxed">
                              {question.question}
                            </p>
                          </div>

                          <span className="shrink-0 self-start rounded-full bg-slate-800 px-3 py-1 text-xs font-medium">
                            {unanswered
                              ? "Not Answered"
                              : isCorrect
                                ? "✓ Correct"
                                : "✕ Wrong"}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <AnswerCard
                            label="User Answer"
                            value={selectedOption}
                            color={
                              unanswered
                                ? "text-yellow-400"
                                : isCorrect
                                  ? "text-green-400"
                                  : "text-red-400"
                            }
                          />

                          <AnswerCard
                            label="Correct Answer"
                            value={correctAnswer}
                            color="text-green-400"
                          />
                        </div>

                        <div className="mt-4 border-t border-slate-800 pt-4">
                          <p className="text-xs text-slate-500">
                            Marks:{" "}
                            <span className="font-medium text-slate-300">
                              {question.earnedMarks}/{question.marks}
                            </span>
                          </p>

                          {question.explanation && (
                            <p className="mt-3 text-sm text-slate-400">
                              Explanation: {question.explanation}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="mt-8 flex justify-start sm:justify-end">
              <Link
                to="/admin/results"
                className="w-full rounded-lg bg-purple-600 px-5 py-3 text-center text-sm font-semibold hover:bg-purple-700 sm:w-auto"
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[65%] break-words text-right text-sm font-medium">
        {value || "N/A"}
      </span>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function AnswerCard({ label, value, color }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-sm font-medium ${color}`}>
        {value}
      </p>
    </div>
  );
}

export default AdminResultDetails;
