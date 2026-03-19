import { redirect, useLoaderData } from "react-router";
import { getSession } from "../.server/session.js";
import {
  getUserBookings,
  getUserBookingStats,
} from "../models/booking.server.js";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  FaCalendarCheck,
  FaClock,
  FaMoneyBillWave,
  FaCar,
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return redirect("/login");
  }

  try {
    const [bookings, stats] = await Promise.all([
      getUserBookings(user.id),
      getUserBookingStats(user.id),
    ]);

    return {
      user,
      bookings,
      stats,
    };
  } catch (error) {
    return {
      user,
      bookings: [],
      stats: {
        total: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0,
      },
    };
  }
}

export default function Dashboard() {
  const { user, bookings, stats } = useLoaderData();

  // Format currency
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-amber-50 pt-5 sm:pt-6 lg:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your bookings and preferences from your dashboard.
            </p>
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-semibold opacity-90">
                  Total Bookings
                </h3>
                <FaCalendarCheck className="text-xl sm:text-2xl opacity-75" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
              <p className="text-xs sm:text-sm opacity-75 mt-2">
                All time bookings
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-semibold opacity-90">
                  Active
                </h3>
                <FaClock className="text-xl sm:text-2xl opacity-75" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{stats.active}</p>
              <p className="text-xs sm:text-sm opacity-75 mt-2">
                Current bookings
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-semibold opacity-90">
                  Completed
                </h3>
                <FaCheckCircle className="text-xl sm:text-2xl opacity-75" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                {stats.completed}
              </p>
              <p className="text-xs sm:text-sm opacity-75 mt-2">
                Past bookings
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-semibold opacity-90">
                  Total Spent
                </h3>
                <FaMoneyBillWave className="text-xl sm:text-2xl opacity-75" />
              </div>
              <p className="text-xl sm:text-2xl font-bold wrap-break-word">
                {formatPrice(stats.totalSpent)}
              </p>
              <p className="text-xs sm:text-sm opacity-75 mt-2">
                Lifetime value
              </p>
            </motion.div>
          </div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Your Bookings
              </h2>
              {bookings.length > 0 && (
                <Link
                  to="/bookings"
                  className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 text-sm sm:text-base"
                >
                  View All
                  <span>→</span>
                </Link>
              )}
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <motion.div
                    key={booking._id}
                    whileHover={{ x: 4 }}
                    className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Vehicle Image */}
                      <div className="w-full sm:w-20 h-32 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {booking.vehicleImage ? (
                          <img
                            src={booking.vehicleImage}
                            alt={booking.vehicleName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaCar className="text-3xl text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Booking Details - Make this take remaining space */}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {booking.vehicleName}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatDate(booking.pickupDate)} at{" "}
                                {booking.pickupTime}
                              </p>
                              <span className="hidden sm:inline text-gray-300">
                                •
                              </span>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {booking.duration} hours
                              </p>
                            </div>
                          </div>

                          {/* Action Button - Move to top right on mobile */}
                          <Link
                            to={`/booking-confirmation/${booking._id}`}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors self-end sm:self-auto"
                          >
                            <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">
                              View
                            </span>
                          </Link>
                        </div>

                        {/* Status and Price */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(booking.status)}`}
                          >
                            {booking.status.replace("_", " ")}
                          </span>
                          <span className="text-sm sm:text-base font-semibold text-amber-600">
                            {formatPrice(booking.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <FaCalendarCheck className="text-2xl sm:text-3xl text-amber-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No bookings yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                  Ready for your next adventure? Browse our fleet and make your
                  first booking.
                </p>
                <Link
                  to="/fleet"
                  className="inline-flex items-center gap-2 bg-amber-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-amber-700 transition-colors text-sm sm:text-base"
                >
                  <FaCar />
                  Browse Fleet
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/fleet"
                className="bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <FaCar className="w-4 h-4" />
                Browse Fleet
              </Link>
              <Link
                to="/profile"
                className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <FaEye className="w-4 h-4" />
                View Profile
              </Link>
              {bookings.length > 0 && (
                <Link
                  to="/bookings"
                  className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  <FaCalendarCheck className="w-4 h-4" />
                  All Bookings
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
