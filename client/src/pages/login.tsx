import React, { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../api";


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");

    try {
      const user = await loginUser(email, password);
      console.log('Logged in user:', user);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    }
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Panel lateral negro (solo visible en pantallas medianas o grandes) */}
      <aside className="hidden md:flex w-1/2 bg-black text-white items-center justify-center p-12">
        <div className="max-w-md border border-gray-700/30 p-8 rounded-lg text-center">
          <h1 className="text-5xl font-extrabold mb-4">MyPortfolio</h1>
          <p className="text-lg mb-6 leading-relaxed text-gray-300">
            Access easily to your favourite investings
          </p>
          <button className="bg-white text-black rounded-full px-6 py-2 font-medium hover:bg-gray-200 transition">
            About us
          </button>
        </div>
      </aside>

      {/* Formulario de login */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Welcome back!
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full border border-gray-300 rounded-2xl py-4 px-4 placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-2xl py-4 px-4 placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="w-full rounded-3xl py-4 bg-black text-white font-semibold text-lg hover:bg-gray-800 transition"
            >
              Sign in
            </button>

            {/* Forgot password */}
            <div className="text-center mt-4">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 transition"
              >
                Forgot Password?
              </a>
            </div>
          </form>

          {/* Link to Register */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 transition">
              Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
