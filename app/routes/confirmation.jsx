// app/routes/booking-confirmation.$id.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaPrint,
  FaDownload,
  FaEnvelope,
  FaWhatsapp,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaCar,
  FaCreditCard,
  FaShieldAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheck,
  FaHelicopter,
  FaMoneyBillWave,
  FaMobileAlt,
} from "react-icons/fa";
import { getBookingById } from "../models/booking";
import toast, { Toaster } from "react-hot-toast";

// ------------------- Loader -------------------
export async function loader({ params }) {
  const { id } = params;

  try {
    console.log("🔍 Loading booking confirmation for ID:", id);
    const booking = await getBookingById(id);

    if (!booking) {
      console.error("❌ Booking not found for ID:", id);
      throw new Response("Booking Not Found", { status: 404 });
    }

    console.log("✅ Booking loaded:", {
      id: booking._id,
      bookingId: booking.bookingId,
      vehicle: booking.vehicleName,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
    });

    // Format dates properly
    const formatDate = (date) => {
      if (!date) return null;
      if (date.$date) return new Date(date.$date).toISOString();
      return new Date(date).toISOString();
    };

    // Calculate correct pricing based on duration
    const dailyRate = booking.dailyRate || 0;
    const hourlyRate = dailyRate / 24;
    const basePrice = hourlyRate * (booking.duration || 1);
    const serviceFee = basePrice * 0.1;
    const insurance = basePrice * 0.05;
    const calculatedTotal = basePrice + serviceFee + insurance;

    return {
      booking: {
        ...booking,
        _id: booking._id.toString(),
        bookingId:
          booking.bookingId ||
          `BK${booking._id.toString().slice(-8).toUpperCase()}`,
        createdAt: formatDate(booking.createdAt),
        updatedAt: formatDate(booking.updatedAt),
        // Ensure all required fields exist with defaults
        vehicleCategory:
          booking.vehicleCategory || booking.category || "Luxury",
        vehicleName: booking.vehicleName || "Vehicle",
        vehicleImage: booking.vehicleImage || booking.vehicleImage || null,
        customerName: booking.customerName || "Customer",
        customerEmail: booking.customerEmail || "email@example.com",
        customerPhone: booking.customerPhone || "+254 700 000 000",
        pickupDate:
          booking.pickupDate || new Date().toISOString().split("T")[0],
        pickupTime: booking.pickupTime || "09:00",
        duration: booking.duration || 1,
        passengers: booking.passengers || 1,
        pickupLocation: booking.pickupLocation || "Nairobi CBD",
        dropoffLocation:
          booking.dropoffLocation || booking.pickupLocation || "Nairobi CBD",
        paymentMethod: booking.paymentMethod || "mpesa",
        status: booking.status || "pending_verification",
        paymentStatus: booking.paymentStatus || "pending",
        totalAmount: booking.totalAmount || calculatedTotal,
        dailyRate: dailyRate,
        hourlyRate: hourlyRate,
        basePrice: basePrice,
        serviceFee: booking.serviceFee || serviceFee,
        insurance: booking.insurance || insurance,
        paymentMetadata: booking.paymentMetadata || {},
      },
    };
  } catch (error) {
    console.error("❌ Loader error:", error);
    throw new Response("Failed to load booking", { status: 500 });
  }
}

// ------------------- BookingConfirmationPage Component -------------------
export default function BookingConfirmationPage() {
  const { booking } = useLoaderData();
  const navigate = useNavigate();
  const { id } = useParams();

  const [isPrinting, setIsPrinting] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-KE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Format price
  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return "Ksh 0";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get vehicle icon based on category
  const getVehicleIcon = (category) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("helicopter") || cat.includes("heli")) {
      return <FaHelicopter className="text-amber-600" />;
    } else if (
      cat.includes("luxury") ||
      cat.includes("premium") ||
      cat.includes("sedan")
    ) {
      return <FaCar className="text-amber-600" />;
    } else {
      return <FaCar className="text-amber-600" />;
    }
  };

  // Get payment method icon and details
  const getPaymentInfo = () => {
    const method = booking.paymentMethod?.toLowerCase() || "";
    const paymentStatus = booking.paymentStatus?.toLowerCase() || "pending";

    if (method === "cash_on_delivery" || method === "delivery") {
      return {
        icon: <FaMoneyBillWave className="text-blue-600 w-5 h-5" />,
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
        label: "Pay on Delivery",
        description: "Cash payment at pickup",
        statusBadge: paymentStatus === "paid" ? "Paid" : "Pending Payment",
        statusColor: paymentStatus === "paid" ? "green" : "yellow",
      };
    } else if (method === "mpesa") {
      return {
        icon: <FaMobileAlt className="text-green-600 w-5 h-5" />,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
        label: "M-Pesa",
        description: "Mobile money payment",
        statusBadge: paymentStatus === "paid" ? "Paid" : "Payment Pending",
        statusColor: paymentStatus === "paid" ? "green" : "yellow",
      };
    } else {
      return {
        icon: <FaCreditCard className="text-amber-600 w-5 h-5" />,
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        label: "Card Payment",
        description: "Credit/Debit card",
        statusBadge: paymentStatus === "paid" ? "Paid" : "Payment Pending",
        statusColor: paymentStatus === "paid" ? "green" : "yellow",
      };
    }
  };

  // Countdown to redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/fleet");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Handle print
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      toast.success("Print dialog opened");
    }, 500);
  };

  // Handle download as PDF
  const handleDownload = () => {
    toast.success("Preparing PDF...");
    // In a real app, this would generate and download a PDF
    setTimeout(() => {
      toast.success("Confirmation downloaded successfully!");
    }, 1500);
  };

  // Handle email confirmation
  const handleEmailConfirmation = async () => {
    setIsEmailSending(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Confirmation email sent successfully!");
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsEmailSending(false);
    }
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = () => {
    const paymentInfo = getPaymentInfo();
    const paymentStatus =
      booking.paymentStatus === "paid" ? "✅ Paid" : "⏳ Payment Pending";

    const message =
      `🚗 I've booked ${booking.vehicleName} on SkyDrive!\n\n` +
      `📋 Booking ID: ${booking.bookingId}\n` +
      `🚗 Vehicle: ${booking.vehicleName}\n` +
      `📅 Date: ${formatDate(booking.pickupDate)}\n` +
      `⏰ Time: ${formatTime(booking.pickupTime)}\n` +
      `⏳ Duration: ${booking.duration} hour${booking.duration > 1 ? "s" : ""}\n` +
      `👥 Passengers: ${booking.passengers}\n` +
      `💰 Total: ${formatPrice(booking.totalAmount)}\n` +
      `💳 Payment: ${paymentInfo.label} - ${paymentStatus}\n\n` +
      `📍 Pickup: ${booking.pickupLocation}\n` +
      `📍 Drop-off: ${booking.dropoffLocation}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("WhatsApp opened");
  };

  // Handle phone call
  const handleCallSupport = () => {
    window.location.href = "tel:+254700000000";
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "payment_pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "confirmed":
        return "✅ Confirmed";
      case "pending_verification":
        return "⏳ Pending Verification";
      case "cancelled":
        return "❌ Cancelled";
      case "completed":
        return "✓ Completed";
      case "payment_pending":
        return "⏳ Awaiting Payment";
      default:
        return "🔄 Processing";
    }
  };

  const paymentInfo = getPaymentInfo();
  const isHelicopter =
    booking.vehicleCategory?.toLowerCase().includes("helicopter") ||
    booking.vehicleName?.toLowerCase().includes("helicopter");
  const isPayOnDelivery =
    booking.paymentMethod === "cash_on_delivery" ||
    booking.paymentMethod === "delivery";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-300 via-white to-amber-300 pt-15">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#111827",
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            padding: "16px",
          },
          success: {
            icon: "✅",
            style: {
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
            },
          },
          error: {
            icon: "❌",
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            },
          },
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-amber-100 border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/fleet")}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-amber-700 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Browse More Vehicles</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Redirecting to fleet in {countdown}s
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Success Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-green-500 to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <FaCheckCircle className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Booking{" "}
            {booking.status === "confirmed" ? "Confirmed!" : "Received!"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Your{" "}
            <span className="font-bold text-amber-700">
              {booking.vehicleName}
            </span>{" "}
            booking has been{" "}
            {booking.status === "confirmed"
              ? "confirmed"
              : "received and is being processed"}
            . We've sent a confirmation to{" "}
            <span className="font-semibold text-amber-700">
              {booking.customerEmail}
            </span>
            .
          </p>
          <div className="inline-flex flex-wrap justify-center items-center gap-4">
            <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
              <span className="font-mono font-bold">
                Booking ID: {booking.bookingId}
              </span>
            </div>
            <div
              className={`px-4 py-2 rounded-full border ${getStatusColor(booking.status)}`}
            >
              <span className="font-medium flex items-center gap-2">
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Vehicle Info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {booking.vehicleImage && (
                    <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden border-2 border-amber-200 shadow-lg">
                      <img
                        src={booking.vehicleImage}
                        alt={booking.vehicleName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop";
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getVehicleIcon(booking.vehicleCategory)}
                      <span className="px-3 py-1 bg-linear-to-r from-amber-600/10 to-amber-500/5 rounded-full border border-amber-200 text-xs font-bold text-amber-700 uppercase tracking-widest">
                        {booking.vehicleCategory || "Luxury Vehicle"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {booking.vehicleName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-2">
                        <FaUser className="text-amber-600" />
                        {booking.passengers}{" "}
                        {booking.passengers > 1 ? "passengers" : "passenger"}
                      </span>
                      <span className="text-lg font-bold text-amber-700">
                        {formatPrice(booking.dailyRate)} / day
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Payment Status Banner - Only show for Pay on Delivery */}
                {isPayOnDelivery && booking.paymentStatus !== "paid" && (
                  <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <FaMoneyBillWave className="text-blue-600 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          Payment on Delivery
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          Your booking is confirmed! Please prepare{" "}
                          <span className="font-bold text-blue-700">
                            {formatPrice(booking.totalAmount)}
                          </span>{" "}
                          in cash for payment when you pick up the vehicle.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Payment Status: Pending
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Booking: Confirmed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rental Timeline */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-amber-600" />
                    Rental Schedule
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FaCalendarAlt className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Pickup Date</p>
                            <p className="font-bold text-gray-900">
                              {formatDate(booking.pickupDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-linear-to-br from-amber-50 to-amber-100/30 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <FaMapMarkerAlt className="text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Pickup Location
                            </p>
                            <p className="font-bold text-gray-900">
                              {booking.pickupLocation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 bg-linear-to-br from-emerald-50 to-emerald-100/30 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <FaClock className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Pickup Time</p>
                            <p className="font-bold text-gray-900">
                              {formatTime(booking.pickupTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100/30 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <FaMapMarkerAlt className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Drop-off Location
                            </p>
                            <p className="font-bold text-gray-900">
                              {booking.dropoffLocation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-linear-to-r from-amber-50 to-amber-100/30 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-700 font-bold text-lg">
                          {booking.duration}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Rental Duration
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.duration} hour
                          {booking.duration > 1 ? "s" : ""} •{" "}
                          {formatPrice(booking.hourlyRate * booking.duration)}{" "}
                          rental cost
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUser className="text-amber-600" />
                    Customer Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-semibold text-lg text-gray-900">
                          {booking.customerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-semibold text-gray-900">
                          {booking.customerEmail}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-semibold text-gray-900">
                          {booking.customerPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg ${paymentInfo.bgColor} flex items-center justify-center`}
                          >
                            {paymentInfo.icon}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 capitalize">
                              {paymentInfo.label}
                            </span>
                            <span
                              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                booking.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {booking.paymentStatus === "paid"
                                ? "Paid"
                                : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Special Requests
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-700">{booking.specialRequests}</p>
                    </div>
                  </div>
                )}

                {/* Important Notes - Dynamic based on vehicle type and payment method */}
                <div
                  className={`bg-linear-to-r ${
                    isPayOnDelivery
                      ? "from-blue-50 to-blue-100/30 border-l-4 border-blue-400"
                      : isHelicopter
                        ? "from-yellow-50 to-yellow-100/30 border-l-4 border-yellow-400"
                        : "from-blue-50 to-blue-100/30 border-l-4 border-blue-400"
                  } p-4 rounded-r-xl`}
                >
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle
                      className={`${
                        isPayOnDelivery
                          ? "text-blue-500"
                          : isHelicopter
                            ? "text-yellow-500"
                            : "text-blue-500"
                      } mt-1 shrink-0`}
                    />
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-bold ${
                          isPayOnDelivery
                            ? "text-blue-800"
                            : isHelicopter
                              ? "text-yellow-800"
                              : "text-blue-800"
                        } mb-2`}
                      >
                        Important Information
                      </h4>
                      <ul
                        className={`text-sm ${
                          isPayOnDelivery
                            ? "text-blue-700"
                            : isHelicopter
                              ? "text-yellow-700"
                              : "text-blue-700"
                        } space-y-2`}
                      >
                        {isPayOnDelivery && (
                          <>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-blue-600" />
                              <span>
                                <strong>Payment:</strong> Please have exact cash
                                amount of {formatPrice(booking.totalAmount)}{" "}
                                ready at pickup
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-blue-600" />
                              <span>
                                <strong>Receipt:</strong> You'll receive a
                                payment receipt upon delivery
                              </span>
                            </li>
                          </>
                        )}
                        {isHelicopter ? (
                          <>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-yellow-600" />
                              <span>
                                Arrive at the helipad 30 minutes before
                                scheduled departure
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-yellow-600" />
                              <span>
                                Bring valid government-issued photo ID for all
                                passengers
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-yellow-600" />
                              <span>
                                Weight restrictions apply - total passenger
                                weight limit: 600kg
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-yellow-600" />
                              <span>
                                Our pilot will contact you 2 hours before pickup
                                for final weather check
                              </span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-blue-600" />
                              <span>
                                Arrive 15 minutes before scheduled pickup time
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-blue-600" />
                              <span>
                                Bring valid driver's license and identification
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-blue-600" />
                              <span>Fuel policy: Full to full</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FaCheck className="w-3 h-3 mt-1 text-blue-600" />
                              <span>
                                Our team will contact you 1 day before pickup to
                                confirm details
                              </span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Actions & Summary */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Price Summary */}
            <div className="bg-linear-to-br from-amber-600 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-600/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaCreditCard className="w-5 h-5" />
                Payment Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Daily Rate</span>
                  <span className="font-semibold">
                    {formatPrice(booking.dailyRate)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Hourly Rate</span>
                  <span className="font-semibold">
                    {formatPrice(booking.hourlyRate)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Duration</span>
                  <span className="font-semibold">
                    {booking.duration} hour{booking.duration > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="h-px bg-amber-400/50 my-2"></div>

                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Base Rental</span>
                  <span className="font-semibold">
                    {formatPrice(booking.basePrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-200/90">Service Fee (10%)</span>
                  <span className="text-amber-200/90">
                    {formatPrice(booking.serviceFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-200/90">Insurance (5%)</span>
                  <span className="text-amber-200/90">
                    {formatPrice(booking.insurance)}
                  </span>
                </div>

                <div className="h-px bg-amber-400/50 my-3"></div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>

                {/* Payment Status Badge */}
                {isPayOnDelivery && (
                  <div className="mt-4 pt-4 border-t border-amber-400/30">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-200/90">Payment Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.paymentStatus === "paid"
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        {booking.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                    {booking.paymentStatus !== "paid" && (
                      <p className="text-xs text-amber-200/90 mt-2">
                        Pay {formatPrice(booking.totalAmount)} in cash at pickup
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-amber-400/30">
                <div className="flex items-center gap-3">
                  <FaShieldAlt className="w-5 h-5 text-amber-200" />
                  <div>
                    <p className="font-medium">Booking Secured</p>
                    <p className="text-amber-200/90 text-sm">
                      {isPayOnDelivery
                        ? "Your booking is confirmed. Payment at pickup."
                        : "Your payment is protected with premium insurance"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmation Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all disabled:opacity-50"
                >
                  <FaPrint className="w-4 h-4" />
                  {isPrinting ? "Printing..." : "Print Confirmation"}
                </button>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
                >
                  <FaDownload className="w-4 h-4" />
                  Download PDF
                </button>

                <button
                  onClick={handleEmailConfirmation}
                  disabled={isEmailSending}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all disabled:opacity-50"
                >
                  <FaEnvelope className="w-4 h-4" />
                  {isEmailSending ? "Sending..." : "Email Confirmation"}
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  Share via WhatsApp
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaPhone className="text-amber-600" />
                Need Help?
              </h3>

              <p className="text-gray-600 mb-4">
                Our customer support team is available 24/7 to assist with your
                booking.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleCallSupport}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-linear-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-600/30 transition-all"
                >
                  <FaPhone className="w-4 h-4" />
                  Call Support: +254 700 000 000
                </button>

                <a
                  href={`mailto:support@skydrive.com?subject=Inquiry%20about%20Booking%20${booking.bookingId}`}
                  className="block text-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  ✉️ support@skydrive.com
                </a>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100/30 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Next Steps
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-xs">1</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Check your email:</strong> We've sent a confirmation
                    to {booking.customerEmail}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-xs">2</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Prepare documents:</strong> Have your ID and{" "}
                    {isHelicopter ? "passenger manifest" : "driver's license"}{" "}
                    ready
                  </span>
                </li>
                {isPayOnDelivery && booking.paymentStatus !== "paid" && (
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-bold text-xs">
                        💰
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      <strong>Prepare payment:</strong> Have{" "}
                      <span className="font-bold text-blue-700">
                        {formatPrice(booking.totalAmount)}
                      </span>{" "}
                      in cash ready for pickup
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-xs">3</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Arrive on time:</strong> Please arrive{" "}
                    {isHelicopter ? "30 minutes" : "15 minutes"} before pickup
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-xs">4</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Enjoy your ride!</strong> Contact us if you need any
                    assistance
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-300">
              SkyDrive Premium • Luxury Vehicle Rentals
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Booking ID: {booking.bookingId} • Created:{" "}
              {formatDate(booking.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
