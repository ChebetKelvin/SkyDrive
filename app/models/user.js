import { client } from "../.server/mongo";
import bcrypt from "bcryptjs";

const db = client.db("SkyDrive");
const collection = db.collection("user"); // Note: it's "user" not "users"

// --- Get all users ---
export async function getUsers() {
  return await collection.find().sort({ name: 1 }).toArray();
}

// --- Get user by ID ---
export async function getUserById(id) {
  const { ObjectId } = await import("mongodb");
  return await collection.findOne({ _id: new ObjectId(id) });
}

// --- Get user by email (FIXED WITH DEBUGGING) ---
export async function getUserByEmail(email) {
  console.log("🔍 getUserByEmail called with:", email);
  console.log("📧 Email type:", typeof email);
  console.log("📧 Email length:", email.length);

  try {
    // Log the collection name to confirm
    console.log("📁 Using collection: user");

    // Try exact match first
    let user = await collection.findOne({ email });

    if (user) {
      console.log("✅ User found with exact match");
    } else {
      console.log("❌ No exact match found, trying case-insensitive search...");

      // Try case-insensitive search
      user = await collection.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });

      if (user) {
        console.log("✅ User found with case-insensitive match");
        console.log("   - Stored email:", user.email);
        console.log("   - Searched email:", email);
      } else {
        console.log("❌ No user found with any email variation");

        // Let's see what users exist in the database
        const allUsers = await collection.find({}).limit(5).toArray();
        console.log(
          "📋 Sample users in DB:",
          allUsers.map((u) => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            provider: u.provider,
            role: u.role,
          })),
        );
      }
    }

    return user;
  } catch (error) {
    console.error("❌ Error in getUserByEmail:", error);
    throw error;
  }
}

// --- Add new user ---

export async function addUser(user) {
  return await collection.insertOne({
    ...user,
    provider: user.provider || "local",
    role: user.role || "customer",
    createdAt: new Date(),
  });
}

// --- Update user by ID ---
export async function updateUser(id, data) {
  const { ObjectId } = await import("mongodb");
  if (data.password && data.provider !== "google") {
    data.password = await bcrypt.hash(data.password, 10);
  }
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
  return await getUserById(id);
}

// --- Delete user by ID ---
export async function deleteUserById(id) {
  const { ObjectId } = await import("mongodb");
  return await collection.deleteOne({ _id: new ObjectId(id) });
}

// --- Authenticate user by email and password ---
export async function authenticateUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  // Block password login for Google users
  if (user.provider === "google") {
    return null;
  }

  if (!user.password) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  return user;
}

// --- Update user role ---
export async function updateUserRole(id, role) {
  const { ObjectId } = await import("mongodb");
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: { role } });
  return await getUserById(id);
}

export async function findOrCreateGoogleUser(data) {
  const { email, name, avatar, googleId } = data;

  let user = await getUserByEmail(email);

  if (user) return user;

  const newUser = {
    email,
    name,
    avatar,
    googleId,
    provider: "google",
    password: null,
    role: "customer",
    createdAt: new Date(),
  };

  const result = await collection.insertOne(newUser);

  return {
    _id: result.insertedId,
    ...newUser,
  };
}
