import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCreditCard,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaCar,
  FaCrown,
  FaCheck,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import vehiclesData from "../vehicles";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicle =
    vehiclesData.find((v) => v.id === parseInt(id || "3")) || vehiclesData[2];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    pickupDate: "",
    pickupTime: "",
    duration: "1",
    passengers: "1",
    specialRequests: "",
    paymentMethod: "card",
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [totals, setTotals] = useState({
    base: 0,
    serviceFee: 0,
    insurance: 0,
    total: 0,
  });
  const [availabilityWarning, setAvailabilityWarning] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    // Set default pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0];

    // Get initial passenger count from vehicle capacity
    const initialPassengers =
      typeof vehicle.capacity === "object"
        ? vehicle.capacity.passengers || 1
        : vehicle.capacity || 1;

    setFormData((prev) => ({
      ...prev,
      pickupDate: formattedDate,
      pickupTime: "09:00",
      passengers: initialPassengers.toString(),
    }));
  }, [vehicle]);

  // Calculate totals whenever duration changes
  useEffect(() => {
    const calculatedTotals = calculateTotal();
    setTotals(calculatedTotals);
  }, [formData.duration, vehicle]);

  // Check availability when pickup date/time changes
  useEffect(() => {
    if (formData.pickupDate && formData.pickupTime && formData.duration) {
      checkAvailability();
    }
  }, [formData.pickupDate, formData.pickupTime, formData.duration]);

  const formatPrice = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
      }).format(0);
    }
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotal = () => {
    const duration = parseInt(formData.duration) || 1;
    // Fix: Handle missing pricing data
    const hourlyRate =
      vehicle.pricing?.perHour || vehicle.pricing?.perDay / 24 || 0;
    const basePrice = hourlyRate * duration;
    const serviceFee = basePrice * 0.1;
    const insurance = basePrice * 0.05;

    return {
      base: basePrice,
      serviceFee,
      insurance,
      total: basePrice + serviceFee + insurance,
    };
  };

  // Function to check time overlap
  const checkTimeOverlap = (booking1, booking2) => {
    const start1 = new Date(`${booking1.pickupDate}T${booking1.pickupTime}`);
    const end1 = new Date(start1);
    end1.setHours(end1.getHours() + booking1.duration);

    const start2 = new Date(`${booking2.pickupDate}T${booking2.pickupTime}`);
    const end2 = new Date(start2);
    end2.setHours(end2.getHours() + booking2.duration);

    // Check if time periods overlap
    return (
      (start1 < end2 && start2 < end1) ||
      (start1.getTime() === start2.getTime() &&
        end1.getTime() === end2.getTime())
    );
  };

  // Check vehicle availability
  const checkAvailability = async () => {
    setIsCheckingAvailability(true);
    setAvailabilityWarning("");

    try {
      // Get existing bookings from localStorage
      const existingBookings = JSON.parse(
        localStorage.getItem("skydrive_all_bookings") || "[]",
      );

      // Filter bookings for this vehicle
      const vehicleBookings = existingBookings.filter(
        (booking) => booking.vehicleId === vehicle.id,
      );

      // Create proposed booking object
      const proposedBooking = {
        vehicleId: vehicle.id,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        duration: parseInt(formData.duration),
      };

      // Check for conflicts
      const conflicts = vehicleBookings.filter((existingBooking) =>
        checkTimeOverlap(existingBooking, proposedBooking),
      );

      if (conflicts.length > 0) {
        // Calculate next available time
        const latestBooking = conflicts.reduce((latest, current) => {
          const currentEnd = new Date(
            `${current.pickupDate}T${current.pickupTime}`,
          );
          currentEnd.setHours(currentEnd.getHours() + current.duration);
          const latestEnd = new Date(
            `${latest.pickupDate}T${latest.pickupTime}`,
          );
          latestEnd.setHours(latestEnd.getHours() + latest.duration);
          return currentEnd > latestEnd ? current : latest;
        }, conflicts[0]);

        const latestEnd = new Date(
          `${latestBooking.pickupDate}T${latestBooking.pickupTime}`,
        );
        latestEnd.setHours(latestEnd.getHours() + latestBooking.duration);

        // Suggest next available time (add 1 hour buffer)
        const nextAvailable = new Date(latestEnd);
        nextAvailable.setHours(nextAvailable.getHours() + 1);

        setAvailabilityWarning(
          `⚠️ ${vehicle.name} is already booked during your selected time. Next available from ${nextAvailable.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          )} on ${nextAvailable.toLocaleDateString()}.`,
        );
      } else {
        // Check if this would exceed daily limit (max 2 bookings per day per vehicle)
        const sameDayBookings = vehicleBookings.filter(
          (booking) => booking.pickupDate === formData.pickupDate,
        );

        if (sameDayBookings.length >= 2) {
          setAvailabilityWarning(
            `ℹ️ ${vehicle.name} has limited availability on ${new Date(
              formData.pickupDate,
            ).toLocaleDateString()}. We recommend choosing another date for better availability.`,
          );
        }
      }
    } catch (error) {
      console.error("Error checking availability:", error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Prevent double booking before submission
  const preventDoubleBooking = () => {
    try {
      const existingBookings = JSON.parse(
        localStorage.getItem("skydrive_all_bookings") || "[]",
      );

      const vehicleBookings = existingBookings.filter(
        (booking) => booking.vehicleId === vehicle.id,
      );

      const proposedBooking = {
        vehicleId: vehicle.id,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        duration: parseInt(formData.duration),
      };

      const conflicts = vehicleBookings.filter((existingBooking) =>
        checkTimeOverlap(existingBooking, proposedBooking),
      );

      if (conflicts.length > 0) {
        alert(
          `❌ ${vehicle.name} is already booked during your selected time. Please choose another time or vehicle.`,
        );
        return false;
      }

      // Check daily limit
      const sameDayBookings = vehicleBookings.filter(
        (booking) => booking.pickupDate === formData.pickupDate,
      );

      if (sameDayBookings.length >= 2) {
        const proceed = confirm(
          `⚠️ ${vehicle.name} has limited availability on ${new Date(
            formData.pickupDate,
          ).toLocaleDateString()}. Your booking will require manual verification. Continue?`,
        );
        if (!proceed) return false;
      }

      return true;
    } catch (error) {
      console.error("Error in double booking prevention:", error);
      return true; // Allow booking if check fails
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) return "Please enter your full name";
      if (!formData.email.trim()) return "Please enter your email";
      if (!formData.phone.trim()) return "Please enter your phone number";
      if (!formData.pickupDate) return "Please select pickup date";
      if (!formData.pickupTime) return "Please select pickup time";
    }
    if (step === 2) {
      if (!formData.paymentMethod) return "Please select a payment method";
    }
    return null;
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      alert(error);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Check for double booking
    if (!preventDoubleBooking()) {
      setIsSubmitting(false);
      return;
    }

    // Generate booking ID
    const bookingId = `SKY-${Date.now().toString().slice(-8)}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    // Prepare booking data to pass to confirmation
    const newBookingData = {
      id: bookingId,
      vehicle: {
        name: vehicle.name,
        category: vehicle.category,
        image: vehicle.thumbnail || vehicle.images?.[0] || vehicle.image,
        capacity:
          typeof vehicle.capacity === "object"
            ? vehicle.capacity.passengers
            : vehicle.capacity,
        year: vehicle.year,
      },
      details: {
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        duration: parseInt(formData.duration),
        passengers: parseInt(formData.passengers),
        location:
          vehicle.baseLocation?.address || "SkyDrive Premium Hub, Nairobi",
        paymentMethod: formData.paymentMethod,
        totalAmount: totals.total,
        specialRequests: formData.specialRequests,
        status: "pending_verification", // Changed to pending verification
      },
      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      },
      totals: {
        base: totals.base,
        serviceFee: totals.serviceFee,
        insurance: totals.insurance,
        total: totals.total,
      },
      host: {
        name: "SkyDrive Premium",
        phone: "+254 700 000 000",
        email: "premium@skydrive.africa",
        whatsapp: "+254 700 000 001",
      },
      timestamp: new Date().toISOString(),
    };

    // Set booking data in state
    setBookingData(newBookingData);

    // Save booking to all bookings list (for availability tracking)
    const allBookings = JSON.parse(
      localStorage.getItem("skydrive_all_bookings") || "[]",
    );
    localStorage.setItem(
      "skydrive_all_bookings",
      JSON.stringify([
        ...allBookings,
        {
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
          duration: parseInt(formData.duration),
          bookingId: bookingId,
          timestamp: new Date().toISOString(),
          status: "pending",
        },
      ]),
    );

    // Send notification email to admin (simulated)
    sendAdminNotification(newBookingData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingSuccess(true);

      // Store booking data in localStorage as backup
      localStorage.setItem(
        "skydrive_last_booking",
        JSON.stringify(newBookingData),
      );

      // Navigate with booking data
      setTimeout(() => {
        navigate("/confirmation", {
          state: { booking: newBookingData },
        });
      }, 2000);
    }, 2000);
  };

  // Send email notification to admin
  const sendAdminNotification = (bookingData) => {
    const adminEmail = "bookings@skydrive.africa";
    const subject = `NEW BOOKING: ${bookingData.id} - ${bookingData.vehicle.name}`;
    const body = `
URGENT: New Booking Requires Verification
==========================================

Booking ID: ${bookingData.id}
Status: PENDING VERIFICATION

VEHICLE DETAILS:
----------------
Vehicle: ${bookingData.vehicle.name}
Category: ${bookingData.vehicle.category}
Date: ${bookingData.details.pickupDate}
Time: ${bookingData.details.pickupTime}
Duration: ${bookingData.details.duration} hours

CUSTOMER DETAILS:
-----------------
Name: ${bookingData.customer.name}
Email: ${bookingData.customer.email}
Phone: ${bookingData.customer.phone}

PAYMENT:
--------
Amount: ${formatPrice(bookingData.details.totalAmount)}
Method: ${bookingData.details.paymentMethod}

SPECIAL REQUESTS:
-----------------
${bookingData.details.specialRequests || "None"}

ACTION REQUIRED:
----------------
1. Verify vehicle availability
2. Check for double bookings
3. Contact customer to confirm
4. Update booking status

IMPORTANT: Check existing bookings at:
LocalStorage: skydrive_all_bookings
`;

    // Simple mailto link (in real app, use email API)
    console.log("Admin notification:", { subject, body });
    // Uncomment to actually send email
    // window.location.href = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCall = () => {
    window.location.href = "tel:+254700000000";
  };

  const handleEmail = () => {
    window.location.href = "mailto:bookings@skydrive.africa";
  };

  // Helper function to get passenger capacity
  const getPassengerCapacity = () => {
    if (typeof vehicle.capacity === "object") {
      return vehicle.capacity.passengers || 4;
    }
    return vehicle.capacity || 4;
  };

  // Generate passenger options based on capacity
  const generatePassengerOptions = () => {
    const capacity = getPassengerCapacity();
    return Array.from({ length: capacity }, (_, i) => i + 1);
  };

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

  // Get seat display text
  const getSeatDisplay = () => {
    if (typeof vehicle.capacity === "object") {
      return `${vehicle.capacity.passengers || 4} seats`;
    }
    return `${vehicle.capacity || 4} seats`;
  };

  // Format time for display
  const formatDisplayTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-amber-50/30 pt-15">
      {/* Navigation */}
      <div className="container mx-auto px-6 lg:px-8 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-4 text-gray-700 hover:text-amber-700 transition-all duration-300"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-amber-600/10 to-amber-500/5 group-hover:from-amber-600/20 group-hover:to-amber-500/10 transition-all duration-300 border border-amber-200 group-hover:border-amber-300">
            <FaArrowLeft className="text-sm text-amber-600 group-hover:text-amber-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-gray-500 group-hover:text-amber-600 transition-colors">
              BACK TO
            </span>
            <p className="text-lg font-bold text-gray-900 group-hover:text-amber-800">
              VEHICLE DETAILS
            </p>
          </div>
        </motion.button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 lg:px-8 pb-16"
      >
        {/* Booking Progress */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className="flex flex-col items-center relative"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= stepNumber
                      ? "bg-linear-to-br from-amber-600 to-amber-500 border-amber-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {step > stepNumber ? (
                    <FaCheck className="text-sm" />
                  ) : (
                    <span className="font-bold">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium transition-colors ${
                    step >= stepNumber ? "text-amber-700" : "text-gray-500"
                  }`}
                >
                  {stepNumber === 1
                    ? "Details"
                    : stepNumber === 2
                      ? "Review"
                      : "Confirm"}
                </span>
                {stepNumber < 3 && (
                  <div
                    className={`absolute top-6 left-full w-32 h-0.5 ${
                      step > stepNumber
                        ? "bg-linear-to-r from-amber-600 to-amber-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Availability Warning */}
        {availabilityWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {availabilityWarning}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Booking Form */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 border border-amber-200/50 p-8 lg:p-12">
              {/* Vehicle Summary */}
              <div className="mb-10 pb-8 border-b border-amber-200/50">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-amber-200 shadow-lg">
                    <img
                      src={vehicle.thumbnail || vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-linear-to-r from-amber-600/10 to-amber-500/5 rounded-full border border-amber-200 text-xs font-bold text-amber-700 uppercase tracking-widest">
                        {vehicle.category}
                      </span>
                      {vehicle.isFeatured && (
                        <div className="px-2 py-1 bg-amber-600/10 rounded-full">
                          <FaCrown className="text-amber-600 text-xs" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {vehicle.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <FaUser className="text-amber-600" />
                        {getSeatDisplay()}
                      </span>
                      <span>•</span>
                      <span className="text-lg font-bold text-amber-600">
                        {formatPrice(vehicle.pricing?.perHour || 0)}
                        <span className="text-sm font-medium text-amber-500">
                          {" "}
                          / hour
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Availability Check Indicator */}
                {isCheckingAvailability && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-amber-600">
                    <div className="w-3 h-3 rounded-full bg-amber-600 animate-pulse"></div>
                    Checking availability...
                  </div>
                )}
              </div>

              {/* Step 1: Booking Details */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-600 to-amber-500 flex items-center justify-center">
                        <FaCalendarAlt className="text-white text-lg" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Booking Details
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                          placeholder="you@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                          placeholder="+254 700 000 000"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pickup Date *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="pickupDate"
                            value={formData.pickupDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            required
                            min={new Date().toISOString().split("T")[0]}
                          />
                          <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pickup Time *
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            name="pickupTime"
                            value={formData.pickupTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            required
                          />
                          <FaClock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Duration *
                        </label>

                        <select
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                          required
                        >
                          {/* Hours 1-24 */}
                          {Array.from({ length: 24 }, (_, i) => i + 1).map(
                            (hour) => (
                              <option key={hour} value={hour}>
                                {hour} {hour === 1 ? "hour" : "hours"}
                              </option>
                            ),
                          )}

                          {/* Days 1-7 */}
                          {Array.from({ length: 7 }, (_, i) => i + 1).map(
                            (day) => (
                              <option key={day + 24} value={day * 24}>
                                {day} {day === 1 ? "day" : "days"}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Passengers *
                        </label>
                        <select
                          name="passengers"
                          value={formData.passengers}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                          required
                        >
                          {generatePassengerOptions().map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? "passenger" : "passengers"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Special Requests (Optional)
                        </label>
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                          placeholder="Any special requirements or notes..."
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review & Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-600 to-amber-500 flex items-center justify-center">
                        <FaCreditCard className="text-white text-lg" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Review & Payment
                      </h3>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-linear-to-br from-amber-50 to-amber-100/30 rounded-2xl p-6 mb-8 border border-amber-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        Booking Summary
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vehicle</span>
                          <span className="font-semibold text-amber-700">
                            {vehicle.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pickup Date</span>
                          <span className="font-semibold text-amber-700">
                            {new Date(formData.pickupDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pickup Time</span>
                          <span className="font-semibold text-amber-700">
                            {formatDisplayTime(formData.pickupTime)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-semibold text-amber-700">
                            {formData.duration} hours
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Passengers</span>
                          <span className="font-semibold text-amber-700">
                            {formData.passengers}
                          </span>
                        </div>
                        {formData.specialRequests && (
                          <div className="flex justify-between items-start pt-4 border-t border-amber-200">
                            <span className="text-gray-600">
                              Special Requests
                            </span>
                            <span className="font-medium text-amber-700 text-right max-w-xs">
                              {formData.specialRequests}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Manual Verification Notice */}
                      {availabilityWarning && (
                        <div className="mt-4 pt-4 border-t border-amber-200">
                          <div className="flex items-start gap-2">
                            <FaExclamationTriangle className="text-yellow-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-yellow-700">
                              This booking requires manual verification. Our
                              team will confirm availability within 1 hour.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        Payment Method
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <label
                          className={`cursor-pointer ${
                            formData.paymentMethod === "card"
                              ? "ring-2 ring-amber-500"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === "card"}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          <div className="p-4 rounded-xl border-2 border-gray-300 hover:border-amber-400 transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-600 to-amber-500 flex items-center justify-center">
                                <FaCreditCard className="text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Credit/Debit Card
                                </p>
                                <p className="text-sm text-gray-600">
                                  Pay securely with your card
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>

                        <label
                          className={`cursor-pointer ${
                            formData.paymentMethod === "mpesa"
                              ? "ring-2 ring-amber-500"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="mpesa"
                            checked={formData.paymentMethod === "mpesa"}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          <div className="p-4 rounded-xl border-2 border-gray-300 hover:border-amber-400 transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-600 to-green-500 flex items-center justify-center">
                                <FaPhone className="text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  M-Pesa
                                </p>
                                <p className="text-sm text-gray-600">
                                  Pay via mobile money
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Card Details (if selected) */}
                    {formData.paymentMethod === "card" && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Card Number
                            </label>
                            <input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              placeholder="As on card"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Note */}
                    <div className="flex items-start gap-3 p-4 bg-linear-to-r from-amber-50 to-amber-100/30 rounded-xl border border-amber-200">
                      <FaLock className="text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Secure Payment
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Your payment is secured with 256-bit SSL encryption.
                          We never store your card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  {bookingSuccess ? (
                    <div>
                      <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-green-400 flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <FaCheckCircle className="text-white text-3xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Booking Submitted!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your booking ID:{" "}
                        <span className="font-bold text-amber-700">
                          {bookingData?.id}
                        </span>
                      </p>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-md mx-auto text-left">
                        <div className="flex">
                          <div className="shrink-0">
                            <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              <strong>Important:</strong> Your booking is
                              pending verification. Our team will confirm
                              availability within 1 hour and send you final
                              confirmation.
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        We've sent the details to {formData.email}.
                      </p>
                      <div className="flex items-center justify-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-ping"></div>
                        <p className="text-sm text-gray-500">
                          Redirecting to confirmation page...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 rounded-full bg-linear-to-br from-amber-600 to-amber-500 flex items-center justify-center mx-auto mb-6">
                        <FaShieldAlt className="text-white text-3xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Confirm Booking
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Please review all details before confirming your
                        booking.
                      </p>

                      <div className="bg-linear-to-br from-amber-50 to-amber-100/30 rounded-2xl p-6 max-w-md mx-auto border border-amber-200">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="text-2xl font-bold text-amber-700">
                              {formatPrice(totals.total)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Vehicle rental
                            </span>
                            <span className="font-medium text-amber-700">
                              {formatPrice(totals.base)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Service fee</span>
                            <span className="font-medium text-amber-700">
                              {formatPrice(totals.serviceFee)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Insurance</span>
                            <span className="font-medium text-amber-700 ">
                              {formatPrice(totals.insurance)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-amber-200/50">
                {step > 1 && !bookingSuccess && (
                  <button
                    onClick={prevStep}
                    className="px-8 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300"
                  >
                    Back
                  </button>
                )}

                {step < 3 && !bookingSuccess && (
                  <button
                    onClick={nextStep}
                    className="ml-auto px-8 py-3 bg-linear-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300"
                  >
                    Continue
                  </button>
                )}

                {step === 3 && !bookingSuccess && (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="ml-auto px-8 py-3 bg-linear-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Price Summary & Info */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-4 space-y-8"
          >
            {/* Price Summary */}
            <div className="bg-linear-to-br from-amber-600 to-amber-500 rounded-3xl p-8 text-white shadow-2xl shadow-amber-600/30">
              <h3 className="text-xl font-bold mb-6">Price Breakdown</h3>

              <div className="space-y-4 mb-8">
                {/* Hourly Rate */}
                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Hourly Rate</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(
                      vehicle.pricing?.perHour ||
                        vehicle.pricing?.perDay / 24 ||
                        0,
                    )}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Duration</span>
                  <span className="font-medium">{formData.duration} hours</span>
                </div>

                <div className="h-px bg-amber-500/50"></div>

                {/* Base Price */}
                <div className="flex justify-between items-center">
                  <span className="text-amber-100">Base Price</span>
                  <span className="font-medium">
                    {formatPrice(totals.base)}
                  </span>
                </div>

                {/* Service Fee */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-200/80">Service Fee (10%)</span>
                  <span className="text-amber-200/80">
                    {formatPrice(totals.serviceFee)}
                  </span>
                </div>

                {/* Insurance */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-200/80">Insurance (5%)</span>
                  <span className="text-amber-200/80">
                    {formatPrice(totals.insurance)}
                  </span>
                </div>

                <div className="h-px bg-amber-500/50"></div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold">
                    {formatPrice(totals.total)}
                  </span>
                </div>
              </div>

              {/* Note */}
              <div className="flex items-center gap-3 text-amber-200/90 text-sm">
                <FaInfoCircle />
                <span>All prices include taxes and fees</span>
              </div>
            </div>

            {/* Pickup Information */}
            <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/10 border border-amber-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-600 to-amber-500 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Pickup Details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-linear-to-br from-amber-50 to-amber-100/30 border border-amber-200">
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-semibold text-gray-900">
                    {vehicle.baseLocation?.address ||
                      "SkyDrive Premium Hub, Nairobi"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-linear-to-br from-amber-50 to-amber-100/30 border border-amber-200">
                  <p className="text-sm text-gray-600 mb-1">Scheduled Time</p>
                  <p className="font-semibold text-gray-900">
                    {formData.pickupDate
                      ? new Date(formData.pickupDate).toLocaleDateString()
                      : "Not set"}{" "}
                    •{" "}
                    {formData.pickupTime
                      ? formatDisplayTime(formData.pickupTime)
                      : "Not set"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-blue-100/30 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Important Note
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Please arrive 15 minutes before your scheduled pickup
                        time. Bring your ID and booking confirmation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/10 border border-amber-200/50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Need Help?
              </h3>
              <p className="text-gray-600 mb-6">
                Our team is available 24/7 to assist with your booking.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleCall}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300"
                >
                  <FaPhone className="text-base" />
                  Call Support
                </button>
                <button
                  onClick={handleEmail}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <FaEnvelope className="text-base" />
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
