import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "./services/api";

function formatTime(totalSeconds) {
  const seconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function QuizAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const answersRef = useRef({});
  const submittingRef = useRef(false);
  const deadlineRef = useRef(null);

  const loadAttempt = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/attempts/${attemptId}`);
      const data = response.data?.data;

      if (!data) {
        throw new Error("Attempt data was not returned by the server.");
      }

      if (data.status === "completed" || data.result) {
        navigate("/result", {
          replace: true,
          state: { result: data.result || data },
        });
        return;
      }

      const loadedQuestions = Array.isArray(data.questions)
        ? data.questions
        : [];

      if (loadedQuestions.length === 0) {
        throw new Error("No questions are available for this attempt.");
      }

      const initialAnswers = {};

      loadedQuestions.forEach((question) => {
        if (
          question.selectedOption !== null &&
          question.selectedOption !== undefined
        ) {
          initialAnswers[question._id] = question.selectedOption;
        }
      });

      answersRef.current = initialAnswers;
      setAnswers(initialAnswers);
      setQuestions(loadedQuestions);
      setAttempt(data);

      if (!data.deadline) {
        throw new Error("The quiz deadline was not provided by the server.");
      }

      const deadline = new Date(data.deadline).getTime();

      if (!Number.isFinite(deadline)) {
        throw new Error("The quiz deadline is invalid.");
      }

      deadlineRef.current = deadline;
      setSecondsRemaining(
        Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load this quiz attempt."
      );
    } finally {
      setLoading(false);
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);

  const submitQuiz = useCallback(
    async (automatic = false) => {
      if (submittingRef.current) return;

      submittingRef.current = true;
      setSubmitting(true);
      setError("");

      try {
        const response = await api.post(`/attempts/${attemptId}/submit`);
        const result =
          response.data?.data?.result || response.data?.data;

        if (!result) {
          throw new Error("The server did not return the quiz result.");
        }

        navigate("/result", {
          replace: true,
          state: { result },
        });
      } catch (err) {
        submittingRef.current = false;
        setSubmitting(false);

        setError(
          err.response?.data?.message ||
            (automatic
              ? "Automatic submission failed. Please try submitting again."
              : "Unable to submit the quiz. Please try again.")
        );
      }
    },
    [attemptId, navigate]
  );

  useEffect(() => {
    if (secondsRemaining === null || loading || submitting) return;

    if (secondsRemaining <= 0) {
      submitQuiz(true);
      return;
    }

    const timer = window.setTimeout(() => {
      if (deadlineRef.current) {
        setSecondsRemaining(
          Math.max(
            0,
            Math.ceil((deadlineRef.current - Date.now()) / 1000)
          )
        );
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [secondsRemaining, loading, submitting, submitQuiz]);

  const selectAnswer = async (question, optionIndex) => {
    if (submitting || secondsRemaining === 0) return;

    const questionId = question._id;

    const updatedAnswers = {
      ...answersRef.current,
      [questionId]: optionIndex,
    };

    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);
    setSavingQuestionId(questionId);
    setError("");

    try {
      await api.patch(`/attempts/${attemptId}/answers`, {
        answers: [
          {
            questionId,
            selectedOption: optionIndex,
          },
        ],
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save your answer. Please select the option again to retry."
      );
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleSubmit = () => {
    if (submittingRef.current) return;

    const unansweredCount = questions.filter(
      (question) => answersRef.current[question._id] === undefined
    ).length;

    const confirmation =
      unansweredCount > 0
        ? `You have ${unansweredCount} unanswered question(s). Submit anyway?`
        : "Are you sure you want to submit this quiz?";

    if (window.confirm(confirmation)) {
      submitQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#020617] text-purple-300">
        <LoaderCircle className="animate-spin" size={28} />
        Loading quiz...
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <AlertCircle className="mx-auto text-red-400" size={40} />
          <h1 className="mt-4 text-2xl font-bold">
            Unable to Load Quiz
          </h1>
          <p className="mt-3 text-slate-400">{error}</p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={loadAttempt}
              className="rounded-lg bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-700"
            >
              Retry
            </button>

            <Link
              to="/quizzes"
              className="rounded-lg bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-700"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  if (!question) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 text-white">
        No question is available.
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const timerIsLow = secondsRemaining !== null && secondsRemaining <= 60;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-slate-800 bg-[#020617]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link to="/" className="text-2xl font-bold">
            Quiz<span className="text-purple-500">Master</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <Link to="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <Link to="/quizzes" className="transition hover:text-white">
              Quizzes
            </Link>
            <span className="text-white">Quiz Attempt</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Time Remaining</p>
              <p
                className={`text-lg font-bold ${
                  timerIsLow ? "text-red-400" : "text-purple-400"
                }`}
              >
                {secondsRemaining === null
                  ? "--:--"
                  : formatTime(secondsRemaining)}
              </p>
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                timerIsLow
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-purple-500/30 bg-purple-600/20"
              }`}
            >
              <Clock size={20} />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-purple-400">
              {attempt?.quiz?.category || "QUIZ"}
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              {attempt?.quiz?.title || "Quiz Attempt"}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Answer each question before the timer expires.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
            <p className="text-xs text-slate-500">Progress</p>
            <p className="font-semibold">
              {currentQuestion + 1} / {questions.length}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7 md:p-9">
              <div className="mb-8 flex items-center justify-between gap-3">
                <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-400">
                  Question {currentQuestion + 1}
                </span>

                <span className="text-sm text-slate-500">
                  {question.marks ?? 1} mark(s)
                </span>
              </div>

              <h2 className="text-xl font-semibold leading-relaxed md:text-2xl">
                {question.questionText}
              </h2>

              <div className="mt-8 space-y-4">
                {question.options.map((option, index) => {
                  const isSelected = answers[question._id] === index;

                  return (
                    <button
                      type="button"
                      key={`${question._id}-${index}`}
                      disabled={submitting || secondsRemaining === 0}
                      onClick={() => selectAnswer(question, index)}
                      className={`w-full rounded-xl border p-4 text-left transition disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-800 bg-slate-950 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>

                        <span
                          className={
                            isSelected
                              ? "font-medium text-white"
                              : "text-slate-300"
                          }
                        >
                          {option}
                        </span>

                        {isSelected && (
                          <CheckCircle2
                            size={18}
                            className="ml-auto text-purple-400"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {savingQuestionId && (
                <p className="mt-4 text-sm text-purple-300">
                  Saving answer...
                </p>
              )}

              <div className="mt-10 flex items-center justify-between gap-3 border-t border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestion((index) => Math.max(0, index - 1))
                  }
                  disabled={currentQuestion === 0 || submitting}
                  className="rounded-lg bg-slate-800 px-5 py-3 font-medium transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                {currentQuestion === questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold transition hover:bg-green-700 disabled:opacity-60"
                  >
                    {submitting && (
                      <LoaderCircle size={18} className="animate-spin" />
                    )}
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestion((index) =>
                        Math.min(questions.length - 1, index + 1)
                      )
                    }
                    disabled={submitting}
                    className="rounded-lg bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-700 disabled:opacity-60"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Question Navigator</h2>
              <span className="text-xs text-slate-500">
                {answeredCount}/{questions.length} answered
              </span>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-3">
              {questions.map((item, index) => {
                const isAnswered = answers[item._id] !== undefined;
                const isCurrent = currentQuestion === index;

                return (
                  <button
                    type="button"
                    key={item._id}
                    onClick={() => setCurrentQuestion(index)}
                    disabled={submitting}
                    aria-label={`Go to question ${index + 1}`}
                    className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
                      isCurrent
                        ? "bg-purple-600 text-white"
                        : isAnswered
                        ? "border border-green-500/30 bg-green-500/20 text-green-400"
                        : "border border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-purple-600" />
                <span className="text-slate-400">Current</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-slate-400">Answered</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-slate-700" />
                <span className="text-slate-400">Not Answered</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-8 w-full rounded-lg bg-green-600 py-3.5 font-semibold transition hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              You can review your answers before submitting.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default QuizAttempt;