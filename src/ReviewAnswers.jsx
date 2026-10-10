import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  BookOpen,
  Trophy,
  Clock,
  CircleHelp,
  AlertCircle,
} from "lucide-react";

import api from "./services/api";

function formatTime(seconds = 0) {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function normalizeIndex(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }

    const letterMatch = trimmed.match(/^([A-Z])$/i);

    if (letterMatch) {
      return letterMatch[1].toUpperCase().charCodeAt(0) - 65;
    }
  }

  return null;
}

function getQuestionStatus(question) {
  if (typeof question.isCorrect === "boolean") {
    return question.isCorrect ? "correct" : "incorrect";
  }

  const selectedOption = normalizeIndex(question.selectedOption);
  const correctOption = normalizeIndex(question.correctOption);

  if (selectedOption === null) {
    return "unanswered";
  }

  if (correctOption !== null) {
    return selectedOption === correctOption ? "correct" : "incorrect";
  }

  return "unknown";
}

export default function ReviewAnswers() {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchReview() {
      if (!attemptId) {
        setError(
          "Attempt ID পাওয়া যায়নি। অনুগ্রহ করে Result Page থেকে আবার চেষ্টা করো।"
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/attempts/${encodeURIComponent(attemptId)}/review`
        );

        const data = response.data?.data;

        if (!data || !Array.isArray(data.questions)) {
          throw new Error("Review data-এর format সঠিক নয়।");
        }

        if (isMounted) {
          setReviewData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Review Answers লোড করা যায়নি। আবার চেষ্টা করো।"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchReview();

    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  const answerSummary = useMemo(() => {
    const questions = reviewData?.questions || [];

    const correct = questions.filter(
      (question) => getQuestionStatus(question) === "correct"
    ).length;

    const incorrect = questions.filter(
      (question) => getQuestionStatus(question) === "incorrect"
    ).length;

    const unanswered = questions.filter(
      (question) => getQuestionStatus(question) === "unanswered"
    ).length;

    const unknown = questions.filter(
      (question) => getQuestionStatus(question) === "unknown"
    ).length;

    return {
      correct,
      incorrect,
      unanswered,
      unknown,
      total: questions.length,
    };
  }, [reviewData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-4 h-10 w-10 animate-spin text-indigo-400" />

          <p className="text-lg font-medium">
            Loading your answer review...
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Please wait while we prepare your results.
          </p>
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />

          <h1 className="text-2xl font-bold">
            Unable to Load Review
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error || "Review data পাওয়া যায়নি।"}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { quiz, result, questions = [] } = reviewData;

  const totalMarks =
    Number(result?.totalMarks ?? quiz?.totalMarks) || 0;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/result?attemptId=${encodeURIComponent(attemptId)}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Result
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-indigo-400">
                <BookOpen size={20} />

                <span className="text-sm font-semibold uppercase tracking-wider">
                  Answer Review
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {quiz?.title || "Quiz Review"}
              </h1>

              <p className="mt-2 text-slate-400">
                Review your answers and learn from your mistakes.
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                result?.isPassed
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {result?.isPassed ? (
                <CheckCircle2 size={18} />
              ) : (
                <XCircle size={18} />
              )}

              {result?.isPassed ? "Quiz Passed" : "Quiz Failed"}
            </div>
          </div>
        </div>

        {/* Result Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex items-center gap-2 text-slate-400">
              <Trophy size={19} />
              <span className="text-sm">Your Score</span>
            </div>

            <p className="text-3xl font-bold text-white">
              {result?.score ?? 0}
              <span className="text-lg text-slate-500">
                {" "}/ {totalMarks}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex items-center gap-2 text-slate-400">
              <CircleHelp size={19} />
              <span className="text-sm">Percentage</span>
            </div>

            <p className="text-3xl font-bold text-indigo-400">
              {result?.percentage ?? 0}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex items-center gap-2 text-slate-400">
              <CheckCircle2 size={19} />
              <span className="text-sm">Correct Answers</span>
            </div>

            <p className="text-3xl font-bold text-emerald-400">
              {answerSummary.correct}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Out of {answerSummary.total} questions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex items-center gap-2 text-slate-400">
              <Clock size={19} />
              <span className="text-sm">Time Taken</span>
            </div>

            <p className="text-3xl font-bold text-white">
              {formatTime(result?.timeTakenSeconds)}
            </p>
          </div>
        </div>

        {/* Answer Legend */}
        <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            Correct Answer ({answerSummary.correct})
          </div>

          <div className="flex items-center gap-2 text-red-400">
            <XCircle size={18} />
            Incorrect Answer ({answerSummary.incorrect})
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <CircleHelp size={18} />
            Unanswered ({answerSummary.unanswered})
          </div>
        </div>

        {answerSummary.unknown > 0 && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-300">
            কিছু প্রশ্নের সঠিক উত্তর নির্ধারণ করার মতো তথ্য Backend থেকে পাওয়া যায়নি।
            এই প্রশ্নগুলোর Status নির্ভুলভাবে দেখাতে Review API পরীক্ষা করতে হবে।
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            const selectedOption = normalizeIndex(question.selectedOption);
            const correctOption = normalizeIndex(question.correctOption);
            const status = getQuestionStatus(question);

            const hasAnswer = selectedOption !== null;

            return (
              <div
                key={question.questionId || question._id || index}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
              >
                {/* Question Header */}
                <div className="flex flex-col gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-slate-300">
                      {index + 1}
                    </span>

                    <div>
                      <h2 className="text-lg font-semibold leading-7 text-white">
                        {question.questionText}
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        Marks: {question.marks ?? 0}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      status === "correct"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : status === "incorrect"
                          ? "bg-red-500/10 text-red-400"
                          : status === "unanswered"
                            ? "bg-slate-800 text-slate-400"
                            : "bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {status === "correct" ? (
                      <CheckCircle2 size={15} />
                    ) : status === "incorrect" ? (
                      <XCircle size={15} />
                    ) : (
                      <CircleHelp size={15} />
                    )}

                    {status === "correct"
                      ? "Correct"
                      : status === "incorrect"
                        ? "Incorrect"
                        : status === "unanswered"
                          ? "Unanswered"
                          : "Status unavailable"}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3 p-5 sm:p-6">
                  {question.options?.map((option, optionIndex) => {
                    const isSelected = selectedOption === optionIndex;
                    const isCorrectOption = correctOption === optionIndex;

                    let optionStyle =
                      "border-slate-700 bg-slate-950/50 text-slate-300";

                    if (isCorrectOption) {
                      optionStyle =
                        "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                    } else if (isSelected && status === "incorrect") {
                      optionStyle =
                        "border-red-500/50 bg-red-500/10 text-red-300";
                    }

                    return (
                      <div
                        key={`${question.questionId || index}-${optionIndex}`}
                        className={`flex items-center gap-3 rounded-xl border p-4 ${optionStyle}`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/30 text-sm font-semibold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>

                        <span className="flex-1 text-sm leading-6 sm:text-base">
                          {option}
                        </span>

                        {isSelected && (
                          <span className="text-xs font-semibold">
                            Your Answer
                          </span>
                        )}

                        {isCorrectOption && (
                          <CheckCircle2
                            size={20}
                            className="shrink-0 text-emerald-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="border-t border-slate-800 bg-slate-950/50 p-5 sm:p-6">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-indigo-300">
                    <BookOpen size={18} />
                    Explanation
                  </h3>

                  <p className="text-sm leading-7 text-slate-400">
                    {question.explanation ||
                      "No explanation is available for this question."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <h2 className="text-xl font-bold">
            Keep Learning! 🚀
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            You answered {answerSummary.correct} correctly,{" "}
            {answerSummary.incorrect} incorrectly, and{" "}
            {answerSummary.unanswered} questions were unanswered.
            Review the explanations to improve your knowledge.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500"
            >
              Back to Home
            </Link>

            <Link
              to="/quiz-history"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold transition hover:bg-slate-800"
            >
              View Quiz History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}