import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Luggage,
  Zap,
  Shield,
  Wifi,
  Wind,
  Music,
  ChevronDown,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "../components/Button";
import { useLoaderData, useNavigate } from "react-router";
import { getVehicleById } from "../models/vehicles";
import toast, { Toaster } from "react-hot-toast";

export async function loader({ params }) {
  const { id } = params;

  const vehicle = await getVehicleById(id);
  if (!vehicle) throw new Response("Vehicle Not Found", { status: 404 });

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
    description:
      vehicle.description ||
      `Experience the comfort and reliability of the ${vehicle.name}. This vehicle offers excellent fuel efficiency and modern features for a pleasant driving experience.`,
  };

  return { vehicle: transformedVehicle };
}

export default function VehicleDetail() {
  const { vehicle } = useLoaderData();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    message: "",
    dates: "",
  });

  const images =
    vehicle?.images?.length > 0
      ? vehicle.images
      : vehicle?.thumbnail
        ? [vehicle.thumbnail]
        : [
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop",
          ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const formatPrice = (amount) => {
    if (!amount) return "Ksh 0";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: vehicle.pricing?.currency || "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const featureIcons = {
    WiFi: <Wifi className="w-4 h-4" />,
    "Air Conditioning": <Wind className="w-4 h-4" />,
    "Climate Control": <Wind className="w-4 h-4" />,
    Radio: <Music className="w-4 h-4" />,
    "Bluetooth Connectivity": <Music className="w-4 h-4" />,
    "Luxury Audio": <Music className="w-4 h-4" />,
    "Safety Features": <Shield className="w-4 h-4" />,
    "Heated Seats": <Zap className="w-4 h-4" />,
    "Navigation System": <MapPin className="w-4 h-4" />,
  };

  const handleBackToFleet = () => {
    navigate("/fleet");
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      toast.success("Added to favorites!");
      localStorage.setItem(`favorite_${vehicle._id}`, "true");
    } else {
      toast("Removed from favorites");
      localStorage.removeItem(`favorite_${vehicle._id}`);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: vehicle.name,
          text: `Check out this ${vehicle.name} on SkyDrive!`,
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Failed to share. Please try again.");
      }
    }
  };

  const handleBookNow = () => {
    if (vehicle.availableUnits === 0) {
      toast.error("This vehicle is currently unavailable for booking");
      return;
    }

    toast.success("Redirecting to booking...");
    navigate(`/booking/${vehicle._id}`);
    setTimeout(() => {
      toast.custom((t) => (
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
          <h3 className="font-bold text-lg text-gray-900">
            Booking Process Started
          </h3>
          <p className="text-gray-600 mt-2">
            We'll guide you through the booking process for:
          </p>
          <p className="font-semibold text-amber-700 mt-1">{vehicle.name}</p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                toast.dismiss(t.id);
                toast.success("Booking confirmed!");
              }}
              className="bg-amber-700 hover:bg-amber-800"
            >
              Confirm Booking
            </Button>
            <Button onClick={() => toast.dismiss(t.id)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      ));
    }, 1000);
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  const handleInquiry = () => {
    setShowInquiryModal(true);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success("Contact request sent! We'll call you soon.");
    setShowContactModal(false);
    setContactForm({ name: "", phone: "", message: "" });
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    toast.success("Inquiry submitted! We'll email you within 24 hours.");
    setShowInquiryModal(false);
    setInquiryForm({ name: "", email: "", message: "", dates: "" });
  };

  const handleCallNow = () => {
    window.location.href = "tel:+254712345678";
  };

  const handleEmailNow = () => {
    window.location.href =
      "mailto:info@skydrive.com?subject=Inquiry about " +
      encodeURIComponent(vehicle.name);
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Vehicle not found
          </h1>
          <p className="text-gray-600 mt-2">
            The vehicle you're looking for does not exist.
          </p>
          <Button
            onClick={() => navigate("/vehicles")}
            className="mt-4 bg-amber-700 hover:bg-amber-800"
          >
            Browse Fleet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#111827",
            border: "1px solid #e5e7eb",
          },
        }}
      />

      {/* Header Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={handleBackToFleet}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-amber-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Fleet</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFavorite}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? "fill-amber-700 text-amber-700" : "text-gray-600"
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows="3"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-amber-700 hover:bg-amber-800"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Request Call
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCallNow}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Call Now: +254 712 345 678
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInquiryModal(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Send Inquiry
            </h3>
            <form onSubmit={handleInquirySubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={inquiryForm.name}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={inquiryForm.email}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Dates
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., May 15-20, 2024"
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={inquiryForm.dates}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, dates: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    required
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows="3"
                    placeholder="Tell us about your rental needs..."
                    value={inquiryForm.message}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-amber-700 hover:bg-amber-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Inquiry
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInquiryModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleEmailNow}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Directly: info@skydrive.com
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Image Gallery & Header Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Image Gallery - Left Column */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-4"
          >
            {/* Main Image Container */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 aspect-video">
              {images?.[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                  <span className="text-4xl">🚗</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                {vehicle.instantBook && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-semibold shadow-lg">
                    <Check className="w-3 h-3" />
                    Instant Book
                  </div>
                )}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                    vehicle.availableUnits > 0
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {vehicle.availableUnits > 0 ? "Available" : "Booked"}
                </div>
              </div>

              {/* Image Navigation */}
              {images && images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-800" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images && images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-amber-700 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Header Card - Right Column */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Vehicle Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="space-y-4">
                {/* Title & Rating */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {vehicle.name || "Unnamed Vehicle"}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(vehicle.rating || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {vehicle.rating || 0} ({vehicle.reviews || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Price & Year */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Daily Rate
                    </p>
                    <p className="text-3xl font-bold text-amber-700">
                      {formatPrice(vehicle.pricing?.daily || 0)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Year</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {vehicle.year || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {vehicle.category || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Locations */}
                {vehicle.serviceLocations?.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Available In
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.serviceLocations.slice(0, 3).map((loc, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200"
                        >
                          <MapPin className="w-3 h-3" />
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Tiers Card */}
            {vehicle.pricing && (
              <div className="bg-linear-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 border border-amber-200">
                <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-4">
                  Pricing Options
                </p>
                <div className="space-y-3">
                  {vehicle.pricing.hourly && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">
                          Hourly
                        </span>
                        {vehicle.pricing.hourly.min > 0 && (
                          <span className="text-xs text-amber-600">
                            (min {vehicle.pricing.hourly.min} hrs)
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-amber-700">
                        {formatPrice(vehicle.pricing.hourly.rate || 0)}/hr
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-900">
                      Daily
                    </span>
                    <span className="font-bold text-amber-700">
                      {formatPrice(vehicle.pricing.daily || 0)}
                    </span>
                  </div>
                  {vehicle.pricing.weekly > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-amber-900">
                        Weekly
                      </span>
                      <span className="font-bold text-amber-700">
                        {formatPrice(vehicle.pricing.weekly)}
                      </span>
                    </div>
                  )}
                  {vehicle.pricing.monthly > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-amber-900">
                        Monthly
                      </span>
                      <span className="font-bold text-amber-700">
                        {formatPrice(vehicle.pricing.monthly)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Specifications Grid */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Capacity */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-semibold text-gray-900">Capacity</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {vehicle.capacity?.passengers || 4}
              </p>
              <p className="text-xs text-gray-500">Passenger Seats</p>
            </div>

            {/* Luggage */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Luggage className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-semibold text-gray-900">Luggage</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {vehicle.capacity?.luggage || 3}
              </p>
              <p className="text-xs text-gray-500">Large Suitcases</p>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-semibold text-gray-900">Available</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {vehicle.availableUnits || 0}/{vehicle.totalUnits || 0}
              </p>
              <p className="text-xs text-gray-500">Units Ready</p>
            </div>
          </div>
        </motion.div>

        {/* Detailed Specifications */}
        {vehicle.specifications &&
        Object.keys(vehicle.specifications).length > 0 ? (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Specifications
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(vehicle.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="pb-4 border-b border-gray-200 last:border-0"
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {key}
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Features Section */}
        {vehicle.features?.length > 0 ? (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Key Features
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {vehicle.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      {featureIcons[feature] || (
                        <Check className="w-4 h-4 text-amber-700" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Collapsible Sections */}
        <motion.div variants={itemVariants} className="space-y-3 mb-8">
          {/* Description Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection("description")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-base font-bold text-gray-900">Description</h3>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  expandedSection === "description" ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSection === "description" && (
              <div className="px-6 pb-4 border-t border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {vehicle.description || "No description available."}
                </p>
              </div>
            )}
          </div>

          {/* Rental Terms Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection("terms")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-base font-bold text-gray-900">
                Rental Terms
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  expandedSection === "terms" ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSection === "terms" && (
              <div className="px-6 pb-4 border-t border-gray-200 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Minimum Rental Period
                  </p>
                  <p className="text-sm text-gray-700">1 day</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Cancellation Policy
                  </p>
                  <p className="text-sm text-gray-700">
                    Free cancellation up to 24 hours before rental
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Insurance
                  </p>
                  <p className="text-sm text-gray-700">
                    Comprehensive coverage included
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sticky Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-3">
            <Button
              onClick={handleBookNow}
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-colors"
              disabled={vehicle.availableUnits === 0}
            >
              Book Now
            </Button>
            <Button
              onClick={handleContact}
              variant="outline"
              className="flex-1 border-2 border-amber-700 text-amber-700 hover:bg-amber-50 font-semibold py-3 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
            <Button
              onClick={handleInquiry}
              variant="outline"
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Inquiry
            </Button>
          </div>
        </motion.div>

        {/* Spacer for sticky buttons */}
        <div className="h-24" />
      </motion.div>
    </div>
  );
}
