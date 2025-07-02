// src/components/FeatureSection.jsx
import { motion } from "framer-motion";
import {
  FileText,
  Calculator,
  Download,
  Users,
  TrendingUp,
  Shield,
  Globe,
  Smartphone,
  Lock,
} from "lucide-react";
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
export default function FeatureSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Built for Modern Businesses
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to level up your invoicing and financial
            workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl transition-all duration-300 border border-gray-700/50 hover:border-green-500/40 shadow hover:shadow-green-500/10 transform hover:-translate-y-2 hover:scale-[1.03]"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="text-green-500" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
