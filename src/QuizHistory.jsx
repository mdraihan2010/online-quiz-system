import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Search,
  Target,
  Trophy,
  XCircle,
  RefreshCw,
  ArrowRight,
  ClipboardCheck,
  Eye,
  AlertCircle,
} from "lucide-react";

import api from "./services/api";

function QuizHistory() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Results");

  const [quizHistory, setQuizHistory] = useState([]);

  const [statistics, setStatistics] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    passedAttempts: 0,
    failedAttempts: 0,
    passRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real quiz history from the backend.
  const fetchQuizHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/attempts/history");

      const payload = response.data?.data;

      if (!payload) {
        throw new Error(
          "Quiz history data was not returned by the server."
        );
      }

      const history = Array.isArray(payload.history)
        ? payload.history
        : [];

      const stats = payload.statistics || {};

      setQuizHistory(history);

      setStatistics({
        totalAttempts: Number(stats.totalAttempts) || 0,
        averageScore: Number(stats.averageScore) || 0,
        bestScore: Number(stats.bestScore) || 0,
        passedAttempts: Number(stats.passedAttempts) || 0,
        failedAttempts: Number(stats.failedAttempts) || 0,
        passRate: Number(stats.passRate) || 0,
      });
    } catch (err) {
      console.error("Failed to fetch quiz history:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired or you are not logged in. Please log in again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load quiz history. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  // Read the logged-in user's information.
  const user = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  // Generate category options dynamically.
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        quizHistory
          .map((quiz) => quiz.category)
          .filter(Boolean)
      ),
    ];

    return uniqueCategories.sort((a, b) =>
      a.localeCompare(b)
    );
  }, [quizHistory]);

  // Search and filter quiz attempts.
  const filteredQuizzes = useMemo(() => {
    return quizHistory.filter((quiz) => {
      const quizTitle = (quiz.title || "").toLowerCase();

      const matchesSearch = quizTitle.includes(
        search.trim().toLowerCase()
      );

      const matchesCategory =
        category === "All Categories" ||
        quiz.category === category;

      const quizStatus = quiz.isPassed ? "Passed" : "Failed";

      const matchesStatus =
        status === "All Results" ||
        quizStatus === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [quizHistory, search, category, status]);

  // Format date and time.
  const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Convert seconds into a readable duration.
  const formatDuration = (seconds) => {
    const totalSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  };

  // Format percentages without unnecessary decimal places.
  const formatPercentage = (value) => {
    const number = Number(value) || 0;

    return `${Number(number.toFixed(2))}%`;
  };

  // Statistics cards.
  const statisticCards = [
    {
      title: "Total Attempts",
      value: statistics.totalAttempts,
      subtitle: "Completed quizzes",
      icon: Activity,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
    },
    {
      title: "Average Score",
      value: formatPercentage(statistics.averageScore),
      subtitle: "Across all attempts",
      icon: BarChart3,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    {
      title: "Best Score",
      value: formatPercentage(statistics.bestScore),
      subtitle: "Your highest score",
      icon: Trophy,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-500/10",
    },
    {
      title: "Pass Rate",
      value: formatPercentage(statistics.passRate),
      subtitle: `${statistics.passedAttempts} passed · ${statistics.failedAttempts} failed`,
      icon: Target,
      iconColor: "text-green-400",
      iconBg: "bg-green-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link
            to="/"
            className="shrink-0 text-2xl font-bold"
          >
            <span className="text-white">Quiz</span>
            <span className="text-purple-500">Master</span>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex lg:gap-8">
            <Link
              to="/dashboard"
              className="transition hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              to="/quizzes"
              className="transition hover:text-white"
            >
              Quizzes
            </Link>

            <Link
              to="/quiz-history"
              className="text-white"
            >
              History
            </Link>

            <Link
              to="/leaderboard"
              className="transition hover:text-white"
            >
              Leaderboard
            </Link>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-3"
            aria-label="View profile"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.name || "Student"}
              </p>

              <p className="text-xs text-slate-500">
                {user.role || "Student"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold">
              {(user.name || "S")
                .charAt(0)
                .toUpperCase()}
            </div>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wider text-purple-400">
              QUIZ ACTIVITY
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Quiz History
            </h1>

            <p className="mt-3 text-slate-400">
              Track your previous quiz attempts and performance.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchQuizHistory}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh History
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statisticCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">
                    {card.title}
                  </p>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
                  >
                    <Icon
                      size={20}
                      className={card.iconColor}
                    />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold">
                  {loading ? (
                    <span className="text-slate-600">
                      —
                    </span>
                  ) : (
                    card.value
                  )}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {loading
                    ? "Loading statistics..."
                    : card.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="flex-1">
              <label
                htmlFor="quiz-search"
                className="mb-2 block text-sm text-slate-400"
              >
                Search Quiz
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="quiz-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by quiz name..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category */}
            <div className="lg:w-56">
              <label
                htmlFor="quiz-category"
                className="mb-2 block text-sm text-slate-400"
              >
                Category
              </label>

              <select
                id="quiz-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
              >
                <option value="All Categories">
                  All Categories
                </option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Result status */}
            <div className="lg:w-48">
              <label
                htmlFor="quiz-status"
                className="mb-2 block text-sm text-slate-400"
              >
                Result
              </label>

              <select
                id="quiz-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
              >
                <option value="All Results">
                  All Results
                </option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </section>

        {/* History List */}
        <section className="mt-8">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">
                Previous Attempts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading your attempts..."
                  : `${filteredQuizzes.length} ${
                      filteredQuizzes.length === 1
                        ? "attempt"
                        : "attempts"
                    } found`}
              </p>
            </div>

            {!loading && !error && quizHistory.length > 0 && (
              <span className="text-xs text-slate-500">
                Showing completed quizzes
              </span>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
              <LoaderCircle
                size={36}
                className="mx-auto animate-spin text-purple-400"
              />

              <p className="mt-4 text-slate-300">
                Loading quiz history...
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Please wait while we fetch your attempts.
              </p>
            </div>
          ) : error ? (
            /* Error */
            <div className="rounded-2xl border border-red-900/50 bg-slate-900 p-8 text-center sm:p-12">
              <AlertCircle
                size={40}
                className="mx-auto text-red-400"
              />

              <h3 className="mt-4 text-lg font-semibold">
                Unable to Load History
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
                {error}
              </p>

              {error.toLowerCase().includes("log in") && (
                <Link
                  to="/login"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium transition hover:bg-purple-700"
                >
                  Log In
                  <ArrowRight size={16} />
                </Link>
              )}

              <button
                type="button"
                onClick={fetchQuizHistory}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium transition hover:bg-purple-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          ) : filteredQuizzes.length > 0 ? (
            /* Attempts */
            <div className="space-y-4">
              {filteredQuizzes.map((quiz, index) => {
                const passed = Boolean(quiz.isPassed);

                const percentage =
                  Number(quiz.percentage) || 0;

                const attemptId =
                  quiz.attemptId || quiz._id;

                const resultPath = attemptId
                  ? `/result?attemptId=${encodeURIComponent(
                      attemptId
                    )}`
                  : "/quiz-history";

                const reviewPath = attemptId
                  ? `/review-answers?attemptId=${encodeURIComponent(
                      attemptId
                    )}`
                  : "/quiz-history";

                return (
                  <div
                    key={attemptId || `${quiz.title}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
                      {/* Quiz information */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                          <span className="text-xl">
                            📝
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-semibold">
                            {quiz.title || "Untitled Quiz"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {quiz.category || "General"}
                            {" · "}
                            {(
                              quiz.difficulty || "easy"
                            )
                              .charAt(0)
                              .toUpperCase() +
                              (
                                quiz.difficulty || "easy"
                              ).slice(1)}
                          </p>

                          <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays size={14} />
                            {formatDate(quiz.submittedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Score and status */}
                      <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            Score
                          </p>

                          <p
                            className={`mt-1 text-xl font-bold ${
                              passed
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatPercentage(percentage)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {quiz.score ?? 0} /{" "}
                            {quiz.totalMarks ?? 0} marks
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Time Taken
                          </p>

                          <p className="mt-1 flex items-center gap-2 font-semibold">
                            <Clock3
                              size={15}
                              className="text-slate-400"
                            />
                            {formatDuration(
                              quiz.timeTakenSeconds
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Duration
                          </p>

                          <p className="mt-1 font-semibold">
                            {quiz.duration ?? 0} min
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                            passed
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}

                          {passed ? "Passed" : "Failed"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                          to={resultPath}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium transition hover:bg-purple-700"
                        >
                          <Eye size={16} />
                          View Result
                        </Link>

                        <Link
                          to={reviewPath}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium transition hover:border-purple-500 hover:bg-slate-800"
                        >
                          <ClipboardCheck size={16} />
                          Review Answers
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
                {quizHistory.length === 0 ? (
                  <Award
                    size={32}
                    className="text-purple-400"
                  />
                ) : (
                  <Search
                    size={32}
                    className="text-purple-400"
                  />
                )}
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {quizHistory.length === 0
                  ? "No Quiz History Yet"
                  : "No Matching Quizzes"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {quizHistory.length === 0
                  ? "You have not completed any quizzes yet. Start a quiz to see your results here."
                  : "Try changing your search keyword or filters."}
              </p>

              {quizHistory.length === 0 ? (
                <Link
                  to="/quizzes"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium transition hover:bg-purple-700"
                >
                  Explore Quizzes
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All Categories");
                    setStatus("All Results");
                  }}
                  className="mt-6 rounded-lg bg-slate-800 px-5 py-3 text-sm font-medium transition hover:bg-slate-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* Helpful note */}
        {!loading && !error && quizHistory.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-green-400"
            />

            <p className="text-sm text-slate-400">
              Your history and statistics are loaded from your
              account. Only completed quiz attempts are shown here.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row">
          <div className="text-lg font-bold">
            <span className="text-white">Quiz</span>
            <span className="text-purple-500">Master</span>
          </div>

          <p className="text-center text-sm text-slate-500">
            © 2026 QuizMaster. All rights reserved.
          </p>

          <Link
            to="/quizzes"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Explore Quizzes
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default QuizHistory;