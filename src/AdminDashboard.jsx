import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  Folder,
  LoaderCircle,
  RefreshCw,
  Target,
  Users,
} from "lucide-react";

import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatNumber = (value) =>
  Number(value || 0).toLocaleString();

const formatPercentage = (value) =>
  `${Number(value || 0).toFixed(1)}%`;

const formatDate = (dateValue) => {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/analytics");

      if (!response.data?.success || !response.data?.data) {
        throw new Error("Invalid analytics response from server.");
      }

      setAnalytics(response.data.data);
    } catch (err) {
      console.error("Admin Dashboard Analytics Error:", err);

      const status = err.response?.status;

      if (status === 401) {
        setError(
          "Your session may have expired. Please log in again."
        );
      } else if (status === 403) {
        setError(
          "Access denied. Please log in with an Admin account."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const overview = analytics?.overview || {};

  const stats = [
    {
      title: "Total Users",
      value: overview.totalUsers,
      color: "text-blue-400",
      icon: Users,
    },
    {
      title: "Total Quizzes",
      value: overview.totalQuizzes,
      color: "text-purple-400",
      icon: BookOpen,
    },
    {
      title: "Total Attempts",
      value: overview.totalAttempts,
      color: "text-yellow-400",
      icon: Target,
    },
    {
      title: "Average Score",
      value: formatPercentage(overview.averageScore),
      color: "text-green-400",
      icon: Activity,
    },
  ];

  const activities = (analytics?.recentActivity || []).map(
    (attempt) => ({
      id: attempt._id,
      title:
        attempt.status === "completed"
          ? "Quiz completed"
          : "Quiz attempt in progress",
      description: `${attempt.user?.name || "Unknown user"} ${
        attempt.status === "completed" ? "completed" : "started"
      } ${attempt.quiz?.title || "a quiz"}`,
      score:
        attempt.status === "completed"
          ? `${formatNumber(attempt.score)} / ${formatNumber(
              attempt.totalMarks
            )} marks (${formatPercentage(attempt.percentage)})`
          : "Not completed",
      date: attempt.submittedAt || attempt.createdAt || attempt.startedAt,
      passed: attempt.isPassed,
      status: attempt.status,
    })
  );

  const popularQuizzes = analytics?.quizPerformance || [];

  const monthlyAttempts = analytics?.monthlyAttempts || [];

  const maxMonthlyAttempts = Math.max(
    1,
    ...monthlyAttempts.map((item) => Number(item.attempts || 0))
  );

  const totalMonthlyAttempts = monthlyAttempts.reduce(
    (total, item) => total + Number(item.attempts || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <div className="w-full min-w-0 flex-1">
          {/* Topbar */}
          <header className="border-b border-slate-800 bg-[#020617]">
            <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchAnalytics(true)}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-purple-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing ? "animate-spin" : ""
                    }
                  />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">Raihan</p>
                  <p className="text-xs text-slate-500">
                    Administrator
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600 font-semibold">
                  R
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            {/* Welcome */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold">
                Welcome back, Admin! 👋
              </h2>

              <p className="mt-2 text-slate-400">
                Here&apos;s what&apos;s happening with your quiz
                platform today.
              </p>
            </section>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-red-300">{error}</p>

                <button
                  type="button"
                  onClick={() => fetchAnalytics()}
                  className="shrink-0 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/30"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex flex-col items-center gap-3">
                  <LoaderCircle
                    size={32}
                    className="animate-spin text-purple-400"
                  />

                  <p className="text-sm text-slate-400">
                    Loading dashboard data...
                  </p>
                </div>
              </div>
            )}

            {/* Dashboard data */}
            {!loading && analytics && (
              <>
                {/* Main Statistics */}
                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.title}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-400">
                            {stat.title}
                          </p>

                          <Icon
                            size={20}
                            className={stat.color}
                          />
                        </div>

                        <p
                          className={`mt-3 text-3xl font-bold ${stat.color}`}
                        >
                          {stat.title === "Average Score"
                            ? stat.value
                            : formatNumber(stat.value)}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                          Live database statistics
                        </p>
                      </div>
                    );
                  })}
                </section>

                {/* Quick Actions */}
                <section className="mt-8">
                  <h2 className="text-xl font-bold">
                    Quick Actions
                  </h2>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                      to="/admin/quizzes"
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <BookOpen
                          size={20}
                          className="text-purple-400"
                        />
                      </div>

                      <h3 className="mt-4 font-semibold">
                        Create Quiz
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Create a new quiz
                      </p>
                    </Link>

                    <Link
                      to="/admin/questions"
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <FileQuestion
                          size={20}
                          className="text-green-400"
                        />
                      </div>

                      <h3 className="mt-4 font-semibold">
                        Add Question
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Add questions to a quiz
                      </p>
                    </Link>

                    <Link
                      to="/admin/users"
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <Users
                          size={20}
                          className="text-blue-400"
                        />
                      </div>

                      <h3 className="mt-4 font-semibold">
                        Manage Users
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        View and manage users
                      </p>
                    </Link>

                    <Link
                      to="/admin/categories"
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                        <Folder
                          size={20}
                          className="text-yellow-400"
                        />
                      </div>

                      <h3 className="mt-4 font-semibold">
                        Categories
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Manage quiz categories
                      </p>
                    </Link>
                  </div>
                </section>

                {/* Activity and Popular Quizzes */}
                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  {/* Recent Activity */}
                  <section className="rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 p-6">
                      <h2 className="text-xl font-bold">
                        Recent Activity
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Latest quiz attempts from the database
                      </p>
                    </div>

                    {activities.length > 0 ? (
                      <div className="space-y-5 p-6">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950">
                              <Activity
                                size={18}
                                className="text-purple-400"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-medium">
                                {activity.title}
                              </p>

                              <p className="mt-1 text-sm text-slate-400">
                                {activity.description}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {activity.score}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                {formatDate(activity.date)}
                              </p>
                            </div>

                            {activity.status === "completed" && (
                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                                  activity.passed
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {activity.passed ? "Passed" : "Failed"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500">
                        No recent quiz attempts found.
                      </div>
                    )}
                  </section>

                  {/* Popular Quizzes */}
                  <section className="rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-800 p-6">
                      <div>
                        <h2 className="text-xl font-bold">
                          Popular Quizzes
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Most attempted quizzes
                        </p>
                      </div>

                      <Link
                        to="/admin/quizzes"
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        View All
                      </Link>
                    </div>

                    {popularQuizzes.length > 0 ? (
                      <div className="space-y-4 p-6">
                        {popularQuizzes.map((quiz, index) => (
                          <div
                            key={quiz.quizId || quiz.title}
                            className="flex items-center gap-4"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 font-semibold text-purple-400">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {quiz.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {quiz.category || "Uncategorized"}{" "}
                                ·{" "}
                                {quiz.difficulty || "Not specified"}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="font-semibold">
                                {formatNumber(quiz.totalAttempts)}
                              </p>

                              <p className="mt-1 text-xs text-green-400">
                                Avg.{" "}
                                {formatPercentage(
                                  quiz.averagePercentage
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500">
                        No quiz attempts available yet.
                      </div>
                    )}
                  </section>
                </div>

                {/* Platform Overview */}
                <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h2 className="text-xl font-bold">
                    Platform Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current system statistics
                  </p>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-sm text-slate-500">
                        Active Users
                      </p>

                      <p className="mt-2 text-2xl font-bold text-blue-400">
                        {formatNumber(overview.activeUsers)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Currently marked active
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-sm text-slate-500">
                        Published Quizzes
                      </p>

                      <p className="mt-2 text-2xl font-bold text-purple-400">
                        {formatNumber(overview.publishedQuizzes)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Available published quizzes
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-sm text-slate-500">
                        Completed Attempts
                      </p>

                      <p className="mt-2 text-2xl font-bold text-green-400">
                        {formatNumber(overview.completedAttempts)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Successfully submitted attempts
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-sm text-slate-500">
                        Pass Rate
                      </p>

                      <p className="mt-2 text-2xl font-bold text-yellow-400">
                        {formatPercentage(overview.passRate)}
                      </p>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-yellow-500 transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, Number(overview.passRate || 0))
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Monthly Attempts */}
                <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold">
                        Monthly Quiz Attempts
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Completed attempts during{" "}
                        {new Date().getFullYear()}
                      </p>
                    </div>

                    <div className="text-sm text-slate-400">
                      Total:{" "}
                      <span className="font-semibold text-white">
                        {formatNumber(totalMonthlyAttempts)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
                    {monthlyAttempts.map((item) => {
                      const attempts = Number(item.attempts || 0);

                      const barHeight =
                        attempts === 0
                          ? 4
                          : Math.max(
                              8,
                              (attempts / maxMonthlyAttempts) * 100
                            );

                      return (
                        <div
                          key={item.month}
                          className="flex min-w-0 flex-col items-center"
                        >
                          <span className="mb-2 text-xs text-slate-400">
                            {formatNumber(attempts)}
                          </span>

                          <div className="flex h-28 w-full items-end justify-center rounded-lg bg-slate-950 p-2">
                            <div
                              title={`${MONTH_NAMES[item.month - 1]}: ${attempts} attempts`}
                              className="w-full rounded-t-md bg-purple-500 transition-all"
                              style={{
                                height: `${barHeight}%`,
                                opacity: attempts === 0 ? 0.2 : 1,
                              }}
                            />
                          </div>

                          <span className="mt-2 text-xs text-slate-500">
                            {MONTH_NAMES[item.month - 1] || item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {/* No data after a failed request */}
            {!loading && !analytics && error && (
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
                Dashboard data could not be loaded. Check that the backend
                is running and your Admin session is valid.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;