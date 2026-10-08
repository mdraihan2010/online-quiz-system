import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";

function Login() {
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

          <form className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition"
            >
              Login
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


function Register() {
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

          <form className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition"
            >
              Create Account
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


// Main App + Router
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;