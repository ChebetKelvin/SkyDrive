// routes/admin.users.jsx
import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaCar,
  FaUserCog,
  FaTimesCircle,
  FaBan,
  FaEye,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaDownload,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";

// Import admin functions
import {
  getAllUsers,
  getUserStats,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserBookings,
} from "../.server/admin.js";

export async function loader({ request }) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role") || "all";
  const status = url.searchParams.get("status") || "all";
  const page = parseInt(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") || "desc";
  const viewUser = url.searchParams.get("view");

  console.log("🔍 Loader - viewUser param:", viewUser);

  const [data, stats] = await Promise.all([
    getAllUsers({
      role: role !== "all" ? role : null,
      status: status !== "all" ? status : null,
      page,
      search,
      sortBy,
      sortOrder,
    }),
    getUserStats(),
  ]);

  let selectedUser = null;
  if (viewUser && viewUser !== "[object Object]") {
    console.log("🔍 Loading user with ID:", viewUser);
    selectedUser = await getUserBookings(viewUser);
  }

  // Serialize ObjectIds to strings
  const serializedUsers = data.users.map((user) => ({
    ...user,
    _id: user._id?.toString() || user._id,
  }));

  const serializedSelectedUser = selectedUser
    ? {
        ...selectedUser,
        _id: selectedUser._id?.toString() || selectedUser._id,
      }
    : null;

  return {
    ...data,
    users: serializedUsers,
    stats,
    filters: { role, status, page, search, sortBy, sortOrder },
    selectedUser: serializedSelectedUser,
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "updateRole": {
      const rawUserId = formData.get("userId");
      const userId = rawUserId?.toString();
      const newRole = formData.get("role");

      console.log("🎯 Update role - userId:", userId, "role:", newRole);

      if (!userId || userId === "[object Object]") {
        return { error: "Invalid user ID format" };
      }

      await updateUserRole(userId, newRole);
      return { success: true, message: `User role updated to ${newRole}` };
    }

    case "updateStatus": {
      const rawUserId = formData.get("userId");
      const userId = rawUserId?.toString();
      const newStatus = formData.get("status");

      console.log("🎯 Update status - userId:", userId, "status:", newStatus);

      if (!userId || userId === "[object Object]") {
        return { error: "Invalid user ID format" };
      }

      await updateUserStatus(userId, newStatus);
      return { success: true, message: `User status updated to ${newStatus}` };
    }

    case "delete": {
      const rawUserId = formData.get("userId");
      const userId = rawUserId?.toString();

      console.log("🗑️ Delete user - userId:", userId);

      if (!userId || userId === "[object Object]") {
        return { error: "Invalid user ID format" };
      }

      await deleteUser(userId);
      return { success: true, message: "User deleted successfully" };
    }

    case "bulkUpdate": {
      const rawUserIds = formData.get("userIds");
      const userIds = rawUserIds?.split(",").map((id) => id.trim()) || [];
      const bulkAction = formData.get("bulkAction");
      const bulkValue = formData.get("bulkValue");

      console.log(
        "📦 Bulk update - users:",
        userIds,
        "action:",
        bulkAction,
        "value:",
        bulkValue,
      );

      await Promise.all(
        userIds.map((id) => {
          if (id && id !== "[object Object]") {
            if (bulkAction === "role") return updateUserRole(id, bulkValue);
            if (bulkAction === "status") return updateUserStatus(id, bulkValue);
          }
        }),
      );
      return {
        success: true,
        message: `${userIds.length} users updated successfully`,
      };
    }

    default:
      return { error: "Invalid action" };
  }
}

export default function AdminUsers() {
  const {
    users,
    pagination,
    stats,
    filters,
    selectedUser: initialSelected,
  } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(initialSelected || null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [bulkAction, setBulkAction] = useState({ type: "", value: "" });

  // Debounce search
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

  const handleSort = (key) => {
    const params = new URLSearchParams(window.location.search);
    const currentSort = filters.sortBy;
    const currentOrder = filters.sortOrder;

    if (currentSort === key) {
      params.set("sortOrder", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", key);
      params.set("sortOrder", "asc");
    }
    navigate(`?${params.toString()}`);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u._id.toString()));
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

  const handleBulkAction = () => {
    if (selectedIds.length === 0 || !bulkAction.type) return;

    if (
      confirm(
        `Are you sure you want to ${bulkAction.type} ${selectedIds.length} users to ${bulkAction.value}?`,
      )
    ) {
      fetcher.submit(
        {
          action: "bulkUpdate",
          userIds: selectedIds.join(","),
          bulkAction: bulkAction.type,
          bulkValue: bulkAction.value,
        },
        { method: "post" },
      );
      setSelectedIds([]);
      setBulkAction({ type: "", value: "" });
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: FaUserCog,
        label: "Admin",
      },
      user: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: FaUser,
        label: "User",
      },
      driver: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: FaCar,
        label: "Driver",
      },
    };
    const conf = config[role] || config.user;
    const Icon = conf.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${conf.bg} ${conf.text}`}
      >
        <Icon className="text-xs" />
        <span className="hidden sm:inline">{conf.label}</span>
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: FaUserCheck,
        label: "Active",
      },
      inactive: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: FaUserTimes,
        label: "Inactive",
      },
      suspended: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: FaBan,
        label: "Suspended",
      },
    };
    const conf = config[status] || config.active;
    const Icon = conf.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${conf.bg} ${conf.text}`}
      >
        <Icon className="text-xs" />
        <span className="hidden sm:inline">{conf.label}</span>
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const statsCards = [
    {
      label: "Total Users",
      value: stats?.total || 0,
      icon: FaUsers,
      color: "bg-blue-500",
      change: "+12% this month",
    },
    {
      label: "Active",
      value: stats?.active || 0,
      icon: FaUserCheck,
      color: "bg-green-500",
      change: `${((stats?.active / stats?.total) * 100 || 0).toFixed(1)}%`,
    },
    {
      label: "New This Month",
      value: stats?.newThisMonth || 0,
      icon: FaUser,
      color: "bg-purple-500",
      change: "New signups",
    },
    {
      label: "Admins",
      value: stats?.admins || 0,
      icon: FaUserCog,
      color: "bg-orange-500",
      change: "System admins",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6 pb-20 sm:pb-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Manage your customers and their permissions
            </p>
          </div>
          <div className="flex gap-1 sm:gap-2 self-end sm:self-auto">
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <FaSync className="text-xs sm:text-sm" />
            </button>
            <button
              className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export"
            >
              <FaDownload className="text-xs sm:text-sm" />
            </button>
          </div>
        </div>

        {/* Stats Cards - Simplified on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">
                    {stat.label}
                  </p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 sm:mt-2 hidden sm:block">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                  <stat.icon className="text-white text-sm sm:text-xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters - Mobile optimized */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Filters Row - Horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900 bg-white"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="driver">Drivers</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors font-medium whitespace-nowrap ${
                  showFilters
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaFilter className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Joined After
                      </label>
                      <input
                        type="date"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Joined Before
                      </label>
                      <input
                        type="date"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min Bookings
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs border border-gray-300 rounded-lg text-gray-900"
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions - Simplified */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                <span className="font-bold">{selectedIds.length}</span> selected
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <select
                  value={bulkAction.type}
                  onChange={(e) =>
                    setBulkAction({ type: e.target.value, value: "" })
                  }
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs border border-amber-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="">Action</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                </select>

                {bulkAction.type === "role" && (
                  <select
                    value={bulkAction.value}
                    onChange={(e) =>
                      setBulkAction({ ...bulkAction, value: e.target.value })
                    }
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs border border-amber-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="">Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="driver">Driver</option>
                  </select>
                )}

                {bulkAction.type === "status" && (
                  <select
                    value={bulkAction.value}
                    onChange={(e) =>
                      setBulkAction({ ...bulkAction, value: e.target.value })
                    }
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs border border-amber-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="">Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                )}

                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction.type || !bulkAction.value}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  Apply
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile View: User Cards */}
        <div className="block lg:hidden space-y-3">
          {users.map((user) => {
            const userId = user._id?.toString();
            return (
              <motion.div
                key={userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-3"
              >
                {/* User Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(userId)}
                      onChange={() => handleSelectOne(userId)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-amber-600 text-xs" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2 mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs flex items-center gap-1 text-gray-700">
                    <FaEnvelope className="text-gray-500 text-xs" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  {user.phone && (
                    <p className="text-xs flex items-center gap-1 text-gray-700">
                      <FaPhone className="text-gray-500 text-xs" />
                      {user.phone}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-xs flex items-center gap-1 text-gray-700">
                      <FaCalendarAlt className="text-gray-500 text-xs" />
                      {formatDate(user.createdAt)}
                    </p>
                    <p className="text-xs font-medium text-amber-600">
                      {user.bookingCount || 0} bookings
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      navigate(`?view=${userId}`, { replace: true });
                    }}
                    className="flex-1 px-2 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <FaEye className="text-xs" />
                    View
                  </button>
                  <select
                    onChange={(e) => {
                      fetcher.submit(
                        {
                          action: "updateRole",
                          userId: userId,
                          role: e.target.value,
                        },
                        { method: "post" },
                      );
                    }}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-700"
                    value={user.role}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="driver">Driver</option>
                  </select>
                  <select
                    onChange={(e) => {
                      fetcher.submit(
                        {
                          action: "updateStatus",
                          userId: userId,
                          status: e.target.value,
                        },
                        { method: "post" },
                      );
                    }}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-700"
                    value={user.status}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === users.length && users.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => {
                  const userId = user._id?.toString();

                  return (
                    <motion.tr
                      key={userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(userId)}
                          onChange={() => handleSelectOne(userId)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1 text-gray-700">
                            <FaEnvelope className="text-gray-500" />
                            <span className="truncate max-w-50">
                              {user.email}
                            </span>
                          </p>
                          {user.phone && (
                            <p className="text-sm flex items-center gap-1 text-gray-700">
                              <FaPhone className="text-gray-500" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <FaCalendarAlt className="text-gray-500" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {user.bookingCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              navigate(`?view=${userId}`, { replace: true });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <select
                            onChange={(e) => {
                              fetcher.submit(
                                {
                                  action: "updateRole",
                                  userId: userId,
                                  role: e.target.value,
                                },
                                { method: "post" },
                              );
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
                            value={user.role}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="driver">Driver</option>
                          </select>
                          <select
                            onChange={(e) => {
                              fetcher.submit(
                                {
                                  action: "updateStatus",
                                  userId: userId,
                                  status: e.target.value,
                                },
                                { method: "post" },
                              );
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
                            value={user.status}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl shadow">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FaUsers className="text-gray-400 text-xl sm:text-2xl" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
              No users found
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Try adjusting your filters
            </p>
          </div>
        )}

        {/* Pagination - Simplified on mobile */}
        {pagination.pages > 1 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow px-3 sm:px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              <span className="hidden sm:inline">Showing </span>
              <span className="font-medium text-gray-900">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              -{" "}
              <span className="font-medium text-gray-900">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>
              <span className="hidden sm:inline"> of {pagination.total}</span>
            </p>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => handleFilterChange("page", pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 sm:p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                <FaChevronLeft className="text-xs sm:text-sm" />
              </button>

              {/* Mobile page indicator */}
              <span className="sm:hidden px-2 py-1.5 text-xs">
                {pagination.page}/{pagination.pages}
              </span>

              {/* Desktop page numbers */}
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
                    className={`hidden sm:block px-3 py-1.5 text-sm rounded-lg transition-colors font-medium ${
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
                className="p-1.5 sm:p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                <FaChevronRight className="text-xs sm:text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* User Details Modal - Responsive */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
              onClick={() => {
                setSelectedUser(null);
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
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                      User Details
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        navigate(".", { replace: true });
                      }}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-gray-500 text-lg sm:text-xl" />
                    </button>
                  </div>

                  {selectedUser && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* User Profile Header */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-linear-to-r from-amber-50 to-orange-50 rounded-xl">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-600 rounded-full flex items-center justify-center">
                          <FaUser className="text-white text-xl sm:text-3xl" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {selectedUser.name}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600">
                            @{selectedUser.username}
                          </p>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                            {getRoleBadge(selectedUser.role)}
                            {getStatusBadge(selectedUser.status)}
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                          <p className="text-xs text-gray-600 mb-1">Email</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-2 break-all">
                            <FaEnvelope className="text-amber-600 shrink-0" />
                            {selectedUser.email}
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                          <p className="text-xs text-gray-600 mb-1">Phone</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <FaPhone className="text-amber-600 shrink-0" />
                            {selectedUser.phone || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {/* Account Statistics */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="bg-blue-50 rounded-lg p-2 sm:p-4 text-center">
                          <p className="text-base sm:text-2xl font-bold text-blue-600">
                            {selectedUser.bookingCount || 0}
                          </p>
                          <p className="text-xs text-gray-700">Bookings</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 sm:p-4 text-center">
                          <p className="text-base sm:text-2xl font-bold text-green-600">
                            {selectedUser.activeBookings || 0}
                          </p>
                          <p className="text-xs text-gray-700">Active</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2 sm:p-4 text-center">
                          <p className="text-sm sm:text-2xl font-bold text-purple-600 truncate">
                            {formatCurrency(selectedUser.totalSpent || 0)}
                          </p>
                          <p className="text-xs text-gray-700">Spent</p>
                        </div>
                      </div>

                      {/* Recent Bookings */}
                      {selectedUser.recentBookings &&
                        selectedUser.recentBookings.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">
                              Recent Bookings
                            </h3>
                            <div className="space-y-2">
                              {selectedUser.recentBookings
                                .slice(0, 3)
                                .map((booking) => {
                                  const bookingId = booking._id?.toString();
                                  return (
                                    <div
                                      key={bookingId}
                                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
                                    >
                                      <div>
                                        <p className="font-medium text-sm text-gray-900">
                                          {booking.vehicleName}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {new Date(
                                            booking.pickupDate,
                                          ).toLocaleDateString()}{" "}
                                          at {booking.pickupTime}
                                        </p>
                                      </div>
                                      <div className="flex items-center justify-between sm:justify-end gap-3">
                                        <p className="font-medium text-sm text-amber-600">
                                          {formatCurrency(
                                            booking.totalAmount || 0,
                                          )}
                                        </p>
                                        {getStatusBadge(booking.status)}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                      {/* Account Timeline */}
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">
                          Account Timeline
                        </h3>
                        <div className="space-y-1 sm:space-y-2 text-xs">
                          <p className="text-gray-700">
                            <span className="text-gray-600">Joined:</span>{" "}
                            {new Date(selectedUser.createdAt).toLocaleString()}
                          </p>
                          <p className="text-gray-700">
                            <span className="text-gray-600">Last Active:</span>{" "}
                            {selectedUser.lastActive
                              ? new Date(
                                  selectedUser.lastActive,
                                ).toLocaleString()
                              : "Never"}
                          </p>
                          <p className="text-gray-700">
                            <span className="text-gray-600">Last Updated:</span>{" "}
                            {new Date(selectedUser.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                        <select
                          onChange={(e) => {
                            fetcher.submit(
                              {
                                action: "updateRole",
                                userId: selectedUser._id?.toString(),
                                role: e.target.value,
                              },
                              { method: "post" },
                            );
                          }}
                          className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700"
                          value={selectedUser.role}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="driver">Driver</option>
                        </select>
                        <select
                          onChange={(e) => {
                            fetcher.submit(
                              {
                                action: "updateStatus",
                                userId: selectedUser._id?.toString(),
                                status: e.target.value,
                              },
                              { method: "post" },
                            );
                          }}
                          className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700"
                          value={selectedUser.status}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this user?",
                              )
                            ) {
                              fetcher.submit(
                                {
                                  action: "delete",
                                  userId: selectedUser._id?.toString(),
                                },
                                { method: "post" },
                              );
                              setSelectedUser(null);
                            }
                          }}
                          className="px-3 sm:px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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

        {/* Status Messages */}
        <AnimatePresence>
          {fetcher.data && fetcher.data.message && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg font-medium text-xs sm:text-sm"
            >
              {fetcher.data.message}
            </motion.div>
          )}
          {fetcher.data && fetcher.data.error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg font-medium text-xs sm:text-sm"
            >
              {fetcher.data.error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {fetcher.state === "submitting" && (
          <div className="fixed bottom-4 left-4 bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium text-xs sm:text-sm">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
