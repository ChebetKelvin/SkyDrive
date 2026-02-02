import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { FaStar, FaShieldAlt, FaClock } from "react-icons/fa";

export default function Hero() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const trustIndicators = [
    { icon: <FaShieldAlt />, label: "Secure", value: "100%" },
    { icon: <FaStar />, label: "Rated", value: "4.9/5" },
    { icon: <FaClock />, label: "Response", value: "< 5min" },
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
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-900 pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/skydrive_hero.png"
          alt="Luxury vehicle in African landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-900/85 via-slate-900/75 to-slate-900/60" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={loaded ? "visible" : "hidden"}
          className="max-w-2xl"
        >
          {/* Overline */}
          <motion.p
            variants={itemVariants}
            className="text-sm font-medium text-amber-400 uppercase tracking-widest mb-6"
          >
            Premium Mobility Across Africa
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight"
          >
            Elevate Your{" "}
            <span className="font-semibold text-amber-300">
              African Journey
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-200 mb-10 leading-relaxed max-w-xl font-light"
          >
            Experience seamless luxury travel with our curated fleet. Trusted by
            executives, diplomats, and discerning travelers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <button
              onClick={() => navigate("/fleet")}
              className="group px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                Book Now
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>

            <button
              onClick={() => navigate("/fleet")}
              className="group px-8 py-3 border-2 border-slate-300 hover:border-white text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white/5"
            >
              <span className="flex items-center justify-center gap-2">
                Explore Fleet
                <svg
                  className="w-4 h-4 group-hover:rotate-90 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </span>
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-700/50"
          >
            {trustIndicators.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-400">{item.icon}</span>
                  <span className="text-lg font-semibold text-white">
                    {item.value}
                  </span>
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  {item.label}
                </p>
                <div className="h-0.5 bg-linear-to-r from-amber-400 to-transparent mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block"
      >
        <div className="text-center">
          <div className="w-6 h-10 border border-slate-400/40 rounded-full mx-auto mb-2 flex justify-center">
            <div className="w-1 h-2 bg-slate-400 rounded-full mt-2" />
          </div>
          <span className="text-xs text-slate-400">Scroll to explore</span>
        </div>
      </motion.div>
    </section>
  );
}
