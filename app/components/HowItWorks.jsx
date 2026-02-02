import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  FaCar,
  FaCalendarAlt,
  FaMobileAlt,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaArrowRight,
  FaCrown,
  FaStar,
  FaArrowDown,
} from "react-icons/fa";

/**
 * How It Works Component - Premium Redesign
 *
 * Design Philosophy: Luxury & Sophistication
 * - Black linear background with amber accents
 * - Split layout with premium imagery
 * - Metallic and glass effect UI elements
 * - Smooth, elegant animations
 * - Premium typography and spacing
 */

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(null);

  const bookingSteps = [
    {
      id: 1,
      title: "Select Your Ride",
      icon: <FaCar className="text-xl" />,
      description: "Browse our curated collection of premium vehicles.",
      details: [
        "Exclusive selection",
        "Real-time availability",
        "Premium concierge service",
      ],
      duration: "1-2 min",
      color: "from-amber-500 to-amber-600",
    },
    {
      id: 2,
      title: "Personalize Experience",
      icon: <FaCalendarAlt className="text-xl" />,
      description: "Customize every detail of your luxury journey.",
      details: ["Flexible scheduling", "Premium add-ons", "Personal driver"],
      duration: "1 min",
      color: "from-amber-400 to-amber-500",
    },
    {
      id: 3,
      title: "Secure & Confirm",
      icon: <FaMobileAlt className="text-xl" />,
      description: "Complete with premium security and instant confirmation.",
      details: ["Encrypted payment", "VIP support", "Digital documents"],
      duration: "30 sec",
      color: "from-amber-300 to-amber-400",
    },
  ];

  const premiumFeatures = [
    {
      icon: <FaShieldAlt />,
      title: "Premium Security",
      description: "Military-grade encryption",
    },
    {
      icon: <FaClock />,
      title: "24/7 Concierge",
      description: "Dedicated personal service",
    },
    {
      icon: <FaCrown />,
      title: "VIP Experience",
      description: "Exclusive benefits",
    },
    {
      icon: <FaStar />,
      title: "5-Star Service",
      description: "Award-winning quality",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7 },
    },
    hover: {
      y: -6,
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Premium Black linear Background */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-700 via-zinc-900 to-amber-800" />
      // Smooth, sophisticated black tones with stone undertones
      {/* Subtle Grid Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
        }}
      />
      {/* Animated Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-3 px-4 py-2 bg-amber-900/20 backdrop-blur-sm rounded-full border border-amber-800/30 mb-6"
          >
            <FaCrown className="text-amber-400" />
            <span className="text-sm font-medium text-amber-300 uppercase tracking-widest">
              Premium Experience
            </span>
            <FaCrown className="text-amber-400" />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight"
          >
            Elevate Your{" "}
            <span className="font-semibold bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Journey
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-amber-100/70 leading-relaxed max-w-2xl mx-auto font-light"
          >
            Experience luxury transportation redefined. Three simple steps to
            your premium journey.
          </motion.p>
        </motion.div>

        {/* Split Layout: Image on Left, Steps on Right */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Premium Image Section */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-800/30 bg-linear-to-br from-gray-800 to-gray-900 shadow-2xl shadow-amber-900/20">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent z-10" />

              {/* Premium Vehicle Image */}
              <img
                src="/audi-q8.jpg"
                alt="Premium luxury vehicle interior"
                className="w-full h-150 object-cover opacity-90"
              />

              {/* Overlay Text */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-0.5 bg-linear-to-r from-amber-400 to-amber-600" />
                  <span className="text-sm font-medium text-amber-300 uppercase tracking-widest">
                    Featured Vehicle
                  </span>
                </div>
                <h3 className="text-2xl font-light text-white mb-2">
                  Range Rover Autobiography
                </h3>
                <p className="text-amber-100/60 text-sm">
                  Ultimate luxury and performance
                </p>
              </div>

              {/* Premium Badge */}
              <div className="absolute top-6 right-6 z-20">
                <div className="px-4 py-2 bg-linear-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-full shadow-lg">
                  Premium
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -right-6 bg-linear-to-br from-gray-800 to-black border border-amber-800/30 rounded-xl p-6 shadow-2xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-1">
                  98%
                </div>
                <div className="text-xs text-amber-300/70 uppercase tracking-widest">
                  Satisfaction
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Steps Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-0.5 bg-linear-to-r from-amber-400 to-amber-600" />
              <h3 className="text-2xl font-light text-white">
                The Premium Process
              </h3>
            </div>

            {bookingSteps.map((step) => (
              <motion.div
                key={step.id}
                variants={stepVariants}
                whileHover="hover"
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
                className="group cursor-pointer relative"
              >
                {/* Step Background */}
                <div className="absolute inset-0 bg-linear-to-br from-gray-800/50 to-black/50 rounded-xl border border-amber-800/30 group-hover:border-amber-600/50 transition-all duration-300 backdrop-blur-sm" />

                {/* Step Content */}
                <div className="relative p-8">
                  {/* Step Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {/* Step Number */}
                      <div
                        className={`w-14 h-14 rounded-full bg-linear-to-br ${step.color} flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="text-white font-bold text-xl">
                          {step.id}
                        </span>
                      </div>

                      {/* Duration Badge */}
                      <div className="px-3 py-1 bg-amber-900/30 rounded-full border border-amber-800/30">
                        <div className="flex items-center gap-2 text-xs text-amber-300">
                          <FaClock className="text-amber-400" />
                          <span>{step.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="text-amber-400 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-light text-white group-hover:text-amber-300 transition-colors duration-300">
                      {step.title}
                    </h4>

                    <p className="text-amber-100/70 text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Premium Details */}
                    <ul className="space-y-3 pt-4 border-t border-amber-800/20">
                      {step.details.map((detail, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-sm text-amber-100/80"
                        >
                          <div className="w-2 h-2 rounded-full bg-linear-to-r from-amber-400 to-amber-600" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaArrowDown className="text-amber-400 animate-bounce" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Premium Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 py-16 border-t border-b border-amber-800/20"
        >
          {premiumFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              custom={idx}
              whileHover={{ y: -4 }}
              className="group text-center"
            >
              <div className="relative inline-flex mb-4">
                <div className="absolute inset-0 bg-linear-to-r from-amber-400 to-amber-600 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-gray-800 to-black border border-amber-800/30 flex items-center justify-center text-amber-400 text-2xl group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-amber-300/70">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center relative"
        >
          {/* CTA Background */}
          <div className="absolute inset-0 bg-linear-to-r from-amber-900/10 via-amber-800/5 to-amber-900/10 rounded-3xl blur-xl" />

          <div className="relative bg-linear-to-br from-gray-800/50 to-black/50 border border-amber-800/30 rounded-2xl p-12 backdrop-blur-sm">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-amber-100/70 text-lg mb-8 max-w-2xl mx-auto"
            >
              Experience the pinnacle of luxury transportation. Your journey
              begins with a single tap.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/fleet"
                className="group inline-flex items-center gap-3 px-10 py-4 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-600/30 hover:scale-105"
              >
                <span>Explore Premium Fleet</span>
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 px-10 py-4 border-2 border-amber-600/50 hover:border-amber-600 text-amber-300 hover:text-amber-200 font-medium rounded-xl transition-all duration-300 hover:bg-amber-900/20"
              >
                <span>Concierge Service</span>
              </Link>
            </div>

            <p className="text-sm text-amber-500/50 mt-6">
              Average booking time: 2 minutes 30 seconds
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
