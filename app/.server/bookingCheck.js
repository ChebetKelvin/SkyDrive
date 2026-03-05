// .server/bookingCheck.js
import { client } from "./mongo.js";
import { ObjectId } from "mongodb";

/**
 * Simple booking conflict check
 * Returns true if any booking overlaps with the requested slot
 */
export async function checkBookingConflict(
  vehicleId,
  pickupDate,
  pickupTime,
  duration,
) {
  console.log("🔍 Checking booking conflict for:", {
    vehicleId,
    pickupDate,
    pickupTime,
    duration,
  });

  try {
    const db = client.db("SkyDrive");
    const bookings = db.collection("bookings");

    // Validate vehicle ID
    let vehicleObjectId;
    try {
      vehicleObjectId = new ObjectId(vehicleId);
    } catch (err) {
      return {
        hasConflict: true,
        error: "Invalid vehicle ID",
        conflictingCount: 0,
      };
    }

    // Validate duration
    const durationNum = parseFloat(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      return {
        hasConflict: true,
        error: "Duration must be a positive number",
        conflictingCount: 0,
      };
    }

    // Calculate requested time range
    const requestedStart = new Date(`${pickupDate}T${pickupTime}:00+03:00`);
    const requestedEnd = new Date(
      requestedStart.getTime() + durationNum * 60 * 60 * 1000,
    );

    console.log(
      `⏰ Requested: ${requestedStart.toISOString()} -> ${requestedEnd.toISOString()}`,
    );

    // Get ALL active bookings for this vehicle
    const activeBookings = await bookings
      .find({
        vehicleId: vehicleObjectId,
        status: { $in: ["confirmed", "pending_verification"] },
      })
      .toArray();

    console.log(
      `📊 Found ${activeBookings.length} active bookings for vehicle`,
    );

    // Manually check each booking for overlap using pickupDate, pickupTime, and duration
    const conflicts = activeBookings.filter((booking) => {
      // Parse existing booking times from the fields we actually have
      const existingStart = new Date(
        `${booking.pickupDate}T${booking.pickupTime}:00+03:00`,
      );
      const existingEnd = new Date(
        existingStart.getTime() + booking.duration * 60 * 60 * 1000,
      );

      // Check for ANY overlap
      const overlaps =
        (requestedStart >= existingStart && requestedStart < existingEnd) || // Starts during existing
        (requestedEnd > existingStart && requestedEnd <= existingEnd) || // Ends during existing
        (requestedStart <= existingStart && requestedEnd >= existingEnd); // Contains existing

      if (overlaps) {
        console.log(
          `  ⚠️ Conflict with booking ${booking._id}: ${booking.pickupDate} ${booking.pickupTime} (${booking.duration} hours)`,
        );
      }

      return overlaps;
    });

    const hasConflict = conflicts.length > 0;

    console.log(
      hasConflict
        ? `⚠️ Found ${conflicts.length} conflicting bookings`
        : "✅ No conflicts found",
    );

    return {
      hasConflict,
      conflictingCount: conflicts.length,
    };
  } catch (error) {
    console.error("❌ Error checking booking conflict:", error);
    return {
      hasConflict: true,
      error: "Unable to check availability",
      conflictingCount: 0,
    };
  }
}
