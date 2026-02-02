import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router"; // Changed import

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation(); // Get current location for active state

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Fleet", href: "/fleet" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact", href: "/contact" },
  ];

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  // Check if a nav item is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100/50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group cursor-pointer"
          aria-label="SkyDrive Africa Home"
        >
          <div className="h-10 w-10 bg-linear-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-lg font-light text-slate-900">
            SkyDrive{" "}
            <span className="font-semibold text-amber-600">Africa</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              {" "}
              {/* Use href as key for better uniqueness */}
              <Link
                to={item.href}
                className={`text-sm font-medium transition-colors duration-300 relative group ${
                  isActive(item.href)
                    ? "text-amber-600"
                    : "text-slate-700 hover:text-amber-600"
                }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-amber-400 to-amber-600 transition-all duration-300 ${
                    isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link
            to="/fleet"
            className="inline-block px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Book a vehicle"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-900 hover:text-amber-600 transition-colors p-2 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden bg-white/95 backdrop-blur-sm border-t border-slate-100/50"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="px-4 py-6 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  custom={i}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to={item.href}
                    className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      isActive(item.href)
                        ? "bg-amber-50 text-amber-600"
                        : "text-slate-700 hover:bg-slate-50 hover:text-amber-600"
                    }`}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                custom={navItems.length}
                variants={mobileItemVariants}
                initial="hidden"
                animate="visible"
                className="pt-4 mt-4 border-t border-slate-100"
              >
                <Link
                  to="/fleet"
                  className="block w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/20 text-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  onClick={() => setOpen(false)}
                  aria-label="Book a vehicle"
                >
                  Book Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
