import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
const useInView = () => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return isInView;
};
const benefitCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
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

const HeroSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Save Hours Every Week",
      description: "Generate invoices 10x faster — from 30 mins to just 2.",
    },
    {
      icon: DollarSign,
      title: "Get Paid 40% Sooner",
      description: "Professional GST-compliant invoices get settled faster.",
    },
    {
      icon: Award,
      title: "Zero GST Errors",
      description: "Built-in tax rules ensure compliance & peace of mind.",
    },
    {
      icon: BarChart3,
      title: "Insights That Matter",
      description: "Track income, overdue payments, and tax reports easily.",
    },
  ];

  return (
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
            few clicks. Transform your business from Excel chaos to professional
            invoicing excellence.
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
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={benefitCardVariants}
              className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:shadow-xl transition-all hover:scale-105 duration-300"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="text-green-500" size={24} />
              </div>
              <div className="text-lg font-semibold text-green-400 mb-1">
                {benefit.title}
              </div>
              <div className="text-sm text-gray-400">{benefit.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
