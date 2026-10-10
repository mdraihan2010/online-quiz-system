import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Users,
  ClipboardList,
  BarChart3,
  Target,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowRight,
  BookOpen,
  TrendingUp,
} from "lucide-react";

import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

// ========================================
// HELPER FUNCTIONS
// ========================================

function formatPercentage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0%";
  }

  return `${Number(number.toFixed(2))}%`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

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
}

function formatRelativeTime(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  const difference = Math.max(0, Date.now() - date.getTime());

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return formatDate(dateValue);
}

function getUserName(user) {
  if (!user) {
    return "Unknown User";
  }

  if (typeof user === "string") {
    return user;
  }

  return (
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    "Unknown User"
  );
}

function getQuizTitle(quiz) {
  if (!quiz) {
    return "Unknown Quiz";
  }

  if (typeof quiz === "string") {
    return quiz;
  }

  return quiz.title || quiz.name || "Untitled Quiz";
}

function formatMonth(month) {
  const monthNumber = Number(month);

  if (
    Number.isInteger(monthNumber) &&
    monthNumber >= 1 &&
    monthNumber <= 12
  ) {
    return new Date(2000, monthNumber - 1, 1).toLocaleString(
      "en-US",
      { month: "short" }
    );
  }

  return String(month);
}

// ========================================
// ADMIN ANALYTICS COMPONENT
// ========================================

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH ANALYTICS FROM BACKEND
  // GET /api/v1/admin/analytics
  // ========================================

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/analytics");

      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          "The server returned an invalid analytics response."
        );
      }

      setAnalytics(response.data.data);
    } catch (err) {
      console.error("Failed to fetch admin analytics:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Only an administrator can view analytics."
        );
      } else if (err.response?.status === 404) {
        setError("The Admin Analytics API endpoint was not found.");
      } else if (!err.response) {
        setError(
          "Cannot connect to the server. Please check whether the backend is running."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load analytics. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ========================================
  // ADMIN INFORMATION
  // ========================================

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  // ========================================
  // OVERVIEW STATISTICS
  // ========================================

  const overview = useMemo(() => {
    const source = analytics?.overview || {};

    return {
      totalUsers: Number(source.totalUsers) || 0,
      activeUsers: Number(source.activeUsers) || 0,
      totalQuizzes: Number(source.totalQuizzes) || 0,
      publishedQuizzes: Number(source.publishedQuizzes) || 0,
      totalAttempts: Number(source.totalAttempts) || 0,
      completedAttempts: Number(source.completedAttempts) || 0,
      averageScore: Number(source.averageScore) || 0,
      passRate: Number(source.passRate) || 0,
    };
  }, [analytics]);

  // ========================================
  // QUIZ PERFORMANCE
  // ========================================

  const quizPerformance = useMemo(() => {
    const items = analytics?.quizPerformance || [];

    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item, index) => ({
      id: item.quizId || item._id || item.id || index,
      quiz: getQuizTitle(item.quiz || item),
      category: item.category || "Uncategorized",
      difficulty: item.difficulty || "medium",
      isPublished: Boolean(item.isPublished),
      attempts: Number(item.totalAttempts ?? item.attempts) || 0,
      completedAttempts: Number(item.completedAttempts) || 0,

      // Backend sends averagePercentage
      averageScore:
        Number(item.averagePercentage ?? item.averageScore) || 0,

      // The current API does not provide per-quiz passRate.
      passRate:
        item.passRate !== undefined
          ? Number(item.passRate) || 0
          : null,
    }));
  }, [analytics]);

  // ========================================
  // RECENT ACTIVITY
  // ========================================

  const recentActivity = useMemo(() => {
    const items = analytics?.recentActivity || [];

    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item, index) => {
      const score = Number(item.score) || 0;
      const totalMarks = Number(item.totalMarks) || 0;

      const percentage =
        item.percentage !== undefined
          ? Number(item.percentage) || 0
          : totalMarks > 0
            ? (score / totalMarks) * 100
            : 0;

      const attemptId = item._id || item.attemptId || item.id;

      return {
        id: attemptId || index,
        attemptId,
        user: getUserName(item.user),
        quiz: getQuizTitle(item.quiz || item.quizTitle),
        status: item.status || "completed",
        score,
        totalMarks,
        percentage,
        isPassed: Boolean(item.isPassed),
        submittedAt:
          item.submittedAt ||
          item.completedAt ||
          item.createdAt ||
          item.startedAt,
      };
    });
  }, [analytics]);

  // ========================================
  // MONTHLY ATTEMPTS
  // ========================================

  const monthlyAttempts = useMemo(() => {
    const items = analytics?.monthlyAttempts || [];

    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item, index) => ({
      month: formatMonth(item.month || index + 1),
      attempts: Number(item.attempts ?? item.count) || 0,
    }));
  }, [analytics]);

  const maxAttempts = Math.max(
    1,
    ...monthlyAttempts.map((item) => item.attempts)
  );

  // ========================================
  // STATISTIC CARDS
  // ========================================

  const statisticCards = [
    {
      title: "Total Users",
      value: overview.totalUsers.toLocaleString(),
      description: `${overview.activeUsers} active accounts`,
      icon: Users,
      color: "text-purple-400",
      background: "bg-purple-500/10",
    },
    {
      title: "Total Quizzes",
      value: overview.totalQuizzes.toLocaleString(),
      description: `${overview.publishedQuizzes} published`,
      icon: ClipboardList,
      color: "text-blue-400",
      background: "bg-blue-500/10",
    },
    {
      title: "Total Attempts",
      value: overview.totalAttempts.toLocaleString(),
      description: `${overview.completedAttempts} completed`,
      icon: Activity,
      color: "text-yellow-400",
      background: "bg-yellow-500/10",
    },
    {
      title: "Average Score",
      value: formatPercentage(overview.averageScore),
      description: "Average of completed attempts",
      icon: BarChart3,
      color: "text-green-400",
      background: "bg-green-500/10",
    },
    {
      title: "Pass Rate",
      value: formatPercentage(overview.passRate),
      description: "Percentage of passed attempts",
      icon: Target,
      color: "text-emerald-400",
      background: "bg-emerald-500/10",
    },
  ];

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <div className="w-full min-w-0 flex-1">
          {/* Header */}
          <header className="border-b border-slate-800">
            <div className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  Analytics
                </h1>
              </div>

              <div className="ml-4 flex shrink-0 items-center gap-3 sm:gap-4">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">
                    {user.name || "Administrator"}
                  </p>

                  <p className="text-xs capitalize text-slate-500">
                    {user.role || "Admin"}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold sm:h-11 sm:w-11">
                  {(user.name || "A").charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {/* Page Heading */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Quiz Analytics
                </h2>

                <p className="mt-2 text-sm text-slate-400 sm:text-base">
                  Monitor quiz performance, user activity and overall
                  platform statistics.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchAnalytics}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh Analytics
              </button>
            </div>

            {/* Loading State */}
            {loading && !analytics && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
                <LoaderCircle
                  size={22}
                  className="animate-spin text-purple-400"
                />
                <span>Loading analytics from the server...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={22}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <div className="min-w-0">
                    <h3 className="font-semibold text-amber-300">
                      Analytics Data Unavailable
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={fetchAnalytics}
                      disabled={loading}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      <RefreshCw size={15} />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Overview Cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {statisticCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 sm:p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-500">
                        {card.title}
                      </p>

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.background}`}
                      >
                        <Icon size={20} className={card.color} />
                      </div>
                    </div>

                    <p className="mt-4 text-3xl font-bold">
                      {loading && !analytics ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        card.value
                      )}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* Monthly Attempts */}
            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp
                    size={22}
                    className="text-purple-400"
                  />

                  <h2 className="text-xl font-bold">
                    Quiz Attempts Overview
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Monthly completed attempts for the current year.
                </p>
              </div>

              {monthlyAttempts.length > 0 ? (
                <div className="flex h-72 items-end gap-3 overflow-x-auto pb-2 sm:gap-4">
                  {monthlyAttempts.map((item) => {
                    const height =
                      item.attempts > 0
                        ? Math.max(
                            4,
                            (item.attempts / maxAttempts) * 100
                          )
                        : 0;

                    return (
                      <div
                        key={item.month}
                        className="flex h-full min-w-[60px] flex-1 flex-col items-center justify-end gap-3"
                      >
                        <span className="text-xs font-medium text-slate-400">
                          {item.attempts}
                        </span>

                        <div className="flex h-52 w-full max-w-16 items-end">
                          <div
                            className={`w-full rounded-t-lg transition ${
                              item.attempts > 0
                                ? "bg-purple-600 hover:bg-purple-500"
                                : "bg-slate-800"
                            }`}
                            style={{ height: `${height}%` }}
                            title={`${item.month}: ${item.attempts} attempts`}
                          />
                        </div>

                        <span className="text-xs text-slate-500">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">
                  <BarChart3
                    size={32}
                    className="mx-auto text-slate-600"
                  />

                  <p className="mt-3 font-medium text-slate-300">
                    No monthly analytics available
                  </p>
                </div>
              )}
            </section>

            {/* Quiz Performance */}
            <section className="mt-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold">
                  Quiz Performance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Performance overview of individual quizzes.
                </p>
              </div>

              {quizPerformance.length > 0 ? (
                <div className="space-y-4">
                  {quizPerformance.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        {/* Quiz Information */}
                        <div className="min-w-0 lg:w-1/4">
                          <p className="text-xs text-slate-500">
                            Quiz
                          </p>

                          <p className="mt-1 break-words font-semibold">
                            {quiz.quiz}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {quiz.category} · {quiz.difficulty}
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs ${
                              quiz.isPublished
                                ? "bg-green-500/10 text-green-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {quiz.isPublished
                              ? "Published"
                              : "Unpublished"}
                          </span>
                        </div>

                        {/* Attempts */}
                        <div className="lg:w-1/6">
                          <p className="text-xs text-slate-500">
                            Total Attempts
                          </p>

                          <p className="mt-1 font-semibold text-purple-400">
                            {quiz.attempts}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {quiz.completedAttempts} completed
                          </p>
                        </div>

                        {/* Average Score */}
                        <div className="lg:w-1/4">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs text-slate-500">
                              Average Score
                            </p>

                            <p className="text-sm font-semibold">
                              {formatPercentage(quiz.averageScore)}
                            </p>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-purple-600"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, quiz.averageScore)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Per-Quiz Pass Rate */}
                        <div className="lg:w-1/4">
                          <p className="text-xs text-slate-500">
                            Pass Rate
                          </p>

                          {quiz.passRate !== null ? (
                            <>
                              <p className="mt-1 text-sm font-semibold text-green-400">
                                {formatPercentage(quiz.passRate)}
                              </p>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                                <div
                                  className="h-full rounded-full bg-green-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(0, quiz.passRate)
                                    )}%`,
                                  }}
                                />
                              </div>
                            </>
                          ) : (
                            <p className="mt-1 text-sm text-slate-500">
                              Not provided by API
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                  <ClipboardList
                    size={32}
                    className="mx-auto text-slate-600"
                  />

                  <p className="mt-3 font-medium text-slate-300">
                    No quiz performance data available
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Quiz-level analytics will appear here when attempts
                    are available.
                  </p>
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section className="mt-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest quiz attempts from users.
                </p>
              </div>

              {recentActivity.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                        index !== recentActivity.length - 1
                          ? "border-b border-slate-800"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 font-semibold">
                          {activity.user.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {activity.user}
                          </p>

                          <p className="mt-1 break-words text-sm text-slate-500">
                            {activity.status === "completed"
                              ? "Completed"
                              : `Status: ${activity.status}`}{" "}
                            {activity.quiz}
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <Clock3 size={13} />
                            {formatRelativeTime(activity.submittedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 sm:shrink-0">
                        <div>
                          <p className="text-xs text-slate-500">
                            Score
                          </p>

                          <p className="mt-1 font-semibold text-purple-400">
                            {activity.score} / {activity.totalMarks}
                          </p>

                          <p className="text-xs text-slate-500">
                            {formatPercentage(activity.percentage)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                            activity.isPassed
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {activity.isPassed ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}

                          {activity.isPassed ? "Passed" : "Failed"}
                        </span>

                        {activity.attemptId && (
                          <Link
                            to={`/admin/attempts/${encodeURIComponent(
                              activity.attemptId
                            )}`}
                            className="inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-white"
                          >
                            Details
                            <ArrowRight size={15} />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                  <Activity
                    size={32}
                    className="mx-auto text-slate-600"
                  />

                  <p className="mt-3 font-medium text-slate-300">
                    No recent activity available
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Recent quiz attempts will appear here when returned
                    by the API.
                  </p>
                </div>
              )}
            </section>

            {/* Quick Links */}
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/admin/attempts"
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/50 hover:bg-slate-900/80"
              >
                <p className="text-lg">🎯</p>
                <p className="mt-3 font-semibold">View Attempts</p>
                <p className="mt-1 text-xs text-slate-500">
                  Review all quiz attempts
                </p>
              </Link>

              <Link
                to="/admin/results"
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/50 hover:bg-slate-900/80"
              >
                <p className="text-lg">📈</p>
                <p className="mt-3 font-semibold">View Results</p>
                <p className="mt-1 text-xs text-slate-500">
                  Manage quiz results
                </p>
              </Link>

              <Link
                to="/admin/users"
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/50 hover:bg-slate-900/80"
              >
                <p className="text-lg">👥</p>
                <p className="mt-3 font-semibold">Manage Users</p>
                <p className="mt-1 text-xs text-slate-500">
                  View and manage users
                </p>
              </Link>

              <Link
                to="/admin/quizzes"
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/50 hover:bg-slate-900/80"
              >
                <p className="text-lg">📝</p>
                <p className="mt-3 font-semibold">Manage Quizzes</p>
                <p className="mt-1 text-xs text-slate-500">
                  Manage all quizzes
                </p>
              </Link>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;