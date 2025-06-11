import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signUpNewUser(email, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D23] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Welcome Back!
        </h2>
        <p className="text-center text-sm text-gray-600 mt-2 mb-6">
          Sign up today & start growing your business
        </p>

        <form onSubmit={handleSignUp}>
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
              placeholder="Password (min. 8 characters)"
              minLength={8}
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/" className="font-medium text-black hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
