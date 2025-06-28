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

  const features = [
    {
      icon: Calculator,
      title: "Auto GST Calculation",
      description:
        "Automatically calculates 9% CGST + 9% SGST for same-state or 18% IGST for inter-state transactions. No manual errors.",
    },
    {
      icon: FileText,
      title: "Professional Templates",
      description:
        "Beautiful, branded invoice templates with HSN/SAC codes that make you look professional to every client.",
    },
    {
      icon: Download,
      title: "Instant PDF Download",
      description:
        "Generate and download professional PDF invoices instantly. Preview before sending with one-click sharing.",
    },
    {
      icon: Users,
      title: "Brand Management",
      description:
        "Easily manage all your brand clients, their GST details, and payment information in one organized place.",
    },
    {
      icon: TrendingUp,
      title: "Revenue Analytics",
      description:
        "Track your earnings, pending payments, overdue amounts, and get monthly/yearly financial summaries.",
    },
    {
      icon: Shield,
      title: "GST Compliant",
      description:
        "Fully compliant with Indian GST regulations. Built-in support for service codes and tax-ready documentation.",
    },
    {
      icon: Globe,
      title: "Public Invoice Links",
      description:
        "Share invoices with secure, public links that clients can access anywhere, anytime.",
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description:
        "Works perfectly on all devices. Create and manage invoices on the go with our mobile-first design.",
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description:
        "Your data is protected with bank-level encryption, automatic backups, and GDPR compliance.",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "85% Time Savings",
      description: "From 30 minutes to 2 minutes per invoice",
    },
    {
      icon: DollarSign,
      title: "40% Faster Payments",
      description: "Professional invoices get paid quicker",
    },
    {
      icon: Award,
      title: "Zero GST Errors",
      description: "Automatic calculations prevent mistakes",
    },
    {
      icon: BarChart3,
      title: "Complete Analytics",
      description: "Track every aspect of your business",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img
                  src="/CreatorInvoice.png"
                  alt="CreatorInvoice Logo"
                  className="w-10 h-10 rounded-lg object-contain"
                />

                <span className="text-xl font-semibold">CreatorInvoice</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white transition-colors hidden md:block">
                <a href="/signin">Sign In</a>
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                <a href="/signup"> Get Started</a>
              </button>
              <button
                className="md:hidden text-gray-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-3 space-y-3">
              <a
                href="#features"
                className="block text-gray-300 hover:text-white"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-gray-300 hover:text-white"
              >
                Pricing
              </a>
              <a href="#about" className="block text-gray-300 hover:text-white">
                About
              </a>
              <a
                href="#contact"
                className="block text-gray-300 hover:text-white"
              >
                Contact
              </a>
              <button className="block w-full text-left text-gray-300 hover:text-white">
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <AnimatedSection>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Professional Invoicing for
              <span className="text-green-500 block bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Content Creators
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Generate GST-compliant, professional invoices for brands in just a
              few clicks. Transform your business from Excel chaos to
              professional invoicing excellence.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-2xl shadow-green-500/25">
                <Zap size={20} />
                <a href="/signup">
                  <span>Start Creating Invoices</span>
                </a>
                <ArrowRight size={20} />
              </button>
              <button className="border-2 border-gray-600 hover:border-green-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:bg-green-500/10 flex items-center justify-center space-x-2">
                <Play size={20} />
                <span>Watch Demo</span>
              </button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="text-green-500" size={24} />
                  </div>
                  <div className="text-2xl font-bold text-green-500 mb-1">
                    {benefit.title}
                  </div>
                  <div className="text-sm text-gray-400">
                    {benefit.description}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="text-5xl md:text-6xl font-bold text-green-500 mb-2 transition-transform group-hover:scale-110">
                  <CountUpNumber target={5000} />+
                </div>
                <div className="text-gray-300 text-lg">Invoices Generated</div>
              </div>
              <div className="text-center group">
                <div className="text-5xl md:text-6xl font-bold text-green-500 mb-2 transition-transform group-hover:scale-110">
                  <CountUpNumber target={1500} />+
                </div>
                <div className="text-gray-300 text-lg">Happy Creators</div>
              </div>
              <div className="text-center group">
                <div className="text-5xl md:text-6xl font-bold text-green-500 mb-2 transition-transform group-hover:scale-110">
                  ₹<CountUpNumber target={2} />
                  Cr+
                </div>
                <div className="text-gray-300 text-lg">Revenue Processed</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Built for Content Creators
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to transform your invoicing from amateur to
                professional
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10 border border-gray-700/50 hover:border-green-500/30">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="text-green-500" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

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
