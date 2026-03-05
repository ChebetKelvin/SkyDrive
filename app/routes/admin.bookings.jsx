// routes/admin.bookings.jsx
import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { getAllBookings, getBookingStats } from "../.server/admin.js";
import { updateBookingStatus } from "../models/booking.server.js";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaFilter,
  FaSearch,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCar,
  FaPhone,
  FaMapMarkerAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

export async function loader({ request }) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "all";
  const page = parseInt(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const [data, stats] = await Promise.all([
    getAllBookings({
      status: status !== "all" ? status : null,
      page,
      search,
      startDate,
      endDate,
    }),
    getBookingStats(),
  ]);

  // CRITICAL FIX: Deep serialize all ObjectIds to strings
  const serializedBookings = data.bookings.map((booking) => {
    // Convert the booking to a plain object and serialize all ObjectIds
    const plainBooking = { ...booking };

    // Convert main ObjectId fields
    plainBooking._id = booking._id?.toString() || booking._id;
    plainBooking.userId = booking.userId?.toString() || booking.userId;
    plainBooking.vehicleId = booking.vehicleId?.toString() || booking.vehicleId;

    // If there's a user object with _id
    if (booking.user && typeof booking.user === "object") {
      plainBooking.user = {
        ...booking.user,
        _id: booking.user._id?.toString() || booking.user._id,
      };
    }

    // If there's a vehicle object with _id
    if (booking.vehicle && typeof booking.vehicle === "object") {
      plainBooking.vehicle = {
        ...booking.vehicle,
        _id: booking.vehicle._id?.toString() || booking.vehicle._id,
      };
    }

    return plainBooking;
  });

  // Also serialize stats if they contain ObjectIds
  const serializedStats = stats
    ? {
        ...stats,
        // Add any ObjectId fields from stats here if needed
      }
    : stats;

  return {
    ...data,
    bookings: serializedBookings,
    stats: serializedStats,
    filters: { status, page, search, startDate, endDate },
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "updateStatus": {
      const bookingId = formData.get("bookingId");
      const status = formData.get("status");
      const notes = formData.get("notes") || "";
      const notifyCustomer = formData.get("notifyCustomer") === "true";

      console.log("🎯 Processing status update:", { bookingId, status });

      if (!bookingId) {
        return {
          success: false,
          error: "Booking ID is required",
        };
      }

      const success = await updateBookingStatus(bookingId, status);

      if (notifyCustomer && success) {
        console.log(`📧 Would notify customer for booking ${bookingId}`);
      }

      if (success) {
        return {
          success: true,
          message: `Booking ${status.replace("_", " ")} successfully`,
        };
      } else {
        return {
          success: false,
          error: "Failed to update booking status",
        };
      }
    }

    case "bulkUpdate": {
      const bookingIds = formData.get("bookingIds").split(",");
      const bulkStatus = formData.get("status");

      const results = await Promise.all(
        bookingIds.map((id) => {
          const cleanId = id.trim();
          return updateBookingStatus(cleanId, bulkStatus);
        }),
      );

      const successCount = results.filter(Boolean).length;
      const failedCount = results.filter((r) => !r).length;

      return {
        success: true,
        message: `${successCount} bookings updated, ${failedCount} failed`,
      };
    }

    default:
      return { error: "Invalid action" };
  }
}

export default function AdminBookings() {
  const { bookings, pagination, stats, filters } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedIds, setSelectedIds] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: filters.startDate || "",
    end: filters.endDate || "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        const params = new URLSearchParams(window.location.search);
        if (searchTerm) {
          params.set("search", searchTerm);
        } else {
          params.delete("search");
        }
        params.set("page", "1");
        navigate(`?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, navigate, filters.search]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  const handleDateRangeApply = () => {
    const params = new URLSearchParams(window.location.search);
    if (dateRange.start) params.set("startDate", dateRange.start);
    if (dateRange.end) params.set("endDate", dateRange.end);
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookings.map((b) => b._id)); // Already strings from loader
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkAction = (status) => {
    if (selectedIds.length === 0) return;

    if (
      confirm(
        `Are you sure you want to mark ${selectedIds.length} bookings as ${status}?`,
      )
    ) {
      fetcher.submit(
        {
          action: "bulkUpdate",
          bookingIds: selectedIds.join(","),
          status,
        },
        { method: "post" },
      );
      setSelectedIds([]);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending_verification: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: FaClock,
        label: "Pending",
      },
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: FaCheckCircle,
        label: "Confirmed",
      },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: FaCheckCircle,
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: FaTimesCircle,
        label: "Cancelled",
      },
    };

    const configItem = config[status] || config.pending_verification;
    const Icon = configItem.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${configItem.bg} ${configItem.text}`}
      >
        <Icon className="text-xs" />
        {configItem.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statsCards = [
    {
      label: "Total Bookings",
      value: stats?.total || 0,
      icon: FaCalendarAlt,
      color: "bg-blue-500",
      change: "+12% this month",
    },
    {
      label: "Pending",
      value: stats?.pending || 0,
      icon: FaClock,
      color: "bg-yellow-500",
      change: "Needs review",
    },
    {
      label: "Confirmed",
      value: stats?.confirmed || 0,
      icon: FaCheckCircle,
      color: "bg-green-500",
      change: "Ready for pickup",
    },
    {
      label: "Revenue",
      value: formatCurrency(stats?.revenue || 0),
      icon: FaMoneyBillWave,
      color: "bg-purple-500",
      change: "This month",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>

          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <FaSync />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export"
            >
              <FaDownload />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white text-xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking ID, customer, vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending_verification">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFilter />
              <span>Date Filter</span>
            </button>
          </div>

          {/* Date Range Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            start: e.target.value,
                          }))
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
                          setDateRange((prev) => ({
                            ...prev,
                            end: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleDateRangeApply}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between"
          >
            <p className="text-amber-800 font-medium">
              <span className="font-bold">{selectedIds.length}</span> bookings
              selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction("confirmed")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Confirm All
              </button>
              <button
                onClick={() => handleBulkAction("cancelled")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancel All
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === bookings.length &&
                        bookings.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Pickup
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(booking._id)}
                        onChange={() => handleSelectOne(booking._id)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {booking.bookingId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-amber-600 text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.user?.name || booking.customerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.user?.email || booking.customerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.vehicle?.image || booking.vehicleImage}
                          alt={booking.vehicleName}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="font-medium text-gray-900">
                          {booking.vehicleName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {formatDate(booking.pickupDate)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.pickupTime}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {booking.pickupLocation}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {booking.duration}h
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {booking.status === "pending_verification" && (
                          <>
                            <button
                              onClick={() => {
                                fetcher.submit(
                                  {
                                    action: "updateStatus",
                                    bookingId: booking._id, // Already string from loader
                                    status: "confirmed",
                                    notes: "Approved by admin",
                                    notifyCustomer: "true",
                                  },
                                  { method: "post" },
                                );
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirm Booking"
                            >
                              <FaCheckCircle className="text-lg" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to reject this booking?",
                                  )
                                ) {
                                  fetcher.submit(
                                    {
                                      action: "updateStatus",
                                      bookingId: booking._id, // Already string from loader
                                      status: "cancelled",
                                      notes: "Rejected by admin",
                                      notifyCustomer: "true",
                                    },
                                    { method: "post" },
                                  );
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject Booking"
                            >
                              <FaTimesCircle className="text-lg" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search term
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination?.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {pagination.total}
                </span>{" "}
                bookings
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleFilterChange("page", pagination.page - 1)
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft />
                </button>

                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange("page", pageNum)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          pageNum === pagination.page
                            ? "bg-amber-600 text-white font-medium"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() =>
                    handleFilterChange("page", pagination.page + 1)
                  }
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        <AnimatePresence>
          {selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedBooking(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Booking Details
                    </h2>
                    <button
                      onClick={() => setSelectedBooking(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-gray-500 text-xl" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Status and ID */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                        <p className="font-mono font-medium text-gray-900">
                          {selectedBooking.bookingId}
                        </p>
                      </div>
                      {getStatusBadge(selectedBooking.status)}
                    </div>

                    {/* Customer Info */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaUser className="text-amber-600" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium text-gray-900">
                            {selectedBooking.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">
                            {selectedBooking.customerEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <FaPhone className="text-xs text-gray-500" />
                            {selectedBooking.customerPhone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaCar className="text-amber-600" />
                        Vehicle Details
                      </h3>
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedBooking.vehicleImage}
                          alt={selectedBooking.vehicleName}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-lg text-gray-900">
                            {selectedBooking.vehicleName}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {selectedBooking.vehicleCategory?.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-amber-600" />
                        Trip Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Pickup Date & Time
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              selectedBooking.pickupDate,
                            ).toLocaleDateString("en-KE", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedBooking.pickupTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium text-gray-900">
                            {selectedBooking.duration} hours
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Pickup Location
                          </p>
                          <p className="font-medium text-gray-900">
                            {selectedBooking.pickupLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Dropoff Location
                          </p>
                          <p className="font-medium text-gray-900">
                            {selectedBooking.dropoffLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Passengers</p>
                          <p className="font-medium text-gray-900">
                            {selectedBooking.passengers}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaMoneyBillWave className="text-amber-600" />
                        Payment Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Method</p>
                          <p className="font-medium capitalize text-gray-900">
                            {selectedBooking.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedBooking.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedBooking.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Base Amount</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedBooking.baseAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">
                            Service Fee (10%)
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedBooking.serviceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">Insurance (5%)</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedBooking.insuranceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 text-lg">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold text-amber-600">
                            {formatCurrency(selectedBooking.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedBooking.specialRequests && (
                      <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FaExclamationTriangle className="text-yellow-600" />
                          Special Requests
                        </h3>
                        <p className="text-gray-700">
                          {selectedBooking.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Admin Actions */}
                    {selectedBooking.status === "pending_verification" && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            fetcher.submit(
                              {
                                action: "updateStatus",
                                bookingId: selectedBooking._id, // Already string from loader
                                status: "confirmed",
                                notes: "Approved by admin",
                                notifyCustomer: "true",
                              },
                              { method: "post" },
                            );
                            setSelectedBooking(null);
                          }}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to reject this booking?",
                              )
                            ) {
                              fetcher.submit(
                                {
                                  action: "updateStatus",
                                  bookingId: selectedBooking._id, // Already string from loader
                                  status: "cancelled",
                                  notes: "Rejected by admin",
                                  notifyCustomer: "true",
                                },
                                { method: "post" },
                              );
                              setSelectedBooking(null);
                            }
                          }}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Reject Booking
                        </button>
                      </div>
                    )}
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
