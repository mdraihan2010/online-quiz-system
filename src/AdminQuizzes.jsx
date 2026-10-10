import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Trophy,
  XCircle,
} from "lucide-react";

import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

function AdminQuizzes() {
  // ========================================
  // FILTER STATES
  // ========================================

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");

  // ========================================
  // QUIZ DATA STATES
  // ========================================

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // ========================================
  // FETCH QUIZZES
  // ========================================

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/quizzes");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load quizzes."
        );
      }

      setQuizzes(
        Array.isArray(response.data.data)
          ? response.data.data
          : []
      );
    } catch (err) {
      console.error("Fetch Quizzes Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load quizzes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // ========================================
  // STATISTICS
  // ========================================

  const totalQuizzes = quizzes.length;

  const publishedQuizzes = quizzes.filter(
    (quiz) => quiz.isPublished
  ).length;

  const draftQuizzes = quizzes.filter(
    (quiz) => !quiz.isPublished
  ).length;

  // ========================================
  // UNIQUE CATEGORIES
  // ========================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        quizzes
          .map((quiz) => quiz.category?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [quizzes]);

  // ========================================
  // SEARCH AND FILTER
  // ========================================

  const filteredQuizzes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const title = (quiz.title || "").toLowerCase();
      const quizCategory = quiz.category || "";

      const matchesSearch =
        title.includes(normalizedSearch) ||
        quizCategory.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === "All Categories" ||
        quizCategory === category;

      const quizStatus = quiz.isPublished
        ? "Published"
        : "Draft";

      const matchesStatus =
        status === "All Status" || quizStatus === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [quizzes, search, category, status]);

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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ========================================
  // DELETE QUIZ
  // ========================================

  const handleDelete = async (quiz) => {
    if (!quiz?._id || deletingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${quiz.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(quiz._id);
      setError("");

      const response = await api.delete(
        `/quizzes/${quiz._id}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to delete quiz."
        );
      }

      // Update the list without reloading the page.
      setQuizzes((previous) =>
        previous.filter((item) => item._id !== quiz._id)
      );
    } catch (err) {
      console.error("Delete Quiz Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not delete quiz. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // RESET FILTERS
  // ========================================

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setStatus("All Status");
  };

  // ========================================
  // STAT CARD
  // ========================================

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    iconClass,
  }) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>

          <p className="mt-3 text-3xl font-bold">
            {loading ? "..." : value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* ADMIN SIDEBAR */}

        <AdminSidebar />

        {/* MAIN CONTENT */}

        <div className="w-full min-w-0 flex-1">

          {/* HEADER */}

          <header className="border-b border-slate-800 bg-[#020617]">
            <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Quiz Management
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage quizzes on your platform.
                </p>
              </div>

              {/* ADMIN PROFILE */}

              <div className="flex shrink-0 items-center gap-3">
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

          {/* PAGE CONTENT */}

          <main className="px-4 py-8 sm:px-6 lg:px-8">

            {/* PAGE TITLE */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold">
                  All Quizzes
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Create, edit, search and manage your quizzes.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={fetchQuizzes}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <Link
                  to="/admin/quizzes/create"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-700"
                >
                  <Plus size={18} />
                  Create Quiz
                </Link>
              </div>
            </div>

            {/* STATISTICS */}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Quizzes"
                value={totalQuizzes}
                description="All quizzes in the database"
                icon={BookOpen}
                iconClass="bg-purple-500/10 text-purple-400"
              />

              <StatCard
                title="Published"
                value={publishedQuizzes}
                description="Quizzes available for users"
                icon={CheckCircle2}
                iconClass="bg-green-500/10 text-green-400"
              />

              <StatCard
                title="Drafts"
                value={draftQuizzes}
                description="Quizzes not yet published"
                icon={FileQuestion}
                iconClass="bg-yellow-500/10 text-yellow-400"
              />

              <StatCard
                title="Total Attempts"
                value="—"
                description="Attempt statistics will be connected later"
                icon={Trophy}
                iconClass="bg-blue-500/10 text-blue-400"
              />
            </div>

            {/* ERROR MESSAGE */}

            {error && (
              <div
                role="alert"
                className="mt-6 flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <XCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-400"
                  />

                  <p className="text-sm text-red-300">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchQuizzes}
                  disabled={loading}
                  className="shrink-0 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* SEARCH AND FILTERS */}

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold">
                  Search & Filters
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Find quizzes by title, category or publication status.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">

                {/* SEARCH */}

                <div>
                  <label
                    htmlFor="quiz-search"
                    className="mb-2 block text-sm font-medium text-slate-400"
                  >
                    Search Quiz
                  </label>

                  <div className="relative">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="quiz-search"
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search by title or category..."
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* CATEGORY */}

                <div>
                  <label
                    htmlFor="quiz-category"
                    className="mb-2 block text-sm font-medium text-slate-400"
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

                {/* STATUS */}

                <div>
                  <label
                    htmlFor="quiz-status"
                    className="mb-2 block text-sm font-medium text-slate-400"
                  >
                    Publication Status
                  </label>

                  <select
                    id="quiz-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    <option value="All Status">
                      All Status
                    </option>

                    <option value="Published">
                      Published
                    </option>

                    <option value="Draft">
                      Draft
                    </option>
                  </select>
                </div>
              </div>

              {/* FILTER SUMMARY */}

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {loading ? "..." : filteredQuizzes.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-white">
                    {loading ? "..." : totalQuizzes}
                  </span>{" "}
                  quizzes
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="self-start text-sm font-medium text-purple-400 transition hover:text-purple-300 sm:self-auto"
                >
                  Clear Filters
                </button>
              </div>
            </section>

            {/* QUIZ LIST */}

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

              {/* TABLE HEADER */}

              <div className="flex flex-col gap-2 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="text-xl font-bold">
                    Quiz List
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage quiz details and questions.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">
                  <BookOpen size={16} />
                  {loading ? "Loading..." : `${filteredQuizzes.length} results`}
                </div>
              </div>

              {/* LOADING STATE */}

              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <LoaderCircle
                    size={32}
                    className="animate-spin text-purple-400"
                  />

                  <p className="mt-4 font-medium">
                    Loading quizzes...
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Fetching data from the database.
                  </p>
                </div>
              ) : error && quizzes.length === 0 ? (
                /* INITIAL LOAD ERROR */

                <div className="p-12 text-center">
                  <XCircle
                    size={36}
                    className="mx-auto text-red-400"
                  />

                  <h3 className="mt-4 font-semibold">
                    Unable to load quizzes
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Check the backend server and try again.
                  </p>

                  <button
                    type="button"
                    onClick={fetchQuizzes}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-700"
                  >
                    <RefreshCw size={16} />
                    Retry
                  </button>
                </div>
              ) : filteredQuizzes.length === 0 ? (
                /* EMPTY STATE */

                <div className="p-10 text-center sm:p-12">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                    <Search size={28} className="text-slate-400" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {quizzes.length === 0
                      ? "No quizzes yet"
                      : "No quizzes found"}
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                    {quizzes.length === 0
                      ? "Create your first quiz to get started."
                      : "Try changing your search keywords or filters."}
                  </p>

                  {quizzes.length === 0 ? (
                    <Link
                      to="/admin/quizzes/create"
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-700"
                    >
                      <Plus size={18} />
                      Create Your First Quiz
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-5 rounded-lg border border-slate-700 px-5 py-3 font-medium transition hover:bg-slate-800"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                /* QUIZ ITEMS */

                <div>
                  {/* DESKTOP COLUMN HEADERS */}

                  <div className="hidden grid-cols-12 gap-3 bg-slate-950 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 2xl:grid">
                    <div className="col-span-3">Quiz</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1 text-center">Questions</div>
                    <div className="col-span-1 text-center">Time</div>
                    <div className="col-span-1 text-center">Difficulty</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  {filteredQuizzes.map((quiz) => {
                    const quizStatus = quiz.isPublished
                      ? "Published"
                      : "Draft";

                    const difficulty = quiz.difficulty
                      ? quiz.difficulty.charAt(0).toUpperCase() +
                        quiz.difficulty.slice(1)
                      : "N/A";

                    const difficultyClass =
                      quiz.difficulty === "easy"
                        ? "text-green-400"
                        : quiz.difficulty === "medium"
                        ? "text-yellow-400"
                        : quiz.difficulty === "hard"
                        ? "text-red-400"
                        : "text-slate-400";

                    return (
                      <article
                        key={quiz._id}
                        className="border-b border-slate-800 p-5 transition last:border-b-0 hover:bg-slate-950/40 sm:p-6"
                      >
                        <div className="grid items-center gap-5 2xl:grid-cols-12 2xl:gap-3">

                          {/* QUIZ TITLE */}

                          <div className="min-w-0 2xl:col-span-3">
                            <p className="break-words font-semibold text-white">
                              {quiz.title || "Untitled Quiz"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Created {formatDate(quiz.createdAt)}
                            </p>

                            {quiz.description && (
                              <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">
                                {quiz.description}
                              </p>
                            )}
                          </div>

                          {/* CATEGORY */}

                          <div className="2xl:col-span-2">
                            <p className="mb-1 text-xs text-slate-500 2xl:hidden">
                              Category
                            </p>

                            <span className="text-sm text-slate-300">
                              {quiz.category || "Uncategorized"}
                            </span>
                          </div>

                          {/* QUESTIONS */}

                          <div className="2xl:col-span-1 2xl:text-center">
                            <p className="mb-1 text-xs text-slate-500 2xl:hidden">
                              Questions
                            </p>

                            <span className="inline-flex items-center gap-2 text-sm font-medium">
                              <FileQuestion
                                size={15}
                                className="text-slate-500"
                              />
                              {quiz.questionCount ?? 0}
                            </span>
                          </div>

                          {/* DURATION */}

                          <div className="2xl:col-span-1 2xl:text-center">
                            <p className="mb-1 text-xs text-slate-500 2xl:hidden">
                              Duration
                            </p>

                            <span className="inline-flex items-center gap-2 text-sm">
                              <Clock3
                                size={15}
                                className="text-slate-500"
                              />
                              {quiz.duration ?? "N/A"} min
                            </span>
                          </div>

                          {/* DIFFICULTY */}

                          <div className="2xl:col-span-1 2xl:text-center">
                            <p className="mb-1 text-xs text-slate-500 2xl:hidden">
                              Difficulty
                            </p>

                            <span className={`text-sm font-medium ${difficultyClass}`}>
                              {difficulty}
                            </span>
                          </div>

                          {/* STATUS */}

                          <div className="2xl:col-span-2 2xl:text-center">
                            <p className="mb-1 text-xs text-slate-500 2xl:hidden">
                              Status
                            </p>

                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                quiz.isPublished
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {quiz.isPublished ? (
                                <CheckCircle2 size={13} />
                              ) : (
                                <Clock3 size={13} />
                              )}

                              {quizStatus}
                            </span>
                          </div>

                          {/* ACTIONS */}

                          <div className="flex flex-wrap gap-2 2xl:col-span-2 2xl:justify-end">

                            {/* EDIT */}

                            <Link
                              to={`/admin/quizzes/edit/${quiz._id}`}
                              className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold transition hover:bg-slate-700"
                            >
                              Edit
                            </Link>

                            {/* QUESTIONS */}

                            <Link
                              to={`/admin/questions?quizId=${quiz._id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20"
                            >
                              <FileQuestion size={14} />
                              Questions
                            </Link>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() => handleDelete(quiz)}
                              disabled={deletingId !== null}
                              title={`Delete ${quiz.title || "quiz"}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === quiz._id ? (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={14} />
                              )}

                              {deletingId === quiz._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* FOOTER NOTE */}

            <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <Trophy size={15} className="mt-0.5 shrink-0" />

              <p>
                Quiz attempts are not connected to this page yet.
                The Attempts statistic will be implemented when the
                quiz-taking and result modules are ready.
              </p>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminQuizzes;