function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {/* Navbar */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-xl font-bold">
            Quiz<span className="text-violet-400">Master</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-300 hover:text-white">
              Features
            </a>

            <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white">
              How It Works
            </a>

            <a href="#quizzes" className="text-sm text-slate-300 hover:text-white">
              Quizzes
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">
              Login
            </button>

            <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          
          <div className="mx-auto mb-6 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-300">
            Test your knowledge
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
            Test Your Knowledge.
            <br />
            <span className="text-violet-400">
              Challenge Yourself.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Take engaging quizzes, track your performance, compete with others,
            and improve your knowledge every day.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-xl bg-violet-600 px-7 py-3.5 font-semibold text-white transition hover:bg-violet-500">
              Start Quiz
            </button>

            <button className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10">
              Explore Quizzes
            </button>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-bold">500+</p>
              <p className="mt-1 text-sm text-slate-400">Quizzes</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-bold">10K+</p>
              <p className="mt-1 text-sm text-slate-400">Questions</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-bold">5K+</p>
              <p className="mt-1 text-sm text-slate-400">Students</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-2xl font-bold">50K+</p>
              <p className="mt-1 text-sm text-slate-400">Attempts</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24">
            
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
                Features
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Everything you need to test and improve your knowledge.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <div className="mb-5 text-3xl">🧠</div>
                <h3 className="text-xl font-semibold">
                  Interactive Quizzes
                </h3>
                <p className="mt-3 text-slate-400">
                  Take carefully designed quizzes with a smooth and focused
                  quiz-taking experience.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <div className="mb-5 text-3xl">📊</div>
                <h3 className="text-xl font-semibold">
                  Track Performance
                </h3>
                <p className="mt-3 text-slate-400">
                  Analyze your scores, results, quiz history, and overall
                  performance.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <div className="mb-5 text-3xl">🏆</div>
                <h3 className="text-xl font-semibold">
                  Compete & Improve
                </h3>
                <p className="mt-3 text-slate-400">
                  Compare your performance with others through the global
                  leaderboard.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24">
            
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
                How It Works
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Start learning in three simple steps.
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-lg font-bold">
                  1
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  Choose a Quiz
                </h3>

                <p className="mt-3 text-slate-400">
                  Browse quizzes by subject, category, and difficulty.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-lg font-bold">
                  2
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  Take the Quiz
                </h3>

                <p className="mt-3 text-slate-400">
                  Answer questions within the given time and challenge yourself.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-lg font-bold">
                  3
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  See Your Result
                </h3>

                <p className="mt-3 text-slate-400">
                  Get instant results and understand your performance.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="quizzes" className="border-t border-white/10">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">
              Ready to challenge yourself?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-slate-400">
              Join the quiz community and start testing your knowledge today.
            </p>

            <button className="mt-8 rounded-xl bg-violet-600 px-8 py-3.5 font-semibold hover:bg-violet-500">
              Start Your First Quiz
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 QuizMaster. All rights reserved.</p>
          <p>Online Quiz System</p>
        </div>
      </footer>

    </div>
  )
}

export default App