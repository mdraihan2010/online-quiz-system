import { useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";

function AdminAttempts() {
  const [search, setSearch] = useState("");
  const [quizFilter, setQuizFilter] = useState("All Quizzes");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // ========================================
  // ATTEMPT DATA
  // ========================================

  const attempts = [
    {
      id: 1,
      user: "Raihan Ahmed",
      email: "raihan@example.com",
      quiz: "JavaScript Fundamentals",
      score: 8,
      totalMarks: 10,
      percentage: 80,
      timeSpent: "12m 35s",
      date: "Oct 9, 2026",
      status: "Completed",
    },

    {
      id: 2,
      user: "Sakib Hasan",
      email: "sakib@example.com",
      quiz: "Database Fundamentals",
      score: 9,
      totalMarks: 10,
      percentage: 90,
      timeSpent: "10m 20s",
      date: "Oct 9, 2026",
      status: "Completed",
    },

    {
      id: 3,
      user: "Nusrat Jahan",
      email: "nusrat@example.com",
      quiz: "Operating Systems",
      score: 7,
      totalMarks: 10,
      percentage: 70,
      timeSpent: "14m 45s",
      date: "Oct 8, 2026",
      status: "Completed",
    },

    {
      id: 4,
      user: "Tanvir Ahmed",
      email: "tanvir@example.com",
      quiz: "Computer Networks",
      score: 5,
      totalMarks: 10,
      percentage: 50,
      timeSpent: "18m 10s",
      date: "Oct 8, 2026",
      status: "Completed",
    },

    {
      id: 5,
      user: "Mim Akter",
      email: "mim@example.com",
      quiz: "HTML & CSS",
      score: 9,
      totalMarks: 10,
      percentage: 90,
      timeSpent: "9m 50s",
      date: "Oct 7, 2026",
      status: "Completed",
    },

    {
      id: 6,
      user: "Arif Hossain",
      email: "arif@example.com",
      quiz: "Python Programming",
      score: 0,
      totalMarks: 10,
      percentage: 0,
      timeSpent: "4m 12s",
      date: "Oct 7, 2026",
      status: "In Progress",
    },

    {
      id: 7,
      user: "Farhan Karim",
      email: "farhan@example.com",
      quiz: "JavaScript Fundamentals",
      score: 6,
      totalMarks: 10,
      percentage: 60,
      timeSpent: "16m 30s",
      date: "Oct 6, 2026",
      status: "Completed",
    },

    {
      id: 8,
      user: "Jannatul Ferdous",
      email: "jannatul@example.com",
      quiz: "Database Fundamentals",
      score: 8,
      totalMarks: 10,
      percentage: 80,
      timeSpent: "11m 15s",
      date: "Oct 6, 2026",
      status: "Completed",
    },
  ];

  // ========================================
  // FILTER
  // ========================================

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      attempt.user
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      attempt.email
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesQuiz =
      quizFilter === "All Quizzes" ||
      attempt.quiz === quizFilter;

    const matchesStatus =
      statusFilter === "All Status" ||
      attempt.status === statusFilter;

    return (
      matchesSearch &&
      matchesQuiz &&
      matchesStatus
    );
  });

  // ========================================
  // STATISTICS
  // ========================================

  const totalAttempts = attempts.length;

  const completedAttempts = attempts.filter(
    (attempt) => attempt.status === "Completed"
  ).length;

  const inProgressAttempts = attempts.filter(
    (attempt) => attempt.status === "In Progress"
  ).length;

  const completedScores = attempts.filter(
    (attempt) => attempt.status === "Completed"
  );

  const averageScore =
    completedScores.length > 0
      ? completedScores.reduce(
          (total, attempt) =>
            total + attempt.percentage,
          0
        ) / completedScores.length
      : 0;

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* ========================================
          RESPONSIVE ADMIN LAYOUT
      ======================================== */}

      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* ========================================
            REUSABLE SIDEBAR
        ======================================== */}

        <AdminSidebar />

        {/* ========================================
            MAIN CONTENT
        ======================================== */}

        <div className="w-full min-w-0 flex-1">

          {/* ========================================
              HEADER
          ======================================== */}

          <header className="border-b border-slate-800 bg-[#020617]">

            <div className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

              <div>

                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Attempt Management
                </h1>

              </div>

              <div className="flex items-center gap-4">

                <div className="hidden text-right sm:block">

                  <p className="text-sm font-medium">
                    Raihan
                  </p>

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

          {/* ========================================
              CONTENT
          ======================================== */}

          <main className="px-4 py-8 sm:px-6 lg:px-8">

            {/* Intro */}

            <div>

              <h2 className="text-2xl font-bold">
                Quiz Attempts
              </h2>

              <p className="mt-2 text-slate-400">
                Monitor and manage quiz attempts from all users.
              </p>

            </div>

            {/* ========================================
                STATS
            ======================================== */}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {/* Total Attempts */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-500">
                  Total Attempts
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalAttempts}
                </p>

              </div>

              {/* Completed */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  {completedAttempts}
                </p>

              </div>

              {/* In Progress */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-400">
                  {inProgressAttempts}
                </p>

              </div>

              {/* Average Score */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-500">
                  Average Score
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-400">
                  {averageScore.toFixed(1)}%
                </p>

              </div>

            </div>

            {/* ========================================
                FILTERS
            ======================================== */}

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

              <div className="grid gap-4 lg:grid-cols-3">

                {/* Search */}

                <div>

                  <label className="mb-2 block text-sm text-slate-500">
                    Search User
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search user or email..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  />

                </div>

                {/* Quiz */}

                <div>

                  <label className="mb-2 block text-sm text-slate-500">
                    Quiz
                  </label>

                  <select
                    value={quizFilter}
                    onChange={(e) =>
                      setQuizFilter(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >

                    <option>All Quizzes</option>
                    <option>JavaScript Fundamentals</option>
                    <option>Database Fundamentals</option>
                    <option>Operating Systems</option>
                    <option>Computer Networks</option>
                    <option>HTML & CSS</option>
                    <option>Python Programming</option>

                  </select>

                </div>

                {/* Status */}

                <div>

                  <label className="mb-2 block text-sm text-slate-500">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >

                    <option>All Status</option>
                    <option>Completed</option>
                    <option>In Progress</option>

                  </select>

                </div>

              </div>

            </section>

            {/* ========================================
                ATTEMPT LIST
            ======================================== */}

            <section className="mt-6">

              <div className="mb-4">

                <h2 className="text-xl font-bold">
                  Attempt History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredAttempts.length} attempts found
                </p>

              </div>

              {/* Attempt List */}

              <div className="space-y-4">

                {filteredAttempts.length > 0 ? (

                  filteredAttempts.map((attempt) => (

                    <div
                      key={attempt.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 sm:p-6"
                    >

                      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

                        {/* User */}

                        <div className="flex min-w-0 flex-1 items-center gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-500/10 font-semibold text-purple-400">
                            {attempt.user.charAt(0)}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold">
                              {attempt.user}
                            </p>

                            <p className="truncate text-sm text-slate-500">
                              {attempt.email}
                            </p>

                          </div>

                        </div>

                        {/* Quiz */}

                        <div className="min-w-0 xl:min-w-[200px]">

                          <p className="text-xs text-slate-500">
                            Quiz
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {attempt.quiz}
                          </p>

                        </div>

                        {/* Score */}

                        <div>

                          <p className="text-xs text-slate-500">
                            Score
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {attempt.score}/{attempt.totalMarks}
                          </p>

                        </div>

                        {/* Percentage */}

                        <div>

                          <p className="text-xs text-slate-500">
                            Percentage
                          </p>

                          <p
                            className={`mt-1 text-sm font-semibold ${
                              attempt.percentage >= 80
                                ? "text-green-400"
                                : attempt.percentage >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {attempt.percentage}%
                          </p>

                        </div>

                        {/* Time */}

                        <div>

                          <p className="text-xs text-slate-500">
                            Time
                          </p>

                          <p className="mt-1 text-sm">
                            {attempt.timeSpent}
                          </p>

                        </div>

                        {/* Status */}

                        <div>

                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                              attempt.status === "Completed"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {attempt.status}
                          </span>

                        </div>

                        {/* VIEW BUTTON */}

                        <div>

                          <Link
                            to={`/admin/attempts/${attempt.id}`}
                            className="inline-block rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-700"
                          >
                            View
                          </Link>

                        </div>

                      </div>

                      {/* Bottom Info */}

                      <div className="mt-5 border-t border-slate-800 pt-4">

                        <p className="text-xs text-slate-500">
                          Attempt Date:{" "}
                          <span className="text-slate-400">
                            {attempt.date}
                          </span>
                        </p>

                      </div>

                    </div>

                  ))

                ) : (

                  /* No Results */

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

                    <div className="text-4xl">
                      🔍
                    </div>

                    <h3 className="mt-4 font-semibold">
                      No attempts found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>

                  </div>

                )}

              </div>

            </section>

            {/* ========================================
                PAGINATION
            ======================================== */}

            <div className="mt-8 flex items-center justify-center gap-2">

              <button
                type="button"
                className="h-10 w-10 rounded-lg bg-slate-800 text-slate-600"
              >
                ←
              </button>

              <button
                type="button"
                className="h-10 w-10 rounded-lg bg-purple-600 font-medium"
              >
                1
              </button>

              <button
                type="button"
                className="h-10 w-10 rounded-lg border border-slate-800 bg-slate-900 transition hover:bg-slate-800"
              >
                2
              </button>

              <button
                type="button"
                className="h-10 w-10 rounded-lg border border-slate-800 bg-slate-900 transition hover:bg-slate-800"
              >
                3
              </button>

              <button
                type="button"
                className="h-10 w-10 rounded-lg border border-slate-800 bg-slate-900 transition hover:bg-slate-800"
              >
                →
              </button>

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}

export default AdminAttempts;