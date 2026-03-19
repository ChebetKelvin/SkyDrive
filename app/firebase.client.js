// firebase.client.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence to LOCAL to stay logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

export const googleProvider = new GoogleAuthProvider();

googleProvider.addScope("profile");
googleProvider.addScope("email");

// Configure provider for better mobile experience
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// ✅ Helper to sign in with popup (desktop)
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(
      auth,
      googleProvider,
      browserPopupRedirectResolver,
    );
    console.log("🔥 Popup result received", result.user.email);

    // Get full Firebase ID token (JWT)
    const idToken = await result.user.getIdToken(true); // force refresh

    console.log("📝 Firebase ID Token length:", idToken.length);

    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        avatar: result.user.photoURL,
      },
      idToken, // ✅ send this to server
    };
  } catch (error) {
    console.error("❌ Google Sign In Popup Error:", error);

    // Handle specific errors
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user"
    ) {
      // Fall back to redirect method
      return {
        success: false,
        error: error.message,
        code: error.code,
        shouldRedirect: true, // Signal that we should try redirect
      };
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      shouldRedirect: false,
    };
  }
};

// ✅ Helper to sign in with redirect (mobile)
export const signInWithGoogleRedirect = async () => {
  try {
    console.log("🔄 Starting redirect sign-in...");
    await signInWithRedirect(
      auth,
      googleProvider,
      browserPopupRedirectResolver,
    );
    console.log("✅ Redirect initiated");
    // The page will redirect to Google, so we don't return anything
  } catch (error) {
    console.error("❌ Google Sign In Redirect Error:", error);
    throw error;
  }
};

// ✅ Get redirect result (when user comes back from Google)
export const getGoogleRedirectResult = async () => {
  try {
    console.log("🔄 Getting redirect result...");
    const result = await getRedirectResult(auth, browserPopupRedirectResolver);

    if (result) {
      console.log("✅ Redirect result received for:", result.user.email);

      // Get full Firebase ID token (JWT)
      const idToken = await result.user.getIdToken(true); // force refresh

      console.log("📝 Firebase ID Token from redirect length:", idToken.length);

      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          avatar: result.user.photoURL,
        },
        idToken, // ✅ send this to server
      };
    }

    console.log("⚠️ No redirect result found");
    // No redirect result (user might have canceled)
    return {
      success: false,
      error: "No redirect result found",
      code: "auth/no-redirect-result",
    };
  } catch (error) {
    console.error("❌ Google Redirect Result Error:", error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

// ✅ Clean up URL after redirect (remove query params)
export const cleanupRedirectUrl = () => {
  if (
    window.location.href.includes("firebase") ||
    window.location.search.includes("code=") ||
    window.location.hash.includes("access_token")
  ) {
    console.log("🧹 Cleaning up redirect URL");
    // Replace the current URL without the query params
    const url = new URL(window.location.href);
    url.search = ""; // Remove all query params
    url.hash = ""; // Remove hash
    window.history.replaceState({}, document.title, url.toString());
  }
};
