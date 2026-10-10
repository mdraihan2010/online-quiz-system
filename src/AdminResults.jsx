import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

function AdminResults() {
  const [search, setSearch] = useState("");
  const [quizFilter, setQuizFilter] = useState("All Quizzes");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({
    totalResults: 0,
    passed: 0,
    failed: 0,
    averageScore: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH REAL RESULTS FROM BACKEND
  // ========================================

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/results");

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to load results."
          );
        }

        const data = response.data.data;

        setResults(Array.isArray(data?.results) ? data.results : []);

        setStatistics({
          totalResults: Number(data?.statistics?.totalResults) || 0,
          passed: Number(data?.statistics?.passed) || 0,
          failed: Number(data?.statistics?.failed) || 0,
          averageScore: Number(data?.statistics?.averageScore) || 0,
        });
      } catch (err) {
        console.error("Failed to fetch admin results:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load results. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // ========================================
  // DYNAMIC QUIZ FILTER OPTIONS
  // ========================================

  const quizOptions = [
    "All Quizzes",
    ...new Set(results.map((result) => result.quiz)),
  ];

  // ========================================
  // FILTER RESULTS
  // ========================================

  const searchText = search.trim().toLowerCase();

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      String(result.user || "").toLowerCase().includes(searchText) ||
      String(result.email || "").toLowerCase().includes(searchText) ||
      String(result.quiz || "").toLowerCase().includes(searchText);

    const matchesQuiz =
      quizFilter === "All Quizzes" || result.quiz === quizFilter;

    const matchesStatus =
      statusFilter === "All Status" || result.status === statusFilter;

    return matchesSearch && matchesQuiz && matchesStatus;
  });

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ========================================
  // LOADING / ERROR / RESULTS
  // ========================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <div className="w-full min-w-0 flex-1">
          {/* HEADER */}

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
                  <p className="text-sm font-medium">Raihan</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold sm:h-11 sm:w-11">
                  R
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT */}

          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Results</h2>

              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                View and manage quiz results of all users.
              </p>
            </div>

            {/* STATISTICS */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <p className="text-sm text-slate-500">Total Results</p>
                <p className="mt-2 text-3xl font-bold">
                  {statistics.totalResults.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <p className="text-sm text-slate-500">Passed</p>
                <p className="mt-2 text-3xl font-bold text-green-400">
                  {statistics.passed.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <p className="text-sm text-slate-500">Failed</p>
                <p className="mt-2 text-3xl font-bold text-red-400">
                  {statistics.failed.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <p className="text-sm text-slate-500">Average Score</p>
                <p className="mt-2 text-3xl font-bold text-purple-400">
                  {statistics.averageScore}%
                </p>
              </div>
            </div>

            {/* FILTERS */}

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-3">
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

                <div>
                  <label className="mb-2 block text-sm text-slate-500">
                    Quiz
                  </label>

                  <select
                    value={quizFilter}
                    onChange={(e) => setQuizFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    {quizOptions.map((quiz) => (
                      <option key={quiz} value={quiz}>
                        {quiz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-500">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </section>

            {/* RESULT LIST */}

            <section className="mt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Result List</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Loading results..."
                    : `${filteredResults.length} results found`}
                </p>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                  <p className="text-slate-400">
                    Loading real results from database...
                  </p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
                  <h3 className="font-semibold text-red-400">
                    Failed to load results
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">{error}</p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-500"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <div
                      key={result.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        {/* USER */}

                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-600 font-semibold">
                            {String(result.user || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold">
                              {result.user || "Unknown User"}
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {result.email || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* QUIZ */}

                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Quiz</p>
                          <p className="mt-1 text-sm font-medium">
                            {result.quiz || "Unknown Quiz"}
                          </p>
                        </div>

                        {/* SCORE */}

                        <div>
                          <p className="text-xs text-slate-500">Score</p>
                          <p className="mt-1 text-sm font-semibold text-purple-400">
                            {result.score}/{result.totalMarks}
                          </p>
                        </div>

                        {/* PERCENTAGE */}

                        <div>
                          <p className="text-xs text-slate-500">Percentage</p>
                          <p className="mt-1 text-sm font-semibold">
                            {Number(result.percentage || 0)}%
                          </p>
                        </div>

                        {/* DATE */}

                        <div>
                          <p className="text-xs text-slate-500">Date</p>
                          <p className="mt-1 text-sm">
                            {formatDate(result.date)}
                          </p>
                        </div>

                        {/* STATUS */}

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

                        {/* ACTION */}

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
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center sm:p-12">
                  <div className="text-4xl">🔍</div>

                  <h3 className="mt-4 font-semibold">No results found</h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {results.length === 0
                      ? "No completed quiz attempts are available yet."
                      : "Try changing your search or filters."}
                  </p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminResults;