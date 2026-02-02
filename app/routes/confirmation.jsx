import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  FaCheckCircle,
  FaCar,
  FaCalendarAlt,
  FaClock,
  FaUserFriends,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaPrint,
  FaDownload,
  FaShieldAlt,
  FaStar,
  FaArrowLeft,
  FaShareAlt,
  FaQrcode,
  FaClipboardCheck,
  FaExclamationCircle,
  FaHeadset,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);
  const [confettiFired, setConfettiFired] = useState(false);
  const [loading, setLoading] = useState(true);

  // Format price function
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date function
  const formatDate = (dateString) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return "Not set";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Sample fallback data
  const sampleBooking = {
    id: "SKY-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
    vehicle: {
      name: "Range Rover Autobiography",
      category: "Premium SUV",
      image:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
      capacity: 5,
      year: 2024,
    },
    details: {
      pickupDate: new Date(Date.now() + 86400000 * 2),
      pickupTime: "09:00",
      duration: 8,
      passengers: 3,
      location: "Jomo Kenyatta International Airport, Nairobi",
      paymentMethod: "M-Pesa",
      totalAmount: 85000,
      specialRequests: "Need child seat and extra water bottles",
      status: "confirmed",
    },
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+254 712 345 678",
    },
    totals: {
      base: 64000,
      serviceFee: 6400,
      insurance: 3200,
      total: 85000,
    },
    host: {
      name: "SkyDrive Premium",
      phone: "+254 700 000 000",
      email: "premium@skydrive.africa",
      whatsapp: "+254 700 000 001",
    },
    timestamp: new Date().toISOString(),
  };

  useEffect(() => {
    const initializeBookingData = async () => {
      setLoading(true);

      // Priority 1: Data from navigation state
      if (location.state?.booking) {
        console.log("Using data from navigation state");
        const data = location.state.booking;
        // Ensure pickupDate is Date object
        if (data.details && typeof data.details.pickupDate === "string") {
          data.details.pickupDate = new Date(data.details.pickupDate);
        }
        setBookingData(data);
        saveToLocalStorage(data);
      }
      // Priority 2: Check localStorage for recent booking
      else if (localStorage.getItem("skydrive_last_booking")) {
        console.log("Using data from localStorage");
        try {
          const storedData = JSON.parse(
            localStorage.getItem("skydrive_last_booking"),
          );
          // Check if stored within last 10 minutes
          const storedTime = new Date(storedData.timestamp);
          const currentTime = new Date();
          const minutesDiff = (currentTime - storedTime) / (1000 * 60);

          if (minutesDiff < 10) {
            if (
              storedData.details &&
              typeof storedData.details.pickupDate === "string"
            ) {
              storedData.details.pickupDate = new Date(
                storedData.details.pickupDate,
              );
            }
            setBookingData(storedData);
          } else {
            // Data too old, use sample
            console.log("Stored data too old, using sample");
            setBookingData(sampleBooking);
          }
        } catch (error) {
          console.error("Error parsing localStorage data:", error);
          setBookingData(sampleBooking);
        }
      }
      // Priority 3: Use sample data
      else {
        console.log("Using sample data");
        setBookingData(sampleBooking);
      }

      setLoading(false);
    };

    initializeBookingData();
  }, [location]);

  useEffect(() => {
    if (!loading && bookingData && !confettiFired) {
      fireConfetti();
      setConfettiFired(true);
      document.title = `Booking ${bookingData.id} Confirmed | SkyDrive Africa`;
      window.scrollTo(0, 0);

      // Add to booking history
      addToBookingHistory(bookingData);
    }
  }, [loading, bookingData, confettiFired]);

  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem(
        "skydrive_last_booking",
        JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  };

  const addToBookingHistory = (data) => {
    try {
      const history = JSON.parse(
        localStorage.getItem("skydrive_booking_history") || "[]",
      );
      history.unshift({
        ...data,
        savedAt: new Date().toISOString(),
      });
      // Keep only last 5 bookings
      const limitedHistory = history.slice(0, 5);
      localStorage.setItem(
        "skydrive_booking_history",
        JSON.stringify(limitedHistory),
      );
    } catch (error) {
      console.error("Failed to save to history:", error);
    }
  };

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio, opts) {
      confetti(
        Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio),
        }),
      );
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#f59e0b", "#d97706", "#b45309"],
    });
    fire(0.2, {
      spread: 60,
      colors: ["#f59e0b", "#d97706"],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#fbbf24", "#f59e0b"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#fde68a", "#fbbf24"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ["#fef3c7", "#fde68a"],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text file with booking details
    if (!bookingData) return;

    const content = `
SKYDRIVE AFRICA - BOOKING CONFIRMATION
=======================================

Booking ID: ${bookingData.id}
Status: CONFIRMED
Date: ${new Date().toLocaleDateString()}

VEHICLE DETAILS
---------------
Vehicle: ${bookingData.vehicle.name}
Category: ${bookingData.vehicle.category}
Capacity: ${bookingData.vehicle.capacity} passengers

BOOKING DETAILS
---------------
Pickup Date: ${formatDate(bookingData.details.pickupDate)}
Pickup Time: ${formatTime(bookingData.details.pickupTime)}
Duration: ${bookingData.details.duration} hours
Passengers: ${bookingData.details.passengers}
Pickup Location: ${bookingData.details.location}
Special Requests: ${bookingData.details.specialRequests || "None"}

CUSTOMER DETAILS
----------------
Name: ${bookingData.customer.name}
Email: ${bookingData.customer.email}
Phone: ${bookingData.customer.phone}

PAYMENT SUMMARY
---------------
Base Rate: ${formatPrice(bookingData.totals?.base || 0)}
Service Fee (10%): ${formatPrice(bookingData.totals?.serviceFee || 0)}
Insurance (5%): ${formatPrice(bookingData.totals?.insurance || 0)}
TOTAL: ${formatPrice(bookingData.details.totalAmount)}
Payment Method: ${bookingData.details.paymentMethod}

CONTACT INFORMATION
-------------------
Host: ${bookingData.host.name}
Phone: ${bookingData.host.phone}
Email: ${bookingData.host.email}
WhatsApp: ${bookingData.host.whatsapp}

IMPORTANT NOTES
---------------
• Arrive 15 minutes before pickup time
• Bring valid ID and driver's license
• Free cancellation up to 24 hours before
• Vehicle inspection required before departure

Thank you for choosing SkyDrive Africa!
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skydrive-booking-${bookingData.id.replace(/[^a-zA-Z0-9-]/g, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `My SkyDrive Booking ${bookingData?.id}`,
        text: `I've booked ${bookingData?.vehicle.name} with SkyDrive Africa! Booking ID: ${bookingData?.id}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(
        `I've booked ${bookingData?.vehicle.name} with SkyDrive Africa!\nBooking ID: ${bookingData?.id}\nTotal: ${formatPrice(bookingData?.details.totalAmount)}`,
      );
      alert("Booking details copied to clipboard!");
    }
  };

  const handleWhatsApp = () => {
    if (!bookingData) return;
    const message = `Hello SkyDrive Africa! I have a question about my booking ${bookingData.id}`;
    window.open(
      `https://wa.me/${bookingData.host.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleEmail = () => {
    if (!bookingData) return;
    const subject = `Inquiry about Booking ${bookingData.id}`;
    const body = `Hello SkyDrive Africa,\n\nI have a question about my booking ${bookingData.id}.\n\nVehicle: ${bookingData.vehicle.name}\nPickup Date: ${formatDate(bookingData.details.pickupDate)}\nPickup Time: ${formatTime(bookingData.details.pickupTime)}\n\nBest regards,\n${bookingData.customer.name}`;
    window.location.href = `mailto:${bookingData.host.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCall = () => {
    if (!bookingData) return;
    window.location.href = `tel:${bookingData.host.phone}`;
  };

  const handleSupport = () => {
    window.location.href = "tel:+254700000002";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-amber-100/20 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-amber-100/20 pt-20">
        <div className="container mx-auto px-4 text-center py-16">
          <FaExclamationCircle className="text-6xl text-amber-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            No Booking Found
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn't find your booking details.
          </p>
          <button
            onClick={() => navigate("/fleet")}
            className="px-8 py-3 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-white to-amber-100/20 pt-20">
      {/* Confetti Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-10" />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-32 h-32 mx-auto mb-8 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 border-8 border-white"
            >
              <FaCheckCircle className="text-white text-6xl" />
            </motion.div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Booking Confirmed!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Your premium experience with SkyDrive Africa is now secured
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-100 text-amber-800 rounded-full font-semibold mb-4">
              <FaClipboardCheck className="text-amber-600" />
              <span>Confirmation ID: {bookingData.id}</span>
            </div>
            <p className="text-sm text-gray-500">
              Confirmation sent to {bookingData.customer.email}
            </p>
          </div>

          {/* Main Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Booking Summary */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Booking Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-2xl shadow-amber-900/10 border border-amber-200"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Booking Summary
                  </h2>
                  <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-semibold text-sm">
                    <FaCheckCircle className="inline mr-2" />
                    CONFIRMED
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Vehicle Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-200 shadow-lg">
                        <img
                          src={bookingData.vehicle.image}
                          alt={bookingData.vehicle.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {bookingData.vehicle.name}
                        </h3>
                        <p className="text-amber-700">
                          {bookingData.vehicle.category} •{" "}
                          {bookingData.vehicle.year || "2024"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <FaUserFriends className="text-amber-600 text-sm" />
                          <span className="text-sm text-gray-600">
                            {bookingData.vehicle.capacity} passengers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                          <FaUserFriends className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Passengers</p>
                          <p className="text-lg font-bold text-gray-900">
                            {bookingData.details.passengers} people
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                          <FaClock className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-lg font-bold text-gray-900">
                            {bookingData.details.duration} hours
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                          <FaCalendarAlt className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pickup Date</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatDate(bookingData.details.pickupDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                          <FaClock className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pickup Time</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatTime(bookingData.details.pickupTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                          <FaMapMarkerAlt className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Pickup Location
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {bookingData.details.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {bookingData.details.specialRequests && (
                  <div className="mt-8 pt-6 border-t border-amber-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      Special Requests
                    </h4>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <p className="text-gray-700">
                        {bookingData.details.specialRequests}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="mt-8 pt-8 border-t border-amber-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Payment Summary
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {bookingData.totals ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Vehicle Rental
                            </span>
                            <span className="font-semibold">
                              {formatPrice(bookingData.totals.base || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Service Fee (10%)
                            </span>
                            <span className="font-semibold">
                              {formatPrice(bookingData.totals.serviceFee || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Insurance (5%)
                            </span>
                            <span className="font-semibold">
                              {formatPrice(bookingData.totals.insurance || 0)}
                            </span>
                          </div>
                          <div className="h-px bg-gray-200 my-2"></div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Payment Method</span>
                            <span className="font-medium">
                              {bookingData.details.paymentMethod === "mpesa"
                                ? "M-Pesa"
                                : bookingData.details.paymentMethod === "card"
                                  ? "Credit/Debit Card"
                                  : bookingData.details.paymentMethod}
                            </span>
                          </div>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">
                                Total Paid
                              </span>
                              <span className="text-3xl font-bold text-amber-700">
                                {formatPrice(bookingData.details.totalAmount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaCheckCircle className="text-emerald-600" />
                              <span>
                                Paid via{" "}
                                {bookingData.details.paymentMethod === "mpesa"
                                  ? "M-Pesa"
                                  : "Credit Card"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaShieldAlt className="text-blue-600" />
                              <span>Payment secured & verified</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2">
                        <p className="text-gray-500 text-center py-8">
                          Payment details not available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Next Steps Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-linear-to-br from-amber-900 to-amber-800 rounded-3xl p-8 text-white shadow-2xl shadow-amber-900/30"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <FaStar className="text-amber-200" />
                  What Happens Next?
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                      <MdEmail className="text-2xl" />
                    </div>
                    <h3 className="font-bold text-lg">1. Confirmation Email</h3>
                    <p className="text-amber-100/80">
                      You'll receive a detailed confirmation email within 5
                      minutes with all booking details.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                      <FaPhone className="text-2xl" />
                    </div>
                    <h3 className="font-bold text-lg">2. Host Contact</h3>
                    <p className="text-amber-100/80">
                      Our premium concierge will contact you within 24 hours to
                      confirm pickup arrangements.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                      <FaCar className="text-2xl" />
                    </div>
                    <h3 className="font-bold text-lg">3. Pickup Day</h3>
                    <p className="text-amber-100/80">
                      Arrive 15 minutes early at the pickup location with your
                      ID and booking confirmation.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Actions & Contact */}
            <div className="space-y-8">
              {/* Contact Host Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-2xl shadow-amber-900/10 border border-amber-200"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Need Help?
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={handleCall}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 group"
                  >
                    <FaPhone className="transition-transform group-hover:scale-110" />
                    Call Host: {bookingData.host.phone}
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 group"
                  >
                    <FaWhatsapp className="text-xl transition-transform group-hover:scale-110" />
                    Chat on WhatsApp
                  </button>
                  <button
                    onClick={handleEmail}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-amber-600 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 group"
                  >
                    <FaEnvelope className="transition-transform group-hover:scale-110" />
                    Send Email
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-amber-200">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Customer Support
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="font-medium">
                        support@skydrive.africa
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="font-medium">+254 700 000 002</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hours</span>
                      <span className="font-medium">24/7 Premium Support</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-2xl shadow-amber-900/10 border border-amber-200"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Booking Actions
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 group"
                  >
                    <FaPrint className="transition-transform group-hover:scale-110" />
                    Print Confirmation
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 group"
                  >
                    <FaDownload className="transition-transform group-hover:scale-110" />
                    Download Details
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 group"
                  >
                    <FaShareAlt className="transition-transform group-hover:scale-110" />
                    Share Booking
                  </button>
                </div>

                {/* QR Code Section */}
                <div className="mt-8 pt-6 border-t border-amber-200 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                    <FaQrcode className="text-4xl text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Show this QR code at pickup for quick verification
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Code: {bookingData.id}
                  </p>
                </div>
              </motion.div>

              {/* Important Notes */}
              <div className="bg-linear-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaShieldAlt className="text-blue-600" />
                  Important Notes
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-blue-600 mt-0.5 shrink-0" />
                    <span>Bring valid ID and driver's license</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-blue-600 mt-0.5 shrink-0" />
                    <span>Free cancellation up to 24 hours before pickup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-blue-600 mt-0.5 shrink-0" />
                    <span>Vehicle inspection required before departure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-blue-600 mt-0.5 shrink-0" />
                    <span>Late returns incur additional charges</span>
                  </li>
                </ul>
              </div>

              {/* Customer Information */}
              <div className="bg-linear-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 border border-amber-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUserFriends className="text-amber-600" />
                  Your Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {bookingData.customer.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">
                      {bookingData.customer.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">
                      {bookingData.customer.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span className="font-medium">
                      {new Date(bookingData.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-6"
          >
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/fleet")}
                className="px-8 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 flex items-center gap-3 group"
              >
                <FaArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
                Browse More Vehicles
              </button>
              <button
                onClick={handleSupport}
                className="px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 flex items-center gap-3 group"
              >
                <FaHeadset className="transition-transform group-hover:scale-110" />
                24/7 Support
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300"
              >
                Go to Dashboard
              </button>
            </div>

            <p className="text-gray-600">
              Need to make changes?{" "}
              <button
                onClick={handleSupport}
                className="text-amber-600 hover:text-amber-700 font-semibold underline"
              >
                Contact our support team
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-8 border-t border-amber-200 mt-12">
        <p className="text-gray-600">
          Thank you for choosing SkyDrive Africa Premium. Your journey awaits!
          ✨
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Need immediate assistance? Call{" "}
          <span className="font-semibold">+254 700 000 002</span>
        </p>
      </div>
    </div>
  );
}
