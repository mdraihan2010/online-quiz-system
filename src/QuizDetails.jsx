import { Link } from "react-router-dom";

function QuizDetails() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <Link to="/" className="text-2xl font-bold">
            <span className="text-white">Quiz</span>
            <span className="text-purple-500">Master</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <Link
              to="/dashboard"
              className="hover:text-white transition"
            >
              Dashboard
            </Link>

            <Link
              to="/quizzes"
              className="text-white"
            >
              Quizzes
            </Link>

            <Link
              to="/dashboard"
              className="hover:text-white transition"
            >
              History
            </Link>

            <Link
              to="/dashboard"
              className="hover:text-white transition"
            >
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">Raihan</p>
              <p className="text-xs text-slate-500">Student</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-semibold">
              R
            </div>

          </div>

        </div>
      </nav>


      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Back */}
        <Link
          to="/quizzes"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-sm mb-8"
        >
          ← Back to Quizzes
        </Link>


        {/* Header */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-10">

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

            <div className="flex items-start gap-5">

              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-3xl">
                💻
              </div>

              <div>

                <p className="text-purple-400 text-sm font-medium mb-2">
                  PROGRAMMING
                </p>

                <h1 className="text-3xl md:text-4xl font-bold">
                  JavaScript Fundamentals
                </h1>

                <p className="text-slate-400 mt-3 max-w-2xl leading-relaxed">
                  Test your understanding of JavaScript fundamentals,
                  syntax, variables, functions, arrays, objects, and
                  modern JavaScript concepts.
                </p>

              </div>

            </div>


            <span className="self-start px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
              Easy
            </span>

          </div>


          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-500 text-sm">
                Questions
              </p>

              <p className="text-2xl font-bold mt-2">
                15
              </p>
            </div>


            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-500 text-sm">
                Time Limit
              </p>

              <p className="text-2xl font-bold mt-2">
                20 min
              </p>
            </div>


            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-500 text-sm">
                Passing Score
              </p>

              <p className="text-2xl font-bold mt-2">
                50%
              </p>
            </div>


            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-500 text-sm">
                Attempts
              </p>

              <p className="text-2xl font-bold mt-2">
                Unlimited
              </p>
            </div>

          </div>

        </section>


        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">


          {/* Quiz Information */}
          <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8">

            <h2 className="text-2xl font-bold mb-6">
              About This Quiz
            </h2>

            <p className="text-slate-400 leading-relaxed">
              This quiz is designed to test your understanding of
              JavaScript fundamentals. It covers the core concepts
              that every JavaScript developer should know.
            </p>


            {/* Topics */}
            <div className="mt-8">

              <h3 className="text-lg font-semibold mb-4">
                Topics Covered
              </h3>

              <div className="flex flex-wrap gap-3">

                <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                  Variables
                </span>

                <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                  Data Types
                </span>

                <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                  Functions
                </span>

                <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                  Arrays
                </span>

                <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                  Objects
                </span>

                <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                  ES6
                </span>

              </div>

            </div>


            {/* Rules */}
            <div className="mt-10">

              <h3 className="text-lg font-semibold mb-4">
                Quiz Rules
              </h3>

              <ul className="space-y-3 text-slate-400">

                <li className="flex gap-3">
                  <span className="text-purple-400">✓</span>
                  Answer all questions within the given time.
                </li>

                <li className="flex gap-3">
                  <span className="text-purple-400">✓</span>
                  You can move between questions during the quiz.
                </li>

                <li className="flex gap-3">
                  <span className="text-purple-400">✓</span>
                  Your score will be calculated automatically.
                </li>

                <li className="flex gap-3">
                  <span className="text-purple-400">✓</span>
                  You can review your answers before submitting.
                </li>

                <li className="flex gap-3">
                  <span className="text-purple-400">✓</span>
                  Once submitted, your result will be displayed.
                </li>

              </ul>

            </div>

          </section>


          {/* Start Quiz Card */}
          <aside className="bg-slate-900 border border-slate-800 rounded-2xl p-8 h-fit">

            <h2 className="text-xl font-bold">
              Ready to Start?
            </h2>

            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Make sure you are ready before starting the quiz.
              The timer will begin immediately.
            </p>


            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Questions
                </span>

                <span className="font-medium">
                  15
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Duration
                </span>

                <span className="font-medium">
                  20 minutes
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Difficulty
                </span>

                <span className="text-green-400 font-medium">
                  Easy
                </span>
              </div>

            </div>


            <button className="w-full mt-8 bg-purple-600 hover:bg-purple-700 py-3.5 rounded-lg font-semibold transition">
              Start Quiz
            </button>


            <Link
              to="/quizzes"
              className="block text-center text-sm text-slate-500 hover:text-slate-300 mt-4"
            >
              Choose Another Quiz
            </Link>

          </aside>

        </div>

      </main>


      {/* Footer */}
      <footer className="border-t border-slate-800 mt-10">

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

export default QuizDetails;