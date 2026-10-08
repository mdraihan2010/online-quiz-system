function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          {/* Logo */}
          <div className="text-2xl font-bold">
            <span className="text-white">Quiz</span>
            <span className="text-purple-500">Master</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>

            <a href="#how-it-works" className="hover:text-white transition">
              How It Works
            </a>

            <a href="#quizzes" className="hover:text-white transition">
              Quizzes
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition"
            >
              Login
            </a>

            <a
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">

          {/* Small Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8">
            Test your knowledge
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
            Test Your Knowledge.
            <br />
            <span className="text-purple-500">
              Challenge Yourself.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Take engaging quizzes, track your performance, compete with
            others, and improve your knowledge every day.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

            <a
              href="/login"
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3.5 rounded-lg font-semibold transition"
            >
              Start Quiz
            </a>

            <a
              href="#quizzes"
              className="bg-slate-800 hover:bg-slate-700 px-8 py-3.5 rounded-lg font-semibold transition"
            >
              Explore Quizzes
            </a>

          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold">500+</h3>
              <p className="text-sm text-slate-400 mt-1">
                Quizzes
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold">10K+</h3>
              <p className="text-sm text-slate-400 mt-1">
                Questions
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold">5K+</h3>
              <p className="text-sm text-slate-400 mt-1">
                Students
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold">50K+</h3>
              <p className="text-sm text-slate-400 mt-1">
                Attempts
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="border-t border-slate-800 bg-slate-950"
      >
        <div className="max-w-7xl mx-auto px-6 py-24">

          <div className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold mb-3">
              FEATURES
            </p>

            <h2 className="text-4xl font-bold">
              Everything You Need to Learn
            </h2>

            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              A complete quiz experience designed to help you learn,
              practice, and improve.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl mb-6">
                🧠
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Interactive Quizzes
              </h3>

              <p className="text-slate-400 leading-relaxed">
                Practice with engaging quizzes across different subjects
                and difficulty levels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl mb-6">
                📊
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Track Performance
              </h3>

              <p className="text-slate-400 leading-relaxed">
                Monitor your scores, progress, quiz history, and overall
                performance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl mb-6">
                🏆
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Compete & Improve
              </h3>

              <p className="text-slate-400 leading-relaxed">
                Challenge yourself, compare your scores, and climb the
                leaderboard.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-t border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-6 py-24">

          <div className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold mb-3">
              HOW IT WORKS
            </p>

            <h2 className="text-4xl font-bold">
              Start in Three Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold mb-6">
                1
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Choose a Quiz
              </h3>

              <p className="text-slate-400">
                Browse quizzes and choose a topic that interests you.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold mb-6">
                2
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Take the Quiz
              </h3>

              <p className="text-slate-400">
                Answer questions and challenge your knowledge within the
                given time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold mb-6">
                3
              </div>

              <h3 className="text-xl font-semibold mb-3">
                See Your Result
              </h3>

              <p className="text-slate-400">
                Get your score, review your answers, and track your progress.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="quizzes"
        className="border-t border-slate-800 bg-slate-950"
      >
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">

          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Challenge Yourself?
          </h2>

          <p className="mt-5 text-slate-400 text-lg">
            Start your quiz journey today and discover how much you really
            know.
          </p>

          <a
            href="/register"
            className="inline-block mt-8 bg-purple-600 hover:bg-purple-700 px-8 py-3.5 rounded-lg font-semibold transition"
          >
            Get Started
          </a>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
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

export default Home;