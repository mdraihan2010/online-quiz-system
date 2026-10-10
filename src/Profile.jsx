import { useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-white">Quiz</span>
            <span className="text-purple-500">Master</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link
              to="/dashboard"
              className="hover:text-white transition"
            >
              Dashboard
            </Link>

            <Link
              to="/quizzes"
              className="hover:text-white transition"
            >
              Quizzes
            </Link>

            <Link
              to="/quiz-history"
              className="hover:text-white transition"
            >
              History
            </Link>

            <Link
              to="/leaderboard"
              className="hover:text-white transition"
            >
              Leaderboard
            </Link>
          </div>

          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-semibold">
            R
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-purple-400 text-sm font-medium">
            ACCOUNT
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            My Profile
          </h1>

          <p className="text-slate-400 mt-3">
            Manage your profile and view your quiz performance.
          </p>
        </div>

        {/* Profile Header */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold">
                R
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold">
                    Raihan
                  </h2>

                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">
                    Student
                  </span>
                </div>

                <p className="text-slate-400 mt-2">
                  @raihan
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Member since September 2026
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEdit(!showEdit)}
              className="px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold transition"
            >
              {showEdit ? "Close Edit" : "Edit Profile"}
            </button>
          </div>

          {/* Edit Profile */}
          {showEdit && (
            <div className="mt-8 pt-8 border-t border-slate-800">
              <h3 className="text-lg font-bold">
                Edit Profile
              </h3>

              <div className="grid md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    defaultValue="Raihan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    Username
                  </label>

                  <input
                    type="text"
                    defaultValue="raihan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button className="mt-5 px-5 py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition">
                Save Changes
              </button>
            </div>
          )}
        </section>

        {/* Statistics */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500">
              Quizzes Taken
            </p>

            <p className="text-2xl font-bold mt-2">
              12
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500">
              Total Attempts
            </p>

            <p className="text-2xl font-bold mt-2">
              18
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500">
              Average Score
            </p>

            <p className="text-2xl font-bold text-green-400 mt-2">
              76%
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500">
              Best Score
            </p>

            <p className="text-2xl font-bold text-yellow-400 mt-2">
              95%
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500">
              Current Rank
            </p>

            <p className="text-2xl font-bold text-purple-400 mt-2">
              #24
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Account Information */}
          <section className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <h2 className="text-xl font-bold">
              Account Information
            </h2>

            <div className="space-y-5 mt-6">
              <div>
                <p className="text-xs text-slate-500">
                  Full Name
                </p>

                <p className="mt-1 font-medium">
                  Raihan
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Username
                </p>

                <p className="mt-1 font-medium">
                  @raihan
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Email
                </p>

                <p className="mt-1 font-medium break-all">
                  raihan@example.com
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Role
                </p>

                <p className="mt-1 font-medium">
                  Student
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Joined
                </p>

                <p className="mt-1 font-medium">
                  September 2026
                </p>
              </div>
            </div>
          </section>

          {/* Performance */}
          <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Performance
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your overall quiz performance
                </p>
              </div>

              <span className="text-2xl font-bold text-purple-400">
                76%
              </span>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  Overall Score
                </span>

                <span>
                  76%
                </span>
              </div>

              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[76%] bg-purple-600 rounded-full"></div>
              </div>
            </div>

            {/* Category Performance */}
            <div className="mt-8">
              <h3 className="font-semibold">
                Category Performance
              </h3>

              <div className="space-y-5 mt-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">
                      Programming
                    </span>

                    <span>85%</span>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full">
                    <div className="h-full w-[85%] bg-purple-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">
                      Database
                    </span>

                    <span>78%</span>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full">
                    <div className="h-full w-[78%] bg-purple-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">
                      Web Development
                    </span>

                    <span>82%</span>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full">
                    <div className="h-full w-[82%] bg-purple-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">
                      Computer Science
                    </span>

                    <span>68%</span>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full">
                    <div className="h-full w-[68%] bg-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Activity */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-7 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Recent Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your latest quiz attempts
              </p>
            </div>

            <Link
              to="/quiz-history"
              className="text-sm text-purple-400 hover:text-purple-300 transition"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div>
                <p className="font-medium">
                  JavaScript Fundamentals
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Programming • Oct 9, 2026
                </p>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-green-400 font-semibold">
                  80%
                </span>

                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                  Passed
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div>
                <p className="font-medium">
                  Database Fundamentals
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Database • Oct 7, 2026
                </p>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-green-400 font-semibold">
                  70%
                </span>

                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                  Passed
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div>
                <p className="font-medium">
                  Operating Systems
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Computer Science • Oct 5, 2026
                </p>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-green-400 font-semibold">
                  90%
                </span>

                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                  Passed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-7 mt-6">
          <h2 className="text-xl font-bold">
            Account & Security
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <button className="text-left bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition">
              <p className="font-semibold">
                🔐 Change Password
              </p>

              <p className="text-sm text-slate-500 mt-2">
                Update your account password.
              </p>
            </button>

            <button className="text-left bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition">
              <p className="font-semibold">
                🚪 Logout
              </p>

              <p className="text-sm text-slate-500 mt-2">
                Sign out from your QuizMaster account.
              </p>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-lg font-bold">
            <span className="text-white">Quiz</span>
            <span className="text-purple-500">Master</span>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 QuizMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Profile;