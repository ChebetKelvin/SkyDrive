// firebase.client.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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
export const googleProvider = new GoogleAuthProvider();

googleProvider.addScope("profile");
googleProvider.addScope("email");

// ✅ Helper to sign in and get full ID token
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

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
    console.error("❌ Google Sign In Error:", error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};
