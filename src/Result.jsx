import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  LoaderCircle,
  AlertCircle,
  RotateCcw,
  LayoutDashboard,
  ClipboardCheck,
} from "lucide-react";

import api from "./services/api";

function formatTime(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(value / 60);
  const remainingSeconds = value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const urlAttemptId = params.get("attemptId");

  const [result, setResult] = useState(
    location.state?.result || null
  );

  const [quizInfo, setQuizInfo] = useState(
    location.state?.quiz || null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resolve Attempt ID from navigation state or URL.
  const attemptId =
    result?.attemptId ||
    result?._id ||
    location.state?.attemptId ||
    urlAttemptId ||
    null;

  useEffect(() => {
    let active = true;

    async function fetchResult() {
      // If the result is available through navigation state,
      // use it immediately.
      if (location.state?.result) {
        if (active) {
          setResult(location.state.result);

          setQuizInfo(
            location.state.quiz ||
              location.state.result.quiz ||
              null
          );

          setError("");
          setLoading(false);
        }

        // If the navigation state already contains the quiz,
        // there is no need to fetch it again.
        if (
          location.state.quiz ||
          location.state.result.quiz
        ) {
          return;
        }
      }

      // If no Attempt ID is available, retain any existing result.
      if (!urlAttemptId) {
        if (!location.state?.result && active) {
          setResult(null);

          setError(
            "Result data is unavailable. Please open your completed quiz from Quiz History."
          );
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/attempts/${encodeURIComponent(urlAttemptId)}`
        );

        const data = response.data?.data;

        if (!data) {
          throw new Error(
            "Result data was not returned by the server."
          );
        }

        if (active) {
          setResult(data.result || data);

          // The backend may return quiz information separately
          // from the result object.
          setQuizInfo(
            data.quiz ||
              data.result?.quiz ||
              location.state?.quiz ||
              null
          );
        }
      } catch (err) {
        if (active) {
          if (!location.state?.result) {
            setResult(null);
          }

          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load the quiz result."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchResult();

    return () => {
      active = false;
    };
  }, [urlAttemptId, location.state]);

  const user = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  })();

  // Loading State
  if (loading && !result) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#020617] text-purple-300">
        <LoaderCircle size={28} className="animate-spin" />
        Loading result...
      </div>
    );
  }

  // Error State
  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <AlertCircle
            className="mx-auto text-yellow-400"
            size={40}
          />

          <h1 className="mt-4 text-2xl font-bold">
            Result Unavailable
          </h1>

          <p className="mt-3 text-slate-400">
            {error ||
              "We could not find the result for this attempt."}
          </p>

          <Link
            to="/quiz-history"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-700"
          >
            View Quiz History
          </Link>
        </div>
      </div>
    );
  }

  const score = Number(result.score) || 0;
  const totalMarks = Number(result.totalMarks) || 0;

  const percentage = Number.isFinite(
    Number(result.percentage)
  )
    ? Number(result.percentage)
    : totalMarks > 0
      ? (score / totalMarks) * 100
      : 0;

  const passed =
    result.isPassed === true ||
    result.isPassed === "true";

  const timeTaken = formatTime(
    result.timeTakenSeconds
  );

  const quizTitle =
    quizInfo?.title ||
    result.quiz?.title ||
    result.quizTitle ||
    "Quiz Completed";

  const category =
    quizInfo?.category ||
    result.quiz?.category ||
    result.category ||
    "General";

  const quizId =
    result.quizId ||
    quizInfo?._id ||
    quizInfo?.id ||
    result.quiz?._id ||
    result.quiz?.id;

  // Use the most reliable Attempt ID available.
  const currentAttemptId =
    result.attemptId ||
    result._id ||
    location.state?.attemptId ||
    urlAttemptId;

  const reviewPath = currentAttemptId
    ? `/review-answers?attemptId=${encodeURIComponent(
        currentAttemptId
      )}`
    : null;

  function handleReviewAnswers() {
    if (!currentAttemptId) {
      setError(
        "Attempt ID is unavailable. Please open this result from Quiz History."
      );

      return;
    }

    navigate(reviewPath);
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-2xl font-bold">
            Quiz<span className="text-purple-500">Master</span>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <Link
              to="/dashboard"
              className="hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              to="/quizzes"
              className="hover:text-white"
            >
              Quizzes
            </Link>

            <Link
              to="/quiz-history"
              className="hover:text-white"
            >
              History
            </Link>

            <Link
              to="/leaderboard"
              className="hover:text-white"
            >
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.name || "Student"}
              </p>

              <p className="text-xs text-slate-500">
                {user.role || "User"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold">
              {(user.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Result Header */}
        <section className="text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border text-4xl ${
              passed
                ? "border-green-500/20 bg-green-500/10"
                : "border-red-500/20 bg-red-500/10"
            }`}
          >
            {passed ? (
              <Trophy
                className="text-green-400"
                size={38}
              />
            ) : (
              <ClipboardCheck
                className="text-red-400"
                size={38}
              />
            )}
          </div>

          <p className="mt-6 text-sm font-medium text-purple-400">
            QUIZ COMPLETED
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            {passed
              ? "Congratulations"
              : "Keep Practicing"}
            , {user.name || "Student"}!
          </h1>

          <p className="mt-3 text-slate-400">
            {passed
              ? "You have successfully passed this quiz."
              : "Your quiz has been submitted. Keep learning and try again!"}
          </p>
        </section>

        {/* Quiz Information */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold">
            {quizTitle}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {category} • {totalMarks} Total Marks
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300"
          >
            {error}
          </div>
        )}

        {/* Main Result Card */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 md:p-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Your Score
              </p>

              <div className="mt-3 text-6xl font-bold text-purple-400">
                {percentage.toFixed(
                  percentage % 1 === 0 ? 0 : 2
                )}
                %
              </div>

              <p className="mt-2 text-slate-400">
                {score} out of {totalMarks} marks
              </p>

              <div
                className={`mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-2 ${
                  passed
                    ? "border-green-500/20 bg-green-500/10 text-green-400"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                {passed ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <XCircle size={17} />
                )}

                <span className="font-medium">
                  {passed ? "PASSED" : "NOT PASSED"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <ClipboardCheck size={18} />
                  </span>

                  <span className="text-slate-300">
                    Total Marks
                  </span>
                </div>

                <span className="font-semibold">
                  {totalMarks}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Clock size={18} />
                  </span>

                  <span className="text-slate-300">
                    Time Taken
                  </span>
                </div>

                <span className="font-semibold">
                  {timeTaken}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                    <CheckCircle2 size={18} />
                  </span>

                  <span className="text-slate-300">
                    Status
                  </span>
                </div>

                <span
                  className={`font-semibold ${
                    passed
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {passed ? "Passed" : "Not Passed"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Summary */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-xl font-bold">
            Performance Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Here is your result for this attempt.
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">
                Overall Performance
              </span>

              <span className="font-medium">
                {percentage.toFixed(
                  percentage % 1 === 0 ? 0 : 2
                )}
                %
              </span>
            </div>

            <div
              className="h-3 w-full overflow-hidden rounded-full bg-slate-800"
              role="progressbar"
              aria-valuenow={Math.min(
                100,
                Math.max(0, percentage)
              )}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, percentage)
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                Score
              </p>

              <p className="mt-2 text-2xl font-bold text-green-400">
                {score}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                Total Marks
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-200">
                {totalMarks}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                Accuracy
              </p>

              <p className="mt-2 text-2xl font-bold text-purple-400">
                {percentage.toFixed(
                  percentage % 1 === 0 ? 0 : 2
                )}
                %
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/quizzes"
            className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-7 py-3.5 text-center font-semibold transition hover:bg-purple-700"
          >
            <RotateCcw size={18} />
            Retake / Choose Quiz
          </Link>

          <button
            type="button"
            onClick={handleReviewAnswers}
            disabled={!currentAttemptId}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-7 py-3.5 text-center font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ClipboardCheck size={18} />
            Review Answers
          </button>

          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-7 py-3.5 text-center font-semibold transition hover:bg-slate-800"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        {quizId && (
          <p className="mt-6 text-center text-xs text-slate-600">
            Quiz ID: {quizId}
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800">
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

export default Result;