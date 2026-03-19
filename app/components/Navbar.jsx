import { useState, useEffect } from "react";
import { Link, Form, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-menu")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    navigate("/logout");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-linear-to-r from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-amber-500/30 transition-shadow"
            >
              <span className="text-white font-bold text-lg">S</span>
            </motion.div>
            <span className="font-bold text-xl bg-linear-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
              SkyDrive
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/fleet"
              className="text-gray-900 hover:text-amber-600 transition-colors relative group"
            >
              Fleet
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/bookings"
              className="text-gray-900 hover:text-amber-600 transition-colors relative group"
            >
              Bookings
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/about"
              className="text-gray-900 hover:text-amber-600 transition-colors relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/contact"
              className="text-gray-900 hover:text-amber-600 transition-colors relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>

            {/* User Menu or Login Button */}
            {user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition-all duration-200 border border-amber-200 hover:border-amber-300"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-10 h-10 bg-linear-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium max-w-25 truncate">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.email || user.name}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        <span className="mr-3">👤</span>
                        Profile
                      </Link>
                      <Link
                        to="/bookings"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        <span className="mr-3">📅</span>
                        My Bookings
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        <span className="mr-3">❤️</span>
                        Favorites
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        <span className="mr-3">⚙️</span>
                        Settings
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <Form
                        method="post"
                        action="/logout"
                        onSubmit={handleLogout}
                      >
                        <button
                          type="submit"
                          className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          role="menuitem"
                        >
                          <span className="mr-3">🚪</span>
                          Sign Out
                        </button>
                      </Form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-amber-600 transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-linear-to-r from-amber-600 to-amber-700 text-white px-6 py-2 rounded-full hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-all duration-200 ${
              scrolled
                ? "hover:bg-gray-100 text-gray-900 bg-gray-100/50"
                : "hover:bg-white/20 text-white bg-black/20 backdrop-blur-sm"
            }`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className="w-8 h-8" // Increased size
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5} // Increased stroke width
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {/* Mobile User Info (if logged in) */}
              {user && (
                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg mb-3">
                  <div className="w-10 h-10 bg-linear-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <Link
                to="/fleet"
                className="block py-2 px-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Fleet
              </Link>
              <Link
                to="/bookings"
                className="block py-2 px-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Bookings
              </Link>
              <Link
                to="/about"
                className="block py-2 px-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block py-2 px-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile User Menu (if logged in) */}
              {user ? (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    to="/profile"
                    className="block py-2 px-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to="/favorites"
                    className="block py-2 px-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    ❤️ Favorites
                  </Link>
                  <Link
                    to="/settings"
                    className="block py-2 px-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <Form method="post" action="/logout">
                    <button
                      type="submit"
                      className="block w-full text-left py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      🚪 Sign Out
                    </button>
                  </Form>
                </>
              ) : (
                <div className="pt-4 pb-2 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center py-2 px-4 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
