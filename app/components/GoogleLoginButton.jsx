import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  auth,
  signInWithGoogle,
  signInWithGoogleRedirect,
  cleanupRedirectUrl,
} from "../firebase.client";
import { onAuthStateChanged } from "firebase/auth";

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Listen for auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(
          "🔥 Firebase auth state changed - user logged in:",
          user.email,
        );

        // Check if we have a pending redirect
        const hasPendingRedirect =
          sessionStorage.getItem("googleRedirectPending") === "true";

        if (hasPendingRedirect) {
          console.log(
            "📥 Detected pending redirect, sending token to backend...",
          );

          try {
            setIsLoading(true);

            // Get fresh token
            const idToken = await user.getIdToken(true);
            console.log("📝 Got fresh token length:", idToken.length);

            // Send to backend - IMPORTANT: Don't follow redirects automatically
            const response = await fetch("/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
              redirect: "manual", // This prevents automatic following of redirects
            });

            console.log("Response status:", response.status);
            console.log("Response type:", response.type);

            // Check if it's a redirect response (302)
            if (
              response.type === "opaqueredirect" ||
              response.status === 302 ||
              response.status === 0
            ) {
              console.log(
                "✅ Backend authentication successful - following redirect",
              );

              // Get the redirect URL from the Location header if available
              const location = response.headers.get("Location");
              console.log("Redirect location:", location);

              // Clean up
              cleanupRedirectUrl();
              sessionStorage.removeItem("googleRedirectPending");

              // Navigate to dashboard or use the location from response
              if (location) {
                window.location.href = location; // Hard redirect to follow the backend's redirect
              } else {
                navigate("/dashboard"); // Fallback to dashboard
              }
            } else if (response.ok) {
              // If it's a 200 response, try to get redirect URL from body
              console.log(
                "✅ Backend authentication successful - 200 response",
              );

              cleanupRedirectUrl();
              sessionStorage.removeItem("googleRedirectPending");

              // Check if response is JSON with redirect URL
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (data.redirectTo) {
                  navigate(data.redirectTo);
                } else {
                  navigate("/dashboard");
                }
              } else {
                navigate("/dashboard");
              }
            } else {
              const errorText = await response.text();
              console.error("Backend error:", errorText);
              throw new Error(errorText);
            }
          } catch (error) {
            console.error("❌ Error during post-redirect auth:", error);
            sessionStorage.removeItem("googleRedirectPending");
            cleanupRedirectUrl();
            alert("Login failed. Please try again.");
          } finally {
            setIsLoading(false);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    console.log("🚀 Starting Google login...");
    setIsLoading(true);

    try {
      // Store the current path to redirect back
      const currentPath = window.location.pathname;
      sessionStorage.setItem("redirectPath", currentPath);
      console.log("Stored redirect path:", currentPath);

      // Check if we're on mobile
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent,
        );

      console.log("Device detection:", { isMobile, userAgent });

      if (isMobile) {
        // Use redirect flow for mobile
        console.log("🔄 Using redirect flow for mobile");
        sessionStorage.setItem("googleRedirectPending", "true");
        await signInWithGoogleRedirect();
        console.log("Redirect initiated - page will redirect to Google");
        // The page will redirect to Google, so execution stops here
      } else {
        // Try popup for desktop
        try {
          console.log("🪟 Trying popup flow");
          const result = await signInWithGoogle();
          console.log("Popup result:", result);

          if (result.success) {
            console.log("✅ Popup success, sending to backend...");

            // Popup succeeded
            const response = await fetch("/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: result.idToken }),
              redirect: "manual", // Prevent automatic redirect following
            });

            console.log("Response status:", response.status);

            // Handle redirect response
            if (
              response.type === "opaqueredirect" ||
              response.status === 302 ||
              response.status === 0
            ) {
              console.log(
                "✅ Backend authentication successful - following redirect",
              );

              // Get redirect URL from headers or use dashboard
              const location = response.headers.get("Location");

              if (location) {
                window.location.href = location;
              } else {
                navigate("/dashboard");
              }
            } else if (response.ok) {
              // 200 response
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                navigate(data.redirectTo || "/dashboard");
              } else {
                navigate("/dashboard");
              }
            } else {
              const errorText = await response.text();
              console.error("Backend error:", errorText);
              throw new Error(errorText);
            }
          } else if (result.shouldRedirect) {
            // Popup was blocked, fall back to redirect
            console.log("⚠️ Popup blocked, falling back to redirect");
            sessionStorage.setItem("googleRedirectPending", "true");
            await signInWithGoogleRedirect();
          } else {
            console.error("❌ Popup failed:", result.error);
            throw new Error(result.error);
          }
        } catch (popupError) {
          console.error("❌ Popup error:", popupError);
          // Fall back to redirect
          console.log("⚠️ Falling back to redirect due to error");
          sessionStorage.setItem("googleRedirectPending", "true");
          await signInWithGoogleRedirect();
        }
      }
    } catch (error) {
      console.error("❌ Google login failed:", error);
      alert("Login failed. Please try again.");
      setIsLoading(false);
      sessionStorage.removeItem("googleRedirectPending");
    }
  };

  return (
    <motion.button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 p-3 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Continue with Google
        </>
      )}
    </motion.button>
  );
}
