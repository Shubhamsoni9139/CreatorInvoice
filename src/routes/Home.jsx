import React, { useState, useEffect } from "react";
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
  Menu,
  X,
  Play,
  Clock,
  DollarSign,
  Award,
  Globe,
  BarChart3,
  Smartphone,
  Lock,
} from "lucide-react";
import Header from "./Home/Header";
import HeroSection from "./Home/HeroSection";
import FeatureSection from "./Home/FeatureSection";

// Simple animation hook to replace Framer Motion
const useInView = () => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return isInView;
};

const AnimatedSection = ({ children, delay = 0, className = "" }) => {
  const isInView = useInView();

  return (
    <div
      className={`transition-all duration-1000 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const CountUpNumber = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
};

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "YouTube Creator",
      content:
        "Before CreatorInvoice, I spent hours on Excel creating messy invoices. Now I generate professional invoices in minutes and my clients pay faster!",
      avatar: "PS",
    },
    {
      name: "Rahul Gupta",
      role: "Digital Marketer",
      content:
        "The automatic GST calculation saved me from so many errors. I can focus on creating content instead of worrying about taxes.",
      avatar: "RG",
    },
    {
      name: "Anita Patel",
      role: "Instagram Influencer",
      content:
        "My invoice game went from amateur to professional overnight. Brands take me more seriously now.",
      avatar: "AP",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}

      {/* Features Section */}
      <FeatureSection />

      {/* Problem/Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8">
                  Tired of <span className="text-red-400">Confusing</span>{" "}
                  Invoicing?
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      title: "Excel Template Chaos",
                      desc: "Messy spreadsheets that break with every update and look unprofessional",
                    },
                    {
                      title: "GST Confusion",
                      desc: "Manual tax calculations that are error-prone and time-consuming",
                    },
                    {
                      title: "Unprofessional Look",
                      desc: "Generic invoices that don't represent your brand or build client trust",
                    },
                    {
                      title: "Payment Delays",
                      desc: "Unclear invoices lead to confusion and delayed payments",
                    },
                  ].map((problem, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 group"
                    >
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-red-500/30 transition-colors">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-400 mb-2">
                          {problem.title}
                        </h3>
                        <p className="text-gray-300">{problem.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8">
                  <span className="text-green-500">Professional</span> Invoicing
                  Made Simple
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      title: "One-Click Invoicing",
                      desc: "Generate professional, GST-compliant invoices in under 2 minutes",
                    },
                    {
                      title: "Smart Tax Handling",
                      desc: "Automatic GST calculation based on state location with HSN/SAC codes",
                    },
                    {
                      title: "Brand-Perfect Design",
                      desc: "Professional templates that build trust and get you paid faster",
                    },
                    {
                      title: "Complete Analytics",
                      desc: "Track revenue, payments, and business growth with detailed insights",
                    },
                  ].map((solution, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 group"
                    >
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-green-500/30 transition-colors">
                        <CheckCircle className="text-green-500" size={18} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-500 mb-2">
                          {solution.title}
                        </h3>
                        <p className="text-gray-300">{solution.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Creators Love CreatorInvoice
              </h2>
              <p className="text-xl text-gray-300">
                Join thousands of creators who've transformed their invoicing
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <blockquote className="text-xl md:text-2xl text-gray-300 mb-6 leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="text-green-500 font-semibold text-lg">
                  {testimonials[activeTestimonial].name}
                </div>
                <div className="text-gray-400">
                  {testimonials[activeTestimonial].role}
                </div>
              </div>

              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeTestimonial
                        ? "bg-green-500"
                        : "bg-gray-600"
                    }`}
                    onClick={() => setActiveTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Invoicing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of content creators who've streamlined their
              invoicing process and increased their revenue
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-2xl shadow-green-500/25">
                <Zap size={20} />
                <span>Start Free Trial</span>
              </button>
              <button className="border-2 border-gray-600 hover:border-green-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:bg-green-500/10">
                Schedule Demo
              </button>
            </div>
            <p className="text-sm text-gray-400">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/CreatorInvoice.png"
                  alt="CreatorInvoice Logo"
                  className="w-10 h-10 rounded-lg object-contain"
                />
                <span className="text-xl font-semibold">CreatorInvoice</span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional invoicing made simple for content creators and
                freelancers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-green-500">Product</h3>
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
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GST Calculator
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-green-500">Support</h3>
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
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-green-500">Legal</h3>
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
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 CreatorInvoice. All rights reserved. Made with ❤️ for
              Content Creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
