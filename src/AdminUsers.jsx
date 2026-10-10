import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  X,
  CheckCircle,
  Ban,
  Check,
} from "lucide-react";

import AdminSidebar from "./components/AdminSidebar";
import api from "./services/api";

const PAGE_SIZE = 10;

const formatJoinedDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeRole = (role) =>
  role?.toLowerCase() === "admin" ? "Admin" : "Student";

const normalizeStatus = (status) => {
  if (typeof status === "boolean") {
    return status ? "Active" : "Inactive";
  }

  return status?.toLowerCase() === "inactive"
    ? "Inactive"
    : "Active";
};

const getErrorMessage = (error, fallback) => {
  const statusCode = error.response?.status;

  if (statusCode === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (statusCode === 403) {
    return "Access denied. Only administrators can perform this action.";
  }

  return error.response?.data?.message || fallback;
};

function AdminUsers() {
  // ========================================
  // STATE
  // ========================================

  const [users, setUsers] = useState([]);

  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    students: 0,
    administrators: 0,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalUsers: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // ========================================
  // FETCH USERS
  // GET /api/v1/admin/users
  // ========================================

  const fetchUsers = useCallback(
    async ({ isRefresh = false, signal } = {}) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          search: search.trim(),
          role:
            role === "All Roles"
              ? "all"
              : role === "Admin"
                ? "admin"
                : "user",
          status:
            status === "All Status"
              ? "all"
              : status.toLowerCase(),
          page: currentPage,
          limit: PAGE_SIZE,
        };

        const response = await api.get("/admin/users", {
          params,
          signal,
        });

        const responseData = response.data?.data;

        if (!Array.isArray(responseData?.users)) {
          throw new Error(
            "The Admin Users API returned an unexpected response."
          );
        }

        const normalizedUsers = responseData.users.map((user) => ({
          id: user.id || user._id,
          name: user.name || "Unknown User",
          email: user.email || "No email available",
          role: normalizeRole(user.role),
          status: normalizeStatus(user.status ?? user.isActive),
          quizzes: Number(user.quizzes ?? user.totalAttempts ?? 0),
          joined: formatJoinedDate(user.joined ?? user.createdAt),
        }));

        setUsers(normalizedUsers);

        if (responseData.statistics) {
          setStatistics({
            totalUsers: Number(
              responseData.statistics.totalUsers ?? 0
            ),
            activeUsers: Number(
              responseData.statistics.activeUsers ?? 0
            ),
            students: Number(
              responseData.statistics.students ?? 0
            ),
            administrators: Number(
              responseData.statistics.administrators ?? 0
            ),
          });
        }

        if (responseData.pagination) {
          setPagination({
            currentPage:
              responseData.pagination.currentPage ?? currentPage,
            pageSize:
              responseData.pagination.pageSize ?? PAGE_SIZE,
            totalUsers:
              responseData.pagination.totalUsers ?? 0,
            totalPages:
              responseData.pagination.totalPages ?? 0,
            hasNextPage:
              responseData.pagination.hasNextPage ?? false,
            hasPreviousPage:
              responseData.pagination.hasPreviousPage ?? false,
          });
        } else {
          setPagination({
            currentPage,
            pageSize: PAGE_SIZE,
            totalUsers: normalizedUsers.length,
            totalPages: normalizedUsers.length
              ? Math.ceil(normalizedUsers.length / PAGE_SIZE)
              : 0,
            hasNextPage: false,
            hasPreviousPage: currentPage > 1,
          });
        }

        // Keep the open modal synchronized with refreshed data.
        setSelectedUser((previousUser) => {
          if (!previousUser) return null;

          const updatedUser = normalizedUsers.find(
            (user) => user.id === previousUser.id
          );

          return updatedUser || previousUser;
        });
      } catch (err) {
        if (
          err.name === "CanceledError" ||
          err.name === "AbortError"
        ) {
          return;
        }

        console.error("Failed to fetch admin users:", err);

        setError(
          getErrorMessage(
            err,
            "Failed to load users. Please try again."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, role, status, currentPage]
  );

  // ========================================
  // LOAD USERS WHEN FILTERS/PAGE CHANGE
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    fetchUsers({
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [fetchUsers]);

  // ========================================
  // ACTIVATE / DEACTIVATE USER
  // PATCH /api/v1/admin/users/:userId/status
  // ========================================

  const handleToggleStatus = async (user) => {
    if (!user?.id || updatingUserId) return;

    const nextIsActive = user.status !== "Active";

    const confirmed = window.confirm(
      nextIsActive
        ? `Are you sure you want to activate ${user.name}'s account?`
        : `Are you sure you want to deactivate ${user.name}'s account?`
    );

    if (!confirmed) return;

    try {
      setUpdatingUserId(user.id);
      setError("");
      setNotice(null);

      const response = await api.patch(
        `/admin/users/${user.id}/status`,
        {
          isActive: nextIsActive,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to update user status."
        );
      }

      const updatedUser = response.data?.data?.user;

      if (!updatedUser) {
        throw new Error(
          "The server did not return the updated user."
        );
      }

      const normalizedUpdatedUser = {
        id: updatedUser.id || updatedUser._id || user.id,
        name: updatedUser.name || user.name,
        email: updatedUser.email || user.email,
        role: normalizeRole(updatedUser.role || user.role),
        status: normalizeStatus(updatedUser.status),
        quizzes: user.quizzes,
        joined: formatJoinedDate(updatedUser.joined ?? user.joined),
      };

      // Update the current list immediately.
      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id ? normalizedUpdatedUser : item
        )
      );

      // Update the details modal if it is open for this user.
      setSelectedUser((previousUser) =>
        previousUser?.id === user.id
          ? normalizedUpdatedUser
          : previousUser
      );

      setNotice({
        type: "success",
        message:
          response.data.message ||
          `User ${nextIsActive ? "activated" : "deactivated"} successfully.`,
      });

      // Fetch again so statistics and filtered results reflect
      // the actual database state.
      await fetchUsers({ isRefresh: true });
    } catch (err) {
      console.error("Failed to update user status:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to update user status. Please try again."
        )
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ========================================
  // FILTER HANDLERS
  // ========================================

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
    setNotice(null);
  };

  const handleRoleChange = (value) => {
    setRole(value);
    setCurrentPage(1);
    setNotice(null);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
    setNotice(null);
  };

  const clearFilters = () => {
    setSearch("");
    setRole("All Roles");
    setStatus("All Status");
    setCurrentPage(1);
    setNotice(null);
  };

  // ========================================
  // CLOSE MODAL WITH ESCAPE
  // ========================================

  useEffect(() => {
    if (!selectedUser) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedUser]);

  // ========================================
  // STATISTICS CARDS
  // ========================================

  const stats = [
    {
      title: "Total Users",
      value: statistics.totalUsers,
      icon: Users,
      color: "text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    {
      title: "Active Users",
      value: statistics.activeUsers,
      icon: UserCheck,
      color: "text-green-400",
      iconBg: "bg-green-500/10",
    },
    {
      title: "Students",
      value: statistics.students,
      icon: GraduationCap,
      color: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
    },
    {
      title: "Administrators",
      value: statistics.administrators,
      icon: ShieldCheck,
      color: "text-purple-400",
      iconBg: "bg-purple-500/10",
    },
  ];

  // ========================================
  // PAGINATION HELPERS
  // ========================================

  const totalPages = pagination.totalPages;

  const startItem =
    pagination.totalUsers === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.pageSize + 1;

  const endItem = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalUsers
  );

  // ========================================
  // STATUS ACTION BUTTON
  // ========================================

  const renderStatusAction = (user) => {
    const isUpdating = updatingUserId === user.id;
    const isActive = user.status === "Active";

    return (
      <button
        type="button"
        onClick={() => handleToggleStatus(user)}
        disabled={Boolean(updatingUserId) || isUpdating}
        title={isActive ? "Deactivate user" : "Activate user"}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isActive
            ? "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            : "border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
        }`}
      >
        {isUpdating ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : isActive ? (
          <Ban size={14} />
        ) : (
          <Check size={14} />
        )}

        {isUpdating
          ? "Updating..."
          : isActive
            ? "Deactivate"
            : "Activate"}
      </button>
    );
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <div className="w-full min-w-0 flex-1">
          {/* HEADER */}

          <header className="border-b border-slate-800 bg-[#020617]">
            <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  User Management
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchUsers({ isRefresh: true })}
                  disabled={loading || refreshing || Boolean(updatingUserId)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />

                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">
                    QuizMaster Admin
                  </p>

                  <p className="text-xs text-slate-500">
                    Administrator
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold">
                  A
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            {/* PAGE INTRO */}

            <section className="mb-8">
              <h2 className="text-2xl font-bold">
                Registered Users
              </h2>

              <p className="mt-2 text-slate-400">
                View registered accounts, monitor their status, and manage access.
              </p>
            </section>

            {/* SUCCESS MESSAGE */}

            {notice?.type === "success" && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
              >
                <CheckCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-green-400"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-green-400">
                    Success
                  </p>

                  <p className="mt-1 break-words text-sm text-slate-300">
                    {notice.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  aria-label="Dismiss success message"
                  className="rounded p-1 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
              >
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-red-400">
                    Request Failed
                  </p>

                  <p className="mt-1 break-words text-sm text-slate-300">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      fetchUsers({ isRefresh: true });
                    }}
                    className="mt-3 text-sm font-medium text-purple-400 hover:text-purple-300"
                  >
                    Try Again
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error message"
                  className="rounded p-1 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* STATISTICS */}

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-400">
                        {stat.title}
                      </p>

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                      >
                        <Icon size={20} className={stat.color} />
                      </div>
                    </div>

                    <p
                      className={`mt-4 text-3xl font-bold ${stat.color}`}
                    >
                      {loading
                        ? "—"
                        : stat.value.toLocaleString()}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Live database statistics
                    </p>
                  </div>
                );
              })}
            </section>

            {/* FILTERS */}

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {/* SEARCH */}

                <div>
                  <label
                    htmlFor="user-search"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Search User
                  </label>

                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="user-search"
                      type="search"
                      value={search}
                      onChange={(event) =>
                        handleSearchChange(event.target.value)
                      }
                      placeholder="Search by name or email..."
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* ROLE FILTER */}

                <div>
                  <label
                    htmlFor="user-role"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Role
                  </label>

                  <select
                    id="user-role"
                    value={role}
                    onChange={(event) =>
                      handleRoleChange(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    <option>All Roles</option>
                    <option>Student</option>
                    <option>Admin</option>
                  </select>
                </div>

                {/* STATUS FILTER */}

                <div>
                  <label
                    htmlFor="user-status"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Status
                  </label>

                  <select
                    id="user-status"
                    value={status}
                    onChange={(event) =>
                      handleStatusChange(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            {/* USER TABLE */}

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="text-xl font-bold">
                    Registered Users
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {loading
                      ? "Loading users..."
                      : `${pagination.totalUsers} users found`}
                  </p>
                </div>
              </div>

              {/* LOADING */}

              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-12 text-slate-400">
                  <RefreshCw
                    size={28}
                    className="animate-spin text-purple-400"
                  />

                  <p>Loading registered users...</p>
                </div>
              ) : users.length > 0 ? (
                <>
                  {/* DESKTOP TABLE */}

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[1100px] text-left">
                      <thead className="bg-slate-950 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-medium">
                            User
                          </th>

                          <th className="px-4 py-4 font-medium">
                            Role
                          </th>

                          <th className="px-4 py-4 font-medium">
                            Status
                          </th>

                          <th className="px-4 py-4 font-medium">
                            Attempts
                          </th>

                          <th className="px-4 py-4 font-medium">
                            Joined
                          </th>

                          <th className="px-4 py-4 text-right font-medium">
                            Details
                          </th>

                          <th className="px-6 py-4 text-right font-medium">
                            Manage Access
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-t border-slate-800 transition hover:bg-slate-950/50"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600/20 font-semibold text-purple-400">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[220px] truncate font-medium">
                                    {user.name}
                                  </p>

                                  <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                  user.role === "Admin"
                                    ? "bg-purple-500/10 text-purple-400"
                                    : "bg-blue-500/10 text-blue-400"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>

                            <td className="px-4 py-5">
                              <span
                                className={`inline-flex items-center gap-2 text-xs font-medium ${
                                  user.status === "Active"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    user.status === "Active"
                                      ? "bg-green-400"
                                      : "bg-red-400"
                                  }`}
                                />

                                {user.status}
                              </span>
                            </td>

                            <td className="px-4 py-5 font-medium">
                              {user.quizzes}
                            </td>

                            <td className="px-4 py-5 text-sm text-slate-400">
                              {user.joined}
                            </td>

                            <td className="px-4 py-5 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(user)}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium transition hover:bg-slate-700"
                              >
                                <Eye size={14} />
                                View
                              </button>
                            </td>

                            <td className="px-6 py-5 text-right">
                              {renderStatusAction(user)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE / TABLET CARDS */}

                  <div className="divide-y divide-slate-800 lg:hidden">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="p-5 transition hover:bg-slate-950/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-600/20 font-semibold text-purple-400">
                            {user.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-words font-medium">
                              {user.name}
                            </p>

                            <p className="mt-1 break-all text-sm text-slate-500">
                              {user.email}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs ${
                                  user.role === "Admin"
                                    ? "bg-purple-500/10 text-purple-400"
                                    : "bg-blue-500/10 text-blue-400"
                                }`}
                              >
                                {user.role}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs ${
                                  user.status === "Active"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {user.status}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs text-slate-500">
                                Attempts: {user.quizzes} · Joined:{" "}
                                {user.joined}
                              </p>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedUser(user)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium hover:bg-slate-700"
                                >
                                  <Eye size={14} />
                                  View
                                </button>

                                {renderStatusAction(user)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PAGINATION */}

                  <div className="flex flex-col gap-4 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="text-sm text-slate-500">
                      Showing {startItem}–{endItem} of{" "}
                      {pagination.totalUsers} users
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(1, page - 1)
                          )
                        }
                        disabled={
                          loading ||
                          Boolean(updatingUserId) ||
                          !pagination.hasPreviousPage
                        }
                        aria-label="Previous page"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <span className="px-3 text-sm text-slate-400">
                        Page {pagination.currentPage} of {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) => page + 1)
                        }
                        disabled={
                          loading ||
                          Boolean(updatingUserId) ||
                          !pagination.hasNextPage
                        }
                        aria-label="Next page"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                    <Search size={24} />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    {error ? "Unable to display users" : "No users found"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {error || "Try changing your search or filters."}
                  </p>

                  {!error && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-4 text-sm font-medium text-purple-400 hover:text-purple-300"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* USER DETAILS MODAL */}

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUser(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            className="my-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="user-details-title"
                  className="text-xl font-bold"
                >
                  User Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registered account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close user details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-xl font-bold text-purple-400">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="break-words font-semibold">
                  {selectedUser.name}
                </p>

                <p className="mt-1 break-all text-sm text-slate-400">
                  {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <span className="text-sm text-slate-500">Role</span>

                <span className="text-sm font-medium">
                  {selectedUser.role}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <span className="text-sm text-slate-500">Status</span>

                <span
                  className={`text-sm font-medium ${
                    selectedUser.status === "Active"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {selectedUser.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <span className="text-sm text-slate-500">
                  Completed Quiz Attempts
                </span>

                <span className="text-sm font-medium">
                  {selectedUser.quizzes}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">Joined</span>

                <span className="text-sm font-medium">
                  {selectedUser.joined}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {renderStatusAction(selectedUser)}

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold transition hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;