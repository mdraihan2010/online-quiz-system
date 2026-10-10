import { Link } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";

function AdminResults() {
  const [search, setSearch] = useState("");
  const [quizFilter, setQuizFilter] = useState("All Quizzes");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // ========================================
  // SAMPLE RESULT DATA
  // ========================================

  const results = [
    {
      id: 1,
      user: "Raihan Ahmed",
      email: "raihan@example.com",
      quiz: "JavaScript Fundamentals",
      score: 8,
      totalMarks: 10,
      percentage: 80,
      date: "Oct 9, 2026",
      status: "Passed",
    },
    {
      id: 2,
      user: "Nusrat Jahan",
      email: "nusrat@example.com",
      quiz: "Database Fundamentals",
      score: 9,
      totalMarks: 10,
      percentage: 90,
      date: "Oct 8, 2026",
      status: "Passed",
    },
    {
      id: 3,
      user: "Tanvir Hasan",
      email: "tanvir@example.com",
      quiz: "Operating Systems",
      score: 5,
      totalMarks: 10,
      percentage: 50,
      date: "Oct 8, 2026",
      status: "Failed",
    },
    {
      id: 4,
      user: "Sadia Rahman",
      email: "sadia@example.com",
      quiz: "HTML & CSS",
      score: 7,
      totalMarks: 10,
      percentage: 70,
      date: "Oct 7, 2026",
      status: "Passed",
    },
    {
      id: 5,
      user: "Fahim Ahmed",
      email: "fahim@example.com",
      quiz: "Computer Networks",
      score: 4,
      totalMarks: 10,
      percentage: 40,
      date: "Oct 7, 2026",
      status: "Failed",
    },
    {
      id: 6,
      user: "Mim Akter",
      email: "mim@example.com",
      quiz: "JavaScript Fundamentals",
      score: 10,
      totalMarks: 10,
      percentage: 100,
      date: "Oct 6, 2026",
      status: "Passed",
    },
    {
      id: 7,
      user: "Sakib Hossain",
      email: "sakib@example.com",
      quiz: "Database Fundamentals",
      score: 6,
      totalMarks: 10,
      percentage: 60,
      date: "Oct 5, 2026",
      status: "Passed",
    },
    {
      id: 8,
      user: "Jannat Islam",
      email: "jannat@example.com",
      quiz: "Operating Systems",
      score: 3,
      totalMarks: 10,
      percentage: 30,
      date: "Oct 4, 2026",
      status: "Failed",
    },
  ];

  // ========================================
  // FILTER RESULTS
  // ========================================

  const filteredResults = results.filter((result) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      result.user.toLowerCase().includes(searchText) ||
      result.email.toLowerCase().includes(searchText) ||
      result.quiz.toLowerCase().includes(searchText);

    const matchesQuiz =
      quizFilter === "All Quizzes" ||
      result.quiz === quizFilter;

    const matchesStatus =
      statusFilter === "All Status" ||
      result.status === statusFilter;

    return matchesSearch && matchesQuiz && matchesStatus;
  });

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

          <header className="border-b border-slate-800">

            <div className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

              <div className="min-w-0">

                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">
                  Result Management
                </h1>

              </div>


              <div className="ml-4 flex shrink-0 items-center gap-3 sm:gap-4">

                <div className="hidden text-right sm:block">

                  <p className="text-sm font-medium">
                    Raihan
                  </p>

                  <p className="text-xs text-slate-500">
                    Administrator
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold sm:h-11 sm:w-11">
                  R
                </div>

              </div>

            </div>

          </header>


          {/* ========================================
              CONTENT
          ======================================== */}

          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

            {/* Page Heading */}

            <div className="mb-8">

              <h2 className="text-2xl font-bold">
                Results
              </h2>

              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                View and manage quiz results of all users.
              </p>

            </div>


            {/* ========================================
                STATISTICS
            ======================================== */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Total Results */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <p className="text-sm text-slate-500">
                  Total Results
                </p>

                <p className="mt-2 text-3xl font-bold">
                  2,845
                </p>

              </div>


              {/* Passed */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <p className="text-sm text-slate-500">
                  Passed
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  2,214
                </p>

              </div>


              {/* Failed */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <p className="text-sm text-slate-500">
                  Failed
                </p>

                <p className="mt-2 text-3xl font-bold text-red-400">
                  631
                </p>

              </div>


              {/* Average Score */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                <p className="text-sm text-slate-500">
                  Average Score
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-400">
                  77%
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
                    Search Result
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search user or quiz..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  />

                </div>


                {/* Quiz Filter */}

                <div>

                  <label className="mb-2 block text-sm text-slate-500">
                    Quiz
                  </label>

                  <select
                    value={quizFilter}
                    onChange={(e) => setQuizFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    <option>All Quizzes</option>
                    <option>JavaScript Fundamentals</option>
                    <option>Database Fundamentals</option>
                    <option>Operating Systems</option>
                    <option>HTML & CSS</option>
                    <option>Computer Networks</option>
                  </select>

                </div>


                {/* Status Filter */}

                <div>

                  <label className="mb-2 block text-sm text-slate-500">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    <option>All Status</option>
                    <option>Passed</option>
                    <option>Failed</option>
                  </select>

                </div>

              </div>

            </section>


            {/* ========================================
                RESULT LIST
            ======================================== */}

            <section className="mt-6">

              <div className="mb-4">

                <h2 className="text-xl font-bold">
                  Result List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredResults.length} results found
                </p>

              </div>


              <div className="space-y-4">

                {filteredResults.length > 0 ? (

                  filteredResults.map((result) => (

                    <div
                      key={result.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 sm:p-6"
                    >

                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                        {/* User */}

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-600 font-semibold">
                            {result.user.charAt(0)}
                          </div>

                          <div className="min-w-0">

                            <p className="font-semibold">
                              {result.user}
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {result.email}
                            </p>

                          </div>

                        </div>


                        {/* Quiz */}

                        <div className="min-w-0">

                          <p className="text-xs text-slate-500">
                            Quiz
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {result.quiz}
                          </p>

                        </div>


                        {/* Score */}

                        <div>

                          <p className="text-xs text-slate-500">
                            Score
                          </p>

                          <p className="mt-1 text-sm font-semibold text-purple-400">
                            {result.score}/{result.totalMarks}
                          </p>

                        </div>


                        {/* Percentage */}

                        <div>

                          <p className="text-xs text-slate-500">
                            Percentage
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {result.percentage}%
                          </p>

                        </div>


                        {/* Date */}

                        <div>

                          <p className="text-xs text-slate-500">
                            Date
                          </p>

                          <p className="mt-1 text-sm">
                            {result.date}
                          </p>

                        </div>


                        {/* Status */}

                        <div>

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


                        {/* Action */}

                        <div>

                          <Link
                            to={`/admin/results/${result.id}`}
                            className="inline-block rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-700"
                          >
                            View
                          </Link>

                        </div>

                      </div>

                    </div>

                  ))

                ) : (

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center sm:p-12">

                    <div className="text-4xl">
                      🔍
                    </div>

                    <h3 className="mt-4 font-semibold">
                      No results found
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

export default AdminResults;