import { Link } from "react-router";
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ColorfulFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "Fleet", path: "/fleet", icon: Car },
    { name: "Contact", path: "/contact", icon: Phone },
    { name: "About", path: "/about", icon: Globe },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      href: "#",
      color: "from-pink-500 to-rose-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "#",
      color: "from-sky-500 to-blue-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "#",
      color: "from-blue-600 to-indigo-700",
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <footer className="relative overflow-hidden bg-linear-to-br from-slate-50 via-white to-amber-50/30 border-t border-amber-100/50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-linear-to-br from-amber-200/20 to-orange-200/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-linear-to-tr from-sky-200/20 to-blue-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="relative w-14 h-14 bg-linear-to-br from-amber-500 via-amber-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30"
                >
                  <Car className="w-7 h-7 text-white" />
                  <div className="absolute inset-0 rounded-2xl border border-amber-400/30" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold bg-linear-to-r from-slate-900 via-slate-800 to-amber-700 bg-clip-text text-transparent">
                    SkyDrive
                  </h3>
                  <p className="text-lg font-semibold bg-linear-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    Africa
                  </p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Experience premium mobility with Africa's finest luxury vehicles
                and exceptional service.
              </p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-slate-900 mb-6 tracking-wide uppercase flex items-center gap-2">
              <div className="w-6 h-0.5 bg-linear-to-r from-amber-500 to-orange-500 rounded-full" />
              Navigation
            </h4>
            <div className="space-y-3">
              {footerLinks.map((link) => (
                <motion.div
                  key={link.path}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    to={link.path}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-100 to-orange-50 flex items-center justify-center group-hover:from-amber-200 group-hover:to-orange-100 transition-all">
                      <link.icon className="w-4 h-4 text-amber-600 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <span className="font-medium text-slate-800 group-hover:text-amber-700 transition-colors">
                      {link.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-slate-900 mb-6 tracking-wide uppercase flex items-center gap-2">
              <div className="w-6 h-0.5 bg-linear-to-r from-sky-500 to-blue-600 rounded-full" />
              Get In Touch
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-sky-100 to-blue-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Call Us</p>
                  <p className="text-sm text-slate-600">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-100 to-teal-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Email</p>
                  <p className="text-sm text-slate-600">
                    contact@skydrive.africa
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-100 to-violet-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Location</p>
                  <p className="text-sm text-slate-600">Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-slate-900 mb-6 tracking-wide uppercase flex items-center gap-2">
              <div className="w-6 h-0.5 bg-linear-to-r from-rose-500 to-pink-600 rounded-full" />
              Connect
            </h4>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600 mb-4">
                Follow our journey for exclusive updates and special offers.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-12 h-12 rounded-xl bg-linear-to-br ${social.color} flex items-center justify-center shadow-lg shadow-current/20 hover:shadow-xl hover:shadow-current/30 transition-all duration-300`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5 text-white" />
                    <div className="absolute inset-0 rounded-xl border border-white/20" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-px bg-linear-to-r from-transparent via-amber-200 to-transparent my-12"
        />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-center"
        >
          <p className="text-sm text-slate-600">
            © {currentYear} SkyDrive Africa. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/privacy"
                className="text-slate-700 hover:text-amber-600 transition-colors font-medium hover:underline decoration-amber-300 decoration-2 underline-offset-4"
              >
                Privacy Policy
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/terms"
                className="text-slate-700 hover:text-amber-600 transition-colors font-medium hover:underline decoration-amber-300 decoration-2 underline-offset-4"
              >
                Terms of Service
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
