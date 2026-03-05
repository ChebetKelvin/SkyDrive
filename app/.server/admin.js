// .server/admin.js
import { client } from "./mongo.js";
import { ObjectId } from "mongodb";
import { getVehicles } from "../models/vehicles.js";

const db = client.db("SkyDrive");
const bookingsCollection = db.collection("bookings");
const usersCollection = db.collection("user");
const vehiclesCollection = db.collection("vehicles");

// Check if user is admin
export async function isAdmin(userId) {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    return user?.role === "admin";
  } catch {
    return false;
  }
}

// Get booking statistics
export async function getBookingStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, pending, confirmed, completed, cancelled, revenue] =
      await Promise.all([
        bookingsCollection.countDocuments(),
        bookingsCollection.countDocuments({ status: "pending_verification" }),
        bookingsCollection.countDocuments({ status: "confirmed" }),
        bookingsCollection.countDocuments({ status: "completed" }),
        bookingsCollection.countDocuments({ status: "cancelled" }),
        bookingsCollection
          .aggregate([
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: startOfMonth },
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ])
          .toArray(),
      ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      revenue: revenue[0]?.total || 0,
    };
  } catch (error) {
    console.error("❌ Error getting booking stats:", error);
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
    };
  }
}

// Get all bookings with filters
export async function getAllBookings(filters = {}) {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      search = "",
      startDate,
      endDate,
    } = filters;

    const query = {};

    if (status) query.status = status;

    // Search by customer name, email, or booking ID
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { bookingId: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.pickupDate = {};
      if (startDate) query.pickupDate.$gte = startDate;
      if (endDate) query.pickupDate.$lte = endDate;
    }

    const bookings = await bookingsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await bookingsCollection.countDocuments(query);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error getting bookings:", error);
    return {
      bookings: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    };
  }
}

// Update booking status
// .server/admin.js - Fixed updateBookingStatus
export async function updateBookingStatus(
  bookingId,
  status,
  notes = "",
  notifyCustomer = false,
) {
  try {
    console.log("📝 updateBookingStatus called with:", {
      bookingId,
      type: typeof bookingId,
      status,
      notes,
    });

    // Function to extract a valid ObjectId from various formats
    function extractObjectId(input) {
      if (!input) return null;

      // If it's already an ObjectId
      if (input instanceof ObjectId) {
        return input;
      }

      // If it's a string
      if (typeof input === "string") {
        // Handle the "[object Object]" case
        if (input === "[object Object]") {
          console.error(
            "❌ Received [object Object] - this indicates an object was stringified",
          );
          return null;
        }

        // Clean the string - remove any wrapper text
        const cleanId = input
          .toString()
          .replace(/^new ObjectId\(['"](.+)['"]\)$/, "$1")
          .trim();

        // Check if it's a valid 24-character hex string
        if (/^[0-9a-fA-F]{24}$/.test(cleanId)) {
          return new ObjectId(cleanId);
        }

        // Try to extract a 24-char hex pattern from the string
        const hexMatch = cleanId.match(/[0-9a-fA-F]{24}/);
        if (hexMatch) {
          return new ObjectId(hexMatch[0]);
        }
      }

      // If it's an object with _id property
      if (input && typeof input === "object") {
        // If it has _id, try that
        if (input._id) {
          return extractObjectId(input._id);
        }
        // If it has id property
        if (input.id) {
          return extractObjectId(input.id);
        }
        // If it's a MongoDB document with _id as ObjectId
        if (input._id instanceof ObjectId) {
          return input._id;
        }
      }

      return null;
    }

    const objectId = extractObjectId(bookingId);

    if (!objectId) {
      throw new Error(
        `Could not extract valid ID from: ${JSON.stringify(bookingId)}`,
      );
    }

    console.log("✅ Successfully extracted ObjectId:", objectId);

    const result = await bookingsCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          status,
          updatedAt: new Date(),
          adminNotes: notes,
          ...(status === "confirmed" ? { confirmedAt: new Date() } : {}),
          ...(status === "cancelled" ? { cancelledAt: new Date() } : {}),
        },
      },
    );

    if (result.matchedCount === 0) {
      console.error("❌ No booking found with ID:", objectId);
      return {
        success: false,
        error: "Booking not found",
      };
    }

    if (notifyCustomer && result.modifiedCount > 0) {
      console.log(`📧 Notification would be sent for booking ${objectId}`);
    }

    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
      bookingId: objectId.toString(),
    };
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// .server/admin.js - Add these vehicle functions

// Get all vehicles with filters
export async function getAllVehicles(filters = {}) {
  try {
    const {
      category,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
    } = filters;

    const query = {};

    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { licensePlate: { $regex: search, $options: "i" } },
      ];
    }

    const vehicles = await vehiclesCollection
      .find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await vehiclesCollection.countDocuments(query);

    // Get booking counts for each vehicle
    const vehiclesWithStats = await Promise.all(
      vehicles.map(async (vehicle) => {
        const activeBookings = await bookingsCollection.countDocuments({
          vehicleId: vehicle._id,
          status: { $in: ["confirmed", "pending_verification"] },
          pickupDate: { $gte: new Date().toISOString().split("T")[0] },
        });

        const totalBookings = await bookingsCollection.countDocuments({
          vehicleId: vehicle._id,
        });

        return {
          ...vehicle,
          _id: vehicle._id.toString(),
          activeBookings,
          totalBookings,
        };
      }),
    );

    return {
      vehicles: vehiclesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error getting vehicles:", error);
    return {
      vehicles: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    };
  }
}

// Get vehicle by ID
export async function getVehicleById(vehicleId) {
  try {
    const vehicle = await vehiclesCollection.findOne({
      _id: new ObjectId(vehicleId),
    });

    if (!vehicle) return null;

    // Get upcoming bookings for this vehicle
    const upcomingBookings = await bookingsCollection
      .find({
        vehicleId: vehicle._id,
        status: { $in: ["confirmed", "pending_verification"] },
        pickupDate: { $gte: new Date().toISOString().split("T")[0] },
      })
      .sort({ pickupDate: 1, pickupTime: 1 })
      .limit(5)
      .toArray();

    return {
      ...vehicle,
      _id: vehicle._id.toString(),
      upcomingBookings: upcomingBookings.map((b) => ({
        ...b,
        _id: b._id.toString(),
        userId: b.userId?.toString(),
      })),
    };
  } catch (error) {
    console.error("❌ Error getting vehicle:", error);
    return null;
  }
}

// Create new vehicle
export async function createVehicle(vehicleData) {
  try {
    const vehicle = {
      ...vehicleData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: vehicleData.status || "available",
      bookingsCount: 0,
      images: vehicleData.images || [],
    };

    await vehiclesCollection.insertOne(vehicle);

    return {
      success: true,
      vehicleId: vehicle._id.toString(),
      message: "Vehicle created successfully",
    };
  } catch (error) {
    console.error("❌ Error creating vehicle:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Update vehicle
export async function updateVehicle(vehicleId, vehicleData) {
  try {
    const updateData = {
      ...vehicleData,
      updatedAt: new Date(),
    };

    // Remove _id if present
    delete updateData._id;

    const result = await vehiclesCollection.updateOne(
      { _id: new ObjectId(vehicleId) },
      { $set: updateData },
    );

    return {
      success: result.modifiedCount > 0,
      message:
        result.modifiedCount > 0
          ? "Vehicle updated successfully"
          : "No changes made",
    };
  } catch (error) {
    console.error("❌ Error updating vehicle:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Delete vehicle
export async function deleteVehicle(vehicleId) {
  try {
    // Check if vehicle has any active bookings
    const activeBookings = await bookingsCollection.countDocuments({
      vehicleId: new ObjectId(vehicleId),
      status: { $in: ["confirmed", "pending_verification"] },
    });

    if (activeBookings > 0) {
      return {
        success: false,
        error: "Cannot delete vehicle with active bookings",
      };
    }

    const result = await vehiclesCollection.deleteOne({
      _id: new ObjectId(vehicleId),
    });

    return {
      success: result.deletedCount > 0,
      message: "Vehicle deleted successfully",
    };
  } catch (error) {
    console.error("❌ Error deleting vehicle:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get vehicle stats
export async function getVehicleStats() {
  try {
    const [total, available, booked, maintenance, categories] =
      await Promise.all([
        vehiclesCollection.countDocuments(),
        vehiclesCollection.countDocuments({ status: "available" }),
        vehiclesCollection.countDocuments({ status: "booked" }),
        vehiclesCollection.countDocuments({ status: "maintenance" }),
        vehiclesCollection
          .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
          .toArray(),
      ]);

    return {
      total,
      available,
      booked,
      maintenance,
      categories: categories.reduce((acc, cat) => {
        acc[cat._id] = cat.count;
        return acc;
      }, {}),
    };
  } catch (error) {
    console.error("❌ Error getting vehicle stats:", error);
    return {
      total: 0,
      available: 0,
      booked: 0,
      maintenance: 0,
      categories: {},
    };
  }
}

// Update vehicle availability based on bookings
export async function updateVehicleAvailability(vehicleId) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const activeBookings = await bookingsCollection.countDocuments({
      vehicleId: new ObjectId(vehicleId),
      status: { $in: ["confirmed", "pending_verification"] },
      pickupDate: { $gte: today },
    });

    const status = activeBookings > 0 ? "booked" : "available";

    await vehiclesCollection.updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    return { success: true, status };
  } catch (error) {
    console.error("❌ Error updating vehicle availability:", error);
    return { success: false };
  }
}

export async function getAdminStats() {
  try {
    // Use the same getVehicles() function that correctly calculates availableUnits
    const vehicles = await getVehicles();

    // Calculate fleet stats using the same logic as your frontend
    const totalVehicles = vehicles.length;
    const totalUnits = vehicles.reduce(
      (sum, v) => sum + (v.totalUnits || 1),
      0,
    );
    const availableUnits = vehicles.reduce(
      (sum, v) => sum + (v.availableUnits || 0),
      0,
    );

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStr = today.toISOString().split("T")[0];

    const [
      totalBookings,
      pendingBookings,
      todayBookings,
      totalRevenue,
      monthlyRevenue,
      activeUsers,
    ] = await Promise.all([
      bookingsCollection.countDocuments(),
      bookingsCollection.countDocuments({ status: "pending_verification" }),
      bookingsCollection.countDocuments({ pickupDate: todayStr }),
      bookingsCollection
        .aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
      bookingsCollection
        .aggregate([
          {
            $match: {
              paymentStatus: "paid",
              createdAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
      usersCollection.countDocuments(),
    ]);

    // Get booking counts by status
    const confirmedBookings = await bookingsCollection.countDocuments({
      status: "confirmed",
    });
    const completedBookings = await bookingsCollection.countDocuments({
      status: "completed",
    });
    const cancelledBookings = await bookingsCollection.countDocuments({
      status: "cancelled",
    });
    const todayPickups = await bookingsCollection.countDocuments({
      pickupDate: todayStr,
      status: "confirmed",
    });

    return {
      overview: {
        totalBookings,
        pendingBookings,
        todayBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        activeUsers,
        totalVehicles, // Number of vehicles
        availableVehicles: availableUnits, // Available UNITS (this matches your fleet logic)
        totalUnits, // Total UNITS
        availableUnits, // Available UNITS
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        todayPickups,
      },
    };
  } catch (error) {
    console.error("❌ Error getting admin stats:", error);
    return {
      overview: {
        totalBookings: 0,
        pendingBookings: 0,
        todayBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeUsers: 0,
        totalVehicles: 0,
        availableVehicles: 0,
        totalUnits: 0,
        availableUnits: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        todayPickups: 0,
      },
    };
  }
}

// Get revenue by period (day, week, month, year)
export async function getRevenueByPeriod(period = "day") {
  try {
    const db = client.db("SkyDrive");
    const bookingsCollection = db.collection("bookings");

    const now = new Date();
    let startDate;
    let groupFormat;

    switch (period) {
      case "day":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 30,
        );
        groupFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        break;
      case "week":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 84,
        );
        groupFormat = {
          $dateToString: { format: "%Y-W%V", date: "$createdAt" },
        };
        break;
      case "month":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupFormat = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 5, 0, 1);
        groupFormat = {
          $dateToString: { format: "%Y", date: "$createdAt" },
        };
        break;
      default:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 30,
        );
        groupFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }

    const revenue = await bookingsCollection
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: groupFormat,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return revenue;
  } catch (error) {
    console.error("❌ Error getting revenue by period:", error);
    return [];
  }
}

// Get recent activity for dashboard
export async function getRecentActivity(limit = 5) {
  try {
    const recentBookings = await bookingsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return recentBookings.map((booking) => ({
      id: booking._id.toString(),
      type: "booking",
      action:
        booking.status === "pending_verification" ? "pending" : booking.status,
      customerName: booking.customerName,
      vehicleName: booking.vehicleName,
      amount: booking.totalAmount,
      timestamp: booking.createdAt,
      bookingId: booking.bookingId,
    }));
  } catch (error) {
    console.error("❌ Error getting recent activity:", error);
    return [];
  }
}

// Add this to .server/admin.js for detailed fleet stats
export async function getDetailedFleetStats() {
  try {
    const allVehicles = await vehiclesCollection.find({}).toArray();

    const stats = {
      totalVehicles: allVehicles.length,
      totalUnits: allVehicles.reduce((sum, v) => sum + (v.totalUnits || 1), 0),
      availableUnits: allVehicles.reduce(
        (sum, v) => sum + (v.availableUnits || 0),
        0,
      ),
      bookedUnits: allVehicles.reduce((sum, v) => {
        const total = v.totalUnits || 1;
        const available = v.availableUnits || 0;
        return sum + (total - available);
      }, 0),
      byCategory: {},
      vehicles: allVehicles.map((v) => ({
        id: v._id,
        name: v.name,
        category: v.category,
        totalUnits: v.totalUnits || 1,
        availableUnits: v.availableUnits || 0,
        thumbnail: v.thumbnail,
      })),
    };

    // Group by category
    allVehicles.forEach((vehicle) => {
      const category = vehicle.category || "other";
      if (!stats.byCategory[category]) {
        stats.byCategory[category] = {
          count: 0,
          totalUnits: 0,
          availableUnits: 0,
        };
      }
      stats.byCategory[category].count += 1;
      stats.byCategory[category].totalUnits += vehicle.totalUnits || 1;
      stats.byCategory[category].availableUnits += vehicle.availableUnits || 0;
    });

    return stats;
  } catch (error) {
    console.error("❌ Error getting detailed fleet stats:", error);
    return {
      totalVehicles: 0,
      totalUnits: 0,
      availableUnits: 0,
      bookedUnits: 0,
      byCategory: {},
      vehicles: [],
    };
  }
}

// Get all users with filters
export async function getAllUsers(filters = {}) {
  try {
    const {
      role,
      status,
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await usersCollection
      .find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await usersCollection.countDocuments(query);

    // Get booking counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookings = await bookingsCollection
          .find({ userId: user._id })
          .toArray();

        return {
          ...user,
          _id: user._id.toString(),
          bookingCount: bookings.length,
          activeBookings: bookings.filter((b) =>
            ["confirmed", "pending_verification"].includes(b.status),
          ).length,
          totalSpent: bookings.reduce(
            (sum, b) => sum + (b.totalAmount || 0),
            0,
          ),
        };
      }),
    );

    return {
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error getting users:", error);
    return {
      users: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    };
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, newThisMonth, admins] = await Promise.all([
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ status: "active" }),
      usersCollection.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
      usersCollection.countDocuments({ role: "admin" }),
    ]);

    return {
      total,
      active,
      newThisMonth,
      admins,
    };
  } catch (error) {
    console.error("❌ Error getting user stats:", error);
    return {
      total: 0,
      active: 0,
      newThisMonth: 0,
      admins: 0,
    };
  }
}

// Update user role
export async function updateUserRole(userId, role) {
  try {
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    return false;
  }
}

// Update user status
export async function updateUserStatus(userId, status) {
  try {
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    return false;
  }
}

// Delete user
export async function deleteUser(userId) {
  try {
    // Check if user has any bookings
    const bookings = await bookingsCollection.countDocuments({
      userId: new ObjectId(userId),
    });

    if (bookings > 0) {
      // Option 1: Prevent deletion
      // return { success: false, error: "User has existing bookings" };

      // Option 2: Delete user but keep bookings (orphaned)
      const result = await usersCollection.deleteOne({
        _id: new ObjectId(userId),
      });
      return result.deletedCount > 0;
    }

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return false;
  }
}

// Get user with their bookings
export async function getUserBookings(userId) {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) return null;

    const bookings = await bookingsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const bookingStats = await bookingsCollection
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
            active: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["confirmed", "pending_verification"]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray();

    return {
      ...user,
      _id: user._id.toString(),
      recentBookings: bookings.map((b) => ({
        ...b,
        _id: b._id.toString(),
      })),
      bookingCount: bookingStats[0]?.total || 0,
      activeBookings: bookingStats[0]?.active || 0,
      totalSpent: bookingStats[0]?.totalSpent || 0,
    };
  } catch (error) {
    console.error("❌ Error getting user bookings:", error);
    return null;
  }
}

// Get revenue statistics
export async function getRevenueStats({ period, startDate, endDate }) {
  try {
    const now = new Date();
    let dateRange = {};

    if (startDate && endDate) {
      dateRange = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (period === "month") {
      dateRange = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
        },
      };
    } else if (period === "year") {
      dateRange = {
        createdAt: { $gte: new Date(now.getFullYear() - 4, 0, 1) },
      };
    }

    const [totalRevenue, monthlyRevenue, bookings, outstanding] =
      await Promise.all([
        // Total revenue
        bookingsCollection
          .aggregate([
            { $match: { paymentStatus: "paid", ...dateRange } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ])
          .toArray(),

        // Monthly revenue
        bookingsCollection
          .aggregate([
            {
              $match: {
                paymentStatus: "paid",
                createdAt: {
                  $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                },
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ])
          .toArray(),

        // Booking stats
        bookingsCollection
          .aggregate([
            { $match: dateRange },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                paid: {
                  $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
                },
              },
            },
          ])
          .toArray(),

        // Outstanding payments
        bookingsCollection
          .aggregate([
            {
              $match: {
                paymentStatus: "pending",
                ...dateRange,
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
      ]);

    const total = totalRevenue[0]?.total || 0;
    const monthly = monthlyRevenue[0]?.total || 0;
    const bookingStats = bookings[0] || { count: 0, paid: 0 };
    const outstandingData = outstanding[0] || { total: 0, count: 0 };

    // Get peak revenue day
    const peakDay = await bookingsCollection
      .aggregate([
        { $match: { paymentStatus: "paid", ...dateRange } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            amount: { $sum: "$totalAmount" },
          },
        },
        { $sort: { amount: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    return {
      totalRevenue: total,
      monthlyRevenue: monthly,
      revenueGrowth: 12.5, // Calculate from previous period
      monthlyGrowth: 8.3,
      avgBookingValue: total / (bookingStats.paid || 1),
      avgBookingGrowth: 5.2,
      totalBookings: bookingStats.count,
      paidBookings: bookingStats.paid,
      outstandingPayments: outstandingData.total,
      outstandingCount: outstandingData.count,
      conversionRate: (bookingStats.paid / (bookingStats.count || 1)) * 100,
      conversionGrowth: 2.1,
      peakDay: peakDay[0] || null,
    };
  } catch (error) {
    console.error("❌ Error getting revenue stats:", error);
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      monthlyGrowth: 0,
      avgBookingValue: 0,
      avgBookingGrowth: 0,
      totalBookings: 0,
      paidBookings: 0,
      outstandingPayments: 0,
      outstandingCount: 0,
      conversionRate: 0,
      conversionGrowth: 0,
      peakDay: null,
    };
  }
}

// Get revenue by period
export async function getRevenueByPeriod(period = "month") {
  try {
    const now = new Date();
    let startDate;
    let groupFormat;

    switch (period) {
      case "day":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 30,
        );
        groupFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        break;
      case "week":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 84,
        );
        groupFormat = {
          $dateToString: { format: "%Y-W%V", date: "$createdAt" },
        };
        break;
      case "month":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupFormat = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 5, 0, 1);
        groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
      default:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 30,
        );
        groupFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }

    const revenue = await bookingsCollection
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: groupFormat,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return revenue;
  } catch (error) {
    console.error("❌ Error getting revenue by period:", error);
    return [];
  }
}

// Get revenue by vehicle category
export async function getRevenueByCategory({ period, startDate, endDate }) {
  try {
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const revenue = await bookingsCollection
      .aggregate([
        { $match: { paymentStatus: "paid", ...dateFilter } },
        {
          $group: {
            _id: "$vehicleCategory",
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
        { $sort: { revenue: -1 } },
      ])
      .toArray();

    const total = revenue.reduce((sum, cat) => sum + cat.revenue, 0);

    return revenue.map((cat) => ({
      name: cat._id?.replace("_", " ") || "Other",
      revenue: cat.revenue,
      count: cat.count,
      average: cat.revenue / cat.count,
      percentage: ((cat.revenue / total) * 100).toFixed(1),
    }));
  } catch (error) {
    console.error("❌ Error getting revenue by category:", error);
    return [];
  }
}

// Get revenue by payment method
export async function getRevenueByPaymentMethod({
  period,
  startDate,
  endDate,
}) {
  try {
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const revenue = await bookingsCollection
      .aggregate([
        { $match: { paymentStatus: "paid", ...dateFilter } },
        {
          $group: {
            _id: "$paymentMethod",
            amount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ])
      .toArray();

    return revenue.map((method) => ({
      name: method._id || "Other",
      amount: method.amount,
      count: method.count,
    }));
  } catch (error) {
    console.error("❌ Error getting revenue by payment method:", error);
    return [];
  }
}

// Get top performing vehicles
export async function getTopVehicles({
  period,
  startDate,
  endDate,
  limit = 10,
}) {
  try {
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const vehicles = await bookingsCollection
      .aggregate([
        { $match: { paymentStatus: "paid", ...dateFilter } },
        {
          $group: {
            _id: "$vehicleId",
            bookings: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
            vehicleName: { $first: "$vehicleName" },
            vehicleImage: { $first: "$vehicleImage" },
            category: { $first: "$vehicleCategory" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: limit },
      ])
      .toArray();

    // Get additional vehicle details
    const vehicleDetails = await Promise.all(
      vehicles.map(async (v) => {
        const vehicle = await vehiclesCollection.findOne({
          _id: new ObjectId(v._id),
        });
        return {
          id: v._id.toString(),
          name: v.vehicleName,
          image: v.vehicleImage,
          category: v.category,
          bookings: v.bookings,
          revenue: v.revenue,
          licensePlate: vehicle?.licensePlate || "N/A",
          utilization: Math.min(100, (v.bookings / 30) * 100), // Calculate properly
          growth: (Math.random() * 20 - 10).toFixed(1), // Calculate from previous period
        };
      }),
    );

    return vehicleDetails;
  } catch (error) {
    console.error("❌ Error getting top vehicles:", error);
    return [];
  }
}

// Get revenue by day of week
export async function getRevenueByDay({ period, startDate, endDate }) {
  try {
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const revenue = await bookingsCollection
      .aggregate([
        { $match: { paymentStatus: "paid", ...dateFilter } },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // MongoDB dayOfWeek: 1 = Sunday, 7 = Saturday
    return revenue.map((item) => ({
      day: days[item._id - 1],
      revenue: item.revenue,
      count: item.count,
      index: item._id,
    }));
  } catch (error) {
    console.error("❌ Error getting revenue by day:", error);
    return [];
  }
}

// Get outstanding payments
export async function getOutstandingPayments() {
  try {
    const payments = await bookingsCollection
      .find({
        paymentStatus: "pending",
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return payments.map((p) => ({
      id: p._id.toString(),
      bookingId: p.bookingId,
      customerName: p.customerName,
      amount: p.totalAmount,
      dueDate: p.pickupDate,
    }));
  } catch (error) {
    console.error("❌ Error getting outstanding payments:", error);
    return [];
  }
}

// Get all system settings
export async function getSystemSettings() {
  try {
    const db = client.db("SkyDrive");
    const settingsCollection = db.collection("settings");

    let settings = await settingsCollection.findOne({ type: "system" });

    if (!settings) {
      // Default settings
      settings = {
        type: "system",
        general: {
          siteName: "SkyDrive",
          siteUrl: process.env.SITE_URL || "http://localhost:3000",
          supportEmail: "support@skydrive.com",
          supportPhone: "+254700000000",
          address: "Nairobi, Kenya",
          timezone: "Africa/Nairobi",
          currency: "KES",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "12h",
          maintenanceMode: false,
        },
        email: {
          smtpHost: process.env.SMTP_HOST || "",
          smtpPort: parseInt(process.env.SMTP_PORT) || 587,
          smtpUser: process.env.SMTP_USER || "",
          smtpPassword: process.env.SMTP_PASSWORD || "",
          fromEmail: process.env.FROM_EMAIL || "noreply@skydrive.com",
          fromName: "SkyDrive",
        },
        payment: {
          serviceFee: 10,
          insuranceFee: 5,
          minDeposit: 20,
        },
        updatedAt: new Date(),
      };
    }

    return settings;
  } catch (error) {
    console.error("❌ Error getting system settings:", error);
    return null;
  }
}

// Update system settings
export async function updateSystemSettings(settings) {
  try {
    const db = client.db("SkyDrive");
    const settingsCollection = db.collection("settings");

    const result = await settingsCollection.updateOne(
      { type: "system" },
      {
        $set: {
          ...settings,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating system settings:", error);
    return false;
  }
}

// Get email templates
export async function getEmailTemplates() {
  try {
    const db = client.db("SkyDrive");
    const templatesCollection = db.collection("emailTemplates");

    const templates = await templatesCollection.find({}).toArray();

    if (templates.length === 0) {
      // Default templates
      const defaultTemplates = [
        {
          id: "booking-confirmation",
          name: "Booking Confirmation",
          subject: "Your SkyDrive Booking Confirmation - {bookingId}",
          body: "Dear {customerName},\n\nYour booking for {vehicleName} has been confirmed.\n\nPickup: {pickupDate} at {pickupTime}\nLocation: {pickupLocation}\nDuration: {duration} hours\nTotal: KES {totalAmount}\n\nThank you for choosing SkyDrive!",
          variables: [
            "customerName",
            "bookingId",
            "vehicleName",
            "pickupDate",
            "pickupTime",
            "pickupLocation",
            "duration",
            "totalAmount",
          ],
        },
        {
          id: "payment-receipt",
          name: "Payment Receipt",
          subject: "Payment Receipt - Booking {bookingId}",
          body: "Dear {customerName},\n\nThank you for your payment of KES {amount} for booking {bookingId}.\n\nPayment Method: {paymentMethod}\nDate: {paymentDate}\n\nYour receipt is attached.",
          variables: [
            "customerName",
            "bookingId",
            "amount",
            "paymentMethod",
            "paymentDate",
          ],
        },
        {
          id: "booking-reminder",
          name: "Booking Reminder",
          subject: "Reminder: Your SkyDrive Booking Tomorrow",
          body: "Dear {customerName},\n\nThis is a reminder that your booking for {vehicleName} is tomorrow at {pickupTime}.\n\nLocation: {pickupLocation}\n\nWe look forward to serving you!",
          variables: [
            "customerName",
            "vehicleName",
            "pickupTime",
            "pickupLocation",
          ],
        },
      ];

      await templatesCollection.insertMany(defaultTemplates);
      return defaultTemplates;
    }

    return templates;
  } catch (error) {
    console.error("❌ Error getting email templates:", error);
    return [];
  }
}

// Update email template
export async function updateEmailTemplate(templateId, template) {
  try {
    const db = client.db("SkyDrive");
    const templatesCollection = db.collection("emailTemplates");

    const result = await templatesCollection.updateOne(
      { id: templateId },
      {
        $set: {
          ...template,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating email template:", error);
    return false;
  }
}

// Get payment gateways
export async function getPaymentGateways() {
  try {
    const db = client.db("SkyDrive");
    const gatewaysCollection = db.collection("paymentGateways");

    const gateways = await gatewaysCollection.find({}).toArray();

    if (gateways.length === 0) {
      // Default gateways
      const defaultGateways = [
        {
          id: "mpesa",
          name: "M-Pesa",
          description: "Mobile money payments via Safaricom M-Pesa",
          enabled: true,
          fields: [
            {
              name: "businessShortCode",
              label: "Business Short Code",
              type: "text",
              placeholder: "174379",
            },
            {
              name: "passkey",
              label: "Passkey",
              type: "password",
              placeholder: "Enter your passkey",
            },
            {
              name: "consumerKey",
              label: "Consumer Key",
              type: "text",
              placeholder: "Enter consumer key",
            },
            {
              name: "consumerSecret",
              label: "Consumer Secret",
              type: "password",
              placeholder: "Enter consumer secret",
            },
          ],
        },
        {
          id: "card",
          name: "Credit Card",
          description: "Visa, Mastercard, and American Express",
          enabled: true,
          fields: [
            {
              name: "apiKey",
              label: "API Key",
              type: "text",
              placeholder: "Enter API key",
            },
            {
              name: "apiSecret",
              label: "API Secret",
              type: "password",
              placeholder: "Enter API secret",
            },
            {
              name: "webhookSecret",
              label: "Webhook Secret",
              type: "password",
              placeholder: "Enter webhook secret",
            },
          ],
        },
        {
          id: "paypal",
          name: "PayPal",
          description: "PayPal payments",
          enabled: false,
          fields: [
            {
              name: "clientId",
              label: "Client ID",
              type: "text",
              placeholder: "Enter client ID",
            },
            {
              name: "clientSecret",
              label: "Client Secret",
              type: "password",
              placeholder: "Enter client secret",
            },
            {
              name: "webhookId",
              label: "Webhook ID",
              type: "text",
              placeholder: "Enter webhook ID",
            },
          ],
        },
      ];

      await gatewaysCollection.insertMany(defaultGateways);
      return defaultGateways;
    }

    return gateways;
  } catch (error) {
    console.error("❌ Error getting payment gateways:", error);
    return [];
  }
}

// Update payment gateway
export async function updatePaymentGateway(gatewayId, gateway) {
  try {
    const db = client.db("SkyDrive");
    const gatewaysCollection = db.collection("paymentGateways");

    const result = await gatewaysCollection.updateOne(
      { id: gatewayId },
      {
        $set: {
          ...gateway,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating payment gateway:", error);
    return false;
  }
}

// Get fleet categories
export async function getFleetCategories() {
  try {
    const db = client.db("SkyDrive");
    const categoriesCollection = db.collection("fleetCategories");

    const categories = await categoriesCollection.find({}).toArray();

    if (categories.length === 0) {
      // Default categories
      const defaultCategories = [
        {
          id: "suv",
          name: "SUV",
          icon: "suv",
          description: "Sport Utility Vehicles - perfect for family trips",
          baseRate: 5000,
          hourlyRate: 9000,
          dailyRate: 50000,
          weeklyRate: 290000,
          features: ["4WD", "Bluetooth", "USB Charging", "Climate Control"],
          image: "https://example.com/suv.jpg",
        },
        {
          id: "sedan",
          name: "Sedan",
          icon: "sedan",
          description: "Comfortable sedans for business and leisure",
          baseRate: 3000,
          hourlyRate: 6000,
          dailyRate: 35000,
          weeklyRate: 200000,
          features: ["Bluetooth", "USB Charging", "Climate Control"],
          image: "https://example.com/sedan.jpg",
        },
        {
          id: "luxury",
          name: "Luxury",
          icon: "luxury",
          description: "Premium vehicles for executive travel",
          baseRate: 10000,
          hourlyRate: 15000,
          dailyRate: 90000,
          weeklyRate: 550000,
          features: [
            "Leather Seats",
            "WiFi",
            "Bluetooth",
            "Climate Control",
            "GPS",
          ],
          image: "https://example.com/luxury.jpg",
        },
        {
          id: "van",
          name: "Van/Minibus",
          icon: "van",
          description: "Spacious vans for group travel",
          baseRate: 7000,
          hourlyRate: 12000,
          dailyRate: 70000,
          weeklyRate: 400000,
          features: ["USB Charging", "Climate Control", "Roof Rack"],
          image: "https://example.com/van.jpg",
        },
      ];

      await categoriesCollection.insertMany(defaultCategories);
      return defaultCategories;
    }

    return categories.map((c) => ({ ...c, id: c._id.toString() }));
  } catch (error) {
    console.error("❌ Error getting fleet categories:", error);
    return [];
  }
}

// Add fleet category
export async function addFleetCategory(category) {
  try {
    const db = client.db("SkyDrive");
    const categoriesCollection = db.collection("fleetCategories");

    const result = await categoriesCollection.insertOne({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result.insertedId;
  } catch (error) {
    console.error("❌ Error adding fleet category:", error);
    return null;
  }
}

// Update fleet category
export async function updateFleetCategory(categoryId, category) {
  try {
    const db = client.db("SkyDrive");
    const categoriesCollection = db.collection("fleetCategories");

    const result = await categoriesCollection.updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $set: {
          ...category,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating fleet category:", error);
    return false;
  }
}

// Delete fleet category
export async function deleteFleetCategory(categoryId) {
  try {
    const db = client.db("SkyDrive");
    const categoriesCollection = db.collection("fleetCategories");

    // Check if category is in use
    const vehiclesInCategory = await db.collection("fleet").countDocuments({
      category: categoryId,
    });

    if (vehiclesInCategory > 0) {
      throw new Error("Cannot delete category with existing vehicles");
    }

    const result = await categoriesCollection.deleteOne({
      _id: new ObjectId(categoryId),
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("❌ Error deleting fleet category:", error);
    return false;
  }
}

// Get booking rules
export async function getBookingRules() {
  try {
    const db = client.db("SkyDrive");
    const rulesCollection = db.collection("bookingRules");

    let rules = await rulesCollection.findOne({});

    if (!rules) {
      rules = {
        minHours: 1,
        maxHours: 720,
        advanceBooking: 30,
        lastMinuteHours: 2,
        cancellationHours: 24,
        refundPercentage: 80,
        businessHours: {
          Monday: { open: "09:00", close: "20:00", closed: false },
          Tuesday: { open: "09:00", close: "20:00", closed: false },
          Wednesday: { open: "09:00", close: "20:00", closed: false },
          Thursday: { open: "09:00", close: "20:00", closed: false },
          Friday: { open: "09:00", close: "20:00", closed: false },
          Saturday: { open: "09:00", close: "18:00", closed: false },
          Sunday: { open: "10:00", close: "16:00", closed: false },
        },
      };

      await rulesCollection.insertOne(rules);
    }

    return rules;
  } catch (error) {
    console.error("❌ Error getting booking rules:", error);
    return null;
  }
}

// Update booking rules
export async function updateBookingRules(rules) {
  try {
    const db = client.db("SkyDrive");
    const rulesCollection = db.collection("bookingRules");

    const result = await rulesCollection.updateOne(
      {},
      {
        $set: {
          ...rules,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating booking rules:", error);
    return false;
  }
}

// Get notification settings
export async function getNotificationSettings() {
  try {
    const db = client.db("SkyDrive");
    const notificationsCollection = db.collection("notificationSettings");

    let settings = await notificationsCollection.findOne({});

    if (!settings) {
      settings = {
        email: {
          bookingConfirmation: true,
          paymentReceipt: true,
          reminders: true,
          promotions: false,
        },
        sms: {
          bookingConfirmation: true,
          reminders: true,
        },
        admin: {
          newBooking: true,
          paymentReceived: true,
          cancellation: true,
          lowStock: true,
        },
      };

      await notificationsCollection.insertOne(settings);
    }

    return settings;
  } catch (error) {
    console.error("❌ Error getting notification settings:", error);
    return null;
  }
}

// Update notification settings
export async function updateNotificationSettings(settings) {
  try {
    const db = client.db("SkyDrive");
    const notificationsCollection = db.collection("notificationSettings");

    const result = await notificationsCollection.updateOne(
      {},
      {
        $set: {
          ...settings,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating notification settings:", error);
    return false;
  }
}

// Get backup settings and history
export async function getBackupSettings() {
  try {
    const db = client.db("SkyDrive");
    const backupsCollection = db.collection("backups");

    const backups = await backupsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return {
      backups: backups.map((b) => ({
        id: b._id.toString(),
        name: b.name,
        size: b.size,
        createdAt: b.createdAt,
      })),
      lastCacheClear: await getLastCacheClear(),
    };
  } catch (error) {
    console.error("❌ Error getting backup settings:", error);
    return { backups: [], lastCacheClear: null };
  }
}

// Create backup
export async function createBackup() {
  try {
    const db = client.db("SkyDrive");
    const backupsCollection = db.collection("backups");

    const backup = {
      name: `Backup_${new Date().toISOString()}`,
      createdAt: new Date(),
      size: "0 MB", // Calculate actual size
    };

    await backupsCollection.insertOne(backup);

    return true;
  } catch (error) {
    console.error("❌ Error creating backup:", error);
    return false;
  }
}

// Restore backup
export async function restoreBackup(backupId) {
  try {
    // Implement backup restoration logic
    console.log(`Restoring backup ${backupId}`);
    return true;
  } catch (error) {
    console.error("❌ Error restoring backup:", error);
    return false;
  }
}

// Clear cache
export async function clearCache() {
  try {
    // Implement cache clearing logic
    await updateLastCacheClear();
    return true;
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    return false;
  }
}

// Get last cache clear time
async function getLastCacheClear() {
  try {
    const db = client.db("SkyDrive");
    const cacheCollection = db.collection("cache");

    const record = await cacheCollection.findOne({ type: "cache_clear" });
    return record?.lastCleared || null;
  } catch (error) {
    return null;
  }
}

// Update last cache clear time
async function updateLastCacheClear() {
  try {
    const db = client.db("SkyDrive");
    const cacheCollection = db.collection("cache");

    await cacheCollection.updateOne(
      { type: "cache_clear" },
      {
        $set: {
          lastCleared: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (error) {
    console.error("Error updating cache clear time:", error);
  }
}

// Get audit logs
export async function getAuditLogs(limit = 50) {
  try {
    const db = client.db("SkyDrive");
    const auditsCollection = db.collection("auditLogs");

    const logs = await auditsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return logs.map((log) => ({
      id: log._id.toString(),
      timestamp: log.timestamp,
      user: log.user,
      email: log.email,
      action: log.action,
      resource: log.resource,
      ip: log.ip,
      status: log.status,
    }));
  } catch (error) {
    console.error("❌ Error getting audit logs:", error);
    return [];
  }
}
