import { client } from "../.server/mongo.js";
import { ObjectId } from "mongodb";
import { checkBookingConflict } from "../.server/bookingCheck.js";

const db = client.db("SkyDrive");
const bookingsCollection = db.collection("bookings");
const usersCollection = db.collection("user");

// Helper to generate a readable booking ID
function generateBookingId() {
  const prefix = "SKY";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function normalizeObjectId(id) {
  try {
    return new ObjectId(id.toString());
  } catch (error) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
}

// Helper to normalize vehicle ID
function normalizeVehicleId(id) {
  if (!id) throw new Error("Invalid ID: missing value");

  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  }

  throw new Error(`Invalid ObjectId: ${id}`);
}

// Helper to normalize user ID
function normalizeUserId(id) {
  if (!id) {
    throw new Error("User ID is missing");
  }

  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  }

  throw new Error(`Invalid User ObjectId: ${id}`);
}

/**
 * 📝 Create a PENDING booking (for M-Pesa payments)
 * This creates a booking but does NOT confirm it or update vehicle stats
 * The booking will be confirmed only after payment is received
 */
export async function createPendingBooking(bookingData) {
  const session = client.startSession();
  let result;
  let bookingDoc;

  try {
    console.log("=".repeat(50));
    console.log("📝 createPendingBooking called");
    console.log("=".repeat(50));

    console.log("Pending booking data:", JSON.stringify(bookingData, null, 2));

    // Basic validation
    if (
      !bookingData.vehicleId ||
      !bookingData.customerName ||
      !bookingData.customerEmail ||
      !bookingData.customerPhone
    ) {
      throw new Error("Missing required customer information");
    }

    // Check if user ID is provided
    if (!bookingData.userId) {
      throw new Error("User ID is required to create a booking");
    }

    console.log("👤 User ID:", bookingData.userId);

    // Check for conflicts - vehicle should still be available
    const conflictResult = await checkBookingConflict(
      bookingData.vehicleId,
      bookingData.pickupDate,
      bookingData.pickupTime,
      bookingData.duration,
    );

    if (conflictResult.hasConflict) {
      console.error("❌ Booking conflict detected - cannot proceed");
      return {
        success: false,
        error: "This vehicle is already booked for the selected time slot",
        code: "CONFLICT_DETECTED",
      };
    }

    // Start transaction
    await session.withTransaction(async () => {
      console.log("🔄 Starting transaction for pending booking...");

      // Create pending booking document
      bookingDoc = {
        ...bookingData,
        vehicleId: normalizeVehicleId(bookingData.vehicleId),
        userId: normalizeUserId(bookingData.userId),
        bookingId: generateBookingId(),
        status: "payment_pending", // Special status for unpaid bookings
        paymentStatus: "awaiting_payment",
        paymentId: bookingData.paymentId || null,
        paymentMetadata: bookingData.paymentMetadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
        specialRequests: bookingData.specialRequests || "",
        pickupLocation: bookingData.pickupLocation || "Nairobi CBD",
        dropoffLocation:
          bookingData.dropoffLocation ||
          bookingData.pickupLocation ||
          "Nairobi CBD",
        passengers: bookingData.passengers || 1,
        paymentMethod: bookingData.paymentMethod || "mpesa",
      };

      console.log("📦 Inserting pending booking document...");

      // Insert the pending booking
      result = await bookingsCollection.insertOne(bookingDoc, { session });

      console.log("✅ Pending booking inserted with ID:", result.insertedId);

      // Add to user's bookings array with pending status
      console.log("👤 Updating user's bookings array...");

      await usersCollection.updateOne(
        { _id: normalizeUserId(bookingData.userId) },
        {
          $push: {
            bookings: {
              bookingId: result.insertedId,
              bookingNumber: bookingDoc.bookingId,
              vehicleName: bookingData.vehicleName,
              vehicleImage: bookingData.vehicleImage,
              pickupDate: bookingData.pickupDate,
              pickupTime: bookingData.pickupTime,
              duration: bookingData.duration,
              totalAmount: bookingData.totalAmount,
              status: "payment_pending",
              paymentStatus: "awaiting_payment",
              createdAt: new Date(),
            },
          },
          $set: { updatedAt: new Date() },
        },
        { session },
      );

      console.log("✅ User pending booking added");
      console.log("🎉 Pending booking transaction completed");
    });

    if (!result || !bookingDoc) {
      throw new Error("Transaction failed - no result returned");
    }

    return {
      success: true,
      bookingId: result.insertedId.toString(),
      bookingNumber: bookingDoc.bookingId,
      message: "Pending booking created. Complete payment to confirm.",
    };
  } catch (error) {
    console.error("❌ createPendingBooking error:", error);
    return {
      success: false,
      error: error.message,
      code: "PENDING_BOOKING_FAILED",
    };
  } finally {
    await session.endSession();
    console.log("🔚 Pending booking transaction session ended");
    console.log("=".repeat(50));
  }
}

/**
 * ✅ Confirm a booking after payment is received
 * This updates the booking status and increments vehicle bookingsCount
 */
export async function confirmBookingAfterPayment(paymentId) {
  const session = client.startSession();

  try {
    console.log("=".repeat(50));
    console.log(
      "✅ confirmBookingAfterPayment called for paymentId:",
      paymentId,
    );
    console.log("=".repeat(50));

    let result;

    await session.withTransaction(async () => {
      // Find the pending booking
      const booking = await bookingsCollection.findOne(
        { paymentId: paymentId },
        { session },
      );

      if (!booking) {
        throw new Error(`No booking found with paymentId: ${paymentId}`);
      }

      console.log("📦 Found pending booking:", {
        id: booking._id,
        status: booking.status,
        vehicleId: booking.vehicleId,
      });

      // Check if already confirmed
      if (booking.status === "confirmed") {
        console.log("⚠️ Booking already confirmed, skipping...");
        result = { alreadyConfirmed: true, bookingId: booking._id.toString() };
        return;
      }

      // Update booking status to confirmed
      const updateResult = await bookingsCollection.updateOne(
        { _id: booking._id },
        {
          $set: {
            status: "confirmed",
            paymentStatus: "paid",
            confirmedAt: new Date(),
            updatedAt: new Date(),
          },
          $unset: { expiresAt: "" }, // Remove expiry
        },
        { session },
      );

      console.log("✅ Booking confirmed:", updateResult);

      // Update vehicle stats (increment bookingsCount)
      try {
        const vehiclesCollection = db.collection("vehicles");
        await vehiclesCollection.updateOne(
          { _id: booking.vehicleId },
          {
            $inc: { bookingsCount: 1 },
            $set: { updatedAt: new Date() },
          },
          { session },
        );
        console.log("🚗 Vehicle stats updated for:", booking.vehicleId);
      } catch (vehicleError) {
        console.warn(
          "⚠️ Could not update vehicle stats:",
          vehicleError.message,
        );
      }

      // Update user's booking status in their array
      await usersCollection.updateOne(
        { _id: booking.userId, "bookings.bookingId": booking._id },
        {
          $set: {
            "bookings.$.status": "confirmed",
            "bookings.$.paymentStatus": "paid",
            updatedAt: new Date(),
          },
        },
        { session },
      );

      console.log("👤 User booking array updated");

      result = {
        success: true,
        bookingId: booking._id.toString(),
        bookingNumber: booking.bookingId,
      };
    });

    return result || { success: false, error: "Confirmation failed" };
  } catch (error) {
    console.error("❌ confirmBookingAfterPayment error:", error);
    return {
      success: false,
      error: error.message,
      code: "CONFIRMATION_FAILED",
    };
  } finally {
    await session.endSession();
    console.log("🔚 Confirmation transaction ended");
    console.log("=".repeat(50));
  }
}

/**
 * 💵 Create a confirmed booking (for Pay on Delivery)
 * This creates a booking immediately and updates vehicle stats
 */
export async function createConfirmedBooking(bookingData) {
  const session = client.startSession();
  let result;
  let bookingDoc;

  try {
    console.log("=".repeat(50));
    console.log("📝 createConfirmedBooking called");
    console.log("=".repeat(50));

    console.log(
      "Confirmed booking data:",
      JSON.stringify(bookingData, null, 2),
    );

    // Basic validation
    if (
      !bookingData.vehicleId ||
      !bookingData.customerName ||
      !bookingData.customerEmail ||
      !bookingData.customerPhone
    ) {
      throw new Error("Missing required customer information");
    }

    if (!bookingData.userId) {
      throw new Error("User ID is required to create a booking");
    }

    // Check for conflicts
    const conflictResult = await checkBookingConflict(
      bookingData.vehicleId,
      bookingData.pickupDate,
      bookingData.pickupTime,
      bookingData.duration,
    );

    if (conflictResult.hasConflict) {
      console.error("❌ Booking conflict detected - cannot proceed");
      return {
        success: false,
        error: "This vehicle is already booked for the selected time slot",
        code: "CONFLICT_DETECTED",
      };
    }

    await session.withTransaction(async () => {
      console.log("🔄 Starting transaction for confirmed booking...");

      // Create confirmed booking document
      bookingDoc = {
        ...bookingData,
        vehicleId: normalizeVehicleId(bookingData.vehicleId),
        userId: normalizeUserId(bookingData.userId),
        bookingId: generateBookingId(),
        status: "confirmed",
        paymentStatus: "pending", // Payment pending (will be collected on delivery)
        paymentMethod: "cash_on_delivery",
        createdAt: new Date(),
        updatedAt: new Date(),
        specialRequests: bookingData.specialRequests || "",
        pickupLocation: bookingData.pickupLocation || "Nairobi CBD",
        dropoffLocation:
          bookingData.dropoffLocation ||
          bookingData.pickupLocation ||
          "Nairobi CBD",
        passengers: bookingData.passengers || 1,
        // Add payment metadata for cash on delivery
        paymentMetadata: {
          method: "cash_on_delivery",
          dueAt: "pickup",
          collected: false,
        },
      };

      console.log("📦 Inserting confirmed booking document...");

      result = await bookingsCollection.insertOne(bookingDoc, { session });

      console.log("✅ Confirmed booking inserted with ID:", result.insertedId);

      // Update vehicle stats (increment bookingsCount)
      try {
        const vehiclesCollection = db.collection("vehicles");
        await vehiclesCollection.updateOne(
          { _id: bookingDoc.vehicleId },
          {
            $inc: { bookingsCount: 1 },
            $set: { updatedAt: new Date() },
          },
          { session },
        );
        console.log("🚗 Vehicle stats updated");
      } catch (vehicleError) {
        console.warn(
          "⚠️ Could not update vehicle stats:",
          vehicleError.message,
        );
      }

      // Add to user's bookings array
      await usersCollection.updateOne(
        { _id: bookingDoc.userId },
        {
          $push: {
            bookings: {
              bookingId: result.insertedId,
              bookingNumber: bookingDoc.bookingId,
              vehicleName: bookingData.vehicleName,
              vehicleImage: bookingData.vehicleImage,
              pickupDate: bookingData.pickupDate,
              pickupTime: bookingData.pickupTime,
              duration: bookingData.duration,
              totalAmount: bookingData.totalAmount,
              status: "confirmed",
              paymentStatus: "pending",
              createdAt: new Date(),
            },
          },
          $set: { updatedAt: new Date() },
        },
        { session },
      );

      console.log("✅ User confirmed booking added");
    });

    if (!result || !bookingDoc) {
      throw new Error("Transaction failed - no result returned");
    }

    return {
      success: true,
      bookingId: result.insertedId.toString(),
      bookingNumber: bookingDoc.bookingId,
      message:
        "Booking confirmed successfully! Payment will be collected on delivery.",
    };
  } catch (error) {
    console.error("❌ createConfirmedBooking error:", error);
    return {
      success: false,
      error: error.message,
      code: "CONFIRMED_BOOKING_FAILED",
    };
  } finally {
    await session.endSession();
    console.log("🔚 Confirmed booking transaction ended");
    console.log("=".repeat(50));
  }
}

/**
 * 🔄 Clean up expired pending bookings
 * Run this as a cron job to remove unpaid bookings
 */
export async function cleanupExpiredBookings() {
  try {
    const now = new Date();

    const result = await bookingsCollection.deleteMany({
      status: "payment_pending",
      expiresAt: { $lt: now },
    });

    console.log(
      `🧹 Cleaned up ${result.deletedCount} expired pending bookings`,
    );
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("❌ Error cleaning up expired bookings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get booking by payment ID (CheckoutRequestID)
 */
export async function getBookingByPaymentId(checkoutRequestId) {
  try {
    console.log("🔍 Fetching booking by paymentId:", checkoutRequestId);

    const booking = await bookingsCollection.findOne({
      paymentId: checkoutRequestId,
    });

    if (booking) {
      console.log("✅ Found booking:", booking.bookingId);
      return {
        ...booking,
        _id: booking._id.toString(),
        userId: booking.userId?.toString(),
        vehicleId: booking.vehicleId?.toString(),
      };
    }

    console.log("❌ No booking found with paymentId:", checkoutRequestId);
    return null;
  } catch (error) {
    console.error("❌ Error fetching booking by payment ID:", error);
    return null;
  }
}

// ============= EXISTING FUNCTIONS BELOW (unchanged) =============

/**
 * Original addBooking function - kept for backward compatibility
 */
export async function addBooking(booking) {
  // Start a session for transaction
  const session = client.startSession();
  let result;
  let bookingDoc;

  try {
    console.log("=".repeat(50));
    console.log("📝 addBooking called");
    console.log("=".repeat(50));

    console.log("Booking data:", JSON.stringify(booking, null, 2));

    // Basic validation
    if (
      !booking.vehicleId ||
      !booking.customerName ||
      !booking.customerEmail ||
      !booking.customerPhone
    ) {
      throw new Error("Missing required customer information");
    }

    // Check if user ID is provided
    if (!booking.userId) {
      throw new Error("User ID is required to create a booking");
    }

    console.log("👤 User ID:", booking.userId);

    // Check conflicts and prevent booking if conflict exists
    const conflictResult = await checkBookingConflict(
      booking.vehicleId,
      booking.pickupDate,
      booking.pickupTime,
      booking.duration,
    );

    if (conflictResult.hasConflict) {
      console.error("❌ Booking conflict detected - cannot proceed");
      return {
        success: false,
        error: "This vehicle is already booked for the selected time slot",
        code: "CONFLICT_DETECTED",
      };
    }

    // Start transaction
    await session.withTransaction(async () => {
      console.log("🔄 Starting transaction...");

      // Create booking document with userId
      bookingDoc = {
        ...booking,
        vehicleId: normalizeVehicleId(booking.vehicleId),
        userId: normalizeUserId(booking.userId),
        bookingId: generateBookingId(),
        status: "pending_verification",
        paymentStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        specialRequests: booking.specialRequests || "",
        pickupLocation: booking.pickupLocation || "Nairobi CBD",
        dropoffLocation:
          booking.dropoffLocation || booking.pickupLocation || "Nairobi CBD",
        passengers: booking.passengers || 1,
        paymentMethod: booking.paymentMethod || "mpesa",
      };

      console.log("📦 Inserting booking document...");

      // Insert the booking
      result = await bookingsCollection.insertOne(bookingDoc, { session });

      console.log("✅ Booking inserted with ID:", result.insertedId);

      // Update the user's bookings array
      console.log("👤 Updating user's bookings array...");

      const userUpdateResult = await usersCollection.updateOne(
        { _id: normalizeUserId(booking.userId) },
        {
          $push: {
            bookings: {
              bookingId: result.insertedId,
              bookingNumber: bookingDoc.bookingId,
              vehicleName: booking.vehicleName,
              vehicleImage: booking.vehicleImage,
              pickupDate: booking.pickupDate,
              pickupTime: booking.pickupTime,
              duration: booking.duration,
              totalAmount: booking.totalAmount,
              status: "pending_verification",
              createdAt: new Date(),
            },
          },
          $set: { updatedAt: new Date() },
        },
        { session },
      );

      console.log("✅ User update result:", {
        matched: userUpdateResult.matchedCount,
        modified: userUpdateResult.modifiedCount,
      });

      // Update vehicle stats
      try {
        const vehiclesCollection = db.collection("vehicles");
        const vehicleUpdateResult = await vehiclesCollection.updateOne(
          { _id: normalizeVehicleId(booking.vehicleId) },
          { $inc: { bookingsCount: 1 } },
          { session },
        );
        console.log(
          "🚗 Vehicle stats updated:",
          vehicleUpdateResult.modifiedCount,
        );
      } catch (vehicleError) {
        console.warn(
          "⚠️ Could not update vehicle stats:",
          vehicleError.message,
        );
      }

      console.log("🎉 Transaction completed successfully");
    });

    if (!result || !bookingDoc) {
      throw new Error("Transaction failed - no result returned");
    }

    return {
      success: true,
      bookingId: result.insertedId.toString(),
      bookingNumber: bookingDoc.bookingId,
      message: "Booking created successfully and added to your profile",
    };
  } catch (error) {
    console.error("❌ addBooking error:", error);
    return {
      success: false,
      error: error.message,
      code: "BOOKING_FAILED",
    };
  } finally {
    await session.endSession();
    console.log("🔚 Transaction session ended");
    console.log("=".repeat(50));
  }
}

// Get user's bookings with full details
export async function getUserBookings(userId) {
  try {
    console.log("🔍 Fetching bookings for user:", userId);

    const bookings = await bookingsCollection
      .find({ userId: normalizeUserId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${bookings.length} bookings`);

    return bookings.map((booking) => ({
      ...booking,
      _id: booking._id.toString(),
      userId: booking.userId?.toString(),
      vehicleId: booking.vehicleId?.toString(),
    }));
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    return [];
  }
}

// Get booking statistics for a user
export async function getUserBookingStats(userId) {
  try {
    const bookings = await bookingsCollection
      .find({ userId: normalizeUserId(userId) })
      .toArray();

    const now = new Date();

    const stats = {
      total: bookings.length,
      active: bookings.filter(
        (b) =>
          b.status === "confirmed" ||
          (b.status === "pending_verification" &&
            new Date(b.pickupDate) >= now),
      ).length,
      completed: bookings.filter(
        (b) =>
          b.status === "completed" ||
          (b.status === "confirmed" && new Date(b.pickupDate) < now),
      ).length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      totalSpent: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error("❌ Error getting user booking stats:", error);
    return {
      total: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      totalSpent: 0,
    };
  }
}

// Get booking by ID
export async function getBookingById(bookingId) {
  try {
    console.log("🔍 Fetching booking by ID:", bookingId);

    const booking = await bookingsCollection.findOne({
      _id: normalizeVehicleId(bookingId),
    });

    if (booking) {
      return {
        ...booking,
        _id: booking._id.toString(),
        userId: booking.userId?.toString(),
        vehicleId: booking.vehicleId?.toString(),
      };
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    return null;
  }
}

// Update booking status
export async function updateBookingStatus(bookingId, status, paymentStatus) {
  try {
    const updateData = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const result = await bookingsCollection.updateOne(
      { _id: normalizeObjectId(bookingId) },
      { $set: updateData },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    return false;
  }
}

// Add to favorites
export async function addToFavorites(userId, vehicleId) {
  try {
    const result = await usersCollection.updateOne(
      { _id: normalizeUserId(userId) },
      {
        $addToSet: { favorites: vehicleId },
        $set: { updatedAt: new Date() },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error adding to favorites:", error);
    return false;
  }
}

// Remove from favorites
export async function removeFromFavorites(userId, vehicleId) {
  try {
    const result = await usersCollection.updateOne(
      { _id: normalizeUserId(userId) },
      {
        $pull: { favorites: vehicleId },
        $set: { updatedAt: new Date() },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error removing from favorites:", error);
    return false;
  }
}

// Update vehicle stats (duplicate function - consider removing one)
export async function updateVehicleStats(vehicleId) {
  try {
    const vehiclesCollection = db.collection("vehicles");

    const result = await vehiclesCollection.updateOne(
      { _id: normalizeVehicleId(vehicleId) },
      {
        $inc: { bookingsCount: 1 },
        $set: { updatedAt: new Date() },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("❌ Error updating vehicle stats:", error);
    return false;
  }
}
