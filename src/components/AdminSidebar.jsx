import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function AdminSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "📊",
      end: true,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: "👥",
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: "📁",
    },
    {
      name: "Quizzes",
      path: "/admin/quizzes",
      icon: "📝",
    },
    {
      name: "Questions",
      path: "/admin/questions",
      icon: "❓",
    },
    {
      name: "Attempts",
      path: "/admin/attempts",
      icon: "🎯",
    },
    {
      name: "Results",
      path: "/admin/results",
      icon: "📈",
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: "📊",
    },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
      isActive
        ? "bg-purple-600 font-medium text-white"
        : "text-slate-400 hover:bg-slate-900 hover:text-white"
    }`;

  return (
    <>
      {/* ========================================
          DESKTOP SIDEBAR
      ======================================== */}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 lg:flex">

        {/* Logo */}

        <div className="border-b border-slate-800 px-6 py-6">

          <Link
            to="/"
            className="text-2xl font-bold"
          >
            <span className="text-white">
              Quiz
            </span>

            <span className="text-purple-500">
              Master
            </span>
          </Link>

          <p className="mt-2 text-xs text-slate-500">
            Admin Panel
          </p>

        </div>


        {/* Navigation */}

        <nav className="flex-1 space-y-2 px-4 py-6">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={navLinkClass}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}

        </nav>


        {/* Bottom Navigation */}

        <div className="space-y-2 border-t border-slate-800 p-4">

          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            🌐
            <span>Back to Website</span>
          </Link>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            🚪
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* ========================================
          MOBILE HEADER
      ======================================== */}

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-4 lg:hidden">

        <Link
          to="/"
          className="text-xl font-bold"
        >
          <span className="text-white">
            Quiz
          </span>

          <span className="text-purple-500">
            Master
          </span>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
          className="rounded-lg border border-slate-700 px-3 py-2 text-xl text-slate-300 transition hover:bg-slate-800"
          aria-label="Toggle admin menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

      </div>


      {/* ========================================
          MOBILE MENU
      ======================================== */}

      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-4 lg:hidden">

          <nav className="space-y-2">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={navLinkClass}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}

          </nav>


          {/* Mobile Bottom Links */}

          <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">

            <Link
              to="/dashboard"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              🌐
              <span>Back to Website</span>
            </Link>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              🚪
              <span>Logout</span>
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default AdminSidebar;