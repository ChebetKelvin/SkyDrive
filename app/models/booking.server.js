import { client } from "../.server/mongo.js";
import { ObjectId } from "mongodb";
import { checkBookingConflict } from "../.server/bookingCheck.js";

const db = client.db("SkyDrive");
const bookingsCollection = db.collection("bookings");
const usersCollection = db.collection("user");
const vehiclesCollection = db.collection("fleet");

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

export async function deleteBooking(bookingId, permanent = false) {
  const session = client.startSession();

  try {
    console.log("=".repeat(50));
    console.log("🗑️ deleteBooking called:", { bookingId, permanent });
    console.log("=".repeat(50));

    let result;

    await session.withTransaction(async () => {
      // First get the booking to know its vehicleId and userId
      const booking = await bookingsCollection.findOne(
        { _id: normalizeObjectId(bookingId) },
        { session },
      );

      if (!booking) {
        throw new Error(`Booking not found with ID: ${bookingId}`);
      }

      if (permanent) {
        // Permanent deletion - remove from database
        result = await bookingsCollection.deleteOne(
          { _id: booking._id },
          { session },
        );

        // Also remove from user's bookings array
        if (booking.userId) {
          await usersCollection.updateOne(
            { _id: booking.userId },
            {
              $pull: { bookings: { bookingId: booking._id } },
              $set: { updatedAt: new Date() },
            },
            { session },
          );
        }

        console.log("✅ Booking permanently deleted");
      } else {
        // Soft delete - just mark as deleted
        result = await bookingsCollection.updateOne(
          { _id: booking._id },
          {
            $set: {
              status: "deleted",
              isDeleted: true,
              deletedAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { session },
        );

        // Update user's bookings array status
        if (booking.userId) {
          await usersCollection.updateOne(
            {
              _id: booking.userId,
              "bookings.bookingId": booking._id,
            },
            {
              $set: {
                "bookings.$.status": "deleted",
                updatedAt: new Date(),
              },
            },
            { session },
          );
        }

        console.log("✅ Booking soft deleted (marked as deleted)");
      }

      // Update vehicle availability
      if (booking.vehicleId) {
        await updateVehicleAvailability(booking.vehicleId);
      }
    });

    return {
      success: true,
      message: permanent
        ? "Booking permanently deleted"
        : "Booking moved to trash",
      deletedCount: result?.deletedCount || 0,
      modifiedCount: result?.modifiedCount || 0,
    };
  } catch (error) {
    console.error("❌ deleteBooking error:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await session.endSession();
  }
}

/**
 * 📝 CREATE - Create a new booking (admin version)
 */
export async function createBooking(bookingData) {
  const session = client.startSession();

  try {
    console.log("=".repeat(50));
    console.log("📝 createBooking (admin) called");
    console.log("=".repeat(50));

    // Basic validation
    if (
      !bookingData.vehicleId ||
      !bookingData.customerName ||
      !bookingData.customerEmail
    ) {
      throw new Error("Missing required booking information");
    }

    let result;
    let bookingDoc;

    await session.withTransaction(async () => {
      // Check for conflicts
      const conflictResult = await checkBookingConflict(
        bookingData.vehicleId,
        bookingData.pickupDate,
        bookingData.pickupTime,
        bookingData.duration,
      );

      if (conflictResult.hasConflict) {
        throw new Error("Vehicle is already booked for this time slot");
      }

      // Create booking document
      bookingDoc = {
        bookingId: generateBookingId(),
        ...bookingData,
        vehicleId: normalizeVehicleId(bookingData.vehicleId),
        userId: bookingData.userId ? normalizeUserId(bookingData.userId) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: bookingData.status || "pending_verification",
        paymentStatus: bookingData.paymentStatus || "pending",
        specialRequests: bookingData.specialRequests || "",
        pickupLocation: bookingData.pickupLocation || "Nairobi CBD",
        dropoffLocation:
          bookingData.dropoffLocation ||
          bookingData.pickupLocation ||
          "Nairobi CBD",
        passengers: bookingData.passengers || 1,
        paymentMethod: bookingData.paymentMethod || "card",
        paymentMetadata: bookingData.paymentMetadata || {},
      };

      result = await bookingsCollection.insertOne(bookingDoc, { session });

      // If user exists, add to their bookings array
      if (bookingData.userId) {
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
                status: bookingDoc.status,
                paymentStatus: bookingDoc.paymentStatus,
                createdAt: new Date(),
              },
            },
            $set: { updatedAt: new Date() },
          },
          { session },
        );
      }

      // Update vehicle stats if booking is confirmed
      if (bookingDoc.status === "confirmed") {
        await vehiclesCollection.updateOne(
          { _id: bookingDoc.vehicleId },
          {
            $inc: { bookingsCount: 1 },
            $set: { updatedAt: new Date() },
          },
          { session },
        );
      }
    });

    return {
      success: true,
      bookingId: result.insertedId.toString(),
      bookingNumber: bookingDoc.bookingId,
      message: "Booking created successfully",
    };
  } catch (error) {
    console.error("❌ createBooking error:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await session.endSession();
  }
}

/**
 * 📝 UPDATE - Update an existing booking
 */
export async function updateBooking(bookingId, bookingData) {
  const session = client.startSession();

  try {
    console.log("=".repeat(50));
    console.log("📝 updateBooking called:", { bookingId });
    console.log("=".repeat(50));

    let result;

    await session.withTransaction(async () => {
      // Get current booking
      const currentBooking = await bookingsCollection.findOne(
        { _id: normalizeObjectId(bookingId) },
        { session },
      );

      if (!currentBooking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      // Check if vehicle or time changed - if so, check for conflicts
      if (
        (bookingData.vehicleId &&
          bookingData.vehicleId !== currentBooking.vehicleId.toString()) ||
        (bookingData.pickupDate &&
          bookingData.pickupDate !== currentBooking.pickupDate) ||
        (bookingData.pickupTime &&
          bookingData.pickupTime !== currentBooking.pickupTime) ||
        (bookingData.duration &&
          bookingData.duration !== currentBooking.duration)
      ) {
        const conflictResult = await checkBookingConflict(
          bookingData.vehicleId || currentBooking.vehicleId,
          bookingData.pickupDate || currentBooking.pickupDate,
          bookingData.pickupTime || currentBooking.pickupTime,
          bookingData.duration || currentBooking.duration,
          bookingId, // Exclude current booking from conflict check
        );

        if (conflictResult.hasConflict) {
          throw new Error("Vehicle is already booked for this time slot");
        }
      }

      // Prepare update data
      const updateData = {
        ...bookingData,
        updatedAt: new Date(),
      };

      // Convert ObjectId fields
      if (updateData.vehicleId)
        updateData.vehicleId = normalizeVehicleId(updateData.vehicleId);
      if (updateData.userId)
        updateData.userId = normalizeUserId(updateData.userId);

      // Remove fields that shouldn't be updated
      delete updateData._id;
      delete updateData.bookingId;
      delete updateData.createdAt;

      result = await bookingsCollection.updateOne(
        { _id: normalizeObjectId(bookingId) },
        { $set: updateData },
        { session },
      );

      // Update user's bookings array if needed
      if (
        currentBooking.userId &&
        (bookingData.status || bookingData.paymentStatus)
      ) {
        await usersCollection.updateOne(
          {
            _id: currentBooking.userId,
            "bookings.bookingId": normalizeObjectId(bookingId),
          },
          {
            $set: {
              "bookings.$.status": bookingData.status || currentBooking.status,
              "bookings.$.paymentStatus":
                bookingData.paymentStatus || currentBooking.paymentStatus,
              updatedAt: new Date(),
            },
          },
          { session },
        );
      }

      // Update vehicle stats if status changed to/from confirmed
      if (bookingData.status && bookingData.status !== currentBooking.status) {
        if (
          bookingData.status === "confirmed" &&
          currentBooking.status !== "confirmed"
        ) {
          // Booking was just confirmed
          await vehiclesCollection.updateOne(
            { _id: currentBooking.vehicleId },
            {
              $inc: { bookingsCount: 1 },
              $set: { updatedAt: new Date() },
            },
            { session },
          );
        } else if (
          currentBooking.status === "confirmed" &&
          bookingData.status !== "confirmed"
        ) {
          // Booking was unconfirmed
          await vehiclesCollection.updateOne(
            { _id: currentBooking.vehicleId },
            {
              $inc: { bookingsCount: -1 },
              $set: { updatedAt: new Date() },
            },
            { session },
          );
        }
      }

      // Update vehicle availability
      if (bookingData.vehicleId || bookingData.status) {
        await updateVehicleAvailability(currentBooking.vehicleId);
        if (
          bookingData.vehicleId &&
          bookingData.vehicleId !== currentBooking.vehicleId.toString()
        ) {
          await updateVehicleAvailability(
            normalizeVehicleId(bookingData.vehicleId),
          );
        }
      }
    });

    return {
      success: true,
      message: "Booking updated successfully",
      modifiedCount: result?.modifiedCount || 0,
    };
  } catch (error) {
    console.error("❌ updateBooking error:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await session.endSession();
  }
}

/**
 * 📊 Get all bookings with filters (admin version)
 */
export async function getAllBookings(filters = {}) {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      search = "",
      startDate,
      endDate,
      userId,
      vehicleId,
      sortBy = "createdAt",
      sortOrder = "desc",
      includeDeleted = false,
    } = filters;

    const query = {};

    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    if (status && status !== "all") query.status = status;
    if (userId) query.userId = normalizeUserId(userId);
    if (vehicleId) query.vehicleId = normalizeVehicleId(vehicleId);

    // Search by customer name, email, or booking ID
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { bookingId: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
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
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await bookingsCollection.countDocuments(query);

    // Get vehicle and user details
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        // Get vehicle details
        if (booking.vehicleId) {
          const vehicle = await vehiclesCollection.findOne(
            { _id: booking.vehicleId },
            { projection: { name: 1, image: 1, category: 1, licensePlate: 1 } },
          );
          booking.vehicle = vehicle;
          booking.vehicleName = vehicle?.name || booking.vehicleName;
          booking.vehicleImage = vehicle?.image || booking.vehicleImage;
          booking.vehicleCategory =
            vehicle?.category || booking.vehicleCategory;
        }

        // Get user details
        if (booking.userId) {
          const user = await usersCollection.findOne(
            { _id: booking.userId },
            { projection: { password: 0 } },
          );
          booking.user = user;
        }

        return booking;
      }),
    );

    return {
      bookings: bookingsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error getting all bookings:", error);
    return {
      bookings: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    };
  }
}

/**
 * 📊 Get booking statistics
 */
export async function getBookingStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      deleted,
      todayBookings,
      weekBookings,
      monthBookings,
      totalRevenue,
      monthRevenue,
      weekRevenue,
      byPaymentMethod,
      byCategory,
    ] = await Promise.all([
      // Total counts by status
      bookingsCollection.countDocuments({ isDeleted: { $ne: true } }),
      bookingsCollection.countDocuments({
        status: "pending_verification",
        isDeleted: { $ne: true },
      }),
      bookingsCollection.countDocuments({
        status: "confirmed",
        isDeleted: { $ne: true },
      }),
      bookingsCollection.countDocuments({
        status: "completed",
        isDeleted: { $ne: true },
      }),
      bookingsCollection.countDocuments({
        status: "cancelled",
        isDeleted: { $ne: true },
      }),
      bookingsCollection.countDocuments({ isDeleted: true }),

      // Bookings by time period
      bookingsCollection.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        isDeleted: { $ne: true },
      }),
      bookingsCollection.countDocuments({
        createdAt: { $gte: startOfWeek },
        isDeleted: { $ne: true },
      }),
      bookingsCollection.countDocuments({
        createdAt: { $gte: startOfMonth },
        isDeleted: { $ne: true },
      }),

      // Revenue
      bookingsCollection
        .aggregate([
          { $match: { paymentStatus: "paid", isDeleted: { $ne: true } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),

      bookingsCollection
        .aggregate([
          {
            $match: {
              paymentStatus: "paid",
              createdAt: { $gte: startOfMonth },
              isDeleted: { $ne: true },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),

      bookingsCollection
        .aggregate([
          {
            $match: {
              paymentStatus: "paid",
              createdAt: { $gte: startOfWeek },
              isDeleted: { $ne: true },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),

      // Stats by payment method
      bookingsCollection
        .aggregate([
          { $match: { paymentStatus: "paid", isDeleted: { $ne: true } } },
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 },
              total: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray(),

      // Stats by vehicle category
      bookingsCollection
        .aggregate([
          { $match: { isDeleted: { $ne: true } } },
          { $group: { _id: "$vehicleCategory", count: { $sum: 1 } } },
        ])
        .toArray(),
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      deleted,
      todayBookings,
      weekBookings,
      monthBookings,
      revenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      weekRevenue: weekRevenue[0]?.total || 0,
      byPaymentMethod: byPaymentMethod.reduce((acc, item) => {
        acc[item._id || "other"] = { count: item.count, total: item.total };
        return acc;
      }, {}),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id || "other"] = item.count;
        return acc;
      }, {}),
      averageBookingValue:
        total > 0 ? (totalRevenue[0]?.total || 0) / total : 0,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  } catch (error) {
    console.error("❌ Error getting booking stats:", error);
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      deleted: 0,
      todayBookings: 0,
      weekBookings: 0,
      monthBookings: 0,
      revenue: 0,
      monthRevenue: 0,
      weekRevenue: 0,
      byPaymentMethod: {},
      byCategory: {},
      averageBookingValue: 0,
      completionRate: 0,
    };
  }
}

/**
 * 🔄 Restore a soft-deleted booking
 */
export async function restoreBooking(bookingId) {
  try {
    const result = await bookingsCollection.updateOne(
      { _id: normalizeObjectId(bookingId) },
      {
        $set: {
          isDeleted: false,
          status: "pending_verification",
          restoredAt: new Date(),
          updatedAt: new Date(),
        },
        $unset: { deletedAt: "" },
      },
    );

    if (result.modifiedCount > 0) {
      // Get the booking to update user's array
      const booking = await bookingsCollection.findOne({
        _id: normalizeObjectId(bookingId),
      });

      if (booking && booking.userId) {
        await usersCollection.updateOne(
          {
            _id: booking.userId,
            "bookings.bookingId": normalizeObjectId(bookingId),
          },
          {
            $set: {
              "bookings.$.status": "pending_verification",
              updatedAt: new Date(),
            },
          },
        );
      }
    }

    return {
      success: result.modifiedCount > 0,
      message:
        result.modifiedCount > 0
          ? "Booking restored successfully"
          : "Booking not found",
    };
  } catch (error) {
    console.error("❌ Error restoring booking:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 🚗 Update vehicle availability based on bookings
 */
export async function updateVehicleAvailability(vehicleId) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const activeBookings = await bookingsCollection.countDocuments({
      vehicleId: normalizeVehicleId(vehicleId),
      status: { $in: ["confirmed", "pending_verification"] },
      pickupDate: { $gte: today },
      isDeleted: { $ne: true },
    });

    const status = activeBookings > 0 ? "booked" : "available";

    await vehiclesCollection.updateOne(
      { _id: normalizeVehicleId(vehicleId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
          activeBookings,
        },
      },
    );

    return { success: true, status, activeBookings };
  } catch (error) {
    console.error("❌ Error updating vehicle availability:", error);
    return { success: false };
  }
}
