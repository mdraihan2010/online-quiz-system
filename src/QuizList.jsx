import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  BookOpen,
  Play,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import api from "./services/api";

const categoryIcons = {
  Programming: "💻",
  Database: "🗄️",
  "Computer Science": "⚙️",
  "Web Development": "🌐",
  Networking: "🌐",
};

function QuizList() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [difficulty, setDifficulty] = useState("All Levels");

  const [loading, setLoading] = useState(true);
  const [startingQuizId, setStartingQuizId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/quizzes");

        const payload = response.data;
        const quizData = Array.isArray(payload)
          ? payload
          : payload.data || payload.quizzes || [];

        if (active) {
          setQuizzes(
            quizData.filter((quiz) => quiz.isPublished === true)
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load quizzes. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchQuizzes();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    return [
      "All Categories",
      ...new Set(quizzes.map((quiz) => quiz.category).filter(Boolean)),
    ];
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const searchText =
        `${quiz.title || ""} ${quiz.description || ""} ${
          quiz.category || ""
        }`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesCategory =
        category === "All Categories" || quiz.category === category;
      const matchesDifficulty =
        difficulty === "All Levels" ||
        (quiz.difficulty || "").toLowerCase() === difficulty.toLowerCase();

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [quizzes, search, category, difficulty]);

  const startQuiz = async (quiz) => {
    try {
      setStartingQuizId(quiz._id);
      setError("");

      const response = await api.post(`/attempts/start/${quiz._id}`);
      const attemptId = response.data?.data?.attemptId;

      if (!attemptId) {
        throw new Error("Attempt ID was not returned by the server.");
      }

      navigate(`/quiz-attempt/${attemptId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start the quiz."
      );
    } finally {
      setStartingQuizId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <Link to="/" className="text-2xl font-bold">
            Quiz<span className="text-purple-500">Master</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link to="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link to="/quizzes" className="text-white">
              Quizzes
            </Link>
            <Link to="/leaderboard" className="hover:text-white">
              Leaderboard
            </Link>
          </div>

          <Link
            to="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold"
            aria-label="Profile"
          >
            U
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-10">
          <p className="mb-2 text-sm font-medium text-purple-400">
            QUIZ LIBRARY
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Explore Quizzes
          </h1>

          <p className="mt-3 text-lg text-slate-400">
            Choose a quiz, test your knowledge, and improve your skills.
          </p>
        </section>

        <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label
                htmlFor="quiz-search"
                className="mb-2 block text-sm text-slate-400"
              >
                Search
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 focus-within:border-purple-500">
                <Search size={18} className="text-slate-500" />

                <input
                  id="quiz-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search quizzes..."
                  className="w-full bg-transparent py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="quiz-category"
                className="mb-2 block text-sm text-slate-400"
              >
                Category
              </label>

              <select
                id="quiz-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-purple-500"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quiz-difficulty"
                className="mb-2 block text-sm text-slate-400"
              >
                Difficulty
              </label>

              <select
                id="quiz-difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-purple-500"
              >
                <option>All Levels</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            <p>{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Available Quizzes</h2>
          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? "Loading quizzes..."
              : `${filteredQuizzes.length} published quiz${
                  filteredQuizzes.length === 1 ? "" : "zes"
                } found`}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-purple-300">
            <LoaderCircle className="animate-spin" size={26} />
            Loading quizzes...
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
            <BookOpen size={40} className="mx-auto text-slate-500" />
            <h3 className="mt-4 text-xl font-semibold">
              No quizzes found
            </h3>
            <p className="mt-2 text-slate-400">
              Try another search or filter.
            </p>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => {
              const level = (quiz.difficulty || "easy").toLowerCase();

              const badgeClass =
                level === "easy"
                  ? "bg-green-500/10 text-green-400"
                  : level === "medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400";

              return (
                <article
                  key={quiz._id}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-purple-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                      {categoryIcons[quiz.category] || "📝"}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${badgeClass}`}
                    >
                      {level}
                    </span>
                  </div>

                  <div className="mt-6 flex-1">
                    <p className="mb-2 text-xs font-medium text-purple-400">
                      {quiz.category || "General"}
                    </p>

                    <h3 className="text-xl font-semibold">{quiz.title}</h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {quiz.description || "Test your knowledge with this quiz."}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-800 py-4 text-sm">
                    <div>
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <BookOpen size={14} />
                        Questions
                      </p>
                      <p className="mt-1 font-medium">
                        {quiz.questionCount ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={14} />
                        Duration
                      </p>
                      <p className="mt-1 font-medium">
                        {quiz.duration} min
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => startQuiz(quiz)}
                    disabled={
                      startingQuizId !== null ||
                      (quiz.questionCount ?? 0) < 1
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 font-semibold transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {startingQuizId === quiz._id ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Starting...
                      </>
                    ) : (quiz.questionCount ?? 0) < 1 ? (
                      "No Questions Available"
                    ) : (
                      <>
                        <Play size={17} />
                        Start Quiz
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <footer className="mt-10 border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="text-lg font-bold">
            Quiz<span className="text-purple-500">Master</span>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 QuizMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default QuizList;