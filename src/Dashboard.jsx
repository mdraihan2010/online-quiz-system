import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  BookOpen,
  CheckCircle,
  Target,
  Trophy,
  Clock,
  RefreshCw,
} from "lucide-react";
import api from "./services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    availableQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    recentAttempts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get logged-in user information
  let user = {};

  try {
    user = JSON.parse(sessionStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  const userName = user.name || "Student";
  const userInitial = userName.charAt(0).toUpperCase();

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dashboard");

      setDashboardData({
        availableQuizzes: response.data.data.availableQuizzes ?? 0,
        completedQuizzes: response.data.data.completedQuizzes ?? 0,
        averageScore: response.data.data.averageScore ?? 0,
        recentAttempts: response.data.data.recentAttempts ?? [],
      });
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Logout functionality
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Statistics cards
  const statistics = [
    {
      title: "Available Quizzes",
      value: dashboardData.availableQuizzes,
      description: "Published quizzes",
      icon: BookOpen,
      color: "text-purple-400",
      background: "bg-purple-500/10",
    },
    {
      title: "Completed Quizzes",
      value: dashboardData.completedQuizzes,
      description: "Successfully completed",
      icon: CheckCircle,
      color: "text-green-400",
      background: "bg-green-500/10",
    },
    {
      title: "Average Score",
      value: `${dashboardData.averageScore}%`,
      description: "Across completed attempts",
      icon: Target,
      color: "text-blue-400",
      background: "bg-blue-500/10",
    },
    {
      title: "Current Rank",
      value: "—",
      description: "Leaderboard integration pending",
      icon: Trophy,
      color: "text-yellow-400",
      background: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-bold cursor-pointer shrink-0"
          >
            <span className="text-white">Quiz</span>
            <span className="text-purple-500">Master</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/quizzes")}
              className="hover:text-white transition"
            >
              Quizzes
            </button>

            <button
              onClick={() => navigate("/quiz-history")}
              className="hover:text-white transition"
            >
              History
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="hover:text-white transition"
            >
              Leaderboard
            </button>
          </div>

          {/* Profile and Logout */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 rounded-lg p-1 hover:bg-slate-900 transition"
              aria-label="Open profile"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-slate-500">
                  {user.role === "admin" ? "Admin" : "Student"}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-semibold">
                {userInitial}
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
              aria-label="Logout"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <section className="mb-10">
          <p className="text-purple-400 text-sm font-medium mb-2">
            STUDENT DASHBOARD
          </p>

          <h1 className="text-4xl md:text-5xl font-bold">
            Welcome back, {userName}! 👋
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Ready to test your knowledge and improve your score?
          </p>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-red-400 mb-3">{error}</p>

            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm hover:bg-red-500/30"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {statistics.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">{stat.title}</p>

                  <div
                    className={`w-10 h-10 rounded-xl ${stat.background} flex items-center justify-center`}
                  >
                    <Icon size={20} className={stat.color} />
                  </div>
                </div>

                <h2 className="text-3xl font-bold mt-4">
                  {loading ? "..." : stat.value}
                </h2>

                <p className="text-slate-500 text-sm mt-2">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Recent Quiz Attempts */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Recent Quiz Attempts</h2>
              <p className="text-slate-400 text-sm mt-1">
                Your latest quiz activity
              </p>
            </div>

            <button
              onClick={() => navigate("/quiz-history")}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              View All
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-slate-400">
                Loading your quiz activity...
              </div>
            ) : dashboardData.recentAttempts.length === 0 ? (
              <div className="p-10 text-center">
                <BookOpen
                  size={40}
                  className="mx-auto mb-4 text-slate-600"
                />

                <h3 className="text-lg font-semibold">
                  No quiz attempts yet
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Complete your first quiz to see your results here.
                </p>

                <button
                  onClick={() => navigate("/quizzes")}
                  className="mt-5 bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-semibold transition"
                >
                  Explore Quizzes
                </button>
              </div>
            ) : (
              dashboardData.recentAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="p-5 border-b border-slate-800 last:border-b-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {attempt.quiz?.title || "Quiz"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {attempt.quiz?.category || "General"} •{" "}
                      {formatDate(attempt.submittedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-purple-400 font-semibold">
                        {attempt.score ?? 0}/{attempt.totalMarks ?? 0}
                      </p>

                      <p className="text-xs text-slate-500">
                        {attempt.percentage ?? 0}% Score
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        attempt.isPassed
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {attempt.isPassed ? "Passed" : "Not Passed"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recommended Quizzes */}
        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Recommended Quizzes</h2>
            <p className="text-slate-400 text-sm mt-1">
              Explore quizzes and test your knowledge
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Published quizzes will appear in the Quizzes section.
            </p>

            <button
              onClick={() => navigate("/quizzes")}
              className="mt-5 bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-semibold transition"
            >
              Browse Quizzes
            </button>
          </div>
        </section>

        {/* Leaderboard Preview */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <p className="text-slate-400 text-sm mt-1">
                Compare your performance with other students
              </p>
            </div>

            <button
              onClick={() => navigate("/leaderboard")}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              View Full Leaderboard
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-slate-400">
              <Trophy size={22} className="text-yellow-400" />

              <p>
                Leaderboard statistics will be available when the leaderboard
                API is implemented.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800">
          <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-lg font-bold">
              <span className="text-white">Quiz</span>
              <span className="text-purple-500">Master</span>
            </div>

            <p className="text-sm text-slate-500">
              © 2026 QuizMaster. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;