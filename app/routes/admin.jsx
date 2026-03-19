// routes/admin.jsx
import { redirect, Outlet, useLoaderData } from "react-router";
import { getSession } from "../.server/session.js";
import { isAdmin } from "../.server/admin.js";
import AdminSidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return redirect("/login");
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    return redirect("/dashboard");
  }

  return { user };
}

export default function AdminLayout() {
  const { user } = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Auto-open sidebar on desktop
      } else {
        setSidebarOpen(false); // Auto-close on mobile
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Menu Button - Fixed position */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-amber-600 text-white rounded-xl shadow-lg hover:bg-amber-700 transition-colors"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed position on both mobile and desktop */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : isMobile ? -280 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`
          fixed lg:fixed top-0 left-0 h-full z-50
          ${!sidebarOpen && isMobile ? "invisible" : "visible"}
        `}
        style={{
          width: 280,
        }}
      >
        <AdminSidebar
          user={user}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 min-h-screen"
        style={{
          marginLeft: isMobile ? 0 : sidebarOpen ? 280 : 0,
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        <div className="p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
