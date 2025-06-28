import React from "react";
import {
  FileText,
  Calculator,
  Download,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Zap,
} from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-sm">
                  CM
                </div>
                <span className="text-xl font-semibold">CreatorInvoice</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/signin"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <button className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </button>
              </a>
              <a href="/signup">
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Get Started
                </button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Professional Invoicing for
            <span className="text-green-500 block">Content Creators</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Generate GST-compliant, professional invoices for brands in just a
            few clicks. No more Excel templates or confusing tax calculations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>Start Creating Invoices</span>
              <ArrowRight size={20} />
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">
                1000+
              </div>
              <div className="text-gray-300">Invoices Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">500+</div>
              <div className="text-gray-300">Happy Creators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">
                ₹50L+
              </div>
              <div className="text-gray-300">Revenue Processed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Built for Content Creators
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage your invoicing process
              professionally and efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Auto GST Calculation
              </h3>
              <p className="text-gray-300">
                Automatically calculates 9% or 18% GST based on state
                compliance. No more manual tax calculations.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <FileText className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Professional Templates
              </h3>
              <p className="text-gray-300">
                Beautiful, branded invoice templates that make you look
                professional to every client.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <Download className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Instant PDF Download
              </h3>
              <p className="text-gray-300">
                Generate and download professional PDF invoices instantly.
                Preview before sending.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <Users className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Brand Management</h3>
              <p className="text-gray-300">
                Easily manage all your brand clients and their information in
                one organized place.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Revenue Tracking</h3>
              <p className="text-gray-300">
                Track your earnings, pending payments, and overdue amounts with
                detailed analytics.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Tax Compliant</h3>
              <p className="text-gray-300">
                Fully compliant with Indian GST regulations. Handle intra and
                inter-state transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Tired of <span className="text-red-400">Confusing</span>{" "}
                Invoicing?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      Excel Template Chaos
                    </h3>
                    <p className="text-gray-300">
                      Messy spreadsheets that break with every update
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      GST Confusion
                    </h3>
                    <p className="text-gray-300">
                      Manual tax calculations that are error-prone
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      Unprofessional Look
                    </h3>
                    <p className="text-gray-300">
                      Generic invoices that don't represent your brand
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-8">
                <span className="text-green-500">Professional</span> Invoicing
                Made Simple
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-green-500" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-500 mb-2">
                      One-Click Invoicing
                    </h3>
                    <p className="text-gray-300">
                      Generate professional invoices in seconds
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-green-500" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-500 mb-2">
                      Smart Tax Handling
                    </h3>
                    <p className="text-gray-300">
                      Automatic GST calculation based on location
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-green-500" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-500 mb-2">
                      Brand-Perfect Design
                    </h3>
                    <p className="text-gray-300">
                      Invoices that make you look like a pro
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Professionalize Your Invoicing?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of content creators who've streamlined their invoicing
            process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <Zap size={20} />
              <span>Start Free Trial</span>
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-sm">
                  CM
                </div>
                <span className="text-xl font-semibold">CreatorInvoice</span>
              </div>
              <p className="text-gray-400">
                Professional invoicing made simple for content creators and
                freelancers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Templates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GST Guide
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CreatorInvoice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
