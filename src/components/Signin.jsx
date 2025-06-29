import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Users,
} from "lucide-react";

const Signin = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [password, setPassword] = useState(
    () => searchParams.get("password") || ""
  );

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}

          {/* Sign In Form */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    id="password"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-600 bg-gray-700 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-500 hover:text-green-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-green-500 hover:text-green-400 font-semibold transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-4">
              Trusted by 500+ content creators
            </p>
            <div className="flex justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-400">Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-400">GST Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-400">Fast Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Features Showcase */}
      <div className="hidden lg:flex flex-1 bg-gray-800 items-center justify-center p-12">
        <div className="max-w-lg">
          <h3 className="text-3xl font-bold text-white mb-6">
            Professional Invoicing Made Simple
          </h3>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of content creators who've streamlined their
            invoicing process with our GST-compliant solution.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">
                  Auto GST Calculation
                </h4>
                <p className="text-gray-400 text-sm">
                  Automatically calculates 9% or 18% GST based on state
                  compliance
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="text-green-500" size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">
                  Brand Management
                </h4>
                <p className="text-gray-400 text-sm">
                  Easily manage all your brand clients in one organized place
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="text-green-500" size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">
                  Instant PDF Generation
                </h4>
                <p className="text-gray-400 text-sm">
                  Generate professional invoices in seconds with preview
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">1000+</div>
              <div className="text-gray-400 text-sm">Invoices Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">500+</div>
              <div className="text-gray-400 text-sm">Happy Creators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">₹50L+</div>
              <div className="text-gray-400 text-sm">Revenue Processed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
