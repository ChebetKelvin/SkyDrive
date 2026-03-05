import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useLoaderData,
  Form,
  redirect,
  useNavigation,
  useActionData,
} from "react-router";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { getVehicleById } from "../models/vehicles";
import {
  createPendingBooking,
  createConfirmedBooking,
} from "../models/booking";
import { checkBookingConflict } from "../service/bookingChecks.js";
import { stkPush, normalizePhone } from "../.server/stkpush.js";
import {
  getSession,
  commitSession,
  setErrorMessage,
  setSuccessMessage,
} from "../.server/session.js";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCreditCard,
  FaLock,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCrown,
  FaSpinner,
  FaMoneyBillWave,
} from "react-icons/fa";

// Helper function to format amount for messages
function formatAmountForMessage(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ------------------- Loader -------------------
export async function loader({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  console.log("🔍 Booking page loader - User:", user ? user.email : "No user");

  if (!user) {
    console.log("❌ No user found, redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.url);
    return redirect(loginUrl.toString());
  }

  const { id } = params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) throw new Response("Vehicle Not Found", { status: 404 });

  // Transform data to match component expectations
  const transformedVehicle = {
    ...vehicle,
    _id: vehicle._id?.toString(),
    images: vehicle.images || [vehicle.thumbnail].filter(Boolean),
    features: vehicle.features || [],
    serviceLocations: vehicle.serviceLocations || [],
    specifications: vehicle.specifications || {},
    reviews: vehicle.reviews || vehicle.reviewCount || 0,
    pricing: {
      hourly: vehicle.pricing?.hourly || null,
      daily: vehicle.pricing?.daily || 0,
      weekly:
        vehicle.pricing?.weekly ||
        (vehicle.pricing?.daily ? vehicle.pricing.daily * 7 * 0.9 : 0),
      monthly:
        vehicle.pricing?.monthly ||
        (vehicle.pricing?.daily ? vehicle.pricing.daily * 30 * 0.8 : 0),
      currency: vehicle.pricing?.currency || "KES",
    },
    capacity: {
      passengers: vehicle.capacity?.passengers || 4,
      luggage: vehicle.capacity?.luggage || 2,
    },
    price: vehicle.price || vehicle.pricing?.daily || 0,
  };

  return {
    vehicle: transformedVehicle,
    user,
  };
}

// ------------------- Action -------------------
export async function action({ request, params }) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    setErrorMessage(session, "You must be logged in to make a booking");
    return redirect("/login", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  const formData = await request.formData();
  const vehicleId = params.id;

  console.log("🔍 Action called for vehicle:", vehicleId);
  console.log("👤 User making booking:", user.email, "ID:", user.id);

  // Get vehicle
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) {
    setErrorMessage(session, "Vehicle not found");
    return redirect("/fleet", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  // Check if vehicle has available units
  if (vehicle.availableUnits <= 0) {
    setErrorMessage(session, "Sorry, this vehicle is fully booked.");
    return redirect(`/fleet/${vehicleId}`, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  // Collect form data
  const fullName = formData.get("fullName")?.trim();
  const email = formData.get("email")?.trim();
  const phone = formData.get("phone")?.trim();
  const pickupDate = formData.get("pickupDate");
  const pickupTime = formData.get("pickupTime");
  const duration = parseInt(formData.get("duration"));
  const passengers = parseInt(formData.get("passengers"));
  const pickupLocation = formData.get("pickupLocation");
  const dropoffLocation = formData.get("dropoffLocation");
  const specialRequests = formData.get("specialRequests")?.trim();
  const paymentMethod = formData.get("paymentMethod");
  const totalAmount = parseFloat(formData.get("totalAmount"));
  const baseAmount = parseFloat(formData.get("baseAmount"));
  const serviceFee = parseFloat(formData.get("serviceFee"));
  const insuranceFee = parseFloat(formData.get("insuranceFee"));

  // Validation
  const errors = {};
  if (!fullName) errors.fullName = "Full name is required.";
  if (!email) errors.email = "Email is required.";
  if (!phone) errors.phone = "Phone number is required.";
  if (!pickupDate) errors.pickupDate = "Pickup date is required.";
  if (!pickupTime) errors.pickupTime = "Pickup time is required.";
  if (!duration || duration < 1)
    errors.duration = "Valid duration is required.";
  if (!passengers || passengers < 1)
    errors.passengers = "Number of passengers is required.";
  if (!paymentMethod) errors.paymentMethod = "Select a payment method.";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Check for booking conflicts
  const conflictResult = await checkBookingConflict(
    vehicleId,
    pickupDate,
    pickupTime,
    duration,
  );

  if (conflictResult.hasConflict) {
    setErrorMessage(
      session,
      "This vehicle is already booked for the selected time",
    );
    return redirect(`/book/${vehicleId}`, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  // Prepare base booking data (without status)
  const bookingData = {
    vehicleId: vehicle._id.toString(),
    vehicleName: vehicle.name,
    vehicleImage: vehicle.thumbnail || vehicle.images?.[0],
    vehicleCategory: vehicle.category,
    dailyRate: vehicle.pricing?.daily || vehicle.price || 0,
    hourlyRate:
      vehicle.pricing?.hourly?.rate ||
      (vehicle.pricing?.daily ? vehicle.pricing.daily / 24 : 0),
    customerName: fullName,
    customerEmail: email,
    customerPhone: phone,
    pickupDate,
    pickupTime,
    duration,
    passengers,
    pickupLocation:
      pickupLocation || vehicle.serviceLocations?.[0] || "Nairobi CBD",
    dropoffLocation:
      dropoffLocation ||
      pickupLocation ||
      vehicle.serviceLocations?.[0] ||
      "Nairobi CBD",
    specialRequests: specialRequests || "",
    paymentMethod,
    totalAmount,
    baseAmount,
    serviceFee,
    insuranceFee,
    userId: user.id,
    userEmail: user.email,
    source: "website",
  };

  // 🔥 M-PESA FLOW - Create pending booking, redirect to payment
  if (paymentMethod === "mpesa") {
    try {
      const phoneNumber = normalizePhone(phone);

      if (!phoneNumber) {
        setErrorMessage(
          session,
          "Invalid phone number format. Please use 07XX or 2547XX format",
        );
        return redirect(`/book/${vehicleId}`, {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      }

      console.log(
        "📱 Initiating STK push for:",
        phoneNumber,
        "Amount:",
        totalAmount,
      );

      // Initiate STK Push FIRST
      const safResponse = await stkPush({
        phone: phoneNumber,
        amount: Math.round(totalAmount),
      });

      console.log("📲 STK Response:", safResponse);

      if (!safResponse.CheckoutRequestID) {
        setErrorMessage(
          session,
          "Failed to initiate payment. Please try again.",
        );
        return redirect(`/book/${vehicleId}`, {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      }

      // Create PENDING booking with payment ID from STK response
      const pendingBooking = await createPendingBooking({
        ...bookingData,
        paymentId: safResponse.CheckoutRequestID,
        paymentMetadata: {
          checkoutRequestId: safResponse.CheckoutRequestID,
          merchantRequestId: safResponse.MerchantRequestID,
          phoneNumber,
          amount: totalAmount,
          initiatedAt: new Date().toISOString(),
        },
        status: "payment_pending",
        paymentStatus: "awaiting_payment",
      });

      if (!pendingBooking.success) {
        console.error(
          "❌ Booking failed after STK success:",
          pendingBooking.error,
        );
        setErrorMessage(
          session,
          "Payment initiated but booking failed. Please contact support.",
        );
        return redirect(`/book/${vehicleId}`, {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      }

      // Store booking info in session for payment processing page
      session.set("pendingBookingId", pendingBooking.bookingId);
      session.set("checkoutRequestId", safResponse.CheckoutRequestID);
      session.set("paymentMethod", "mpesa");
      session.set("requiresPayment", true);

      setSuccessMessage(
        session,
        "Please complete payment on your phone. Your booking will be confirmed once payment is received.",
      );

      return redirect("/payment-status", {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    } catch (error) {
      console.error("💥 M-Pesa error:", error);
      setErrorMessage(session, "Payment system error. Please try again.");
      return redirect(`/book/${vehicleId}`, {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    }
  }

  // 💵 PAY ON DELIVERY FLOW - Create confirmed booking immediately
  if (paymentMethod === "delivery") {
    try {
      console.log("💰 Processing Pay on Delivery booking...");

      // Create confirmed booking with pending payment status using createConfirmedBooking
      const bookingResult = await createConfirmedBooking({
        ...bookingData,
        paymentMethod: "cash_on_delivery",
      });

      if (!bookingResult.success) {
        console.error(
          "❌ Pay on Delivery booking failed:",
          bookingResult.error,
        );
        setErrorMessage(
          session,
          bookingResult.error || "Failed to create booking",
        );
        return redirect(`/book/${vehicleId}`, {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      }

      console.log("✅ Pay on Delivery booking created:", bookingResult);

      // Store success message in session
      setSuccessMessage(
        session,
        "Booking confirmed! Please have KES " +
          formatAmountForMessage(totalAmount) +
          " cash ready for payment on delivery.",
      );

      // Redirect directly to confirmation page
      return redirect(`/booking-confirmation/${bookingResult.bookingId}`, {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    } catch (error) {
      console.error("💥 Pay on delivery error:", error);
      setErrorMessage(session, "Failed to create booking. Please try again.");
      return redirect(`/book/${vehicleId}`, {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    }
  }

  // CARD FLOW (placeholder)
  if (paymentMethod === "card") {
    setErrorMessage(session, "Card payments coming soon!");
    return redirect(`/book/${vehicleId}`, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  // Default redirect
  return redirect(`/book/${vehicleId}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

// ------------------- BookingPage Component -------------------
export default function BookingPage() {
  const { vehicle, user } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { id } = useParams();

  const isSubmitting = navigation.state === "submitting";

  const [formState, setFormState] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    pickupDate: "",
    pickupTime: "09:00",
    duration: 1,
    passengers: vehicle.capacity?.passengers || 4,
    paymentMethod: "mpesa",
    pickupLocation: vehicle.serviceLocations?.[0] || "Nairobi CBD",
    dropoffLocation: vehicle.serviceLocations?.[0] || "Nairobi CBD",
    specialRequests: "",
  });

  const [availabilityWarning, setAvailabilityWarning] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [totals, setTotals] = useState({
    base: 0,
    serviceFee: 0,
    insurance: 0,
    total: 0,
  });

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0];

    setFormState((prev) => ({
      ...prev,
      pickupDate: formattedDate,
      passengers: Math.min(prev.passengers, vehicle.capacity?.passengers || 4),
      pickupLocation: vehicle.serviceLocations?.[0] || prev.pickupLocation,
      dropoffLocation: vehicle.serviceLocations?.[0] || prev.dropoffLocation,
    }));
  }, [vehicle]);

  useEffect(() => {
    const duration = parseInt(formState.duration) || 1;

    let hourlyRate;
    if (vehicle.pricing?.hourly?.rate) {
      hourlyRate = vehicle.pricing.hourly.rate;
    } else {
      const dailyRate = vehicle.pricing?.daily || vehicle.price || 0;
      hourlyRate = dailyRate / 24;
    }

    const basePrice = hourlyRate * duration;
    const serviceFee = basePrice * 0.1;
    const insurance = basePrice * 0.05;

    setTotals({
      base: basePrice,
      serviceFee,
      insurance,
      total: basePrice + serviceFee + insurance,
    });
  }, [formState.duration, vehicle]);

  useEffect(() => {
    if (formState.pickupDate && formState.pickupTime && formState.duration) {
      checkAvailability();
    }
  }, [formState.pickupDate, formState.pickupTime, formState.duration]);

  useEffect(() => {
    if (actionData?.errors) {
      Object.values(actionData.errors).forEach((error) => {
        toast.error(error);
      });
    }
  }, [actionData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    if (type === "number") {
      processedValue = parseInt(value) || 0;

      if (name === "passengers") {
        const maxPassengers = vehicle.capacity?.passengers || 4;
        if (processedValue > maxPassengers) {
          processedValue = maxPassengers;
          toast.error(
            `Maximum passengers for this vehicle is ${maxPassengers}`,
          );
        }
        if (processedValue < 1) processedValue = 1;
      }

      if (name === "duration") {
        if (processedValue < 1) processedValue = 1;
        if (processedValue > 168) {
          processedValue = 168;
          toast.error("Maximum booking duration is 7 days (168 hours)");
        }
      }
    }

    setFormState((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return "Ksh 0";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: vehicle.pricing?.currency || "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const checkAvailability = async () => {
    if (!formState.pickupDate || !formState.pickupTime || !formState.duration)
      return;

    setIsCheckingAvailability(true);
    setAvailabilityWarning("");

    try {
      if (vehicle.availableUnits === 0) {
        setAvailabilityWarning(
          `⚠️ ${vehicle.name} is currently unavailable. All units are booked.`,
        );
        return;
      }

      const conflictResult = await checkBookingConflict(
        vehicle._id.toString(),
        formState.pickupDate,
        formState.pickupTime,
        formState.duration,
      );

      if (conflictResult.hasConflict) {
        setAvailabilityWarning(
          `⚠️ ${vehicle.name} is already booked during your selected time. Please choose another time.`,
        );
      } else {
        setAvailabilityWarning("");
      }
    } catch (error) {
      console.error("❌ Error checking availability:", error);
      toast.error("Could not verify availability. Please try again.");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    if (formState.paymentMethod === "mpesa") {
      setIsProcessingPayment(true);
      // The form will submit normally, but we show processing state
    }
  };

  const handleCallSupport = () => {
    window.location.href = "tel:+254700000000";
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:support@skydrive.com";
  };

  const handleBackToVehicle = () => {
    navigate(`/fleet/${id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

  const hourlyRate = vehicle.pricing?.hourly?.rate
    ? vehicle.pricing.hourly.rate
    : (vehicle.pricing?.daily || vehicle.price || 0) / 24;

  // Get payment method display info
  const getPaymentMethodInfo = () => {
    switch (formState.paymentMethod) {
      case "mpesa":
        return {
          icon: <FaMobileAlt className="text-green-600 w-5 h-5" />,
          title: "M-Pesa",
          description: "Pay instantly via mobile money",
          instruction: "You'll receive an STK push on your phone",
          color: "green",
        };
      case "delivery":
        return {
          icon: <FaMoneyBillWave className="text-blue-600 w-5 h-5" />,
          title: "Pay on Delivery",
          description: "Cash payment when you receive the vehicle",
          instruction: "Pay the full amount in cash at pickup",
          color: "blue",
        };
      case "card":
        return {
          icon: <FaCreditCard className="text-amber-600 w-5 h-5" />,
          title: "Card Payment",
          description: "Secure online payment",
          instruction: "You'll be redirected to secure payment gateway",
          color: "amber",
        };
      default:
        return {
          icon: <FaCreditCard className="text-gray-600 w-5 h-5" />,
          title: "Select Payment Method",
          description: "",
          instruction: "",
          color: "gray",
        };
    }
  };

  const paymentInfo = getPaymentMethodInfo();

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-amber-50/30 pt-20">
      <Toaster position="top-center" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={handleBackToVehicle}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-amber-700 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Vehicle</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">
            Book {vehicle.name}
          </h1>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              {/* Vehicle Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={
                      vehicle.thumbnail ||
                      vehicle.images?.[0] ||
                      "/default-vehicle.jpg"
                    }
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {vehicle.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">
                      {vehicle.category} • {vehicle.year}
                    </span>
                    {vehicle.instantBook && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        <FaCrown className="w-3 h-3" />
                        Instant Book
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        vehicle.availableUnits > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {vehicle.availableUnits > 0
                        ? `${vehicle.availableUnits} Available`
                        : "Fully Booked"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability Warning */}
              {(availabilityWarning || vehicle.availableUnits === 0) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700">
                      {vehicle.availableUnits === 0
                        ? `⚠️ ${vehicle.name} is currently unavailable. All units are booked.`
                        : availabilityWarning}
                    </p>
                  </div>
                </div>
              )}

              {/* Checking Availability Indicator */}
              {isCheckingAvailability && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-blue-700">
                      Checking availability...
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <Form method="post" onSubmit={handleSubmit}>
                {/* Hidden fields for calculated values */}
                <input type="hidden" name="totalAmount" value={totals.total} />
                <input type="hidden" name="baseAmount" value={totals.base} />
                <input
                  type="hidden"
                  name="serviceFee"
                  value={totals.serviceFee}
                />
                <input
                  type="hidden"
                  name="insuranceFee"
                  value={totals.insurance}
                />
                <input type="hidden" name="vehicleName" value={vehicle.name} />

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaUser className="text-amber-600" />
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formState.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="Your full name"
                        />
                        {actionData?.errors?.fullName && (
                          <p className="text-red-500 text-sm mt-1">
                            {actionData.errors.fullName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="you@example.com"
                        />
                        {actionData?.errors?.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {actionData.errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formState.phone}
                          onChange={handleChange}
                          required
                          pattern="[0-9]{10,15}"
                          className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="0712345678"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Format: 0712345678 or +254712345678
                        </p>
                        {actionData?.errors?.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {actionData.errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rental Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaCalendarAlt className="text-amber-600" />
                      Rental Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pickup Date *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="pickupDate"
                            value={formState.pickupDate}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          />
                          <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        {actionData?.errors?.pickupDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {actionData.errors.pickupDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pickup Time *
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            name="pickupTime"
                            value={formState.pickupTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          />
                          <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        {actionData?.errors?.pickupTime && (
                          <p className="text-red-500 text-sm mt-1">
                            {actionData.errors.pickupTime}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (hours) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="168"
                            name="duration"
                            value={formState.duration}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            hrs
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Hourly rate: {formatPrice(hourlyRate)}/hr
                        </p>
                        {actionData?.errors?.duration && (
                          <p className="text-red-500 text-sm mt-1">
                            {actionData.errors.duration}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Passengers *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={vehicle.capacity?.passengers || 4}
                          name="passengers"
                          value={formState.passengers}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Max: {vehicle.capacity?.passengers || 4} passengers
                        </p>
                        {actionData?.errors?.passengers && (
                          <p className="text-red-500 text-sm mt-1">
                            {actionData.errors.passengers}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-amber-600" />
                      Locations
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pickup Location *
                        </label>
                        <select
                          name="pickupLocation"
                          value={formState.pickupLocation}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        >
                          <option value="">Select a location</option>
                          {vehicle.serviceLocations?.map((location, idx) => (
                            <option key={idx} value={location}>
                              {location}
                            </option>
                          ))}
                          <option value="other">
                            Other (specify in notes)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Drop-off Location *
                        </label>
                        <select
                          name="dropoffLocation"
                          value={formState.dropoffLocation}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        >
                          <option value="">Select a location</option>
                          {vehicle.serviceLocations?.map((location, idx) => (
                            <option key={idx} value={location}>
                              {location}
                            </option>
                          ))}
                          <option value="other">
                            Other (specify in notes)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaCreditCard className="text-amber-600" />
                      Payment Method
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* M-Pesa Option */}
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mpesa"
                          checked={formState.paymentMethod === "mpesa"}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div
                          className={`p-4 border-2 rounded-xl transition-all ${
                            formState.paymentMethod === "mpesa"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-300 hover:border-green-300"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <FaMobileAlt className="text-green-600 w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                M-Pesa
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Pay instantly
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* Pay on Delivery Option */}
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="delivery"
                          checked={formState.paymentMethod === "delivery"}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div
                          className={`p-4 border-2 rounded-xl transition-all ${
                            formState.paymentMethod === "delivery"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaMoneyBillWave className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                Pay on Delivery
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Cash at pickup
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* Card Option */}
                      <label className="cursor-pointer opacity-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          disabled
                          className="hidden"
                        />
                        <div className="p-4 border-2 border-gray-300 rounded-xl bg-gray-50">
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaCreditCard className="text-gray-400 w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-500">
                                Card
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Coming soon
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                    {actionData?.errors?.paymentMethod && (
                      <p className="text-red-500 text-sm mt-2">
                        {actionData.errors.paymentMethod}
                      </p>
                    )}
                  </div>

                  {/* Payment Method Info */}
                  {formState.paymentMethod && (
                    <div
                      className={`p-4 bg-${paymentInfo.color}-50 border border-${paymentInfo.color}-200 rounded-xl`}
                    >
                      <div className="flex items-start gap-3">
                        {paymentInfo.icon}
                        <div>
                          <p className="font-medium text-gray-900">
                            {paymentInfo.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {paymentInfo.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <FaInfoCircle className="w-3 h-3" />
                            {paymentInfo.instruction}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formState.specialRequests}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                      placeholder="Any special requirements, notes, or specific pickup instructions..."
                    />
                  </div>

                  {/* Security Note */}
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <FaLock className="text-amber-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Secure Booking
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your booking is secured and protected. We'll verify
                        availability before confirming.
                      </p>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the Terms and Conditions and Privacy Policy. I
                      understand that this booking request is subject to
                      availability confirmation.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        isProcessingPayment ||
                        !!availabilityWarning ||
                        vehicle.availableUnits === 0 ||
                        !formState.paymentMethod
                      }
                      className="w-full py-4 bg-linear-to-r from-amber-600 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || isProcessingPayment ? (
                        <div className="flex items-center justify-center gap-2">
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          {formState.paymentMethod === "mpesa"
                            ? "Initiating M-Pesa..."
                            : "Processing Booking..."}
                        </div>
                      ) : (
                        <>
                          {formState.paymentMethod === "mpesa"
                            ? "Pay with M-Pesa"
                            : formState.paymentMethod === "delivery"
                              ? "Confirm Booking (Pay on Delivery)"
                              : "Complete Booking"}{" "}
                          • {formatPrice(totals.total)}
                          <span className="block text-xs font-normal opacity-90 mt-1">
                            {formState.paymentMethod === "mpesa"
                              ? "You'll receive an M-Pesa prompt on your phone"
                              : formState.paymentMethod === "delivery"
                                ? "Pay cash when you pick up the vehicle"
                                : "Secure payment processing"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </motion.div>

          {/* Right Column - Summary */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Price Summary */}
            <div className="bg-linear-to-br from-amber-600 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-6">Price Breakdown</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Hourly Rate</span>
                  <span className="font-semibold">
                    {formatPrice(hourlyRate)}/hr
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Duration</span>
                  <span className="font-semibold">
                    {formState.duration} hours
                  </span>
                </div>

                <div className="h-px bg-amber-400/50 my-2"></div>

                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Base Price</span>
                  <span className="font-semibold">
                    {formatPrice(totals.base)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-200/90">Service Fee (10%)</span>
                  <span className="text-amber-200/90">
                    {formatPrice(totals.serviceFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-200/90">Insurance (5%)</span>
                  <span className="text-amber-200/90">
                    {formatPrice(totals.insurance)}
                  </span>
                </div>

                <div className="h-px bg-amber-400/50 my-2"></div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold">
                    {formatPrice(totals.total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-amber-400/30">
                <div className="flex items-center gap-2 text-amber-200/90 text-sm">
                  <FaInfoCircle className="w-4 h-4" />
                  <span>All prices include taxes and fees</span>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium text-gray-900">
                    {vehicle.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Date</span>
                  <span className="font-medium text-gray-900">
                    {formState.pickupDate}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Time</span>
                  <span className="font-medium text-gray-900">
                    {formatTime(formState.pickupTime)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">
                    {formState.duration} hours
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-medium text-gray-900">
                    {formState.passengers}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg bg-${paymentInfo.color}-100 flex items-center justify-center`}
                    >
                      {paymentInfo.icon}
                    </div>
                    <span className="font-medium text-gray-900">
                      {paymentInfo.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  vehicle.availableUnits > 3
                    ? "bg-emerald-100 text-emerald-700"
                    : vehicle.availableUnits > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {vehicle.availableUnits > 0
                  ? `${vehicle.availableUnits} unit${vehicle.availableUnits > 1 ? "s" : ""} available`
                  : "Fully booked"}
              </span>

              {vehicle.availableUnits <= 2 && vehicle.availableUnits > 0 && (
                <span className="text-xs text-amber-600 animate-pulse">
                  ⚡ Only {vehicle.availableUnits} left!
                </span>
              )}
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>

              <p className="text-gray-600 mb-4">
                Our support team is here to assist you 24/7.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleCallSupport}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all"
                >
                  <FaPhone className="w-4 h-4" />
                  Call Support
                </button>

                <button
                  onClick={handleEmailSupport}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  <FaEnvelope className="w-4 h-4" />
                  Email Support
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
