// routes/admin.dashboard.jsx
import { useLoaderData } from "react-router";
import {
  getAdminStats,
  getRevenueByPeriod,
  getRecentActivity,
} from "../.server/admin.js";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router";
import {
  FaCalendarCheck,
  FaMoneyBillWave,
  FaUsers,
  FaCar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export async function loader() {
  const [stats, revenue, recentActivity] = await Promise.all([
    getAdminStats(),
    getRevenueByPeriod("day"),
    getRecentActivity(10),
  ]);

  return { stats, revenue, recentActivity };
}

export default function AdminDashboard() {
  const { stats, revenue, recentActivity } = useLoaderData();
  const { overview } = stats;
  const [period, setPeriod] = useState("day");

  // Calculate trends (mock data - replace with real calculations)
  const statCards = [
    {
      title: "Total Bookings",
      value: overview.totalBookings,
      icon: FaCalendarCheck,
      color: "bg-blue-500",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Pending Review",
      value: overview.pendingBookings,
      icon: FaClock,
      color: "bg-yellow-500",
      trend: overview.pendingBookings > 0 ? "Action needed" : "All clear",
      trendUp: overview.pendingBookings > 0,
    },
    {
      title: "Today's Bookings",
      value: overview.todayBookings,
      icon: FaCheckCircle,
      color: "bg-green-500",
      subtext: "Ready for pickup",
    },
    {
      title: "Monthly Revenue",
      value: `KES ${overview.monthlyRevenue.toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: "bg-purple-500",
      trend: `vs ${(overview.monthlyRevenue * 0.85).toLocaleString()} last month`,
    },
    {
      title: "Active Users",
      value: overview.activeUsers,
      icon: FaUsers,
      color: "bg-indigo-500",
      trend: "+5 this week",
      trendUp: true,
    },
    {
      title: "Fleet Status",
      value: `${overview.availableVehicles}/${overview.totalVehicles}`,
      icon: FaCar,
      color: "bg-orange-500",
      subtext: `${overview.availableVehicles} available`,
      progress: (overview.availableVehicles / overview.totalVehicles) * 100,
    },
  ];

  // Colors for pie chart
  const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

  // Booking status data for pie chart
  const bookingStatusData = [
    { name: "Pending", value: overview.pendingBookings },
    {
      name: "Confirmed",
      value: overview.totalBookings - overview.pendingBookings - 10,
    }, // Mock data
    { name: "Completed", value: 10 }, // Mock data
    { name: "Cancelled", value: 5 }, // Mock data
  ].filter((item) => item.value > 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
            >
              <option value="day">Last 30 Days</option>
              <option value="week">Last 12 Weeks</option>
              <option value="month">Last 12 Months</option>
              <option value="year">Last 5 Years</option>
            </select>
            <Link
              to="/admin/bookings"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              View All Bookings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>

                  {/* Trend indicator */}
                  {card.trend && (
                    <p
                      className={`text-sm mt-2 flex items-center gap-1 font-medium ${
                        card.trendUp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {card.trendUp ? <FaArrowUp /> : <FaArrowDown />}
                      {card.trend}
                    </p>
                  )}

                  {/* Subtext */}
                  {card.subtext && (
                    <p className="text-sm text-gray-600 mt-2">{card.subtext}</p>
                  )}
                </div>

                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="text-white text-xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Revenue Overview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Revenue trend for the selected period
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-amber-50 text-amber-700 rounded-lg font-medium">
                  Revenue
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Bookings
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="_id"
                  stroke="#6b7280"
                  tick={{ fontSize: 12, fill: "#374151" }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12, fill: "#374151" }}
                  tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">{label}</p>
                          <p className="font-bold text-amber-600">
                            {formatCurrency(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#f59e0b" }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(
                    revenue.reduce((sum, item) => sum + (item.total || 0), 0),
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Daily</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(
                    revenue.reduce((sum, item) => sum + (item.total || 0), 0) /
                      (revenue.length || 1),
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Day</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(
                    Math.max(...revenue.map((item) => item.total || 0)),
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Booking Status Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Booking Status
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Distribution of booking statuses
              </p>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {payload[0].name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Count: {payload[0].value}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              (payload[0].value /
                                bookingStatusData.reduce(
                                  (sum, item) => sum + item.value,
                                  0,
                                )) *
                              100
                            ).toFixed(1)}
                            % of total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {bookingStatusData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900 ml-auto">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="text-lg font-bold text-gray-900">
                  {bookingStatusData.reduce((sum, item) => sum + item.value, 0)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Recent Activity
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Latest bookings and updates
              </p>
            </div>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {/* Status Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        activity.action === "pending"
                          ? "bg-yellow-100"
                          : activity.action === "confirmed"
                            ? "bg-green-100"
                            : activity.action === "cancelled"
                              ? "bg-red-100"
                              : "bg-blue-100"
                      }`}
                    >
                      {activity.action === "pending" && (
                        <FaClock className="text-yellow-700" />
                      )}
                      {activity.action === "confirmed" && (
                        <FaCheckCircle className="text-green-700" />
                      )}
                      {activity.action === "cancelled" && (
                        <FaExclamationTriangle className="text-red-700" />
                      )}
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.customerName} booked {activity.vehicleName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleString("en-KE", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>

                    {/* Amount and Booking ID */}
                    <div className="text-right shrink-0">
                      <p className="font-medium text-amber-600">
                        {formatCurrency(activity.amount || 0)}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {activity.bookingId}
                      </p>
                    </div>

                    {/* View Link */}
                    <Link
                      to={`/admin/bookings?search=${activity.bookingId}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                      title="View Booking"
                    >
                      <FaEye />
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </div>

            {/* View All Link */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <Link
                to="/admin/bookings"
                className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1"
              >
                View All Activity <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Common tasks and shortcuts
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/admin/bookings?status=pending_verification"
                className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaClock className="text-yellow-800" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Review Pending</p>
                  <p className="text-sm text-gray-700">
                    {overview.pendingBookings} bookings to review
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/vehicles"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaCar className="text-green-800" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Manage Fleet</p>
                  <p className="text-sm text-gray-700">
                    {overview.availableVehicles} vehicles available
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/vehicles?action=add"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaCar className="text-blue-800" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Add New Vehicle</p>
                  <p className="text-sm text-gray-700">Expand your fleet</p>
                </div>
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaUsers className="text-purple-800" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-700">
                    {overview.activeUsers} active users
                  </p>
                </div>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
                  <p className="text-xl font-bold text-gray-900">68%</p>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ 5% vs last month
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Avg. Booking</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(
                      overview.totalRevenue / (overview.totalBookings || 1),
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per booking</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
