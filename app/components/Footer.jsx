import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
  FaShieldAlt,
  FaCreditCard,
  FaHeadset,
  FaCrown,
  FaRegCopyright,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail("");
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000);
    }, 1000);
  };

  const quickLinks = [
    { label: "Premium Fleet", href: "/fleet" },
    { label: "Helicopter Services", href: "/helicopters" },
    { label: "Corporate Packages", href: "/corporate" },
    { label: "Event Transportation", href: "/events" },
    { label: "Airport Transfers", href: "/airport" },
    { label: "Safari Tours", href: "/safari" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Partners", href: "/partners" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Investors", href: "/investors" },
  ];

  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "Safety Center", href: "/safety" },
    { label: "Cancellation Policy", href: "/cancellation" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
  ];

  const socialLinks = [
    {
      icon: <FaFacebookF />,
      label: "Facebook",
      href: "https://facebook.com/skydriveafrica",
    },
    {
      icon: <FaInstagram />,
      label: "Instagram",
      href: "https://instagram.com/skydriveafrica",
    },
    {
      icon: <FaTwitter />,
      label: "Twitter",
      href: "https://twitter.com/skydriveafrica",
    },
    {
      icon: <FaLinkedinIn />,
      label: "LinkedIn",
      href: "https://linkedin.com/company/skydriveafrica",
    },
    {
      icon: <FaYoutube />,
      label: "YouTube",
      href: "https://youtube.com/skydriveafrica",
    },
  ];

  const trustBadges = [
    { icon: <FaShieldAlt />, text: "Secure Payments" },
    { icon: <FaCreditCard />, text: "SSL Certified" },
    { icon: <FaHeadset />, text: "24/7 Support" },
    { icon: <FaCrown />, text: "Premium Service" },
  ];

  const contactInfo = [
    { icon: <FaPhone />, text: "+254 700 000 000", href: "tel:+254700000000" },
    {
      icon: <FaEnvelope />,
      text: "premium@skydrive.africa",
      href: "mailto:premium@skydrive.africa",
    },
    {
      icon: <FaMapMarkerAlt />,
      text: "SkyDrive Plaza, Westlands, Nairobi",
      href: "https://maps.google.com/?q=SkyDrive+Plaza+Westlands+Nairobi",
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
      transition: { duration: 0.6 },
    },
  };

  return (
    <footer className="relative bg-linear-to-br from-gray-900 via-black to-gray-900 border-t border-amber-800/30">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-600/50 to-transparent" />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.03%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      {/* Animated Glow Effects */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl animate-pulse" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-linear-to-br from-gray-800/50 to-black/50 border border-amber-800/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-900/20 rounded-full border border-amber-800/30 mb-6">
                  <FaCrown className="text-amber-400" />
                  <span className="text-sm font-medium text-amber-300 uppercase tracking-widest">
                    Premium Updates
                  </span>
                </div>
                <h3 className="text-2xl font-light text-white mb-3">
                  Subscribe to Our{" "}
                  <span className="font-semibold bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    Exclusive Newsletter
                  </span>
                </h3>
                <p className="text-amber-100/60">
                  Get first access to new fleet additions, exclusive offers, and
                  luxury travel insights.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-amber-400/70" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 bg-gray-800/30 border border-amber-800/30 rounded-xl text-white placeholder-amber-300/50 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-300"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-600/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : isSubscribed ? (
                      <>
                        <FiSend className="text-xl" />
                        <span>Subscribed Successfully!</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe Now</span>
                        <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
                <p className="text-xs text-amber-500/50 mt-4">
                  By subscribing, you agree to our Privacy Policy. Unsubscribe
                  anytime.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 group mb-6">
              <div className="h-12 w-12 bg-linear-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-bold text-xl">SD</span>
              </div>
              <div>
                <div className="text-xl font-light text-white">
                  SkyDrive{" "}
                  <span className="font-semibold bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    Africa
                  </span>
                </div>
                <div className="text-xs text-amber-300/70 uppercase tracking-widest">
                  Premium Mobility
                </div>
              </div>
            </Link>

            <p className="text-amber-100/60 mb-8 leading-relaxed max-w-md">
              Redefining luxury transportation across Africa. Experience
              unparalleled comfort, safety, and service with our premium fleet
              and dedicated concierge.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 mb-8">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-linear-to-br from-gray-800 to-black border border-amber-800/30 text-amber-400 flex items-center justify-center hover:border-amber-600 hover:scale-110 hover:text-amber-300 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/30 rounded-xl border border-amber-800/20"
                >
                  <div className="text-amber-400">{badge.icon}</div>
                  <span className="text-xs text-amber-300/80">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-amber-800/30">
              Our Services
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-2 text-amber-100/60 hover:text-amber-300 transition-colors duration-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-amber-800/30">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-2 text-amber-100/60 hover:text-amber-300 transition-colors duration-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support & Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-amber-800/30">
              Support
            </h4>
            <ul className="space-y-3 mb-8">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-2 text-amber-100/60 hover:text-amber-300 transition-colors duration-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  target={info.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    info.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group flex items-start gap-3 text-amber-100/60 hover:text-amber-300 transition-colors duration-300"
                >
                  <div className="text-amber-400 mt-1 group-hover:scale-110 transition-transform">
                    {info.icon}
                  </div>
                  <span className="text-sm">{info.text}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-amber-800/20 to-transparent my-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 text-amber-300/60 text-sm"
          >
            <FaRegCopyright className="text-xs" />
            <span>
              {new Date().getFullYear()} SkyDrive Africa. All rights reserved.
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-6 text-sm"
          >
            <Link
              to="/privacy"
              className="text-amber-300/60 hover:text-amber-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-amber-300/60 hover:text-amber-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-amber-300/60 hover:text-amber-300 transition-colors"
            >
              Cookies
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4"
          >
            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-gray-800/50 rounded border border-amber-800/30 flex items-center justify-center">
                <span className="text-xs text-amber-300/60">VISA</span>
              </div>
              <div className="w-8 h-5 bg-gray-800/50 rounded border border-amber-800/30 flex items-center justify-center">
                <span className="text-xs text-amber-300/60">MC</span>
              </div>
              <div className="w-8 h-5 bg-gray-800/50 rounded border border-amber-800/30 flex items-center justify-center">
                <span className="text-xs text-amber-300/60">PP</span>
              </div>
              <div className="w-8 h-5 bg-gray-800/50 rounded border border-amber-800/30 flex items-center justify-center">
                <span className="text-xs text-amber-300/60">MPSA</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back to Top Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-linear-to-br from-gray-800 to-black border border-amber-800/30 text-amber-400 flex items-center justify-center hover:border-amber-600 hover:scale-110 transition-all duration-300 backdrop-blur-sm shadow-2xl z-40"
          aria-label="Back to top"
        >
          <FaArrowRight className="text-lg rotate-90" />
        </motion.button>
      </div>

      {/* Decorative Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-600/30 to-transparent" />
    </footer>
  );
}
