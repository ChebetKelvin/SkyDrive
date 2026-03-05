// routes/admin.revenue.jsx
import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaDownload,
  FaSync,
  FaChartLine,
  FaChartPie,
  FaChartBar,
  FaCar,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFileInvoice,
  FaWallet,
  FaCreditCard,
  FaMobileAlt,
  FaPrint,
  FaEnvelope,
  FaFilePdf,
  FaFileExcel,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaArrowDown,
  FaPercentage,
  FaCoins,
  FaLandmark,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Import admin functions
import {
  getRevenueStats,
  getRevenueByPeriod,
  getRevenueByCategory,
  getRevenueByPaymentMethod,
  getTopVehicles,
  getRevenueByDay,
  getOutstandingPayments,
} from "../.server/admin.js";

export async function loader({ request }) {
  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "month";
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const view = url.searchParams.get("view") || "overview";

  const [
    stats,
    revenueByPeriod,
    revenueByCategory,
    revenueByPayment,
    topVehicles,
    revenueByDay,
    outstanding,
  ] = await Promise.all([
    getRevenueStats({ period, startDate, endDate }),
    getRevenueByPeriod(period),
    getRevenueByCategory({ period, startDate, endDate }),
    getRevenueByPaymentMethod({ period, startDate, endDate }),
    getTopVehicles({ period, startDate, endDate, limit: 10 }),
    getRevenueByDay({ period, startDate, endDate }),
    getOutstandingPayments(),
  ]);

  return {
    stats,
    revenueByPeriod,
    revenueByCategory,
    revenueByPayment,
    topVehicles,
    revenueByDay,
    outstanding,
    filters: { period, startDate, endDate, view },
  };
}

export default function AdminRevenue() {
  const {
    stats,
    revenueByPeriod,
    revenueByCategory,
    revenueByPayment,
    topVehicles,
    revenueByDay,
    outstanding,
    filters,
  } = useLoaderData();

  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [period, setPeriod] = useState(filters.period);
  const [view, setView] = useState(filters.view);
  const [dateRange, setDateRange] = useState({
    start: filters.startDate || "",
    end: filters.endDate || "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChart, setSelectedChart] = useState("revenue");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Handle period change
  useEffect(() => {
    if (period !== filters.period) {
      const params = new URLSearchParams(window.location.search);
      params.set("period", period);
      navigate(`?${params.toString()}`);
    }
  }, [period, filters.period, navigate]);

  const handleDateRangeApply = () => {
    const params = new URLSearchParams(window.location.search);
    if (dateRange.start) params.set("startDate", dateRange.start);
    if (dateRange.end) params.set("endDate", dateRange.end);
    navigate(`?${params.toString()}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const COLORS = [
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#84cc16",
  ];

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <FaArrowUp className="text-green-600" />;
    if (growth < 0) return <FaArrowDown className="text-red-600" />;
    return null;
  };

  const statsCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: FaMoneyBillWave,
      color: "bg-green-500",
      change: stats?.revenueGrowth
        ? `${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}%`
        : null,
      trend: stats?.revenueGrowth > 0 ? "up" : "down",
      subtext: `${stats?.paidBookings || 0} paid bookings`,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: FaCalendarAlt,
      color: "bg-blue-500",
      change: stats?.monthlyGrowth
        ? `${stats.monthlyGrowth > 0 ? "+" : ""}${stats.monthlyGrowth}%`
        : null,
      trend: stats?.monthlyGrowth > 0 ? "up" : "down",
      subtext: "Current month",
    },
    {
      title: "Average Booking Value",
      value: formatCurrency(stats?.avgBookingValue || 0),
      icon: FaChartLine,
      color: "bg-purple-500",
      change: `${stats?.avgBookingGrowth || 0}%`,
      subtext: `${stats?.totalBookings || 0} total bookings`,
    },
    {
      title: "Outstanding Payments",
      value: formatCurrency(stats?.outstandingPayments || 0),
      icon: FaClock,
      color: "bg-orange-500",
      change: `${stats?.outstandingCount || 0} pending`,
      subtext: `${((stats?.outstandingPayments / stats?.totalRevenue) * 100 || 0).toFixed(1)}% of revenue`,
    },
    {
      title: "Conversion Rate",
      value: formatPercentage(stats?.conversionRate || 0),
      icon: FaPercentage,
      color: "bg-indigo-500",
      change: `${stats?.conversionGrowth > 0 ? "+" : ""}${stats?.conversionGrowth || 0}%`,
      subtext: "Booking to payment",
    },
    {
      title: "Peak Revenue Day",
      value: stats?.peakDay?.date || "N/A",
      icon: FaChartBar,
      color: "bg-pink-500",
      subtext: stats?.peakDay?.amount
        ? formatCurrency(stats.peakDay.amount)
        : "No data",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Revenue Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Track your business financial performance
            </p>
          </div>
          <div className="flex gap-2">
            {/* Period Selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white text-gray-900"
            >
              <option value="day">Last 30 Days</option>
              <option value="week">Last 12 Weeks</option>
              <option value="month">Last 12 Months</option>
              <option value="year">Last 5 Years</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh"
            >
              <FaSync />
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Export"
              >
                <FaDownload />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FaFilePdf className="text-red-500" /> Export as PDF
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FaFileExcel className="text-green-500" /> Export as Excel
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FaPrint className="text-blue-500" /> Print Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        {period === "custom" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
              </div>
              <button
                onClick={handleDateRangeApply}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((card, index) => (
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

                  {card.change && (
                    <p
                      className={`text-sm mt-2 flex items-center gap-1 font-medium ${
                        card.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {getGrowthIcon(card.trend === "up" ? 1 : -1)}
                      {card.change}
                    </p>
                  )}

                  {card.subtext && (
                    <p className="text-sm text-gray-500 mt-2">{card.subtext}</p>
                  )}
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="text-white text-xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setView("overview")}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                view === "overview"
                  ? "bg-amber-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaChartLine />
              Overview
            </button>
            <button
              onClick={() => setView("categories")}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                view === "categories"
                  ? "bg-amber-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaChartPie />
              Categories
            </button>
            <button
              onClick={() => setView("vehicles")}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                view === "vehicles"
                  ? "bg-amber-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaCar />
              Top Vehicles
            </button>
            <button
              onClick={() => setView("payments")}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                view === "payments"
                  ? "bg-amber-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaWallet />
              Payments
            </button>
          </div>
        </div>

        {/* Overview View */}
        {view === "overview" && (
          <div className="space-y-6">
            {/* Main Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaChartLine className="text-amber-600" />
                    Revenue Trend
                  </h2>
                  <p className="text-sm text-gray-600">
                    {period === "day" &&
                      "Daily revenue for the selected period"}
                    {period === "week" && "Weekly revenue trends"}
                    {period === "month" && "Monthly revenue performance"}
                    {period === "year" && "Yearly revenue overview"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedChart("revenue")}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors font-medium ${
                      selectedChart === "revenue"
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setSelectedChart("bookings")}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors font-medium ${
                      selectedChart === "bookings"
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Bookings
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                {selectedChart === "revenue" ? (
                  <AreaChart data={revenueByPeriod}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="_id"
                      stroke="#6b7280"
                      tick={{ fontSize: 12, fill: "#374151" }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 12, fill: "#374151" }}
                      tickFormatter={(value) =>
                        `KES ${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                              <p className="text-sm text-gray-600 mb-1">
                                {label}
                              </p>
                              <p className="font-bold text-amber-600">
                                {formatCurrency(payload[0].value)}
                              </p>
                              {payload[0].payload.count && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {payload[0].payload.count} bookings
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={revenueByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="_id"
                      stroke="#6b7280"
                      tick={{ fontSize: 12, fill: "#374151" }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 12, fill: "#374151" }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                              <p className="text-sm text-gray-600 mb-1">
                                {label}
                              </p>
                              <p className="font-bold text-amber-600">
                                {payload[0].value} bookings
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(
                      revenueByPeriod.reduce(
                        (sum, item) => sum + (item.total || 0),
                        0,
                      ),
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(
                      revenueByPeriod.reduce(
                        (sum, item) => sum + (item.total || 0),
                        0,
                      ) / (revenueByPeriod.length || 1),
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Best Day</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      Math.max(
                        ...revenueByPeriod.map((item) => item.total || 0),
                      ),
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-xl font-bold text-gray-900">
                    {revenueByPeriod.reduce(
                      (sum, item) => sum + (item.count || 0),
                      0,
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Revenue by Day of Week */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-amber-600" />
                Revenue by Day of Week
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: "#374151" }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: "#374151" }}
                    tickFormatter={(value) =>
                      `KES ${(value / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">
                              {label}
                            </p>
                            <p className="font-bold text-amber-600">
                              {formatCurrency(payload[0].value)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {revenueByDay.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}

        {/* Categories View */}
        {view === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Category Pie Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartPie className="text-amber-600" />
                Revenue by Category
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="revenue"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                  >
                    {revenueByCategory.map((entry, index) => (
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
                              Revenue: {formatCurrency(payload[0].value)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Count: {payload[0].payload.count}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {revenueByCategory.map((category, index) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(category.revenue)}
                      </span>
                      <span className="text-xs text-gray-600 w-16 text-right">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Total Category Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    revenueByCategory.reduce(
                      (sum, cat) => sum + cat.revenue,
                      0,
                    ),
                  )}
                </p>
              </div>
            </motion.div>

            {/* Category Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartBar className="text-amber-600" />
                Category Performance
              </h2>

              <div className="space-y-4">
                {revenueByCategory.map((category, index) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {category.count} bookings
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-amber-600 h-2 rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        Avg: {formatCurrency(category.average)}
                      </span>
                      <span className="text-xs font-medium text-amber-600">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Insights */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Insights</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Best performing:{" "}
                    <span className="font-medium text-green-600">
                      {revenueByCategory[0]?.name}
                    </span>{" "}
                    ({revenueByCategory[0]?.percentage}% of revenue)
                  </p>
                  <p className="text-sm text-gray-700">
                    Average booking value by category ranges from{" "}
                    {formatCurrency(
                      Math.min(...revenueByCategory.map((c) => c.average)),
                    )}{" "}
                    to{" "}
                    {formatCurrency(
                      Math.max(...revenueByCategory.map((c) => c.average)),
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Top Vehicles View */}
        {view === "vehicles" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCar className="text-amber-600" />
              Top Performing Vehicles
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topVehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={
                                vehicle.image ||
                                "https://via.placeholder.com/40"
                              }
                              alt={vehicle.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {vehicle.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {vehicle.licensePlate}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-700">
                          {vehicle.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          {vehicle.bookings}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-amber-600">
                          {formatCurrency(vehicle.revenue)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            {vehicle.utilization}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${vehicle.utilization}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            vehicle.growth > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {vehicle.growth > 0 ? <FaArrowUp /> : <FaArrowDown />}
                          {Math.abs(vehicle.growth)}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {topVehicles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No vehicle data available</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Payments View */}
        {view === "payments" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaWallet className="text-amber-600" />
                Payment Methods
              </h2>

              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={revenueByPayment}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                  >
                    {revenueByPayment.map((entry, index) => (
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
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {payload[0].name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Amount: {formatCurrency(payload[0].value)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Transactions: {payload[0].payload.count}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {revenueByPayment.map((method, index) => (
                  <div
                    key={method.name}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {method.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(method.amount)}
                      </span>
                      <span className="text-xs text-gray-600">
                        {method.count} txns
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Outstanding Payments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-amber-600" />
                Outstanding Payments
              </h2>

              {outstanding.length > 0 ? (
                <div className="space-y-3">
                  {outstanding.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {payment.customerName}
                        </span>
                        <span className="text-sm text-gray-600">
                          {payment.bookingId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          Amount:{" "}
                          <span className="font-medium text-amber-600">
                            {formatCurrency(payment.amount)}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium">
                          Mark Paid
                        </button>
                        <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium">
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium mb-1">
                    No outstanding payments
                  </p>
                  <p className="text-sm text-gray-600">
                    All payments are up to date
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    Total Outstanding
                  </span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(stats?.outstandingPayments || 0)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Invoice Modal */}
        <AnimatePresence>
          {selectedInvoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedInvoice(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Invoice Details
                    </h2>
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-gray-500 text-xl" />
                    </button>
                  </div>

                  {/* Invoice content would go here */}
                  <div className="text-center py-8 text-gray-600">
                    Invoice details for {selectedInvoice.bookingId}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 font-medium">
                      <FaDownload />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
