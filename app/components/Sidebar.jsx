// components/admin/Sidebar.jsx
import { NavLink } from "react-router";
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaCar,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

export default function AdminSidebar({ user }) {
  const menuItems = [
    { path: "/admin", icon: FaTachometerAlt, label: "Dashboard", end: true },
    { path: "/admin/bookings", icon: FaCalendarCheck, label: "Bookings" },
    { path: "/admin/vehicles", icon: FaCar, label: "Vehicles" },
    { path: "/admin/users", icon: FaUsers, label: "Users" },
    { path: "/admin/revenue", icon: FaMoneyBillWave, label: "Revenue" },
    { path: "/admin/settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <div className="fixed w-64 h-screen bg-gray-900 text-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-amber-500">SkyDrive</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
      </div>

      <div className="mb-6 pb-6 border-b border-gray-700">
        <p className="text-sm text-gray-400">Logged in as</p>
        <p className="font-medium truncate">{user?.email}</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-amber-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <form action="/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </div>
  );
}
