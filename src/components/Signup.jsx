import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
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
  TrendingUp,
  Calculator,
  FileText,
  DollarSign,
  PieChart,
  CreditCard,
  Banknote,
} from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      setLoading(false);
      return;
    }

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

  const benefits = [
    {
      icon: Calculator,
      title: "Smart GST Calculation",
      desc: "Automatic 9% or 18% GST based on location",
    },
    {
      icon: TrendingUp,
      title: "Revenue Analytics",
      desc: "Track earnings and payment trends",
    },
    {
      icon: FileText,
      title: "Professional Invoices",
      desc: "Brand-perfect invoice templates",
    },
    {
      icon: PieChart,
      title: "Financial Insights",
      desc: "Detailed revenue breakdowns",
    },
  ];

  const financialStats = [
    {
      icon: DollarSign,
      value: "₹50L+",
      label: "Revenue Processed",
      color: "text-green-500",
    },
    {
      icon: CreditCard,
      value: "1000+",
      label: "Invoices Generated",
      color: "text-blue-500",
    },
    {
      icon: Banknote,
      value: "₹25K",
      label: "Avg Monthly Earnings",
      color: "text-purple-500",
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Payment Success Rate",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}

          {/* Financial Benefits Preview */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-green-400 font-semibold text-sm">
                Financial Growth Awaits
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-white">₹25K+</div>
                <div className="text-xs text-gray-400">Avg Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">95%</div>
                <div className="text-xs text-gray-400">Payment Rate</div>
              </div>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <form onSubmit={handleSignUp} className="space-y-6">
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
                    id="password"
                    placeholder="Create a strong password"
                    minLength={8}
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

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  id="accept-terms"
                  name="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-600 bg-gray-700 rounded mt-1"
                />
                <label htmlFor="accept-terms" className="text-sm text-gray-300">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-green-500 hover:text-green-400 transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-green-500 hover:text-green-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className={`w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 ${
                  loading || !acceptTerms ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Create Account</span>
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

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/"
                  className="text-green-500 hover:text-green-400 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-4">
              Join 500+ successful content creators
            </p>
            <div className="flex justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-400">
                  Bank-level Security
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-400">GST Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-400">Instant Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Financial Benefits Showcase */}
      <div className="hidden lg:flex flex-1 bg-gray-800 items-center justify-center p-12">
        <div className="max-w-lg">
          <h3 className="text-3xl font-bold text-white mb-6">
            Maximize Your{" "}
            <span className="text-green-500">Financial Growth</span>
          </h3>
          <p className="text-gray-300 mb-8 text-lg">
            Transform your content creation into a profitable business with
            professional invoicing and financial tracking.
          </p>

          {/* Financial Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {financialStats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center`}
                  >
                    <stat.icon className={`${stat.color} h-4 w-4`} />
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="text-green-500" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-400 text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Growth Promise */}
          <div className="mt-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <span className="text-green-400 font-semibold">
                Financial Growth Promise
              </span>
            </div>
            <p className="text-gray-300 text-sm">
              Our creators see an average of{" "}
              <span className="text-green-400 font-semibold">40% increase</span>{" "}
              in payment efficiency and{" "}
              <span className="text-green-400 font-semibold">25% faster</span>{" "}
              invoice processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
