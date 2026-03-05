import admin from "firebase-admin";
import { getSession } from "../.server/session.js";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const auth = admin.auth();

// Verify Firebase ID Token
export async function verifyIdToken(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return { valid: true, user: decodedToken };
  } catch (error) {
    console.error("Token verification failed:", error);
    return { valid: false, error: error.message };
  }
}

// Handle Firebase user + session
export async function handleFirebaseUser(request, firebaseUser) {
  const session = await getSession(request.headers.get("Cookie"));

  const { findOrCreateGoogleUser } = await import("../models/user.js");

  try {
    const user = await findOrCreateGoogleUser({
      email: firebaseUser.email,
      name: firebaseUser.name,
      avatar: firebaseUser.picture,
      googleId: firebaseUser.uid,
    });

    session.set("user", {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "customer",
      avatar: user.avatar,
    });

    return { success: true, session, dbUser: user };
  } catch (error) {
    console.error("Error handling Firebase user:", error);
    return { success: false, error: error.message };
  }
}
