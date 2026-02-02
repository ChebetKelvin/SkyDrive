import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaStar, FaArrowRight, FaFilter, FaSort } from "react-icons/fa";
import { Link } from "react-router";
import vehiclesData from "../vehicles.js";

export default function Vehicles() {
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const vehicleTypes = [
    { value: "all", label: "All Vehicles" },
    { value: "sedan", label: "Sedans" },
    { value: "suv", label: "SUVs" },
    { value: "helicopter", label: "Helicopters" },
  ];

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = vehiclesData;

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((v) => v.type === selectedType);
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortBy === "price-low") {
      sorted.sort((a, b) => a.pricing.perHour - b.pricing.perHour);
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => b.pricing.perHour - a.pricing.perHour);
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    return sorted;
  }, [selectedType, sortBy]);

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
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
    hover: {
      y: -4,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-linear-to-b from-slate-50 to-white border-b border-slate-100 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-medium text-amber-600 uppercase tracking-widest mb-3">
              Our Fleet
            </p>
            <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
              Premium Vehicles &{" "}
              <span className="font-semibold text-amber-600">Helicopters</span>
            </h1>
            <p className="text-lg text-slate-600 font-light">
              Explore our curated collection of luxury vehicles for executive
              travel, safari adventures, and unforgettable journeys.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters & Sorting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
            {/* Type Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-amber-600 text-sm" />
                <span className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                  Filter by Type
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {vehicleTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      selectedType === type.value
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="w-full md:w-auto">
              <div className="flex items-center gap-2 mb-4">
                <FaSort className="text-amber-600 text-sm" />
                <span className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                  Sort by
                </span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              >
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold">{filteredVehicles.length}</span>{" "}
            vehicle
            {filteredVehicles.length !== 1 ? "s" : ""}
          </p>
        </motion.div>

        {/* Vehicles Grid */}
        {filteredVehicles.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredVehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                variants={cardVariants}
                whileHover="hover"
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-lg border border-slate-100 hover:border-slate-200 overflow-hidden transition-all duration-300 h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative h-80 overflow-hidden bg-slate-100">
                    <img
                      src={vehicle.thumbnail}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Featured Badge */}
                    {vehicle.isFeatured && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 bg-amber-600 text-white text-xs font-semibold uppercase tracking-widest rounded-full">
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      <FaStar className="text-amber-400 text-xs" />
                      <span className="text-sm font-semibold text-slate-900">
                        {vehicle.rating}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        ({vehicle.totalReviews})
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col grow">
                    {/* Category */}
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-2">
                      {vehicle.category}
                    </p>

                    {/* Name */}
                    <h3 className="text-xl font-light text-slate-900 mb-2 leading-tight group-hover:text-amber-600 transition-colors duration-300">
                      {vehicle.name}
                    </h3>

                    {/* Year & Color */}
                    <p className="text-xs text-slate-500 mb-4">
                      {vehicle.year} • {vehicle.color}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 grow">
                      {vehicle.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-slate-100">
                      {vehicle.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {vehicle.tags.length > 3 && (
                        <span className="text-xs text-slate-500 px-2 py-1">
                          +{vehicle.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Capacity
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {vehicle.capacity.passengers} Seats
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Trips
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {vehicle.trips.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-5 pb-5 border-b border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                        Pricing
                      </p>
                      <div className="flex items-baseline gap-4">
                        <div>
                          <p className="text-xs text-slate-600">Per Hour</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {vehicle.pricing.currency}{" "}
                            {vehicle.pricing.perHour.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Per Day</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {vehicle.pricing.currency}{" "}
                            {vehicle.pricing.perDay.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      to={`/fleet/${vehicle.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-300 group/link"
                    >
                      View Details
                      <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-lg text-slate-600">
              No vehicles found matching your criteria.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
