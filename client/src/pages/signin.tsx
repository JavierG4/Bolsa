import React, { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { registerUser, loginUser } from "../api";

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      setError("All fields are required");
      return;
    }

    setError("");
    try {
      const response = await registerUser(fullName, email, password);
      console.log("Registration successful:", response);
      const user = await loginUser(email, password);
      console.log('Logged in user:', user);
      window.location.href = '/dashboard';

      
    } catch (error) {
      setError(`Registration failed. Please try again. ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Panel izquierdo */}
      <aside className="hidden md:flex w-1/2 bg-black text-white items-center justify-center p-12">
        <div className="max-w-md border border-gray-700/30 p-8 rounded-lg text-center">
          <h1 className="text-5xl font-extrabold mb-4">MyPortfolio</h1>
          <p className="text-lg mb-6 leading-relaxed text-gray-300">
            Join and start tracking your investments easily
          </p>
          <button className="bg-white text-black rounded-full px-6 py-2 font-medium hover:bg-gray-200 transition">
            Learn more
          </button>
        </div>
      </aside>

      {/* Formulario principal */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Create your account
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Sign up and start your investment journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-2xl py-4 px-4 placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

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

            {/* Botón de registro */}
            <button
              type="submit"
              className="w-full rounded-3xl py-4 bg-black text-white font-semibold text-lg hover:bg-gray-800 transition"
            >
              <Link
                to="/login">
              </Link>
              Sign up
            </button>

            {/* Enlace a Login */}
            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-800 transition"
              >
                Already have an account? Login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
