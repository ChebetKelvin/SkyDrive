// routes/admin.bookings.jsx
import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { getAllBookings, getBookingStats } from "../.server/admin.js";
import {
  updateBookingStatus,
  deleteBooking,
  createBooking,
  getBookingById,
} from "../models/booking.server.js";
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
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaBan,
} from "react-icons/fa";

export async function loader({ request }) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "all";
  const page = parseInt(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const bookingId = url.searchParams.get("bookingId");

  // If viewing a single booking
  if (bookingId) {
    const booking = await getBookingById(bookingId);
    return { booking: serializeBooking(booking), isEditing: true };
  }

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
  const serializedBookings = data.bookings.map(serializeBooking);

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

// Helper function to serialize booking
function serializeBooking(booking) {
  if (!booking) return null;

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
}

export async function action({ request }) {
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "createBooking": {
      const bookingData = {
        userId: formData.get("userId"),
        vehicleId: formData.get("vehicleId"),
        pickupDate: formData.get("pickupDate"),
        pickupTime: formData.get("pickupTime"),
        duration: parseInt(formData.get("duration")),
        pickupLocation: formData.get("pickupLocation"),
        dropoffLocation: formData.get("dropoffLocation"),
        passengers: parseInt(formData.get("passengers")),
        customerName: formData.get("customerName"),
        customerEmail: formData.get("customerEmail"),
        customerPhone: formData.get("customerPhone"),
        specialRequests: formData.get("specialRequests") || "",
        baseAmount: parseFloat(formData.get("baseAmount")),
        serviceFee: parseFloat(formData.get("serviceFee")),
        insuranceFee: parseFloat(formData.get("insuranceFee")),
        totalAmount: parseFloat(formData.get("totalAmount")),
        paymentMethod: formData.get("paymentMethod"),
        paymentStatus: formData.get("paymentStatus") || "pending",
        status: formData.get("status") || "pending_verification",
      };

      console.log("📝 Creating new booking:", bookingData);

      const booking = await createBooking(bookingData);

      return {
        success: true,
        message: "Booking created successfully",
        booking: serializeBooking(booking),
      };
    }

    case "updateBooking": {
      const bookingId = formData.get("bookingId");
      const bookingData = {
        pickupDate: formData.get("pickupDate"),
        pickupTime: formData.get("pickupTime"),
        duration: parseInt(formData.get("duration")),
        pickupLocation: formData.get("pickupLocation"),
        dropoffLocation: formData.get("dropoffLocation"),
        passengers: parseInt(formData.get("passengers")),
        customerName: formData.get("customerName"),
        customerEmail: formData.get("customerEmail"),
        customerPhone: formData.get("customerPhone"),
        specialRequests: formData.get("specialRequests") || "",
        baseAmount: parseFloat(formData.get("baseAmount")),
        serviceFee: parseFloat(formData.get("serviceFee")),
        insuranceFee: parseFloat(formData.get("insuranceFee")),
        totalAmount: parseFloat(formData.get("totalAmount")),
        paymentMethod: formData.get("paymentMethod"),
        paymentStatus: formData.get("paymentStatus"),
      };

      console.log("📝 Updating booking:", { bookingId, ...bookingData });

      const success = await updateBooking(bookingId, bookingData);

      if (success) {
        return {
          success: true,
          message: "Booking updated successfully",
        };
      } else {
        return {
          success: false,
          error: "Failed to update booking",
        };
      }
    }

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

      const success = await updateBookingStatus(bookingId, status, notes);

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

    case "deleteBooking": {
      const bookingId = formData.get("bookingId");
      const permanent = formData.get("permanent") === "true";

      console.log("🗑️ Deleting booking:", { bookingId, permanent });

      const success = await deleteBooking(bookingId, permanent);

      if (success) {
        return {
          success: true,
          message: permanent
            ? "Booking permanently deleted"
            : "Booking moved to trash",
        };
      } else {
        return {
          success: false,
          error: "Failed to delete booking",
        };
      }
    }

    case "bulkDelete": {
      const bookingIds = formData.get("bookingIds").split(",");
      const permanent = formData.get("permanent") === "true";

      const results = await Promise.all(
        bookingIds.map((id) => deleteBooking(id.trim(), permanent)),
      );

      const successCount = results.filter(Boolean).length;
      const failedCount = results.filter((r) => !r).length;

      return {
        success: true,
        message: `${successCount} bookings deleted, ${failedCount} failed`,
      };
    }

    default:
      return { error: "Invalid action" };
  }
}

export default function AdminBookings() {
  const { bookings, pagination, stats, filters, booking, isEditing } =
    useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [selectedBooking, setSelectedBooking] = useState(booking || null);
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [selectedIds, setSelectedIds] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: filters?.startDate || "",
    end: filters?.endDate || "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    // Create/Edit form fields
    userId: "",
    vehicleId: "",
    pickupDate: "",
    pickupTime: "",
    duration: 4,
    pickupLocation: "",
    dropoffLocation: "",
    passengers: 1,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
    baseAmount: 0,
    serviceFee: 0,
    insuranceFee: 0,
    totalAmount: 0,
    paymentMethod: "card",
    paymentStatus: "pending",
    status: "pending_verification",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters?.search) {
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
  }, [searchTerm, navigate, filters?.search]);

  // Auto-calculate totals
  useEffect(() => {
    const base = parseFloat(formData.baseAmount) || 0;
    const service = base * 0.1; // 10% service fee
    const insurance = base * 0.05; // 5% insurance
    const total = base + service + insurance;

    setFormData((prev) => ({
      ...prev,
      serviceFee: service.toFixed(2),
      insuranceFee: insurance.toFixed(2),
      totalAmount: total.toFixed(2),
    }));
  }, [formData.baseAmount]);

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
    if (selectedIds.length === bookings?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookings?.map((b) => b._id) || []);
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

  const handleBulkDelete = (permanent = false) => {
    if (selectedIds.length === 0) return;

    const action = permanent ? "permanently delete" : "move to trash";
    if (
      confirm(
        `Are you sure you want to ${action} ${selectedIds.length} bookings?`,
      )
    ) {
      fetcher.submit(
        {
          action: "bulkDelete",
          bookingIds: selectedIds.join(","),
          permanent: permanent.toString(),
        },
        { method: "post" },
      );
      setSelectedIds([]);
    }
  };

  const handleCreateBooking = (e) => {
    e.preventDefault();
    fetcher.submit(
      {
        action: "createBooking",
        ...formData,
      },
      { method: "post" },
    );
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateBooking = (e) => {
    e.preventDefault();
    fetcher.submit(
      {
        action: "updateBooking",
        bookingId: selectedBooking._id,
        ...formData,
      },
      { method: "post" },
    );
    setShowEditModal(false);
    setSelectedBooking(null);
  };

  const handleDeleteBooking = (bookingId, permanent = false) => {
    if (
      confirm(
        `Are you sure you want to ${permanent ? "permanently delete" : "delete"} this booking?`,
      )
    ) {
      fetcher.submit(
        {
          action: "deleteBooking",
          bookingId,
          permanent: permanent.toString(),
        },
        { method: "post" },
      );
      setShowDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      vehicleId: "",
      pickupDate: "",
      pickupTime: "",
      duration: 4,
      pickupLocation: "",
      dropoffLocation: "",
      passengers: 1,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      specialRequests: "",
      baseAmount: 0,
      serviceFee: 0,
      insuranceFee: 0,
      totalAmount: 0,
      paymentMethod: "card",
      paymentStatus: "pending",
      status: "pending_verification",
    });
  };

  const editBooking = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      userId: booking.userId || "",
      vehicleId: booking.vehicleId || "",
      pickupDate: booking.pickupDate?.split("T")[0] || "",
      pickupTime: booking.pickupTime || "",
      duration: booking.duration || 4,
      pickupLocation: booking.pickupLocation || "",
      dropoffLocation: booking.dropoffLocation || "",
      passengers: booking.passengers || 1,
      customerName: booking.customerName || "",
      customerEmail: booking.customerEmail || "",
      customerPhone: booking.customerPhone || "",
      specialRequests: booking.specialRequests || "",
      baseAmount: booking.baseAmount || 0,
      serviceFee: booking.serviceFee || 0,
      insuranceFee: booking.insuranceFee || 0,
      totalAmount: booking.totalAmount || 0,
      paymentMethod: booking.paymentMethod || "card",
      paymentStatus: booking.paymentStatus || "pending",
      status: booking.status || "pending_verification",
    });
    setShowEditModal(true);
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
        className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${configItem.bg} ${configItem.text}`}
      >
        <Icon className="text-xs" />
        <span className="hidden sm:inline">{configItem.label}</span>
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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Stats - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Manage Bookings
          </h1>

          <div className="flex gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base"
            >
              <FaPlus className="text-xs sm:text-sm" />
              <span>New Booking</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <FaSync className="text-sm sm:text-base" />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export"
            >
              <FaDownload className="text-sm sm:text-base" />
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                    {stat.label}
                  </p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 wrap-break-word">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`${stat.color} p-2 sm:p-3 rounded-lg shrink-0 ml-2`}
                >
                  <stat.icon className="text-white text-sm sm:text-xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters - Stack on mobile */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search - Full width on mobile */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters?.status || "all"}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full lg:w-auto px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
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
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                showFilters
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFilter />
              <span>Date</span>
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleDateRangeApply}
                        className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white text-sm sm:text-base rounded-lg hover:bg-amber-700 transition-colors"
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

        {/* Bulk Actions - Responsive */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p className="text-sm sm:text-base text-amber-800 font-medium">
              <span className="font-bold">{selectedIds.length}</span> bookings
              selected
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleBulkAction("confirmed")}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => handleBulkAction("cancelled")}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkDelete(false)}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => handleBulkDelete(true)}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Bookings Table - Card view on mobile, table on desktop */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Mobile View (Cards) - Hidden on md and above */}
          <div className="block md:hidden">
            {bookings?.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border-b border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(booking._id)}
                    onChange={() => handleSelectOne(booking._id)}
                    className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />

                  <div className="flex-1">
                    {/* Header with ID and Status */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {booking.bookingId}
                        </span>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Customer and Vehicle */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <FaUser className="text-amber-600 text-xs" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {booking.user?.name || booking.customerName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {booking.user?.email || booking.customerEmail}
                        </p>
                      </div>
                    </div>

                    {/* Vehicle and Pickup */}
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaCar className="text-gray-400" />
                        <span className="truncate">{booking.vehicleName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>{formatDate(booking.pickupDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaClock className="text-gray-400" />
                        <span>{booking.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaMoneyBillWave className="text-gray-400" />
                        <span className="font-medium text-amber-600">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                      {booking.status === "pending_verification" && (
                        <>
                          <button
                            onClick={() => {
                              fetcher.submit(
                                {
                                  action: "updateStatus",
                                  bookingId: booking._id,
                                  status: "confirmed",
                                  notes: "Approved by admin",
                                  notifyCustomer: "true",
                                },
                                { method: "post" },
                              );
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Confirm Booking"
                          >
                            <FaCheckCircle className="text-base" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Reject this booking?")) {
                                fetcher.submit(
                                  {
                                    action: "updateStatus",
                                    bookingId: booking._id,
                                    status: "cancelled",
                                    notes: "Rejected by admin",
                                    notifyCustomer: "true",
                                  },
                                  { method: "post" },
                                );
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Reject Booking"
                          >
                            <FaTimesCircle className="text-base" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => editBooking(booking)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit Booking"
                      >
                        <FaEdit className="text-base" />
                      </button>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="View Details"
                      >
                        <FaEye className="text-base" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(booking)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Booking"
                      >
                        <FaTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === bookings?.length &&
                        bookings?.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                    Booking ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                    Pickup
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings?.map((booking) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(booking._id)}
                        onChange={() => handleSelectOne(booking._id)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {booking.bookingId}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                          <FaUser className="text-amber-600 text-xs" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate max-w-37.5">
                            {booking.user?.name || booking.customerName}
                          </p>
                          <p className="text-xs text-gray-600 truncate max-w-37.5">
                            {booking.user?.email || booking.customerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.vehicle?.image || booking.vehicleImage}
                          alt={booking.vehicleName}
                          className="w-10 h-10 object-cover rounded shrink-0"
                        />
                        <span className="text-sm text-gray-900 truncate max-w-30">
                          {booking.vehicleName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {formatDate(booking.pickupDate)}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-xs text-gray-400" />
                        <span className="truncate max-w-25">
                          {booking.pickupLocation}
                        </span>
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {booking.duration}h
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-1">
                        {booking.status === "pending_verification" && (
                          <>
                            <button
                              onClick={() => {
                                fetcher.submit(
                                  {
                                    action: "updateStatus",
                                    bookingId: booking._id,
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
                              <FaCheckCircle className="text-base" />
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
                                      bookingId: booking._id,
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
                              <FaTimesCircle className="text-base" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => editBooking(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Booking"
                        >
                          <FaEdit className="text-base" />
                        </button>
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="text-base" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(booking)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Booking"
                        >
                          <FaTrash className="text-base" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {(!bookings || bookings.length === 0) && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-gray-400 text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Try adjusting your filters or search term
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base"
              >
                Create New Booking
              </button>
            </div>
          )}

          {/* Pagination - Responsive */}
          {pagination?.pages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="hidden sm:inline">Showing </span>
                {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                <span className="hidden sm:inline">of </span>
                <span className="font-semibold text-gray-900">
                  {pagination.total}
                </span>
              </p>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() =>
                    handleFilterChange("page", pagination.page - 1)
                  }
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-xs sm:text-sm" />
                </button>

                {Array.from(
                  { length: Math.min(3, pagination.pages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 2) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 1) {
                      pageNum = pagination.pages - 2 + i;
                    } else {
                      pageNum = pagination.page - 1 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange("page", pageNum)}
                        className={`hidden sm:block px-3 py-2 text-sm rounded-lg transition-colors ${
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

                <span className="sm:hidden px-3 py-2 text-sm">
                  {pagination.page} / {pagination.pages}
                </span>

                <button
                  onClick={() =>
                    handleFilterChange("page", pagination.page + 1)
                  }
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight className="text-xs sm:text-sm" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Booking Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                      Create New Booking
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-gray-500 text-lg sm:text-xl" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateBooking} className="space-y-6">
                    {/* Customer Information */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaUser className="text-amber-600" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.customerName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customerName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.customerEmail}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customerEmail: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.customerPhone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customerPhone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Selection */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaCar className="text-amber-600" />
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle ID *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.vehicleId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                vehicleId: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                            placeholder="Enter vehicle ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            User ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={formData.userId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                userId: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                            placeholder="Enter user ID if registered"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-amber-600" />
                        Trip Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.pickupDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pickupDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Time *
                          </label>
                          <input
                            type="time"
                            required
                            value={formData.pickupTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pickupTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (hours) *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passengers *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={formData.passengers}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                passengers: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Location *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.pickupLocation}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pickupLocation: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dropoff Location *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.dropoffLocation}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dropoffLocation: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaMoneyBillWave className="text-amber-600" />
                        Payment Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Amount (KES) *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.baseAmount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                baseAmount: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method *
                          </label>
                          <select
                            value={formData.paymentMethod}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentMethod: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          >
                            <option value="card">Card</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Status
                          </label>
                          <select
                            value={formData.paymentStatus}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentStatus: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Booking Status
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          >
                            <option value="pending_verification">
                              Pending Verification
                            </option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Fee Breakdown */}
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Service Fee (10%)
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(formData.serviceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Insurance (5%)</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(formData.insuranceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                          <span className="text-gray-900">Total Amount</span>
                          <span className="text-amber-600">
                            {formatCurrency(formData.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialRequests: e.target.value,
                          })
                        }
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                        placeholder="Any special requests or notes..."
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                      >
                        <FaSave className="text-sm" />
                        Create Booking
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Booking Modal */}
        <AnimatePresence>
          {showEditModal && selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
              onClick={() => {
                setShowEditModal(false);
                setSelectedBooking(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                      Edit Booking
                    </h2>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedBooking(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-gray-500 text-lg sm:text-xl" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateBooking} className="space-y-6">
                    {/* Similar form as create but pre-filled */}
                    {/* Customer Information */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaUser className="text-amber-600" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.customerName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customerName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.customerEmail}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customerEmail: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.customerPhone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customerPhone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-amber-600" />
                        Trip Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.pickupDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pickupDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Time *
                          </label>
                          <input
                            type="time"
                            required
                            value={formData.pickupTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pickupTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (hours) *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passengers *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={formData.passengers}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                passengers: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Location *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.pickupLocation}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pickupLocation: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dropoff Location *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.dropoffLocation}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dropoffLocation: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaMoneyBillWave className="text-amber-600" />
                        Payment Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Amount (KES) *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.baseAmount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                baseAmount: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method *
                          </label>
                          <select
                            value={formData.paymentMethod}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentMethod: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          >
                            <option value="card">Card</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Status
                          </label>
                          <select
                            value={formData.paymentStatus}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentStatus: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>

                      {/* Fee Breakdown */}
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Service Fee (10%)
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(formData.serviceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Insurance (5%)</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(formData.insuranceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                          <span className="text-gray-900">Total Amount</span>
                          <span className="text-amber-600">
                            {formatCurrency(formData.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialRequests: e.target.value,
                          })
                        }
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                        placeholder="Any special requests or notes..."
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedBooking(null);
                        }}
                        className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                      >
                        <FaSave className="text-sm" />
                        Update Booking
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <FaExclamationTriangle className="text-2xl" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Delete Booking
                    </h2>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete booking{" "}
                    <span className="font-mono font-medium text-gray-900">
                      {showDeleteConfirm.bookingId}
                    </span>
                    ? This action can be reversed unless you choose permanent
                    deletion.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() =>
                        handleDeleteBooking(showDeleteConfirm._id, false)
                      }
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      Move to Trash
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteBooking(showDeleteConfirm._id, true)
                      }
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Delete Permanently
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Details Modal - Keep existing */}
        <AnimatePresence>
          {selectedBooking && !showEditModal && !showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
              onClick={() => setSelectedBooking(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                      Booking Details
                    </h2>
                    <button
                      onClick={() => setSelectedBooking(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-gray-500 text-lg sm:text-xl" />
                    </button>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Status and ID */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Booking ID
                        </p>
                        <p className="font-mono text-sm sm:text-base font-medium text-gray-900 break-all">
                          {selectedBooking.bookingId}
                        </p>
                      </div>
                      {getStatusBadge(selectedBooking.status)}
                    </div>

                    {/* Customer Info */}
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 flex items-center gap-2">
                        <FaUser className="text-amber-600 text-sm sm:text-base" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Name</p>
                          <p className="text-sm font-medium text-gray-900 wrap-break-word">
                            {selectedBooking.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="text-sm font-medium text-gray-900 wrap-break-word">
                            {selectedBooking.customerEmail}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-600">Phone</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <FaPhone className="text-xs text-gray-500" />
                            {selectedBooking.customerPhone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 flex items-center gap-2">
                        <FaCar className="text-amber-600 text-sm sm:text-base" />
                        Vehicle Details
                      </h3>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <img
                          src={selectedBooking.vehicleImage}
                          alt={selectedBooking.vehicleName}
                          className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-base sm:text-lg text-gray-900">
                            {selectedBooking.vehicleName}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {selectedBooking.vehicleCategory?.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-amber-600 text-sm sm:text-base" />
                        Trip Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs text-gray-600">
                            Pickup Date & Time
                          </p>
                          <p className="text-sm font-medium text-gray-900">
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
                          <p className="text-xs text-gray-600">Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.duration} hours
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">
                            Pickup Location
                          </p>
                          <p className="text-sm font-medium text-gray-900 wrap-break-word">
                            {selectedBooking.pickupLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">
                            Dropoff Location
                          </p>
                          <p className="text-sm font-medium text-gray-900 break-word">
                            {selectedBooking.dropoffLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Passengers</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.passengers}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 flex items-center gap-2">
                        <FaMoneyBillWave className="text-amber-600 text-sm sm:text-base" />
                        Payment Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Method</p>
                          <p className="text-sm font-medium capitalize text-gray-900 break-word">
                            {selectedBooking.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Status</p>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              selectedBooking.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedBooking.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Base Amount</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedBooking.baseAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Service Fee (10%)
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedBooking.serviceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Insurance (5%)</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedBooking.insuranceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 text-base sm:text-lg">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold text-amber-600">
                            {formatCurrency(selectedBooking.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedBooking.specialRequests && (
                      <div className="border border-yellow-200 rounded-lg p-3 sm:p-4 bg-yellow-50">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 flex items-center gap-2">
                          <FaExclamationTriangle className="text-yellow-600 text-sm sm:text-base" />
                          Special Requests
                        </h3>
                        <p className="text-sm text-gray-700 break-word">
                          {selectedBooking.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                      {selectedBooking.status === "pending_verification" && (
                        <>
                          <button
                            onClick={() => {
                              fetcher.submit(
                                {
                                  action: "updateStatus",
                                  bookingId: selectedBooking._id,
                                  status: "confirmed",
                                  notes: "Approved by admin",
                                  notifyCustomer: "true",
                                },
                                { method: "post" },
                              );
                              setSelectedBooking(null);
                            }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 transition-colors font-medium"
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
                                    bookingId: selectedBooking._id,
                                    status: "cancelled",
                                    notes: "Rejected by admin",
                                    notifyCustomer: "true",
                                  },
                                  { method: "post" },
                                );
                                setSelectedBooking(null);
                              }
                            }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            Reject Booking
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => editBooking(selectedBooking)}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <FaEdit className="text-sm" />
                        Edit Booking
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(selectedBooking);
                          setSelectedBooking(null);
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <FaTrash className="text-sm" />
                        Delete Booking
                      </button>
                    </div>
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
