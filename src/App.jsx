import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";
import api from "./services/api";

import Home from "./Home";
import Dashboard from "./Dashboard";
import QuizList from "./QuizList";
import QuizDetails from "./QuizDetails";
import QuizAttempt from "./QuizAttempt";
import Result from "./Result";
import QuizHistory from "./QuizHistory";
import ReviewAnswers from "./ReviewAnswers";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";

import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminCategories from "./AdminCategories";
import AdminQuizzes from "./AdminQuizzes";
import AdminQuestions from "./AdminQuestions";
import AdminQuestionForm from "./AdminQuestionForm";
import AdminAttempts from "./AdminAttempts";
import AdminAttemptDetails from "./AdminAttemptDetails";
import AdminResults from "./AdminResults";
import AdminResultDetails from "./AdminResultDetails";
import AdminAnalytics from "./AdminAnalytics";
import AdminQuizForm from "./AdminQuizForm";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// ========================================
// LOGIN
// ========================================

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        sessionStorage.setItem("token", response.data.token);

        sessionStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        if (response.data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-2">
            Welcome Back
          </h1>

          <p className="text-slate-400 text-center mb-8">
            Login to continue your quiz journey
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-purple-400 hover:text-purple-300"
            >
              Register
            </Link>
          </p>

          <div className="text-center mt-4">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// REGISTER
// ========================================

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      if (response.data.success) {
        setSuccess(
          "Registration successful! Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-2">
            Create Account
          </h1>

          <p className="text-slate-400 text-center mb-8">
            Join QuizMaster and start learning
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                minLength={2}
                maxLength={50}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300"
            >
              Login
            </Link>
          </p>

          <div className="text-center mt-4">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// APP ROUTES
// ========================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/quizzes" element={<QuizList />} />

          <Route
            path="/quiz-details"
            element={<QuizDetails />}
          />

          <Route
            path="/quiz-attempt/:attemptId"
            element={<QuizAttempt />}
          />

          <Route path="/result" element={<Result />} />

          <Route
            path="/quiz-history"
            element={<QuizHistory />}
          />

          {/* NEW: Review Answers Page */}
          <Route
            path="/review-answers"
            element={<ReviewAnswers />}
          />

          <Route
            path="/leaderboard"
            element={<Leaderboard />}
          />

          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/categories"
            element={<AdminCategories />}
          />

          <Route
            path="/admin/quizzes"
            element={<AdminQuizzes />}
          />

          <Route
            path="/admin/questions"
            element={<AdminQuestions />}
          />

          <Route
            path="/admin/questions/create"
            element={<AdminQuestionForm />}
          />

          <Route
            path="/admin/questions/edit/:id"
            element={<AdminQuestionForm />}
          />

          <Route
            path="/admin/attempts"
            element={<AdminAttempts />}
          />

          <Route
            path="/admin/attempts/:id"
            element={<AdminAttemptDetails />}
          />

          <Route
            path="/admin/results"
            element={<AdminResults />}
          />

          <Route
            path="/admin/results/:id"
            element={<AdminResultDetails />}
          />

          <Route
            path="/admin/analytics"
            element={<AdminAnalytics />}
          />

          <Route
            path="/admin/quizzes/create"
            element={<AdminQuizForm />}
          />

          <Route
            path="/admin/quizzes/edit/:id"
            element={<AdminQuizForm />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;