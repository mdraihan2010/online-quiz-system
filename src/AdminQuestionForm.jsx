import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  LoaderCircle,
} from "lucide-react";

import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

function AdminQuestionForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  // ========================================
  // FORM STATE
  // ========================================

  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState("");

  const [questionType, setQuestionType] =
    useState("Multiple Choice");

  const [question, setQuestion] = useState("");

  const [options, setOptions] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
    { id: 3, text: "" },
    { id: 4, text: "" },
  ]);

  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(0);

  const [marks, setMarks] = useState(1);
  const [order, setOrder] = useState(1);
  const [explanation, setExplanation] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // FETCH QUIZZES
  // ========================================

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await api.get("/quizzes");

      if (response.data.success) {
        const quizList = response.data.data || [];

        setQuizzes(quizList);

        // Default quiz for Create Mode
        if (!isEditMode && quizList.length > 0) {
          setQuiz((previousQuiz) => {
            if (previousQuiz) return previousQuiz;

            return String(quizList[0]._id);
          });
        }
      }
    } catch (err) {
      console.error("Failed to load quizzes:", err);

      setError(
        err.response?.data?.message ||
          "Quiz list load করা যায়নি। Backend এবং login status পরীক্ষা করো।"
      );
    }
  }, [isEditMode]);

  // ========================================
  // FETCH EXISTING QUESTION
  // ========================================

  const fetchQuestion = useCallback(async () => {
    if (!isEditMode) {
      setInitialLoading(false);
      return;
    }

    try {
      setInitialLoading(true);
      setError("");

      const response = await api.get(`/questions/${id}`);

      const data = response.data.data;

      if (!data) {
        throw new Error("Question data পাওয়া যায়নি।");
      }

      setQuestion(data.questionText || "");
      setQuiz(String(data.quiz?._id || data.quiz || ""));

      setMarks(data.marks || 1);
      setOrder(data.order || 1);
      setExplanation(data.explanation || "");

      const loadedOptions = (data.options || []).map(
        (text, index) => ({
          id: index + 1,
          text,
        })
      );

      setOptions(
        loadedOptions.length >= 2
          ? loadedOptions
          : [
              { id: 1, text: "" },
              { id: 2, text: "" },
            ]
      );

      // The current GET API excludes correctAnswer.
      // Therefore, existing correct answer cannot be
      // preselected until the backend supports an admin-only
      // answer field in the response.
      setCorrectAnswer(0);
      setTrueFalseAnswer(0);
      setQuestionType(
        loadedOptions.length === 2
          ? "True/False"
          : "Multiple Choice"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Question load করা যায়নি।"
      );
    } finally {
      setInitialLoading(false);
    }
  }, [id, isEditMode]);

  // ========================================
  // INITIAL DATA
  // ========================================

  useEffect(() => {
    fetchQuizzes();
    fetchQuestion();
  }, [fetchQuizzes, fetchQuestion]);

  // ========================================
  // HANDLE QUESTION TYPE CHANGE
  // ========================================

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    setError("");

    if (value === "True/False") {
      setOptions([
        { id: 1, text: "True" },
        { id: 2, text: "False" },
      ]);

      setCorrectAnswer(trueFalseAnswer);
    } else {
      setOptions((previousOptions) => {
        if (
          previousOptions.length === 2 &&
          previousOptions[0].text === "True" &&
          previousOptions[1].text === "False"
        ) {
          return [
            { id: Date.now(), text: "" },
            { id: Date.now() + 1, text: "" },
            { id: Date.now() + 2, text: "" },
            { id: Date.now() + 3, text: "" },
          ];
        }

        return previousOptions;
      });

      setCorrectAnswer(0);
    }
  };

  // ========================================
  // ADD OPTION
  // ========================================

  const addOption = () => {
    if (options.length >= 6) {
      setError("সর্বোচ্চ ৬টি Option যোগ করা যাবে।");
      return;
    }

    setError("");

    setOptions((previousOptions) => [
      ...previousOptions,
      {
        id: Date.now(),
        text: "",
      },
    ]);
  };

  // ========================================
  // REMOVE OPTION
  // ========================================

  const removeOption = (optionId) => {
    if (options.length <= 2) {
      setError("কমপক্ষে ২টি Option রাখতে হবে।");
      return;
    }

    const removedIndex = options.findIndex(
      (option) => option.id === optionId
    );

    const updatedOptions = options.filter(
      (option) => option.id !== optionId
    );

    setOptions(updatedOptions);

    if (removedIndex === correctAnswer) {
      setCorrectAnswer(0);
    } else if (removedIndex < correctAnswer) {
      setCorrectAnswer((previous) => previous - 1);
    }

    setError("");
  };

  // ========================================
  // UPDATE OPTION
  // ========================================

  const updateOption = (optionId, value) => {
    setOptions((previousOptions) =>
      previousOptions.map((option) =>
        option.id === optionId
          ? { ...option, text: value }
          : option
      )
    );
  };

  // ========================================
  // VALIDATE FORM
  // ========================================

  const validateForm = () => {
    if (!quiz) {
      return "একটি Quiz নির্বাচন করো।";
    }

    if (!question.trim()) {
      return "Question লিখতে হবে।";
    }

    if (question.trim().length > 2000) {
      return "Question সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।";
    }

    if (!Number.isInteger(Number(marks)) || Number(marks) < 1) {
      return "Marks অবশ্যই ১ বা তার বেশি পূর্ণসংখ্যা হতে হবে।";
    }

    if (!Number.isInteger(Number(order)) || Number(order) < 1) {
      return "Question Order অবশ্যই ১ বা তার বেশি পূর্ণসংখ্যা হতে হবে।";
    }

    if (options.length < 2 || options.length > 6) {
      return "২ থেকে ৬টি Option থাকতে হবে।";
    }

    if (options.some((option) => !option.text.trim())) {
      return "সব Option পূরণ করতে হবে।";
    }

    const normalizedOptions = options.map((option) =>
      option.text.trim().toLowerCase()
    );

    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      return "একই Option একাধিকবার দেওয়া যাবে না।";
    }

    if (
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer >= options.length
    ) {
      return "সঠিক উত্তর নির্বাচন করো।";
    }

    if (explanation.length > 1000) {
      return "Explanation সর্বোচ্চ ১০০০ অক্ষরের হতে পারবে।";
    }

    return "";
  };

  // ========================================
  // CREATE / UPDATE QUESTION
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      quizId: quiz,
      questionText: question.trim(),
      options: options.map((option) => option.text.trim()),
      correctAnswer: Number(correctAnswer),
      marks: Number(marks),
      explanation: explanation.trim(),
      order: Number(order),
    };

    try {
      setLoading(true);

      if (isEditMode) {
        await api.patch(`/questions/${id}`, payload);

        setSuccess("Question সফলভাবে Update হয়েছে।");
      } else {
        await api.post("/questions", payload);

        setSuccess("Question সফলভাবে তৈরি হয়েছে।");
      }

      // Let the user see the success message briefly.
      setTimeout(() => {
        navigate("/admin/questions");
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isEditMode
            ? "Question Update করা যায়নি।"
            : "Question তৈরি করা যায়নি।")
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOADING
  // ========================================

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <AdminSidebar />

          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <LoaderCircle
                size={36}
                className="mx-auto animate-spin text-indigo-500"
              />

              <p className="mt-4 text-slate-400">
                Question load হচ্ছে...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <div className="w-full min-w-0 flex-1">
          {/* HEADER */}

          <header className="border-b border-slate-800 bg-slate-900">
            <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditMode ? "Edit Question" : "Create Question"}
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  {isEditMode
                    ? `Update question #${id}`
                    : "Add a new question to the question bank"}
                </p>
              </div>

              <Link
                to="/admin/questions"
                className="flex w-fit items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                <ArrowLeft size={18} />
                Back to Questions
              </Link>
            </div>
          </header>

          {/* FORM */}

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
              >
                {/* ERROR MESSAGE */}

                {error && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
                  >
                    <AlertCircle size={20} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* SUCCESS MESSAGE */}

                {success && (
                  <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400"
                  >
                    <CheckCircle size={20} className="shrink-0" />
                    <p>{success}</p>
                  </div>
                )}

                {/* BASIC INFORMATION */}

                <section className="mb-8">
                  <h2 className="mb-5 text-lg font-semibold">
                    Basic Information
                  </h2>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="quiz"
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        Quiz <span className="text-red-400">*</span>
                      </label>

                      <select
                        id="quiz"
                        value={quiz}
                        onChange={(event) => setQuiz(event.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                      >
                        <option value="">Select a Quiz</option>

                        {quizzes.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.title}
                            {item.isPublished ? "" : " (Draft)"}
                          </option>
                        ))}
                      </select>

                      {quizzes.length === 0 && (
                        <p className="mt-2 text-xs text-yellow-400">
                          কোনো Quiz পাওয়া যায়নি। আগে একটি Quiz তৈরি করো।
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="question-type"
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        Question Type
                      </label>

                      <select
                        id="question-type"
                        value={questionType}
                        onChange={(event) =>
                          handleQuestionTypeChange(event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                      >
                        <option value="Multiple Choice">
                          Multiple Choice
                        </option>

                        <option value="True/False">True/False</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* QUESTION */}

                <section className="mb-8">
                  <h2 className="mb-5 text-lg font-semibold">
                    Question
                  </h2>

                  <textarea
                    rows={5}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Write your question here..."
                    maxLength={2000}
                    required
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                  />

                  <p className="mt-2 text-right text-xs text-slate-500">
                    {question.length}/2000
                  </p>
                </section>

                {/* OPTIONS */}

                <section className="mb-8">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">
                      Answer Options
                    </h2>

                    {questionType === "Multiple Choice" && (
                      <button
                        type="button"
                        onClick={addOption}
                        disabled={options.length >= 6}
                        className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={17} />
                        Add Option
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {options.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-semibold">
                          {String.fromCharCode(65 + index)}
                        </div>

                        <input
                          type="text"
                          value={option.text}
                          onChange={(event) =>
                            updateOption(option.id, event.target.value)
                          }
                          readOnly={questionType === "True/False"}
                          required
                          maxLength={500}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 read-only:cursor-not-allowed read-only:opacity-80"
                        />

                        {questionType === "Multiple Choice" && (
                          <button
                            type="button"
                            onClick={() => removeOption(option.id)}
                            disabled={options.length <= 2}
                            aria-label={`Remove option ${index + 1}`}
                            className="shrink-0 rounded-lg border border-slate-700 p-3 text-slate-400 transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* QUESTION SETTINGS */}

                <section className="mb-8">
                  <h2 className="mb-5 text-lg font-semibold">
                    Question Settings
                  </h2>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label
                        htmlFor="correct-answer"
                        className="mb-2 block text-sm text-slate-300"
                      >
                        Correct Answer
                      </label>

                      <select
                        id="correct-answer"
                        value={correctAnswer}
                        onChange={(event) => {
                          const value = Number(event.target.value);

                          setCorrectAnswer(value);

                          if (questionType === "True/False") {
                            setTrueFalseAnswer(value);
                          }
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                      >
                        {options.map((option, index) => (
                          <option key={option.id} value={index}>
                            Option {String.fromCharCode(65 + index)}:{" "}
                            {option.text || "(Empty)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="marks"
                        className="mb-2 block text-sm text-slate-300"
                      >
                        Marks
                      </label>

                      <input
                        id="marks"
                        type="number"
                        value={marks}
                        min={1}
                        step={1}
                        onChange={(event) => setMarks(event.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="order"
                        className="mb-2 block text-sm text-slate-300"
                      >
                        Question Order
                      </label>

                      <input
                        id="order"
                        type="number"
                        value={order}
                        min={1}
                        step={1}
                        onChange={(event) => setOrder(event.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </section>

                {/* EXPLANATION */}

                <section className="mb-8">
                  <h2 className="mb-5 text-lg font-semibold">
                    Explanation
                  </h2>

                  <textarea
                    rows={4}
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                    placeholder="Explain why the correct answer is correct..."
                    maxLength={1000}
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                  />

                  <p className="mt-2 text-right text-xs text-slate-500">
                    {explanation.length}/1000
                  </p>
                </section>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
                  <Link
                    to="/admin/questions"
                    className="rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={loading || quizzes.length === 0}
                    className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}

                    {loading
                      ? "Saving..."
                      : isEditMode
                        ? "Update Question"
                        : "Save Question"}
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

export default AdminQuestionForm;