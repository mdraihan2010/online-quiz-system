import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

function AdminQuizForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  // URL-এ ID থাকলে Edit Mode, না থাকলে Create Mode
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "easy",
    duration: 10,
    totalMarks: 10,
    passingMarks: 5,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // LOAD EXISTING QUIZ FOR EDITING
  // ========================================

  useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;

    const fetchQuiz = async () => {
      try {
        setFetching(true);
        setError("");

        const response = await api.get(`/quizzes/${id}`);

        if (!response.data.success) {
          throw new Error("Failed to load quiz information.");
        }

        const quiz = response.data.data;

        if (isMounted) {
          setFormData({
            title: quiz.title || "",
            description: quiz.description || "",
            category: quiz.category || "",
            difficulty: quiz.difficulty || "easy",
            duration: quiz.duration ?? 10,
            totalMarks: quiz.totalMarks ?? 10,
            passingMarks: quiz.passingMarks ?? 5,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not load quiz information."
          );
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    fetchQuiz();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  // ========================================
  // HANDLE INPUT CHANGES
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // HANDLE FORM SUBMISSION
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = formData.title.trim();
    const description = formData.description.trim();
    const category = formData.category.trim();

    const duration = Number(formData.duration);
    const totalMarks = Number(formData.totalMarks);
    const passingMarks = Number(formData.passingMarks);

    if (!title || !category) {
      setError("Quiz title and category are required.");
      return;
    }

    if (title.length < 3 || title.length > 120) {
      setError("Quiz title must be between 3 and 120 characters.");
      return;
    }

    if (!["easy", "medium", "hard"].includes(formData.difficulty)) {
      setError("Please select a valid difficulty.");
      return;
    }

    if (
      !Number.isFinite(duration) ||
      !Number.isFinite(totalMarks) ||
      !Number.isFinite(passingMarks) ||
      !Number.isInteger(duration) ||
      !Number.isInteger(totalMarks) ||
      !Number.isInteger(passingMarks) ||
      duration < 1 ||
      duration > 600 ||
      totalMarks < 1 ||
      passingMarks < 0 ||
      passingMarks > totalMarks
    ) {
      setError(
        "Enter valid numbers. Duration must be 1–600 minutes, and passing marks cannot exceed total marks."
      );
      return;
    }

    const payload = {
      title,
      description,
      category,
      difficulty: formData.difficulty,
      duration,
      totalMarks,
      passingMarks,
    };

    try {
      setLoading(true);

      let response;

      if (isEditMode) {
        // Update existing quiz
        response = await api.patch(`/quizzes/${id}`, payload);
      } else {
        // Create new quiz
        response = await api.post("/quizzes", payload);
      }

      if (response.data.success) {
        setSuccess(
          isEditMode
            ? "Quiz updated successfully!"
            : "Quiz created successfully as a draft!"
        );

        setTimeout(() => {
          navigate("/admin/quizzes", { replace: true });
        }, 800);
      } else {
        setError(
          isEditMode
            ? "Unable to update quiz."
            : "Unable to create quiz."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isEditMode
            ? "Failed to update quiz. Please try again."
            : "Failed to create quiz. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <AdminSidebar />

          <main className="flex flex-1 items-center justify-center p-8">
            <p className="text-slate-400">
              Loading quiz information...
            </p>
          </main>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="border-b border-slate-800 px-4 py-5 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-purple-400">
              ADMIN PANEL
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              {isEditMode ? "Edit Quiz" : "Create Quiz"}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {isEditMode
                ? "Update your quiz information."
                : "Add a new quiz to your QuizMaster platform."}
            </p>
          </header>

          <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="mb-8">
                <h2 className="text-xl font-bold">
                  Quiz Information
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Fill in the details below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium"
                  >
                    Quiz Title *
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Python Fundamentals"
                    minLength={3}
                    maxLength={120}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-purple-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this quiz covers..."
                    rows={4}
                    maxLength={1000}
                    className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-purple-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category *
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Programming"
                    maxLength={80}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-purple-500"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label
                    htmlFor="difficulty"
                    className="mb-2 block text-sm font-medium"
                  >
                    Difficulty *
                  </label>

                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-purple-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="duration"
                    className="mb-2 block text-sm font-medium"
                  >
                    Duration (minutes) *
                  </label>

                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    max="600"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-purple-500"
                  />
                </div>

                {/* Marks */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="totalMarks"
                      className="mb-2 block text-sm font-medium"
                    >
                      Total Marks *
                    </label>

                    <input
                      id="totalMarks"
                      name="totalMarks"
                      type="number"
                      min="1"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="passingMarks"
                      className="mb-2 block text-sm font-medium"
                    >
                      Passing Marks *
                    </label>

                    <input
                      id="passingMarks"
                      name="passingMarks"
                      type="number"
                      min="0"
                      max={formData.totalMarks}
                      value={formData.passingMarks}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Notice */}
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-300">
                  {isEditMode
                    ? "Quiz-এর তথ্য পরিবর্তন করলে Save Changes বাটনে ক্লিক করো।"
                    : "নতুন Quiz প্রথমে Draft হিসেবে সংরক্ষিত হবে। প্রশ্ন যোগ করে প্রস্তুত করার পর সেটি প্রকাশ করা যাবে।"}
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div
                    role="status"
                    className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300"
                  >
                    {success}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
                  <Link
                    to="/admin/quizzes"
                    className="rounded-lg border border-slate-700 px-5 py-3 text-center font-medium transition hover:bg-slate-800"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? isEditMode
                        ? "Saving Changes..."
                        : "Creating Quiz..."
                      : isEditMode
                      ? "Save Changes"
                      : "Create Quiz"}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminQuizForm;