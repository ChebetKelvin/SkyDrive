const API_BASE = "/api/bookings";

export async function checkBookingConflict(
  vehicleId,
  pickupDate,
  pickupTime,
  duration,
) {
  try {
    console.log("📤 Client-side API request to:", API_BASE);

    const params = new URLSearchParams({
      vehicleId,
      pickupDate,
      pickupTime,
      duration: duration.toString(),
    });

    const url = `${API_BASE}?${params}`;
    console.log("📤 Full URL:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to check availability (${response.status})`,
      );
    }

    const result = await response.json();
    console.log("✅ API response:", result);
    return result;
  } catch (error) {
    console.error("❌ Client-side API call failed:", error);
    return {
      hasConflict: false,
      error: error.message,
      conflictingCount: 0,
    };
  }
}

export async function getAvailableSlots(vehicleId, date) {
  try {
    const params = new URLSearchParams({
      vehicleId,
      pickupDate: date,
    });

    const response = await fetch(`${API_BASE}?${params}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get available slots (${response.status})`);
    }

    const data = await response.json();
    return data.slots || [];
  } catch (error) {
    console.error("❌ Get slots error:", error);
    return [];
  }
}
