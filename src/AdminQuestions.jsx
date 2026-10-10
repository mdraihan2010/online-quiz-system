import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

function AdminQuestions() {
  const [search, setSearch] = useState("");
  const [quizFilter, setQuizFilter] = useState("All Quizzes");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ========================================
  // FETCH QUESTIONS AND QUIZZES
  // ========================================

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/questions");

      if (response.data.success) {
        setQuestions(response.data.data || []);
      } else {
        setError("Failed to load questions.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Questions load করা যায়নি। Backend এবং login status পরীক্ষা করো।"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await api.get("/quizzes");

      if (response.data.success) {
        setQuizzes(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
    fetchQuizzes();
  }, [fetchQuestions, fetchQuizzes]);

  // ========================================
  // QUESTION TYPE
  // ========================================

  const getQuestionType = (question) => {
    // Current backend supports questions with options.
    // Two-option questions are treated as True/False.
    if (question.options?.length === 2) {
      return "True/False";
    }

    return "MCQ";
  };

  // ========================================
  // QUIZ OPTIONS
  // ========================================

  const quizOptions = useMemo(() => {
    const quizMap = new Map();

    quizzes.forEach((quiz) => {
      quizMap.set(String(quiz._id), {
        id: String(quiz._id),
        title: quiz.title,
      });
    });

    questions.forEach((question) => {
      if (question.quiz?._id) {
        quizMap.set(String(question.quiz._id), {
          id: String(question.quiz._id),
          title: question.quiz.title,
        });
      }
    });

    return Array.from(quizMap.values());
  }, [quizzes, questions]);

  // ========================================
  // FILTER QUESTIONS
  // ========================================

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const questionText = question.questionText || "";

      const quizTitle = question.quiz?.title || "Unknown Quiz";

      const matchesSearch = questionText
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesQuiz =
        quizFilter === "All Quizzes" ||
        String(question.quiz?._id) === quizFilter;

      const matchesType =
        typeFilter === "All Types" ||
        getQuestionType(question) === typeFilter;

      return matchesSearch && matchesQuiz && matchesType;
    });
  }, [questions, search, quizFilter, typeFilter]);

  // ========================================
  // STATISTICS
  // ========================================

  const totalQuestions = questions.length;

  const mcqQuestions = questions.filter(
    (question) => getQuestionType(question) === "MCQ"
  ).length;

  const trueFalseQuestions = questions.filter(
    (question) => getQuestionType(question) === "True/False"
  ).length;

  const activeQuestions = questions.filter(
    (question) => question.quiz?.isPublished === true
  ).length;

  // ========================================
  // DELETE QUESTION
  // ========================================

  const handleDelete = async () => {
    if (!questionToDelete || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(`/questions/${questionToDelete._id}`);

      setQuestions((previousQuestions) =>
        previousQuestions.filter(
          (question) => question._id !== questionToDelete._id
        )
      );

      setSuccess("Question সফলভাবে delete হয়েছে।");
      setQuestionToDelete(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Question delete করা যায়নি। আবার চেষ্টা করো।"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <div className="w-full min-w-0 flex-1">
          {/* HEADER */}

          <header className="border-b border-slate-800 bg-[#020617]">
            <div className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Question Management
                </h1>
              </div>

              <div className="flex items-center gap-4">
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

          {/* MAIN CONTENT */}

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            {/* INTRO */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold">Questions</h2>

                <p className="mt-2 text-slate-400">
                  Create and manage questions for your quizzes.
                </p>
              </div>

              <Link
                to="/admin/questions/create"
                className="w-full rounded-lg bg-purple-600 px-5 py-3 text-center font-semibold transition hover:bg-purple-700 sm:w-auto"
              >
                + Add Question
              </Link>
            </div>

            {/* SUCCESS MESSAGE */}

            {success && (
              <div
                role="status"
                className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400"
              >
                {success}
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => {
                      fetchQuestions();
                      fetchQuizzes();
                    }}
                    className="rounded-lg bg-red-500/10 px-3 py-2 font-medium hover:bg-red-500/20"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* STATISTICS */}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-500">
                  Total Questions
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalQuestions}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-500">
                  MCQ Questions
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-400">
                  {mcqQuestions}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-500">
                  True / False
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-400">
                  {trueFalseQuestions}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-500">
                  Published Quiz Questions
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  {activeQuestions}
                </p>
              </div>
            </div>

            {/* FILTERS */}

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {/* SEARCH */}

                <div>
                  <label
                    htmlFor="question-search"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Search Question
                  </label>

                  <input
                    id="question-search"
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search question..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  />
                </div>

                {/* QUIZ FILTER */}

                <div>
                  <label
                    htmlFor="quiz-filter"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Quiz
                  </label>

                  <select
                    id="quiz-filter"
                    value={quizFilter}
                    onChange={(event) => setQuizFilter(event.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    <option value="All Quizzes">All Quizzes</option>

                    {quizOptions.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TYPE FILTER */}

                <div>
                  <label
                    htmlFor="type-filter"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Question Type
                  </label>

                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    <option value="All Types">All Types</option>
                    <option value="MCQ">MCQ</option>
                    <option value="True/False">True/False</option>
                  </select>
                </div>
              </div>
            </section>

            {/* QUESTION BANK */}

            <section className="mt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Question Bank</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Loading questions..."
                    : `${filteredQuestions.length} questions found`}
                </p>
              </div>

              {/* LOADING */}

              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-purple-500" />

                  <p className="mt-4 text-sm text-slate-400">
                    Loading questions from server...
                  </p>
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map((question, index) => {
                    const questionType = getQuestionType(question);

                    const quizTitle =
                      question.quiz?.title || "Unknown Quiz";

                    const isPublished =
                      question.quiz?.isPublished === true;

                    return (
                      <div
                        key={question._id}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 sm:p-6"
                      >
                        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
                          {/* QUESTION CONTENT */}

                          <div className="flex min-w-0 flex-1 gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 font-semibold text-purple-400">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-base font-medium leading-relaxed">
                                {question.questionText}
                              </p>

                              {/* OPTIONS */}

                              {question.options?.length > 0 && (
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                  {question.options.map((option, optionIndex) => (
                                    <div
                                      key={`${question._id}-${optionIndex}`}
                                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400"
                                    >
                                      <span className="mr-2 text-purple-400">
                                        {String.fromCharCode(65 + optionIndex)}.
                                      </span>

                                      {option}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* INFORMATION */}

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-400">
                                  {quizTitle}
                                </span>

                                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                                  {questionType}
                                </span>

                                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                                  {question.marks}{" "}
                                  {question.marks === 1 ? "Mark" : "Marks"}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs ${
                                    isPublished
                                      ? "bg-green-500/10 text-green-400"
                                      : "bg-yellow-500/10 text-yellow-400"
                                  }`}
                                >
                                  {isPublished ? "Published Quiz" : "Draft Quiz"}
                                </span>
                              </div>

                              {question.explanation && (
                                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                                  <span className="font-medium text-slate-400">
                                    Explanation:{" "}
                                  </span>
                                  {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ACTIONS */}

                          <div className="flex shrink-0 gap-2">
                            <Link
                              to={`/admin/questions/edit/${question._id}`}
                              className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-700"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => setQuestionToDelete(question)}
                              className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
                  <div className="text-4xl">🔍</div>

                  <h3 className="mt-4 font-semibold">
                    No questions found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {questions.length === 0
                      ? "এখনো কোনো Question তৈরি করা হয়নি। Add Question বাটনে ক্লিক করে তৈরি করো।"
                      : "Search অথবা Filter পরিবর্তন করে আবার চেষ্টা করো।"}
                  </p>

                  {questions.length === 0 && (
                    <Link
                      to="/admin/questions/create"
                      className="mt-5 inline-block rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-700"
                    >
                      + Create First Question
                    </Link>
                  )}
                </div>
              )}
            </section>

            {/* REFRESH */}

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSuccess("");
                  fetchQuestions();
                  fetchQuizzes();
                }}
                disabled={loading}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "↻ Refresh Questions"}
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}

      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                🗑️
              </div>

              <h2 className="text-xl font-semibold">Delete Question?</h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Are you sure you want to delete this question? This action
                cannot be undone.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm leading-relaxed text-slate-300">
                {questionToDelete.questionText}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminQuestions;