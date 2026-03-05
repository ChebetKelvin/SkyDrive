import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { signInWithGoogle } from "../firebase.client";

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) throw new Error(result.error);

      const response = await fetch("/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: result.idToken }), // ✅ full JWT
      });

      if (!response.ok) throw new Error(await response.text());
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Login failed. Try again.");
    } finally {
      setIsLoading(false);
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
