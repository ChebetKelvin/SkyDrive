// routes/bookings.jsx
import { redirect, useLoaderData } from "react-router";
import { getSession } from "../.server/session.js";
import { getUserBookings } from "../models/booking.js";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  FaCar,
  FaEye,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return redirect("/login");
  }

  const bookings = await getUserBookings(user.id);

  return { user, bookings };
}

export default function BookingsPage() {
  const { user, bookings } = useLoaderData();

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: "bg-green-100 text-green-700",
      pending_verification: "bg-yellow-100 text-yellow-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-amber-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FaCar className="text-4xl text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Bookings Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Ready to start your journey? Browse our luxury fleet and make
                your first booking.
              </p>
              <Link
                to="/fleet"
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700"
              >
                <FaCar />
                Browse Fleet
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="md:flex">
                    {/* Vehicle Image */}
                    <div className="md:w-64 h-48 md:h-auto bg-gray-100">
                      {booking.vehicleImage ? (
                        <img
                          src={booking.vehicleImage}
                          alt={booking.vehicleName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaCar className="text-5xl text-gray-700" />
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {booking.vehicleName}
                          </h2>
                          <p className="text-gray-700">
                            Booking #{booking.bookingId}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(booking.status)}`}
                        >
                          {booking.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Pickup Date</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <FaCalendarAlt className="text-amber-600 text-sm" />
                            {formatDate(booking.pickupDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Pickup Time</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <FaClock className="text-amber-600 text-sm" />
                            {booking.pickupTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">
                            {booking.duration} hours
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="font-bold text-amber-600">
                            {formatPrice(booking.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-amber-600" />
                            Pickup Location
                          </p>
                          <p className="text-sm text-gray-900">
                            {booking.pickupLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-amber-600" />
                            Drop-off Location
                          </p>
                          <p className="text-sm text-gray-900">
                            {booking.dropoffLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Link
                          to={`/booking-confirmation/${booking._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <FaEye />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
