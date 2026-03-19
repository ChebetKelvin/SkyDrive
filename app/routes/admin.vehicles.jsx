import { useLoaderData, useFetcher, useNavigate } from "react-router";
import {
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicleById,
  addVehicle,
  getVehiclesByCategory,
  searchVehiclesByName,
} from "../models/vehicles.js";
import { getVehicleStats } from "../.server/admin.js";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUsers,
  FaBan,
  FaMapMarkerAlt,
  FaStar,
  FaBoxes,
  FaTimes,
} from "react-icons/fa";

export async function loader({ request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "all";
  const page = parseInt(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const viewVehicle = url.searchParams.get("view");
  const limit = 6; // Reduced for mobile-first

  let vehicles = [];
  let total = 0;

  if (search) {
    vehicles = await searchVehiclesByName(search);
    total = vehicles.length;
    vehicles = vehicles.slice((page - 1) * limit, page * limit);
  } else if (category !== "all") {
    vehicles = await getVehiclesByCategory(category);
    total = vehicles.length;
    vehicles = vehicles.slice((page - 1) * limit, page * limit);
  } else {
    vehicles = await getVehicles();
    total = vehicles.length;
    vehicles = vehicles.slice((page - 1) * limit, page * limit);
  }

  const stats = await getVehicleStats();

  let selectedVehicle = null;
  if (viewVehicle && viewVehicle !== "[object Object]") {
    selectedVehicle = await getVehicleById(viewVehicle);
  }

  const serializedVehicles = vehicles.map((vehicle) => ({
    ...vehicle,
    _id: vehicle._id?.toString() || vehicle._id,
  }));

  const serializedSelectedVehicle = selectedVehicle
    ? {
        ...selectedVehicle,
        _id: selectedVehicle._id?.toString() || selectedVehicle._id,
      }
    : null;

  return {
    vehicles: serializedVehicles,
    stats,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    filters: { category, page, search },
    selectedVehicle: serializedSelectedVehicle,
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "create": {
      const vehicleData = {
        name: formData.get("name"),
        year: parseInt(formData.get("year")) || new Date().getFullYear(),
        category: formData.get("category"),
        thumbnail: formData.get("thumbnail"),
        capacity: {
          passengers: parseInt(formData.get("passengerCapacity")) || 5,
          luggage: parseInt(formData.get("luggageCapacity")) || 3,
        },
        rating: parseFloat(formData.get("rating")) || 4.5,
        reviewCount: parseInt(formData.get("reviewCount")) || 0,
        features:
          formData
            .get("features")
            ?.split(",")
            .map((f) => f.trim())
            .filter(Boolean) || [],
        instantBook: formData.get("instantBook") === "on",
        baseLocation: {
          city: formData.get("locationCity") || "Nairobi",
          address: formData.get("locationAddress") || "",
        },
        pricing: {
          daily: parseInt(formData.get("dailyRate")) || 0,
          currency: "KES",
        },
        totalUnits: parseInt(formData.get("totalUnits")) || 1,
        availableUnits: parseInt(formData.get("totalUnits")) || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await addVehicle(vehicleData);
      return { success: true, message: "Vehicle created successfully" };
    }

    case "update": {
      const vehicleId = formData.get("vehicleId")?.toString();
      if (!vehicleId || vehicleId === "[object Object]") {
        return { success: false, error: "Invalid vehicle ID" };
      }

      const updateData = {
        name: formData.get("name"),
        year: parseInt(formData.get("year")) || new Date().getFullYear(),
        category: formData.get("category"),
        thumbnail: formData.get("thumbnail"),
        capacity: {
          passengers: parseInt(formData.get("passengerCapacity")) || 5,
          luggage: parseInt(formData.get("luggageCapacity")) || 3,
        },
        rating: parseFloat(formData.get("rating")) || 4.5,
        reviewCount: parseInt(formData.get("reviewCount")) || 0,
        features:
          formData
            .get("features")
            ?.split(",")
            .map((f) => f.trim())
            .filter(Boolean) || [],
        instantBook: formData.get("instantBook") === "on",
        baseLocation: {
          city: formData.get("locationCity") || "Nairobi",
          address: formData.get("locationAddress") || "",
        },
        pricing: {
          daily: parseInt(formData.get("dailyRate")) || 0,
          currency: "KES",
        },
        totalUnits: parseInt(formData.get("totalUnits")) || 1,
        availableUnits: parseInt(formData.get("availableUnits")) || 1,
        updatedAt: new Date(),
      };

      await updateVehicle(vehicleId, updateData);
      return { success: true, message: "Vehicle updated successfully" };
    }

    case "delete": {
      const deleteId = formData.get("vehicleId")?.toString();
      if (!deleteId || deleteId === "[object Object]") {
        return { success: false, error: "Invalid vehicle ID" };
      }
      await deleteVehicleById(deleteId);
      return { success: true, message: "Vehicle deleted successfully" };
    }

    default:
      return { error: "Invalid action" };
  }
}

export default function AdminVehicles() {
  const {
    vehicles,
    stats,
    pagination,
    filters,
    selectedVehicle: initialSelected,
  } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(
    initialSelected || null,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [activeCategory, setActiveCategory] = useState(filters.category);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    category: "suv",
    thumbnail: "",
    passengerCapacity: 5,
    luggageCapacity: 3,
    rating: 4.5,
    reviewCount: 0,
    features: "",
    instantBook: false,
    locationCity: "Nairobi",
    locationAddress: "",
    dailyRate: 0,
    totalUnits: 1,
    availableUnits: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        const params = new URLSearchParams(window.location.search);
        if (searchTerm) params.set("search", searchTerm);
        else params.delete("search");
        params.set("page", "1");
        navigate(`?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, navigate, filters.search]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name || "",
      year: vehicle.year || new Date().getFullYear(),
      category: vehicle.category || "suv",
      thumbnail: vehicle.thumbnail || "",
      passengerCapacity: vehicle.capacity?.passengers || 5,
      luggageCapacity: vehicle.capacity?.luggage || 3,
      rating: vehicle.rating || 4.5,
      reviewCount: vehicle.reviewCount || 0,
      features: vehicle.features?.join(", ") || "",
      instantBook: vehicle.instantBook || false,
      locationCity: vehicle.baseLocation?.city || "Nairobi",
      locationAddress: vehicle.baseLocation?.address || "",
      dailyRate: vehicle.pricing?.daily || 0,
      totalUnits: vehicle.totalUnits || 1,
      availableUnits: vehicle.availableUnits || 1,
    });
    setShowForm(true);
  };

  const handleDelete = (vehicleId, vehicleName) => {
    if (confirm(`Delete ${vehicleName}? This cannot be undone.`)) {
      fetcher.submit(
        { action: "delete", vehicleId: vehicleId?.toString() },
        { method: "post" },
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    if (editingVehicle) {
      formData.append("vehicleId", editingVehicle._id?.toString());
      formData.append("action", "update");
    } else {
      formData.append("action", "create");
    }

    fetcher.submit(formData, { method: "post" });
    setShowForm(false);
    setEditingVehicle(null);
  };

  const getStatusBadge = (vehicle) => {
    if (vehicle.availableUnits === 0) {
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: FaBan,
        label: "Sold Out",
      };
    } else if (vehicle.availableUnits < vehicle.totalUnits) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: FaClock,
        label: "Limited",
      };
    } else {
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: FaCheckCircle,
        label: "Available",
      };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const categories = [
    { value: "all", label: "All" },
    { value: "suv", label: "SUV" },
    { value: "sedan", label: "Sedan" },
    { value: "executive_sedan", label: "Executive" },
    { value: "van", label: "Van" },
    { value: "luxury", label: "Luxury" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Fleet</h1>
          <button
            onClick={() => {
              setEditingVehicle(null);
              setFormData({
                name: "",
                year: new Date().getFullYear(),
                category: "suv",
                thumbnail: "",
                passengerCapacity: 5,
                luggageCapacity: 3,
                rating: 4.5,
                reviewCount: 0,
                features: "",
                instantBook: false,
                locationCity: "Nairobi",
                locationAddress: "",
                dailyRate: 0,
                totalUnits: 1,
                availableUnits: 1,
              });
              setShowForm(true);
            }}
            className="flex items-center gap-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium"
          >
            <FaPlus size={14} />
            <span>Add</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Categories - Horizontal Scroll */}
        <div className="mt-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  handleFilterChange("category", cat.value);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.value
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Add top padding to account for fixed header */}
      <div className="pt-32 px-4 pb-20">
        {/* Quick Stats - Minimal */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white rounded-lg p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-900">{vehicles.length}</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Units</p>
            <p className="text-lg font-bold text-amber-600">
              {vehicles.reduce((sum, v) => sum + (v.totalUnits || 1), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Available</p>
            <p className="text-lg font-bold text-green-600">
              {vehicles.reduce((sum, v) => sum + (v.availableUnits || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm">
            <p className="text-xs text-gray-600">Types</p>
            <p className="text-lg font-bold text-purple-600">
              {new Set(vehicles.map((v) => v.category)).size}
            </p>
          </div>
        </div>

        {/* Vehicle List - Simple Cards */}
        <div className="space-y-3">
          {vehicles.map((vehicle) => {
            const vehicleId = vehicle._id?.toString();
            const status = getStatusBadge(vehicle);
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={vehicleId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="flex gap-3 p-3">
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={
                        vehicle.thumbnail || "https://via.placeholder.com/80"
                      }
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {vehicle.name}
                        </h3>
                        <p className="text-xs text-gray-600 capitalize">
                          {vehicle.category?.replace("_", " ")} • {vehicle.year}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}
                      >
                        <StatusIcon size={10} />
                        <span className="hidden sm:inline">{status.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-700">
                      <span className="flex items-center gap-0.5">
                        <FaUsers size={10} className="text-amber-600" />
                        {vehicle.capacity?.passengers}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <FaMapMarkerAlt size={10} className="text-amber-600" />
                        {vehicle.baseLocation?.city}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <FaStar size={10} className="text-amber-600" />
                        {vehicle.rating || 4.5}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-amber-600 text-sm">
                        {formatCurrency(vehicle.pricing?.daily).replace(
                          "KES",
                          "KSh",
                        )}
                        /day
                      </span>
                      <span className="text-xs text-gray-600">
                        <FaBoxes
                          className="inline mr-0.5 text-amber-600"
                          size={10}
                        />
                        {vehicle.availableUnits}/{vehicle.totalUnits}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          navigate(`?view=${vehicleId}`, { replace: true });
                        }}
                        className="flex-1 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <FaEye size={12} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="flex-1 py-1.5 bg-amber-50 text-amber-700 rounded text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <FaEdit size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(vehicleId, vehicle.name)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {vehicles.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FaCar className="text-gray-400 text-2xl" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">
              No vehicles found
            </h3>
            <p className="text-sm text-gray-600 mb-4">Try a different search</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium"
            >
              Add Vehicle
            </button>
          </div>
        )}

        {/* Pagination - Simple */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 bg-white rounded-lg shadow-sm p-3">
            <p className="text-xs text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange("page", pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 bg-gray-100 rounded disabled:opacity-50"
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                onClick={() => handleFilterChange("page", pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-1.5 bg-gray-100 rounded disabled:opacity-50"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Full screen on mobile */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">
                    {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="p-2">
                    <FaTimes size={20} className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={formData.name}
                      className="w-full px-3 py-2 text-sm border rounded-lg"
                      placeholder="Toyota Land Cruiser"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <input
                        type="number"
                        name="year"
                        required
                        min="2000"
                        defaultValue={formData.year}
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        required
                        defaultValue={formData.category}
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                      >
                        <option value="suv">SUV</option>
                        <option value="sedan">Sedan</option>
                        <option value="executive_sedan">Executive</option>
                        <option value="van">Van</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="thumbnail"
                      defaultValue={formData.thumbnail}
                      className="w-full px-3 py-2 text-sm border rounded-lg"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Capacity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passengers
                      </label>
                      <input
                        type="number"
                        name="passengerCapacity"
                        min="1"
                        defaultValue={formData.passengerCapacity}
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Luggage
                      </label>
                      <input
                        type="number"
                        name="luggageCapacity"
                        min="0"
                        defaultValue={formData.luggageCapacity}
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="locationCity"
                      defaultValue={formData.locationCity}
                      className="w-full px-3 py-2 text-sm border rounded-lg"
                    />
                  </div>

                  {/* Pricing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Rate (KES) *
                    </label>
                    <input
                      type="number"
                      name="dailyRate"
                      required
                      min="0"
                      defaultValue={formData.dailyRate}
                      className="w-full px-3 py-2 text-sm border rounded-lg"
                    />
                  </div>

                  {/* Inventory */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Units
                      </label>
                      <input
                        type="number"
                        name="totalUnits"
                        min="1"
                        defaultValue={formData.totalUnits}
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available
                      </label>
                      <input
                        type="number"
                        name="availableUnits"
                        min="0"
                        defaultValue={formData.availableUnits}
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Features{" "}
                      <span className="text-gray-500">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      name="features"
                      defaultValue={formData.features}
                      className="w-full px-3 py-2 text-sm border rounded-lg"
                      placeholder="WiFi, AC, GPS"
                    />
                  </div>

                  {/* Options */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="instantBook"
                      defaultChecked={formData.instantBook}
                      className="rounded text-amber-600"
                    />
                    <span className="text-sm">Instant Booking Available</span>
                  </label>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-2 border rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium"
                    >
                      {editingVehicle ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle Details Modal - Full screen on mobile */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center"
            onClick={() => {
              setSelectedVehicle(null);
              navigate(".", { replace: true });
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Vehicle Details</h2>
                  <button
                    onClick={() => {
                      setSelectedVehicle(null);
                      navigate(".", { replace: true });
                    }}
                    className="p-2"
                  >
                    <FaTimes size={20} className="text-gray-500" />
                  </button>
                </div>

                {selectedVehicle && (
                  <div className="space-y-4">
                    <img
                      src={
                        selectedVehicle.thumbnail ||
                        "https://via.placeholder.com/400"
                      }
                      alt={selectedVehicle.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />

                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedVehicle.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {selectedVehicle.category?.replace("_", " ")} •{" "}
                        {selectedVehicle.year}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Passengers</p>
                        <p className="font-bold">
                          {selectedVehicle.capacity?.passengers}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Luggage</p>
                        <p className="font-bold">
                          {selectedVehicle.capacity?.luggage}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Rating</p>
                        <p className="font-bold flex items-center gap-1">
                          <FaStar className="text-yellow-400" size={14} />
                          {selectedVehicle.rating} (
                          {selectedVehicle.reviewCount || 0})
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Location</p>
                        <p className="font-bold text-sm truncate">
                          {selectedVehicle.baseLocation?.city}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Daily Rate</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {formatCurrency(selectedVehicle.pricing?.daily)}
                      </p>
                    </div>

                    {selectedVehicle.features?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Features</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedVehicle.features.map((f, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Total Units</p>
                        <p className="font-bold text-lg">
                          {selectedVehicle.totalUnits || 1}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Available</p>
                        <p className="font-bold text-lg">
                          {selectedVehicle.availableUnits || 0}
                        </p>
                      </div>
                    </div>

                    {selectedVehicle.instantBook && (
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center gap-2">
                        <FaCheckCircle />
                        <span className="text-sm font-medium">
                          Instant Booking Available
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => {
                          setSelectedVehicle(null);
                          handleEdit(selectedVehicle);
                        }}
                        className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVehicle(null);
                          handleDelete(
                            selectedVehicle._id?.toString(),
                            selectedVehicle.name,
                          );
                        }}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {fetcher.state === "submitting" && (
        <div className="fixed bottom-4 left-4 right-4 mx-auto w-fit bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
}
