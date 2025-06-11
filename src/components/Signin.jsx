import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { session, error } = await signInUser(email, password);

    if (error) {
      setError(error.message || "Login failed. Please try again.");
      setTimeout(() => setError(null), 3000);
    } else {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D23] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Welcome Back!
        </h2>
        <p className="text-center text-sm text-gray-600 mt-2 mb-6">
          Sign in to continue
        </p>

        <form onSubmit={handleSignIn}>
          <div className="flex flex-col mb-4">
            <input
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 mt-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="email"
              name="email"
              id="email"
              placeholder="Email address"
              required
            />
          </div>

          <div className="flex flex-col mb-4">
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 mt-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#0D0D23] text-white py-3 rounded-md font-medium transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account yet?{" "}
          <Link to="/signup" className="font-medium text-black hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
