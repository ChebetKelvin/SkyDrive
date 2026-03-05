// routes/admin.vehicles.jsx
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
  FaCog,
  FaBan,
  FaMapMarkerAlt,
  FaTachometerAlt,
  FaSnowflake,
  FaWifi,
  FaBluetooth,
  FaChargingStation,
  FaStar,
  FaBoxes,
  FaMapPin,
  FaGlobe,
  FaTags,
  FaSuitcase,
} from "react-icons/fa";

export async function loader({ request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "all";
  const page = parseInt(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const viewVehicle = url.searchParams.get("view");
  const limit = 9;

  console.log(
    "🔍 Loader - viewVehicle param:",
    viewVehicle,
    "type:",
    typeof viewVehicle,
  );

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
    console.log("🔍 Loading vehicle with ID:", viewVehicle);
    selectedVehicle = await getVehicleById(viewVehicle);
  }

  // Serialize ObjectIds to strings for the frontend
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
          coordinates: {
            lat: parseFloat(formData.get("latitude")) || 0,
            lng: parseFloat(formData.get("longitude")) || 0,
          },
        },
        serviceLocations: formData
          .get("serviceLocations")
          ?.split(",")
          .map((l) => l.trim())
          .filter(Boolean) || ["Nairobi"],
        pricing: {
          hourly: {
            min: parseInt(formData.get("hourlyMin")) || 4,
            rate: parseInt(formData.get("hourlyRate")) || 0,
          },
          daily: parseInt(formData.get("dailyRate")) || 0,
          weekly: parseInt(formData.get("weeklyRate")) || 0,
          currency: "KES",
        },
        totalUnits: parseInt(formData.get("totalUnits")) || 1,
        availableUnits: parseInt(formData.get("totalUnits")) || 1,
        bookedRanges: [],
        tags:
          formData
            .get("tags")
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean) || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await addVehicle(vehicleData);
      return {
        success: true,
        message: "Vehicle created successfully",
        id: result.insertedId?.toString(),
      };
    }

    case "update": {
      const rawVehicleId = formData.get("vehicleId");
      const vehicleId = rawVehicleId?.toString();

      console.log(
        "🎯 Update vehicle - raw:",
        rawVehicleId,
        "converted:",
        vehicleId,
      );

      if (!vehicleId || vehicleId === "[object Object]") {
        return {
          success: false,
          error: "Invalid vehicle ID format",
        };
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
          coordinates: {
            lat: parseFloat(formData.get("latitude")) || 0,
            lng: parseFloat(formData.get("longitude")) || 0,
          },
        },
        serviceLocations: formData
          .get("serviceLocations")
          ?.split(",")
          .map((l) => l.trim())
          .filter(Boolean) || ["Nairobi"],
        pricing: {
          hourly: {
            min: parseInt(formData.get("hourlyMin")) || 4,
            rate: parseInt(formData.get("hourlyRate")) || 0,
          },
          daily: parseInt(formData.get("dailyRate")) || 0,
          weekly: parseInt(formData.get("weeklyRate")) || 0,
          currency: "KES",
        },
        totalUnits: parseInt(formData.get("totalUnits")) || 1,
        availableUnits: parseInt(formData.get("availableUnits")) || 1,
        tags:
          formData
            .get("tags")
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean) || [],
        updatedAt: new Date(),
      };

      const updated = await updateVehicle(vehicleId, updateData);
      return {
        success: true,
        message: "Vehicle updated successfully",
        vehicle: updated,
      };
    }

    case "delete": {
      const rawDeleteId = formData.get("vehicleId");
      const deleteId = rawDeleteId?.toString();

      console.log(
        "🗑️ Delete vehicle - raw:",
        rawDeleteId,
        "converted:",
        deleteId,
      );

      if (!deleteId || deleteId === "[object Object]") {
        return {
          success: false,
          error: "Invalid vehicle ID format",
        };
      }

      await deleteVehicleById(deleteId);
      return {
        success: true,
        message: "Vehicle deleted successfully",
      };
    }

    case "bulk-status": {
      const rawVehicleIds = formData.get("vehicleIds");
      const vehicleIds = rawVehicleIds?.split(",").map((id) => id.trim()) || [];

      console.log("📦 Bulk update vehicles:", vehicleIds);

      const newStatus = formData.get("status");

      for (const id of vehicleIds) {
        if (id && id !== "[object Object]") {
          const vehicle = await getVehicleById(id);
          if (vehicle) {
            await updateVehicle(id, {
              tags: [...(vehicle.tags || []), `status_${newStatus}`],
            });
          }
        }
      }

      return {
        success: true,
        message: `${vehicleIds.length} vehicles updated to ${newStatus}`,
      };
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState(filters.category);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    category: "suv",
    thumbnail: "",
    passengerCapacity: 5,
    luggageCapacity: 3,
    rating: 4.5,
    reviewCount: 0,
    features: [],
    instantBook: false,
    locationCity: "Nairobi",
    locationAddress: "",
    latitude: 0,
    longitude: 0,
    serviceLocations: ["Nairobi"],
    hourlyMin: 4,
    hourlyRate: 0,
    dailyRate: 0,
    weeklyRate: 0,
    totalUnits: 1,
    availableUnits: 1,
    tags: [],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        const params = new URLSearchParams(window.location.search);
        if (searchTerm) {
          params.set("search", searchTerm);
        } else {
          params.delete("search");
        }
        params.set("page", "1");
        navigate(`?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, navigate, filters.search]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
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
      features: vehicle.features || [],
      instantBook: vehicle.instantBook || false,
      locationCity: vehicle.baseLocation?.city || "Nairobi",
      locationAddress: vehicle.baseLocation?.address || "",
      latitude: vehicle.baseLocation?.coordinates?.lat || 0,
      longitude: vehicle.baseLocation?.coordinates?.lng || 0,
      serviceLocations: vehicle.serviceLocations || ["Nairobi"],
      hourlyMin: vehicle.pricing?.hourly?.min || 4,
      hourlyRate: vehicle.pricing?.hourly?.rate || 0,
      dailyRate: vehicle.pricing?.daily || 0,
      weeklyRate: vehicle.pricing?.weekly || 0,
      totalUnits: vehicle.totalUnits || 1,
      availableUnits: vehicle.availableUnits || 1,
      tags: vehicle.tags || [],
    });
    setShowForm(true);
  };

  const handleDelete = (vehicleId, vehicleName) => {
    const idString = vehicleId?.toString();
    console.log("🗑️ handleDelete - ID:", idString);

    if (
      confirm(
        `Are you sure you want to delete ${vehicleName}? This action cannot be undone.`,
      )
    ) {
      fetcher.submit(
        {
          action: "delete",
          vehicleId: idString,
        },
        { method: "post" },
      );
    }
  };

  const handleBulkStatusUpdate = (status) => {
    if (selectedIds.length === 0) return;

    if (
      confirm(`Change status of ${selectedIds.length} vehicles to ${status}?`)
    ) {
      console.log("📦 Bulk updating IDs:", selectedIds);
      fetcher.submit(
        {
          action: "bulk-status",
          vehicleIds: selectedIds.join(","),
          status,
        },
        { method: "post" },
      );
      setSelectedIds([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === vehicles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(vehicles.map((v) => v._id.toString()));
    }
  };

  const handleSelectOne = (id) => {
    const idString = id.toString();
    setSelectedIds((prev) =>
      prev.includes(idString)
        ? prev.filter((i) => i !== idString)
        : [...prev, idString],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    if (editingVehicle) {
      const vehicleIdString = editingVehicle._id?.toString();
      console.log("📝 handleSubmit - editing vehicle ID:", vehicleIdString);
      formData.append("vehicleId", vehicleIdString);
      formData.append("action", "update");
    } else {
      formData.append("action", "create");
    }

    fetcher.submit(formData, { method: "post" });
    setShowForm(false);
    setEditingVehicle(null);
  };

  const getStatusBadge = (vehicle) => {
    const availableUnits = vehicle.availableUnits || 0;
    const totalUnits = vehicle.totalUnits || 1;

    if (availableUnits === 0) {
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: FaBan,
        label: "Sold Out",
      };
    } else if (availableUnits < totalUnits) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: FaClock,
        label: "Partially Available",
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
    { value: "suv", label: "SUV", icon: FaCar },
    { value: "sedan", label: "Sedan", icon: FaCar },
    { value: "executive_sedan", label: "Executive Sedan", icon: FaCar },
    { value: "van", label: "Van/Minibus", icon: FaCar },
    { value: "convertible", label: "Convertible", icon: FaCar },
    { value: "luxury", label: "Luxury", icon: FaCar },
  ];

  const featuresList = [
    { value: "WiFi", icon: FaWifi },
    { value: "Bluetooth", icon: FaBluetooth },
    { value: "USB Charging", icon: FaChargingStation },
    { value: "Climate Control", icon: FaSnowflake },
    { value: "Cruise Control", icon: FaTachometerAlt },
    { value: "4WD", icon: FaCog },
    { value: "Navigation System", icon: FaMapPin },
    { value: "Driver Included", icon: FaUsers },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fleet Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your vehicle inventory</p>
          </div>
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
                features: [],
                instantBook: false,
                locationCity: "Nairobi",
                locationAddress: "",
                latitude: 0,
                longitude: 0,
                serviceLocations: ["Nairobi"],
                hourlyMin: 4,
                hourlyRate: 0,
                dailyRate: 0,
                weeklyRate: 0,
                totalUnits: 1,
                availableUnits: 1,
                tags: [],
              });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            <FaPlus />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <p className="text-sm text-gray-600 mb-1">Total Fleet</p>
            <p className="text-2xl font-bold text-gray-900">
              {vehicles.length}
            </p>
            <p className="text-sm text-gray-500 mt-2">Unique vehicles</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <p className="text-sm text-gray-600 mb-1">Total Units</p>
            <p className="text-2xl font-bold text-amber-600">
              {vehicles.reduce((sum, v) => sum + (v.totalUnits || 1), 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Across all models</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <p className="text-sm text-gray-600 mb-1">Available Units</p>
            <p className="text-2xl font-bold text-green-600">
              {vehicles.reduce((sum, v) => sum + (v.availableUnits || 0), 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Ready for booking</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <p className="text-sm text-gray-600 mb-1">Categories</p>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(vehicles.map((v) => v.category)).size}
            </p>
            <p className="text-sm text-gray-500 mt-2">Vehicle types</p>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex overflow-x-auto gap-2 pb-1">
            <button
              onClick={() => {
                setActiveTab("all");
                handleFilterChange("category", "all");
              }}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-medium ${
                activeTab === "all" || !activeTab
                  ? "bg-amber-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              All Vehicles
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveTab(cat.value);
                  handleFilterChange("category", cat.value);
                }}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 font-medium ${
                  activeTab === cat.value
                    ? "bg-amber-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <cat.icon className="text-sm" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category, features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                showFilters
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFilter />
              <span>Advanced Filters</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Rating
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                        <option value="0">Any</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                        <option value="4.8">4.8+ Stars</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                        <option value="all">All</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kisumu">Kisumu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passengers
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                        <option value="0">Any</option>
                        <option value="4">4+ seats</option>
                        <option value="5">5+ seats</option>
                        <option value="7">7+ seats</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between"
          >
            <p className="text-amber-800 font-medium">
              <span className="font-bold">{selectedIds.length}</span> vehicles
              selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate("available")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Mark Available
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("maintenance")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Mark Maintenance
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            // CRITICAL FIX: Convert ID to string for all uses
            const vehicleId = vehicle._id?.toString();
            console.log(
              "🚗 Rendering vehicle:",
              vehicle.name,
              "ID:",
              vehicleId,
            );

            const status = getStatusBadge(vehicle);
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={vehicleId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] relative"
              >
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(vehicleId)}
                    onChange={() => handleSelectOne(vehicleId)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                </div>

                <div className="relative h-48 bg-gray-100">
                  <img
                    src={
                      vehicle.thumbnail ||
                      "https://via.placeholder.com/400x200?text=No+Image"
                    }
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                    >
                      <StatusIcon className="text-xs" />
                      {status.label}
                    </span>
                  </div>
                  {vehicle.rating && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      {vehicle.rating} ({vehicle.reviewCount || 0})
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {vehicle.category?.replace("_", " ")} • {vehicle.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-amber-600" />
                      {vehicle.capacity?.passengers} seats
                    </span>
                    <span className="flex items-center gap-1">
                      <FaSuitcase className="text-amber-600" />
                      {vehicle.capacity?.luggage} luggage
                    </span>
                  </div>

                  <div className="mb-4 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-amber-600" />
                      {vehicle.baseLocation?.city}
                      {vehicle.baseLocation?.address &&
                        ` • ${vehicle.baseLocation.address.substring(0, 30)}${vehicle.baseLocation.address.length > 30 ? "..." : ""}`}
                    </span>
                  </div>

                  {vehicle.serviceLocations &&
                    vehicle.serviceLocations.length > 0 && (
                      <div className="mb-4 flex flex-wrap items-center gap-1">
                        <FaGlobe className="text-amber-600 text-xs" />
                        <span className="text-xs text-gray-600">
                          Service in:
                        </span>
                        {vehicle.serviceLocations.slice(0, 2).map((loc, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {loc}
                          </span>
                        ))}
                        {vehicle.serviceLocations.length > 2 && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            +{vehicle.serviceLocations.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Hourly</p>
                      <p className="font-bold text-amber-600 text-sm">
                        {formatCurrency(vehicle.pricing?.hourly?.rate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        min {vehicle.pricing?.hourly?.min}h
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Daily</p>
                      <p className="font-bold text-amber-600 text-sm">
                        {formatCurrency(vehicle.pricing?.daily)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Weekly</p>
                      <p className="font-bold text-amber-600 text-sm">
                        {formatCurrency(vehicle.pricing?.weekly)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicle.features?.slice(0, 3).map((feature, i) => {
                      const featureIcon =
                        featuresList.find((f) =>
                          feature.toLowerCase().includes(f.value.toLowerCase()),
                        )?.icon || FaStar;
                      const Icon = featureIcon;
                      return (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Icon className="text-amber-600 text-xs" />
                          {feature.length > 15
                            ? feature.substring(0, 15) + "..."
                            : feature}
                        </span>
                      );
                    })}
                    {(vehicle.features?.length || 0) > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        +{vehicle.features.length - 3} more
                      </span>
                    )}
                  </div>

                  {vehicle.tags && vehicle.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mb-4">
                      <FaTags className="text-amber-600 text-xs" />
                      {vehicle.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {vehicle.tags.length > 2 && (
                        <span className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded">
                          +{vehicle.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
                    <span className="flex items-center gap-1">
                      <FaBoxes className="text-amber-600" />
                      {vehicle.availableUnits} of {vehicle.totalUnits} available
                    </span>
                    {vehicle.instantBook && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                        Instant Book
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        console.log(
                          "👁️ View button clicked for ID:",
                          vehicleId,
                        );
                        setSelectedVehicle(vehicle);
                        // CRITICAL FIX: Use the string ID in the URL
                        navigate(`?view=${vehicleId}`, { replace: true });
                      }}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 font-medium"
                    >
                      <FaEye />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 font-medium"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(vehicleId, vehicle.name)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete Vehicle"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {vehicles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaCar className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or add a new vehicle
            </p>
            <button
              onClick={() => {
                setEditingVehicle(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <FaPlus />
              Add New Vehicle
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {pagination.total}
              </span>{" "}
              vehicles
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange("page", pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>

              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handleFilterChange("page", pageNum)}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      pageNum === pagination.page
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handleFilterChange("page", pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Vehicle Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-gray-500 text-xl" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            defaultValue={formData.name}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                            placeholder="e.g., Toyota Land Cruiser Prado"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year *
                          </label>
                          <input
                            type="number"
                            name="year"
                            required
                            min="2000"
                            max={new Date().getFullYear() + 1}
                            defaultValue={formData.year}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thumbnail URL
                          </label>
                          <input
                            type="url"
                            name="thumbnail"
                            defaultValue={formData.thumbnail}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Capacity
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passengers *
                          </label>
                          <input
                            type="number"
                            name="passengerCapacity"
                            required
                            min="1"
                            max="20"
                            defaultValue={formData.passengerCapacity}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Luggage Capacity *
                          </label>
                          <input
                            type="number"
                            name="luggageCapacity"
                            required
                            min="0"
                            max="10"
                            defaultValue={formData.luggageCapacity}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Ratings
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating (0-5)
                          </label>
                          <input
                            type="number"
                            name="rating"
                            step="0.1"
                            min="0"
                            max="5"
                            defaultValue={formData.rating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Review Count
                          </label>
                          <input
                            type="number"
                            name="reviewCount"
                            min="0"
                            defaultValue={formData.reviewCount}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Location
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              name="locationCity"
                              required
                              defaultValue={formData.locationCity}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              name="locationAddress"
                              defaultValue={formData.locationAddress}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Latitude
                            </label>
                            <input
                              type="number"
                              name="latitude"
                              step="0.0001"
                              defaultValue={formData.latitude}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Longitude
                            </label>
                            <input
                              type="number"
                              name="longitude"
                              step="0.0001"
                              defaultValue={formData.longitude}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Locations (comma-separated)
                          </label>
                          <input
                            type="text"
                            name="serviceLocations"
                            defaultValue={formData.serviceLocations?.join(", ")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            placeholder="Nairobi, Mombasa, Kisumu"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Pricing (KES)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hourly Rate *
                          </label>
                          <input
                            type="number"
                            name="hourlyRate"
                            required
                            min="0"
                            defaultValue={formData.hourlyRate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Hours
                          </label>
                          <input
                            type="number"
                            name="hourlyMin"
                            min="1"
                            defaultValue={formData.hourlyMin}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Daily Rate *
                          </label>
                          <input
                            type="number"
                            name="dailyRate"
                            required
                            min="0"
                            defaultValue={formData.dailyRate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weekly Rate
                          </label>
                          <input
                            type="number"
                            name="weeklyRate"
                            min="0"
                            defaultValue={formData.weeklyRate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Inventory
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Units *
                          </label>
                          <input
                            type="number"
                            name="totalUnits"
                            required
                            min="1"
                            defaultValue={formData.totalUnits}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Available Units
                          </label>
                          <input
                            type="number"
                            name="availableUnits"
                            min="0"
                            defaultValue={formData.availableUnits}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Features
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Features (comma-separated)
                        </label>
                        <input
                          type="text"
                          name="features"
                          defaultValue={formData.features?.join(", ")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          placeholder="WiFi, Climate Control, 4WD, Navigation System"
                        />
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Tags
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          name="tags"
                          defaultValue={formData.tags?.join(", ")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          placeholder="suv, offroad, family, luxury"
                        />
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Options
                      </h3>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="instantBook"
                          defaultChecked={formData.instantBook}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">
                          Instant Booking Available
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                      >
                        {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vehicle Details Modal */}
        <AnimatePresence>
          {selectedVehicle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setSelectedVehicle(null);
                navigate(".", { replace: true });
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Vehicle Details
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedVehicle(null);
                        navigate(".", { replace: true });
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-gray-500 text-xl" />
                    </button>
                  </div>

                  {selectedVehicle && (
                    <div className="space-y-6">
                      <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={
                            selectedVehicle.thumbnail ||
                            "https://via.placeholder.com/800x400?text=No+Image"
                          }
                          alt={selectedVehicle.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600">Vehicle Name</p>
                          <p className="font-medium text-lg text-gray-900">
                            {selectedVehicle.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Year</p>
                          <p className="font-medium text-gray-900">
                            {selectedVehicle.year}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="capitalize text-gray-900">
                            {selectedVehicle.category?.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="flex items-center gap-1 text-gray-900">
                            <FaStar className="text-yellow-400" />
                            {selectedVehicle.rating} (
                            {selectedVehicle.reviewCount || 0} reviews)
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Passenger Capacity
                          </p>
                          <p className="font-medium text-lg text-gray-900">
                            {selectedVehicle.capacity?.passengers} seats
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Luggage Capacity
                          </p>
                          <p className="font-medium text-lg text-gray-900">
                            {selectedVehicle.capacity?.luggage} pieces
                          </p>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-amber-600" />
                          Location
                        </h3>
                        <p className="text-gray-700">
                          <span className="text-gray-600">City:</span>{" "}
                          {selectedVehicle.baseLocation?.city}
                        </p>
                        {selectedVehicle.baseLocation?.address && (
                          <p className="text-gray-700">
                            <span className="text-gray-600">Address:</span>{" "}
                            {selectedVehicle.baseLocation.address}
                          </p>
                        )}
                      </div>

                      {selectedVehicle.serviceLocations &&
                        selectedVehicle.serviceLocations.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Service Locations
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {selectedVehicle.serviceLocations.map(
                                (loc, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 bg-amber-50 text-amber-800 rounded-lg text-sm"
                                  >
                                    {loc}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Hourly</p>
                          <p className="font-bold text-2xl text-amber-600">
                            {formatCurrency(
                              selectedVehicle.pricing?.hourly?.rate,
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            min {selectedVehicle.pricing?.hourly?.min}h
                          </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Daily</p>
                          <p className="font-bold text-2xl text-amber-600">
                            {formatCurrency(selectedVehicle.pricing?.daily)}
                          </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Weekly</p>
                          <p className="font-bold text-2xl text-amber-600">
                            {formatCurrency(selectedVehicle.pricing?.weekly)}
                          </p>
                        </div>
                      </div>

                      {selectedVehicle.features &&
                        selectedVehicle.features.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Features
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {selectedVehicle.features.map((feature, i) => {
                                const featureIcon =
                                  featuresList.find((f) =>
                                    feature
                                      .toLowerCase()
                                      .includes(f.value.toLowerCase()),
                                  )?.icon || FaStar;
                                const Icon = featureIcon;
                                return (
                                  <span
                                    key={i}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-1"
                                  >
                                    <Icon className="text-amber-600" />{" "}
                                    {feature}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {selectedVehicle.tags &&
                        selectedVehicle.tags.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedVehicle.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Units</p>
                          <p className="font-bold text-2xl text-blue-600">
                            {selectedVehicle.totalUnits || 1}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Available Units
                          </p>
                          <p className="font-bold text-2xl text-green-600">
                            {selectedVehicle.availableUnits || 0}
                          </p>
                        </div>
                      </div>

                      {selectedVehicle.instantBook && (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                          <FaCheckCircle />
                          <span className="font-medium">
                            Instant Booking Available
                          </span>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
                        <p>
                          Created:{" "}
                          {new Date(selectedVehicle.createdAt).toLocaleString()}
                        </p>
                        <p>
                          Updated:{" "}
                          {new Date(selectedVehicle.updatedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setSelectedVehicle(null);
                            handleEdit(selectedVehicle);
                          }}
                          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                        >
                          Edit Vehicle
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicle(null);
                            handleDelete(
                              selectedVehicle._id.toString(),
                              selectedVehicle.name,
                            );
                          }}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Delete Vehicle
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {fetcher.state === "submitting" && (
          <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span className="font-medium">Saving...</span>
          </div>
        )}
      </div>
    </div>
  );
}
