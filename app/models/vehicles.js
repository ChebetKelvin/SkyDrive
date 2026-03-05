import { client } from "../.server/mongo";

const db = client.db("SkyDrive");
const collection = db.collection("fleet");

// --- Get all vehicles ---
export async function getVehicles() {
  const vehicles = await collection.find().sort({ name: 1 }).toArray();
  return vehicles.map((vehicle) => {
    const now = new Date();
    const activeBookings = (vehicle.bookedRanges || []).filter(
      (range) => new Date(range.to) > now,
    ).length;
    return {
      ...vehicle,
      availableUnits: vehicle.totalUnits - activeBookings,
    };
  });
}

// --- Get vehicle by ID ---
export async function getVehicleById(id) {
  try {
    console.log("🔍 getVehicleById called with id:", id, "type:", typeof id);

    // Handle case where id is already an ObjectId object
    if (id && typeof id === "object" && id._id) {
      id = id._id;
    }

    const { ObjectId } = await import("mongodb");

    // If it's already an ObjectId instance, use it directly
    if (id instanceof ObjectId) {
      return await collection.findOne({ _id: id });
    }

    // If it's a string, try to convert to ObjectId
    if (typeof id === "string") {
      // Check if it's a valid 24-character hex string
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        try {
          const objectId = new ObjectId(id);
          return await collection.findOne({ _id: objectId });
        } catch (error) {
          console.error("❌ Invalid ObjectId format:", id);
        }
      }

      // If not a valid hex string, try to find by string ID
      console.log("🔍 Trying to find by string ID");
      return await collection.findOne({ _id: id });
    }

    // If we get here, try direct lookup
    console.log("🔍 Trying direct lookup with id:", id);
    return await collection.findOne({ _id: id });
  } catch (error) {
    console.error("❌ Error in getVehicleById:", error);
    return null;
  }
}

// --- Add new vehicle ---
export async function addVehicle(vehicle) {
  return await collection.insertOne({
    ...vehicle,
    createdAt: new Date(),
  });
}

// --- Update vehicle by ID ---
export async function updateVehicle(id, data) {
  try {
    console.log("📝 updateVehicle called with id:", id, "type:", typeof id);

    const { ObjectId } = await import("mongodb");

    // Helper function to convert to ObjectId safely
    const toObjectId = (input) => {
      // If it's already an ObjectId, return it
      if (input instanceof ObjectId) {
        return input;
      }

      // If it's an object with _id property (like a MongoDB document)
      if (input && typeof input === "object" && input._id) {
        if (input._id instanceof ObjectId) {
          return input._id;
        }
        if (
          typeof input._id === "string" &&
          /^[0-9a-fA-F]{24}$/.test(input._id)
        ) {
          return new ObjectId(input._id);
        }
      }

      // If it's a valid hex string
      if (typeof input === "string" && /^[0-9a-fA-F]{24}$/.test(input)) {
        return new ObjectId(input);
      }

      // If it's a string that looks like [object Object], try to extract from it
      if (typeof input === "string" && input === "[object Object]") {
        console.error(
          "❌ Received [object Object] as ID - this indicates an ObjectId wasn't properly converted to string",
        );
        throw new Error("Invalid ID format: ObjectId not converted to string");
      }

      // If we can't convert, throw
      throw new Error(`Invalid ID format: ${input}`);
    };

    const objectId = toObjectId(id);

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { ...data, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      console.error("❌ No vehicle found with id:", id);
      return null;
    }

    console.log("✅ Vehicle updated successfully");
    return await getVehicleById(objectId);
  } catch (error) {
    console.error("❌ Error in updateVehicle:", error);
    throw error;
  }
}

// --- Delete vehicle by ID ---
export async function deleteVehicleById(id) {
  try {
    console.log("🗑️ deleteVehicleById called with id:", id, "type:", typeof id);

    const { ObjectId } = await import("mongodb");

    // Helper function to convert to ObjectId safely
    const toObjectId = (input) => {
      if (input instanceof ObjectId) {
        return input;
      }

      if (input && typeof input === "object" && input._id) {
        if (input._id instanceof ObjectId) {
          return input._id;
        }
        if (
          typeof input._id === "string" &&
          /^[0-9a-fA-F]{24}$/.test(input._id)
        ) {
          return new ObjectId(input._id);
        }
      }

      if (typeof input === "string" && /^[0-9a-fA-F]{24}$/.test(input)) {
        return new ObjectId(input);
      }

      if (typeof input === "string" && input === "[object Object]") {
        console.error("❌ Received [object Object] as ID");
        throw new Error("Invalid ID format: ObjectId not converted to string");
      }

      throw new Error(`Invalid ID format: ${input}`);
    };

    const objectId = toObjectId(id);

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      console.error("❌ No vehicle found with id:", id);
      return null;
    }

    console.log("✅ Vehicle deleted successfully");
    return result;
  } catch (error) {
    console.error("❌ Error in deleteVehicleById:", error);
    throw error;
  }
}

// --- Get vehicles by category ---
export async function getVehiclesByCategory(category) {
  return await collection.find({ category }).sort({ name: 1 }).toArray();
}

// --- Search vehicles by name (case-insensitive) ---
export async function searchVehiclesByName(query) {
  return await collection
    .find({ name: { $regex: query, $options: "i" } })
    .sort({ name: 1 })
    .toArray();
}

// --- Update vehicle availability ---
export async function updateVehicleAvailability(
  vehicleId,
  operation = "decrement",
) {
  try {
    const { ObjectId } = await import("mongodb");

    // Convert vehicleId to ObjectId safely
    let objectId;
    if (vehicleId instanceof ObjectId) {
      objectId = vehicleId;
    } else if (
      typeof vehicleId === "string" &&
      /^[0-9a-fA-F]{24}$/.test(vehicleId)
    ) {
      objectId = new ObjectId(vehicleId);
    } else if (vehicleId && typeof vehicleId === "object" && vehicleId._id) {
      // If it's a vehicle object, extract the _id
      if (vehicleId._id instanceof ObjectId) {
        objectId = vehicleId._id;
      } else if (
        typeof vehicleId._id === "string" &&
        /^[0-9a-fA-F]{24}$/.test(vehicleId._id)
      ) {
        objectId = new ObjectId(vehicleId._id);
      }
    } else {
      throw new Error(`Invalid vehicleId format: ${vehicleId}`);
    }

    const update =
      operation === "decrement"
        ? { $inc: { availableUnits: -1 } }
        : { $inc: { availableUnits: 1 } };

    update.$set = { updatedAt: new Date() };

    const result = await collection.updateOne({ _id: objectId }, update);

    if (result.modifiedCount === 1) {
      const updatedVehicle = await getVehicleById(objectId);
      return {
        success: true,
        availableUnits: updatedVehicle.availableUnits,
      };
    }

    return {
      success: false,
      error: "Vehicle not found or not updated",
    };
  } catch (error) {
    console.error("Error updating vehicle availability:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
