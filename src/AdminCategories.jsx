import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";

function AdminCategories() {
  const [search, setSearch] = useState("");

  const categories = [
    {
      id: 1,
      name: "Programming",
      description: "Programming languages and coding concepts",
      quizzes: 18,
      questions: 340,
      status: "Active",
      created: "Sep 2026",
    },
    {
      id: 2,
      name: "Database",
      description: "Database systems, SQL and data management",
      quizzes: 12,
      questions: 210,
      status: "Active",
      created: "Sep 2026",
    },
    {
      id: 3,
      name: "Computer Science",
      description: "Core computer science concepts",
      quizzes: 15,
      questions: 285,
      status: "Active",
      created: "Aug 2026",
    },
    {
      id: 4,
      name: "Web Development",
      description: "HTML, CSS, JavaScript and web technologies",
      quizzes: 14,
      questions: 260,
      status: "Active",
      created: "Aug 2026",
    },
    {
      id: 5,
      name: "Networking",
      description: "Computer networks and communication",
      quizzes: 9,
      questions: 180,
      status: "Active",
      created: "Jul 2026",
    },
    {
      id: 6,
      name: "Artificial Intelligence",
      description: "AI, machine learning and intelligent systems",
      quizzes: 6,
      questions: 125,
      status: "Active",
      created: "Oct 2026",
    },
    {
      id: 7,
      name: "Mathematics",
      description: "Mathematics and problem solving",
      quizzes: 8,
      questions: 140,
      status: "Inactive",
      created: "Jul 2026",
    },
  ];

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* ========================================
          PAGE LAYOUT
      ======================================== */}

      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* ========================================
            REUSABLE ADMIN SIDEBAR
        ======================================== */}

        <AdminSidebar />


        {/* ========================================
            MAIN CONTENT
        ======================================== */}

        <div className="w-full min-w-0 flex-1">

          {/* ========================================
              HEADER
          ======================================== */}

          <header className="border-b border-slate-800 bg-[#020617]">

            <div className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

              <div>

                <p className="text-sm font-medium text-purple-400">
                  ADMIN PANEL
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Category Management
                </h1>

              </div>


              {/* Admin Profile */}

              <div className="flex items-center gap-4">

                <div className="hidden text-right sm:block">

                  <p className="text-sm font-medium">
                    Raihan
                  </p>

                  <p className="text-xs text-slate-500">
                    Administrator
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600 font-semibold">
                  R
                </div>

              </div>

            </div>

          </header>


          {/* ========================================
              MAIN
          ======================================== */}

          <main className="px-4 py-8 sm:px-6 lg:px-8">

            {/* ========================================
                INTRO
            ======================================== */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>

                <h2 className="text-2xl font-bold">
                  Categories
                </h2>

                <p className="mt-2 text-slate-400">
                  Create and manage quiz categories.
                </p>

              </div>


              <button
                type="button"
                className="rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-700"
              >
                + Add Category
              </button>

            </div>


            {/* ========================================
                STATS
            ======================================== */}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {/* Total Categories */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-500">
                  Total Categories
                </p>

                <p className="mt-2 text-3xl font-bold">
                  7
                </p>

              </div>


              {/* Active Categories */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-500">
                  Active Categories
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  6
                </p>

              </div>


              {/* Total Quizzes */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-500">
                  Total Quizzes
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-400">
                  82
                </p>

              </div>


              {/* Total Questions */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-500">
                  Total Questions
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-400">
                  1,540
                </p>

              </div>

            </div>


            {/* ========================================
                SEARCH
            ======================================== */}

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <label className="mb-2 block text-sm text-slate-500">
                Search Category
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category by name..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
              />

            </section>


            {/* ========================================
                CATEGORY LIST
            ======================================== */}

            <section className="mt-6">

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    All Categories
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredCategories.length} categories found
                  </p>

                </div>

              </div>


              {/* Category Cards */}

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {filteredCategories.length > 0 ? (

                  filteredCategories.map((category) => (

                    <div
                      key={category.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                    >

                      {/* Top */}

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                          📁
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            category.status === "Active"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {category.status}
                        </span>

                      </div>


                      {/* Content */}

                      <h3 className="mt-5 text-lg font-bold">
                        {category.name}
                      </h3>

                      <p className="mt-2 min-h-[42px] text-sm leading-relaxed text-slate-500">
                        {category.description}
                      </p>


                      {/* Stats */}

                      <div className="mt-6 grid grid-cols-2 gap-3">

                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">

                          <p className="text-xs text-slate-500">
                            Quizzes
                          </p>

                          <p className="mt-1 font-semibold">
                            {category.quizzes}
                          </p>

                        </div>


                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">

                          <p className="text-xs text-slate-500">
                            Questions
                          </p>

                          <p className="mt-1 font-semibold">
                            {category.questions}
                          </p>

                        </div>

                      </div>


                      {/* Footer */}

                      <div className="mt-6 flex flex-col gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-xs text-slate-600">
                          Created {category.created}
                        </p>


                        <div className="flex gap-2">

                          <button
                            type="button"
                            className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium transition hover:bg-slate-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  ))

                ) : (

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center md:col-span-2 xl:col-span-3">

                    <div className="text-4xl">
                      🔍
                    </div>

                    <h3 className="mt-4 font-semibold">
                      No categories found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Try changing your search.
                    </p>

                  </div>

                )}

              </div>

            </section>

          </main>

        </div>

      </div>

    </div>
  );
}

export default AdminCategories;