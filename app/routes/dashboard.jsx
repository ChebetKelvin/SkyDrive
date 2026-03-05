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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Header */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600">
              Manage your bookings and preferences from your dashboard.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold opacity-90">Total Bookings</h3>
                <FaCalendarCheck className="text-2xl opacity-75" />
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm opacity-75 mt-2">All time bookings</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold opacity-90">Active</h3>
                <FaClock className="text-2xl opacity-75" />
              </div>
              <p className="text-3xl font-bold">{stats.active}</p>
              <p className="text-sm opacity-75 mt-2">Current bookings</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold opacity-90">Completed</h3>
                <FaCheckCircle className="text-2xl opacity-75" />
              </div>
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-sm opacity-75 mt-2">Past bookings</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold opacity-90">Total Spent</h3>
                <FaMoneyBillWave className="text-2xl opacity-75" />
              </div>
              <p className="text-2xl font-bold">
                {formatPrice(stats.totalSpent)}
              </p>
              <p className="text-sm opacity-75 mt-2">Lifetime value</p>
            </motion.div>
          </div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Bookings
              </h2>
              {bookings.length > 0 && (
                <Link
                  to="/bookings"
                  className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
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
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {/* Vehicle Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
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

                        {/* Booking Details */}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking.vehicleName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(booking.pickupDate)} at{" "}
                            {booking.pickupTime}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {booking.duration} hours
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(booking.status)}`}
                            >
                              {booking.status.replace("_", " ")}
                            </span>
                            <span className="text-sm font-semibold text-amber-600">
                              {formatPrice(booking.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to={`/booking-confirmation/${booking._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <FaEye className="w-4 h-4" />
                        <span className="text-sm font-medium">View</span>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <FaCalendarCheck className="text-3xl text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Ready for your next adventure? Browse our fleet and make your
                  first booking.
                </p>
                <Link
                  to="/fleet"
                  className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors"
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
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/fleet"
                className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <FaCar />
                Browse Fleet
              </Link>
              <Link
                to="/profile"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <FaEye />
                View Profile
              </Link>
              {bookings.length > 0 && (
                <Link
                  to="/bookings"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <FaCalendarCheck />
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
