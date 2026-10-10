import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Crown,
  GraduationCap,
  Medal,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

import api from "./services/api";

// ========================================
// CONSTANTS
// ========================================

const PERIOD_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
];

const ALL_CATEGORIES = "All Categories";

const EMPTY_STATS = {
  rank: null,
  points: 0,
  completedQuizzes: 0,
  averagePercentage: 0,
  passedQuizzes: 0,
  totalParticipants: 0,
};

// ========================================
// HELPERS
// ========================================

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatPercentage(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U"
  );
}

function getRankStyle(rank) {
  if (rank === 1) {
    return {
      text: "text-yellow-300",
      background: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    };
  }

  if (rank === 2) {
    return {
      text: "text-slate-200",
      background: "bg-slate-300/10",
      border: "border-slate-300/20",
    };
  }

  if (rank === 3) {
    return {
      text: "text-orange-300",
      background: "bg-orange-400/10",
      border: "border-orange-400/20",
    };
  }

  return {
    text: "text-slate-400",
    background: "bg-slate-800/80",
    border: "border-slate-700",
  };
}

function getPeriodLabel(period) {
  return (
    PERIOD_OPTIONS.find((item) => item.value === period)?.label ||
    "All Time"
  );
}

// ========================================
// SMALL COMPONENTS
// ========================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent = "purple",
}) {
  const accents = {
    purple: {
      icon: "text-purple-300 bg-purple-500/10 border-purple-500/20",
      glow: "from-purple-500/10",
    },
    yellow: {
      icon: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
      glow: "from-yellow-500/10",
    },
    emerald: {
      icon: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
      glow: "from-emerald-500/10",
    },
    blue: {
      icon: "text-blue-300 bg-blue-500/10 border-blue-500/20",
      glow: "from-blue-500/10",
    },
  };

  const theme = accents[accent] || accents.purple;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-slate-700 sm:p-6">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow} to-transparent opacity-80`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${theme.icon}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <span className="relative block">
        <Icon
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950 py-3.5 pl-10 pr-10 text-sm text-slate-200 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 disabled:cursor-wait disabled:opacity-60"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </span>
    </label>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
        <RefreshCw
          size={25}
          className="animate-spin text-purple-300"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        Loading Leaderboard
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Fetching real quiz performance data...
      </p>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
        <Trophy size={28} className="text-slate-500" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        No Rankings Yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        No completed quiz attempts were found for these filters.
        Complete a quiz to start appearing on the leaderboard.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
        >
          <RefreshCw size={15} />
          Reset Filters
        </button>

        <Link
          to="/quizzes"
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
        >
          Explore Quizzes
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function PodiumCard({ user, position }) {
  const styles = {
    1: {
      card: "border-yellow-400/30 bg-gradient-to-b from-yellow-500/10 via-slate-900 to-slate-900",
      medal: "text-yellow-300",
      avatar: "border-yellow-400/40 bg-yellow-400/10 text-yellow-200",
      label: "CHAMPION",
      icon: Crown,
    },
    2: {
      card: "border-slate-400/25 bg-gradient-to-b from-slate-400/10 via-slate-900 to-slate-900",
      medal: "text-slate-200",
      avatar: "border-slate-300/30 bg-slate-300/10 text-slate-100",
      label: "RUNNER UP",
      icon: Medal,
    },
    3: {
      card: "border-orange-400/25 bg-gradient-to-b from-orange-500/10 via-slate-900 to-slate-900",
      medal: "text-orange-300",
      avatar: "border-orange-400/30 bg-orange-400/10 text-orange-200",
      label: "THIRD PLACE",
      icon: Award,
    },
  };

  const style = styles[position] || styles[1];
  const Icon = style.icon;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 sm:p-7 ${style.card}`}
    >
      <div className="absolute right-4 top-4 opacity-20">
        <Icon size={38} className={style.medal} />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold tracking-[0.18em] ${style.medal}`}>
          {style.label}
        </span>

        <span className="rounded-lg border border-slate-700/70 bg-slate-950/60 px-2.5 py-1 text-xs font-bold text-slate-300">
          #{user.rank}
        </span>
      </div>

      <div className="mt-7 flex flex-col items-center text-center">
        <div
          className={`flex h-[76px] w-[76px] items-center justify-center rounded-3xl border text-2xl font-bold shadow-lg ${style.avatar}`}
        >
          {getInitials(user.name)}
        </div>

        <h3 className="mt-4 max-w-full truncate text-lg font-bold text-white">
          {user.name}
        </h3>

        <p className="mt-1 max-w-full truncate text-sm text-slate-500">
          {user.username}
        </p>

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Avg. Score
            </p>

            <p className="mt-2 text-lg font-bold text-emerald-300">
              {formatPercentage(user.averagePercentage)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Total Points
            </p>

            <p className="mt-2 text-lg font-bold text-yellow-300">
              {formatNumber(user.points)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <BookOpen size={14} />
          {user.completedQuizzes} completed attempts
        </div>
      </div>
    </article>
  );
}

function RankingRow({ user }) {
  const rankStyle = getRankStyle(user.rank);

  return (
    <div
      className={`grid grid-cols-1 gap-4 border-b border-slate-800/80 px-5 py-5 last:border-b-0 transition hover:bg-slate-800/20 sm:px-6 md:grid-cols-12 md:items-center ${
        user.isCurrentUser ? "bg-purple-500/[0.06]" : ""
      }`}
    >
      <div className="flex items-center justify-between md:col-span-1">
        <span className="text-xs uppercase tracking-wider text-slate-500 md:hidden">
          Rank
        </span>

        <span
          className={`inline-flex min-w-10 items-center justify-center rounded-lg border px-2.5 py-2 text-sm font-bold ${rankStyle.text} ${rankStyle.background} ${rankStyle.border}`}
        >
          #{user.rank}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3 md:col-span-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-semibold ${
            user.isCurrentUser
              ? "border-purple-500/30 bg-purple-500/15 text-purple-200"
              : "border-slate-700 bg-slate-800 text-slate-200"
          }`}
        >
          {getInitials(user.name)}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-100">
              {user.name}
            </p>

            {user.isCurrentUser && (
              <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-300">
                YOU
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-xs text-slate-500">
            {user.username}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:col-span-2 md:justify-center">
        <span className="text-xs text-slate-500 md:hidden">
          Completed Attempts
        </span>

        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
          <BookOpen size={15} className="text-slate-500" />
          {user.completedQuizzes}
        </span>
      </div>

      <div className="flex items-center justify-between md:col-span-2 md:justify-center">
        <span className="text-xs text-slate-500 md:hidden">
          Average Score
        </span>

        <span className="text-sm font-bold text-emerald-300">
          {formatPercentage(user.averagePercentage)}
        </span>
      </div>

      <div className="flex items-center justify-between md:col-span-3 md:justify-end">
        <span className="text-xs text-slate-500 md:hidden">
          Total Points
        </span>

        <span className="inline-flex items-center gap-2 text-sm font-bold text-yellow-300">
          <Zap size={15} />
          {formatNumber(user.points)}
        </span>
      </div>
    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

function Leaderboard() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [period, setPeriod] = useState("all");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(EMPTY_STATS);

  const [statistics, setStatistics] = useState({
    totalParticipants: 0,
    totalCompletedAttempts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // FETCH CATEGORIES FROM DATABASE
  // ========================================

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoryError("");

    try {
      const response = await api.get("/quizzes/categories");
      const data = response.data;

      if (!data?.success || !Array.isArray(data.data)) {
        throw new Error(data?.message || "Unable to load quiz categories.");
      }

      const uniqueCategories = [
        ...new Set(
          data.data
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b));

      setCategories(uniqueCategories);

      // If the selected category no longer exists, reset the filter.
      setCategory((currentCategory) => {
        if (
          currentCategory !== ALL_CATEGORIES &&
          !uniqueCategories.includes(currentCategory)
        ) {
          return ALL_CATEGORIES;
        }

        return currentCategory;
      });
    } catch (err) {
      setCategoryError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load quiz categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ========================================
  // FETCH REAL LEADERBOARD DATA
  // ========================================

  const fetchLeaderboard = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const response = await api.get("/leaderboard", {
          params: {
            period,
            category: category === ALL_CATEGORIES ? "all" : category,
          },
        });

        const data = response.data;

        if (!data?.success) {
          throw new Error(
            data?.message || "Unable to load leaderboard."
          );
        }

        setLeaderboard(
          Array.isArray(data.leaderboard) ? data.leaderboard : []
        );

        setCurrentUser({
          ...EMPTY_STATS,
          ...(data.currentUser || {}),
        });

        setStatistics({
          totalParticipants:
            Number(data.statistics?.totalParticipants) || 0,
          totalCompletedAttempts:
            Number(data.statistics?.totalCompletedAttempts) || 0,
        });
      } catch (err) {
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          setError(
            "Your session may have expired. Please log in again to view the leaderboard."
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load leaderboard. Please try again."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, category]
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // ========================================
  // SEARCH FILTER
  // ========================================

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return leaderboard;
    }

    return leaderboard.filter((user) => {
      return (
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      );
    });
  }, [leaderboard, search]);

  // ========================================
  // TOP THREE
  // ========================================

  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);

  // ========================================
  // RESET FILTERS
  // ========================================

  const resetFilters = () => {
    setSearch("");
    setCategory(ALL_CATEGORIES);
    setPeriod("all");
  };

  // ========================================
  // REFRESH ALL DATA
  // ========================================

  const refreshAllData = async () => {
    await Promise.all([
      fetchCategories(),
      fetchLeaderboard({ showLoading: false }),
    ]);
  };

  // ========================================
  // RENDER
  // ========================================

  const categoryOptions = [
    { label: ALL_CATEGORIES, value: ALL_CATEGORIES },
    ...categories.map((item) => ({
      label: item,
      value: item,
    })),
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070914] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/4 h-96 w-96 rounded-full bg-purple-600/[0.08] blur-[120px]" />
        <div className="absolute right-0 top-[35%] h-80 w-80 rounded-full bg-blue-500/[0.05] blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-800/80 bg-[#070914]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-900/20">
              <GraduationCap size={23} className="text-white" />
            </div>

            <div>
              <div className="text-xl font-extrabold tracking-tight">
                Quiz<span className="text-purple-400">Master</span>
              </div>

              <p className="hidden text-[10px] font-medium tracking-[0.2em] text-slate-500 sm:block">
                LEARN. PRACTICE. EXCEL.
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 text-sm md:flex">
            <Link
              to="/dashboard"
              className="text-slate-400 transition hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              to="/quizzes"
              className="text-slate-400 transition hover:text-white"
            >
              Quizzes
            </Link>

            <Link
              to="/quiz-history"
              className="text-slate-400 transition hover:text-white"
            >
              History
            </Link>

            <Link
              to="/leaderboard"
              className="font-semibold text-purple-300"
            >
              Leaderboard
            </Link>
          </div>

          <Link
            to="/dashboard"
            title="Go to dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-purple-500/40 hover:text-white"
          >
            <GraduationCap size={19} />
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/50 via-[#111326] to-[#0a1020] p-6 sm:p-9 lg:p-12">
          <div className="pointer-events-none absolute -right-12 -top-16 opacity-[0.07]">
            <Trophy size={290} strokeWidth={1} />
          </div>

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-72 rounded-full bg-purple-500/10 blur-[80px]" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold tracking-wide text-purple-200">
                <Sparkles size={14} />
                THE QUIZMASTER HALL OF FAME
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Leader<span className="text-purple-400">board</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Every quiz is an opportunity to grow. Track your
                performance, challenge other learners, and climb the
                rankings through your actual quiz results.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/quizzes"
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition hover:bg-purple-500"
                >
                  Explore Quizzes
                  <ArrowRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={refreshAllData}
                  disabled={loading || refreshing || categoriesLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={refreshing || categoriesLoading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur">
                <Users size={21} className="text-purple-300" />

                <p className="mt-4 text-3xl font-extrabold">
                  {loading ? "—" : formatNumber(statistics.totalParticipants)}
                </p>

                <p className="mt-1 text-xs text-slate-400">Participants</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur">
                <Activity size={21} className="text-emerald-300" />

                <p className="mt-4 text-3xl font-extrabold">
                  {loading
                    ? "—"
                    : formatNumber(statistics.totalCompletedAttempts)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Completed Attempts
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personal performance */}
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Your Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your actual results for {getPeriodLabel(period).toLowerCase()}.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              Verified quiz results
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Trophy}
              label="Your Rank"
              value={
                loading
                  ? "—"
                  : currentUser.rank
                    ? `#${currentUser.rank}`
                    : "—"
              }
              description={
                loading
                  ? "Loading your position..."
                  : currentUser.rank
                    ? `Among ${formatNumber(currentUser.totalParticipants)} participants`
                    : "Complete a quiz to earn a rank"
              }
              accent="purple"
            />

            <StatCard
              icon={Target}
              label="Average Score"
              value={
                loading ? "—" : formatPercentage(currentUser.averagePercentage)
              }
              description="Average percentage across completed attempts"
              accent="emerald"
            />

            <StatCard
              icon={Zap}
              label="Total Points"
              value={loading ? "—" : formatNumber(currentUser.points)}
              description="Sum of marks earned in completed attempts"
              accent="yellow"
            />

            <StatCard
              icon={BookOpen}
              label="Completed Attempts"
              value={
                loading ? "—" : formatNumber(currentUser.completedQuizzes)
              }
              description={`${formatNumber(currentUser.passedQuizzes)} passed attempts`}
              accent="blue"
            />
          </div>
        </section>

        {/* Errors */}
        {error && (
          <section className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={21}
                className="mt-0.5 shrink-0 text-red-300"
              />

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-red-200">
                  Could not load the leaderboard
                </h3>

                <p className="mt-1 break-words text-sm leading-6 text-red-200/70">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => fetchLeaderboard()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Top performers */}
        <section className="mt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Crown size={21} className="text-yellow-300" />

                <h2 className="text-xl font-bold sm:text-2xl">
                  Top Performers
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                The highest-ranked participants based on actual quiz results.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays size={14} />
              {getPeriodLabel(period)}
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-500">
              Top performers are unavailable until the data loads.
            </div>
          ) : topThree.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
              <EmptyState onReset={resetFilters} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {topThree.map((user) => (
                <PodiumCard
                  key={user.userId}
                  user={user}
                  position={user.rank}
                />
              ))}
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Find a Participant</h2>

              <p className="mt-1 text-xs text-slate-500">
                Search and filter the real leaderboard.
              </p>
            </div>

            {(search ||
              category !== ALL_CATEGORIES ||
              period !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 transition hover:text-purple-200"
              >
                <X size={14} />
                Reset filters
              </button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Search */}
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Search Student
              </span>

              <span className="relative block">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or username..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                />
              </span>
            </label>

            {/* Dynamic Category */}
            <div>
              <SelectField
                label="Quiz Category"
                value={category}
                onChange={setCategory}
                icon={BookOpen}
                disabled={categoriesLoading}
                options={categoryOptions}
              />

              {categoriesLoading && (
                <p className="mt-2 text-xs text-slate-500">
                  Loading categories...
                </p>
              )}

              {!categoriesLoading && categoryError && (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />

                  <span>{categoryError}</span>

                  <button
                    type="button"
                    onClick={fetchCategories}
                    className="shrink-0 font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!categoriesLoading &&
                !categoryError &&
                categories.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    No quiz categories found yet.
                  </p>
                )}
            </div>

            {/* Period */}
            <SelectField
              label="Time Period"
              value={period}
              onChange={setPeriod}
              icon={CalendarDays}
              options={PERIOD_OPTIONS}
            />
          </div>
        </section>

        {/* Rankings */}
        <section className="mt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Global Rankings
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Ranked by total points, average score, and completed attempts.
              </p>
            </div>

            <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-400">
              {loading ? "Loading..." : `${filteredData.length} participants shown`}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
                  <Medal size={20} className="text-purple-300" />
                </div>

                <div>
                  <h3 className="font-bold text-white">Rankings Table</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {getPeriodLabel(period)} ·{" "}
                    {category === ALL_CATEGORIES
                      ? "All categories"
                      : category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live API data
              </div>
            </div>

            {loading ? (
              <LoadingState />
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle
                  size={28}
                  className="mx-auto text-red-300"
                />

                <p className="mt-3 text-sm text-slate-400">
                  Rankings could not be displayed.
                </p>

                <button
                  type="button"
                  onClick={() => fetchLeaderboard()}
                  className="mt-4 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold hover:bg-purple-500"
                >
                  Reload Data
                </button>
              </div>
            ) : filteredData.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <>
                <div className="hidden grid-cols-12 gap-4 border-b border-slate-800 bg-slate-950/60 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 md:grid">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-4">Participant</div>
                  <div className="col-span-2 text-center">Attempts</div>
                  <div className="col-span-2 text-center">Avg. Score</div>
                  <div className="col-span-3 text-right">Points</div>
                </div>

                {filteredData.map((user) => (
                  <RankingRow key={user.userId} user={user} />
                ))}
              </>
            )}
          </div>
        </section>

        {/* Footer note */}
        <section className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
          <div className="mt-0.5 text-purple-300">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-300">
              How rankings work
            </p>

            <p className="mt-1 text-xs leading-6 text-slate-500">
              Points are calculated from marks earned in completed quiz
              attempts. Average score is the average percentage across
              those attempts. The selected time period and category determine
              which attempts are included.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 border-t border-slate-800/80 bg-[#070914]/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 sm:px-6 md:flex-row">
          <Link to="/" className="text-lg font-extrabold">
            Quiz<span className="text-purple-400">Master</span>
          </Link>

          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} QuizMaster. Learn, practice, excel.
          </p>

          <Link
            to="/quizzes"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            Explore Quizzes
            <ArrowRight size={15} />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Leaderboard;