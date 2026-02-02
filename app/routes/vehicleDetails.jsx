import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  FaStar,
  FaArrowLeft,
  FaArrowRight,
  FaHeart,
  FaShare,
  FaCheck,
  FaUsers,
  FaGasPump,
  FaCog,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaCrown,
  FaCar,
  FaHelicopter,
  FaTachometerAlt,
  FaPalette,
  FaCarSide,
  FaDoorOpen,
  FaSuitcaseRolling,
} from "react-icons/fa";

import vehiclesData from "../vehicles";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);

  // Find vehicle by ID
  const vehicle =
    vehiclesData.find((v) => v.id === parseInt(id || "1")) || vehiclesData[0];

  const images = vehicle.images || [vehicle.image];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  // Format price function
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBookNow = () => {
    navigate(`/book/${vehicle.id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle.name,
        text: `Check out this ${vehicle.category} on SkyDrive Africa`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleCall = () => {
    window.location.href = "tel:+254700000000";
  };

  const handleEmail = () => {
    window.location.href = "mailto:bookings@skydrive.africa";
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-400 via-white to-amber-100/40 pt-15">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-all duration-300"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-all duration-300">
            <FaArrowLeft className="text-sm text-amber-600" />
          </div>
          <span className="text-sm font-medium text-amber-700 group-hover:text-amber-800">
            Back to Fleet
          </span>
        </motion.button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16"
      >
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {/* Image Gallery - Left Column */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            {/* Main Image Container */}
            <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-amber-100/50 to-amber-200/20 h-125 lg:h-150 shadow-2xl shadow-amber-900/5">
              {/* Main Image */}
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-50 to-amber-100">
                  <div className="text-center">
                    <div className="text-7xl mb-4 text-amber-300">
                      {vehicle.type === "helicopter" ? "🚁" : "🚗"}
                    </div>
                    <p className="text-amber-700 font-light">{vehicle.name}</p>
                  </div>
                </div>
              )}

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white text-amber-800 transition-all duration-300 shadow-xl shadow-amber-900/10 hover:shadow-2xl hover:shadow-amber-900/20 group"
                  >
                    <FaArrowLeft className="text-lg transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white text-amber-800 transition-all duration-300 shadow-xl shadow-amber-900/10 hover:shadow-2xl hover:shadow-amber-900/20 group"
                  >
                    <FaArrowRight className="text-lg transition-transform group-hover:translate-x-0.5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-6 right-6 bg-linear-to-r from-amber-800/90 to-amber-900/90 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg">
                  {selectedImage + 1} / {images.length}
                </div>
              )}

              {/* Featured Badge */}
              {vehicle.isFeatured && (
                <div className="absolute top-6 left-6">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-600 to-amber-700 text-white rounded-full shadow-xl shadow-amber-700/30">
                    <FaCrown className="text-amber-200" />
                    <span className="text-sm font-semibold tracking-wide">
                      Premium Featured
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-3 px-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${
                      selectedImage === idx
                        ? "border-amber-600 shadow-lg shadow-amber-600/30"
                        : "border-transparent opacity-70 hover:opacity-100 hover:border-amber-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${vehicle.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Vehicle Info & Booking - Right Column */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-amber-900/5 border border-amber-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-3 py-1 bg-linear-to-r from-amber-100 to-amber-50 rounded-full border border-amber-200">
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        {vehicle.category}
                      </span>
                    </div>
                    {vehicle.isFeatured && (
                      <div className="px-2 py-1 bg-amber-600/10 rounded-full">
                        <FaCrown className="text-amber-600 text-xs" />
                      </div>
                    )}
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                    {vehicle.name}
                  </h1>
                  <p className="text-amber-700 font-light text-lg mb-4">
                    Luxury {vehicle.type} ∙ {vehicle.year || 2024}
                  </p>
                </div>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 rounded-full hover:bg-red-50 transition-all duration-300 transform hover:scale-110 ml-2"
                >
                  <FaHeart
                    className={`text-2xl transition-all duration-300 ${
                      isFavorite
                        ? "text-red-500 fill-red-500 drop-shadow-lg"
                        : "text-gray-400 hover:text-red-400"
                    }`}
                  />
                </button>
              </div>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pt-4 border-t border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <FaStar className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-gray-900">
                      {vehicle.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ({vehicle.totalReviews || vehicle.trips} reviews)
                  </span>
                </div>
                <div className="w-px h-4 bg-amber-200"></div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-amber-600" />
                  <span className="text-sm text-gray-600">
                    {vehicle.trips?.toLocaleString() || "0"} trips completed
                  </span>
                </div>
                <div className="w-px h-4 bg-amber-200"></div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
                  </div>
                  <span className="text-sm font-medium text-emerald-700">
                    {vehicle.availability || 95}% available
                  </span>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-linear-to-b from-amber-50 to-white rounded-xl border border-amber-100">
                  <FaUsers className="text-amber-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">Seats</p>
                  <p className="font-bold text-gray-900">
                    {vehicle.capacity?.passengers || vehicle.capacity || "4"}
                  </p>
                </div>
                <div className="text-center p-3 bg-linear-to-b from-amber-50 to-white rounded-xl border border-amber-100">
                  <FaSuitcaseRolling className="text-amber-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">Luggage</p>
                  <p className="font-bold text-gray-900">
                    {vehicle.capacity?.luggage || "3"}
                  </p>
                </div>
                <div className="text-center p-3 bg-linear-to-b from-amber-50 to-white rounded-xl border border-amber-100">
                  <FaTachometerAlt className="text-amber-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="font-bold text-gray-900 capitalize">
                    {vehicle.type}
                  </p>
                </div>
                <div className="text-center p-3 bg-linear-to-b from-amber-50 to-white rounded-xl border border-amber-100">
                  <FaPalette className="text-amber-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">Color</p>
                  <p className="font-bold text-gray-900">
                    {vehicle.color || "Premium"}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-linear-to-br from-amber-600 to-amber-700 rounded-3xl p-6 shadow-2xl shadow-amber-900/20">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-amber-100 uppercase tracking-widest">
                  Exclusive Pricing
                </p>
                <div className="px-3 py-1 bg-amber-800/50 rounded-full">
                  <span className="text-xs text-amber-100">Best Value</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline pb-3 border-b border-amber-500/30">
                  <div>
                    <span className="text-amber-100/90">Hourly Rate</span>
                    <p className="text-xs text-amber-200/70 mt-1">
                      Perfect for short trips
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-white">
                    {formatPrice(
                      vehicle.pricing?.perHour || vehicle.pricePerHour,
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pb-3 border-b border-amber-500/30">
                  <div>
                    <span className="text-amber-100/90">Daily Rate</span>
                    <p className="text-xs text-amber-200/70 mt-1">Save 15%</p>
                  </div>
                  <span className="text-2xl font-bold text-amber-50">
                    {formatPrice(
                      vehicle.pricing?.perDay || vehicle.pricePerHour * 6,
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-amber-100/90">Weekly Rate</span>
                    <p className="text-xs text-amber-200/70 mt-1">Save 25%</p>
                  </div>
                  <span className="text-xl font-bold text-amber-100">
                    {formatPrice(
                      vehicle.pricing?.perWeek || vehicle.pricePerHour * 6 * 5,
                    )}
                  </span>
                </div>
              </div>

              {vehicle.pricing?.includes &&
                vehicle.pricing.includes.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-amber-500/30">
                    <p className="text-xs text-amber-100/80 mb-3 uppercase tracking-wider">
                      All Includes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.pricing.includes.slice(0, 4).map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1.5 bg-amber-800/40 text-amber-100 rounded-full border border-amber-500/30"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                className="w-full px-8 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-bold rounded-2xl shadow-xl shadow-amber-600/30 hover:shadow-2xl hover:shadow-amber-600/40 transition-all duration-300 text-lg"
              >
                Book Now
              </motion.button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShare}
                  className="px-4 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <FaShare className="text-sm transition-transform group-hover:rotate-12" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-amber-300 hover:text-amber-700 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <FaEnvelope className="text-sm" />
                  <span>Inquiry</span>
                </button>
              </div>
            </div>

            {/* Host Info */}
            {vehicle.host && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-lg shadow-amber-900/5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Premium Host
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {vehicle.host.name?.charAt(0) || "S"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {vehicle.host.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <FaStar className="text-amber-500 text-xs" />
                        <span className="text-xs text-gray-600">
                          {vehicle.host.rating} • {vehicle.host.responseRate}{" "}
                          response rate
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Description */}
        <motion.div variants={itemVariants} className="max-w-3xl mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-0.5 bg-linear-to-r from-amber-600 to-amber-400"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Vehicle Overview
            </h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed font-light mb-8">
            {vehicle.description ||
              `Experience unparalleled luxury with this premium ${vehicle.category}. Meticulously maintained and equipped with state-of-the-art features, this vehicle offers the perfect blend of performance, comfort, and style for your journey across Africa's most stunning landscapes.`}
          </p>

          {vehicle.tags && vehicle.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {vehicle.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-linear-to-r from-amber-50 to-amber-100 text-amber-700 text-sm rounded-full border border-amber-200 hover:border-amber-300 transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex space-x-1 mb-8 bg-linear-to-r from-amber-50 to-amber-100/50 rounded-2xl p-1 shadow-inner">
            {["overview", "specifications", "features", "location"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 font-medium capitalize rounded-xl transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-white text-amber-700 shadow-lg shadow-amber-900/10 border border-amber-100"
                      : "text-gray-600 hover:text-amber-700 hover:bg-white/50"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>

          {/* Tab Content */}
          <div className="min-h-100">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Capacity & Features */}
                <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-900/5">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-amber-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                      <FaUsers className="text-amber-600" />
                    </div>
                    Capacity & Comfort
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-3 hover:bg-amber-50/50 rounded-xl transition-colors">
                      <div className="w-14 h-14 rounded-xl bg-linear-to-br from-amber-600/10 to-amber-500/5 flex items-center justify-center">
                        <FaUsers className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Passengers</p>
                        <p className="text-lg font-bold text-gray-900">
                          {vehicle.capacity?.passengers || vehicle.capacity}{" "}
                          Seats
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 hover:bg-amber-50/50 rounded-xl transition-colors">
                      <div className="w-14 h-14 rounded-xl bg-linear-to-br from-amber-600/10 to-amber-500/5 flex items-center justify-center">
                        <FaSuitcaseRolling className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Luggage Capacity
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {vehicle.capacity?.luggage || "3"} Large Suitcases
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 hover:bg-amber-50/50 rounded-xl transition-colors">
                      <div className="w-14 h-14 rounded-xl bg-linear-to-br from-amber-600/10 to-amber-500/5 flex items-center justify-center">
                        <FaDoorOpen className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Doors</p>
                        <p className="text-lg font-bold text-gray-900">
                          {vehicle.specifications?.doors || "4"} Doors
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-900/5">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-amber-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                      <FaCrown className="text-amber-600" />
                    </div>
                    Premium Features
                  </h3>
                  <ul className="space-y-3">
                    {Array.isArray(vehicle.features) &&
                      vehicle.features.slice(0, 6).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 p-2 hover:bg-amber-50/50 rounded-lg transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                            <FaCheck className="text-amber-600 text-xs" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specifications" && vehicle.specifications && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(vehicle.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-white rounded-xl p-5 border border-amber-100 hover:border-amber-200 transition-colors group"
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .toLowerCase()
                        .trim()}
                    </p>
                    <p className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Features Tab */}
            {activeTab === "features" && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Safety Features */}
                {vehicle.safety && vehicle.safety.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-900/5">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-amber-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-100 to-red-50 flex items-center justify-center">
                        <FaShieldAlt className="text-red-600" />
                      </div>
                      Safety Features
                    </h3>
                    <ul className="space-y-3">
                      {vehicle.safety.slice(0, 6).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 p-2 hover:bg-red-50/50 rounded-lg transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                            <FaCheck className="text-red-600 text-xs" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comfort Features */}
                {vehicle.comfort && vehicle.comfort.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-900/5">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-amber-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <FaCarSide className="text-blue-600" />
                      </div>
                      Comfort & Entertainment
                    </h3>
                    <ul className="space-y-3">
                      {vehicle.comfort.slice(0, 6).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 p-2 hover:bg-blue-50/50 rounded-lg transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <FaCheck className="text-blue-600 text-xs" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Location Tab */}
            {activeTab === "location" && (
              <div className="grid md:grid-cols-2 gap-8">
                {vehicle.baseLocation && (
                  <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-900/5">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-amber-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                        <FaMapMarkerAlt className="text-amber-600" />
                      </div>
                      Pickup Location
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          {vehicle.baseLocation.city}
                        </p>
                        <p className="text-gray-600">
                          {vehicle.baseLocation.address}
                        </p>
                      </div>
                      <div className="aspect-video bg-linear-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center overflow-hidden">
                        <div className="text-center p-6">
                          <div className="relative">
                            <FaMapMarkerAlt className="text-amber-600 text-5xl mx-auto mb-4 animate-bounce" />
                            <div className="absolute inset-0 bg-amber-600/20 rounded-full animate-ping"></div>
                          </div>
                          <p className="text-amber-700 font-medium">
                            Available for Pickup
                          </p>
                          <p className="text-sm text-amber-600/70 mt-2">
                            Free parking ∙ 24/7 access ∙ Secure facility
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-900/5">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-amber-100">
                    Contact & Support
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 mb-6">
                      Our premium concierge team is available 24/7 to assist
                      with your booking and answer any questions.
                    </p>
                    <button
                      onClick={handleCall}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 group"
                    >
                      <FaPhone className="text-sm transition-transform group-hover:scale-110" />
                      Call: +254 700 000 000
                    </button>
                    <button
                      onClick={handleEmail}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-amber-600 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 group"
                    >
                      <FaEnvelope className="text-sm transition-transform group-hover:scale-110" />
                      Email: bookings@skydrive.africa
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
