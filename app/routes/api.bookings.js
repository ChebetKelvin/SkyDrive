// routes/api.bookings.js
import { checkBookingConflict } from "../.server/bookingCheck.js";

export async function loader({ request }) {
  const url = new URL(request.url);
  const vehicleId = url.searchParams.get("vehicleId");
  const pickupDate = url.searchParams.get("pickupDate");
  const pickupTime = url.searchParams.get("pickupTime");
  const duration = url.searchParams.get("duration");

  if (!vehicleId || !pickupDate || !pickupTime || !duration) {
    return new Response(
      JSON.stringify({
        error: "Missing required parameters",
        hasConflict: false,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const result = await checkBookingConflict(
      vehicleId,
      pickupDate,
      pickupTime,
      parseInt(duration),
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to check availability",
        hasConflict: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
