import { useState, useEffect, useRef, useCallback } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router";
import {
  getSession,
  commitSession,
  setErrorMessage,
  setSuccessMessage,
} from "../.server/session.js";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "../models/user.js";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import GoogleLoginButton from "../components/GoogleLoginButton";

// Simple throttle implementation
const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Action - handle login form submission
export async function action({ request }) {
  let session = await getSession(request.headers.get("Cookie"));
  let formData = await request.formData();
  let email = formData.get("email");
  let password = formData.get("password");
  let remember = formData.get("remember") === "on";

  let fieldErrors = {};
  if (!email) fieldErrors.email = "Email is required";
  if (!password) fieldErrors.password = "Password is required";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { email } };
  }

  try {
    let user = await getUserByEmail(email);

    if (!user) {
      setErrorMessage(session, "Wrong credentials! Try again..");
      return redirect("/login", {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    }

    let validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      setErrorMessage(session, "Wrong credentials! Try again..");
      return redirect("/login", {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    }

    session.set("user", {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    setSuccessMessage(session, `Welcome back, ${user.name}!`);

    const redirectUrl = user.role === "admin" ? "/admin" : "/";

    return redirect(redirectUrl, {
      headers: {
        "Set-Cookie": await commitSession(session, {
          maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        }),
      },
    });
  } catch (error) {
    setErrorMessage(session, "Login failed. Please try again.");
    return redirect("/login", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
}

export default function Login() {
  let actionData = useActionData();
  let navigation = useNavigation();
  let isSubmitting = navigation.state === "submitting";

  let [showPassword, setShowPassword] = useState(false);
  let [focusedField, setFocusedField] = useState(null);
  let [showDemoAlert, setShowDemoAlert] = useState(true);
  let [toastMessage, setToastMessage] = useState(null);
  let [isMobile, setIsMobile] = useState(false);

  // Refs for confetti triggers
  let loginButtonRef = useRef(null);
  let emailInputRef = useRef(null);
  let passwordInputRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Clear toast message after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Welcome confetti on page load (only once)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !sessionStorage.getItem("loginConfettiShown")
    ) {
      setTimeout(() => {
        triggerWelcomeConfetti();
        sessionStorage.setItem("loginConfettiShown", "true");
      }, 500);
    }
  }, []);

  // Confetti functions
  const triggerWelcomeConfetti = () => {
    confetti({
      particleCount: isMobile ? 50 : 100, // Less particles on mobile
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#d97706", "#fbbf24", "#ffffff", "#92400e"],
      decay: 0.9,
      startVelocity: isMobile ? 25 : 30,
    });
  };

  // Only trigger confetti on successful login via frontend demo
  const triggerSuccessfulLoginConfetti = () => {
    if (loginButtonRef.current) {
      const rect = loginButtonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: isMobile ? 40 : 80,
        spread: 50,
        origin: { x, y },
        colors: ["#f59e0b", "#d97706", "#fbbf24", "#ffffff"],
        startVelocity: isMobile ? 25 : 35,
        decay: 0.9,
        ticks: isMobile ? 200 : 300,
      });
    }
  };

  // Throttled hover confetti - disabled on mobile
  const throttledHoverConfetti = useCallback(
    throttle((e) => {
      // Don't trigger confetti on mobile devices
      if (isMobile) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 8,
        spread: 40,
        origin: { x, y },
        colors: ["#f59e0b", "#fbbf24"],
        startVelocity: 15,
        decay: 0.95,
        ticks: 100,
        gravity: 0.6,
      });
    }, 500),
    [isMobile],
  );

  // Auto-fill demo credentials
  const fillDemoCredentials = () => {
    if (emailInputRef.current && passwordInputRef.current) {
      emailInputRef.current.value = "john@example.com";
      passwordInputRef.current.value = "password123";

      // Trigger success event for React state
      const emailEvent = new Event("input", { bubbles: true });
      const passwordEvent = new Event("input", { bubbles: true });
      emailInputRef.current.dispatchEvent(emailEvent);
      passwordInputRef.current.dispatchEvent(passwordEvent);

      confetti({
        particleCount: isMobile ? 15 : 20,
        spread: 30,
        origin: { y: 0.5 },
        colors: ["#10b981", "#34d399"],
        startVelocity: 20,
      });

      setToastMessage({
        type: "success",
        message: "Demo credentials filled! Click Sign In to continue.",
      });
    }
  };

  // Handle demo form submission with confetti
  const handleDemoSubmit = (e) => {
    if (
      emailInputRef.current?.value === "john@example.com" &&
      passwordInputRef.current?.value === "password123"
    ) {
      triggerSuccessfulLoginConfetti();
    }
  };

  // Handle touch events properly on mobile
  const handleTouchStart = useCallback((e) => {
    // Prevent default to avoid double-tap zoom on buttons
    if (e.currentTarget.tagName === "BUTTON") {
      e.preventDefault();
    }
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Toast Message - Using local state for demo alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 left-4 md:left-auto z-50 max-w-md mx-auto md:mx-0 ${
              toastMessage.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            } border px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-lg flex items-center gap-3`}
            role="alert"
            aria-live="assertive"
          >
            <span className="text-xl md:text-2xl" aria-hidden="true">
              {toastMessage.type === "error" ? "❌" : "✅"}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-sm md:text-base">
                {toastMessage.type === "error" ? "Error" : "Success"}
              </p>
              <p className="text-xs md:text-sm">{toastMessage.message}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className={`p-1 ${
                toastMessage.type === "error"
                  ? "text-red-500 hover:text-red-700"
                  : "text-green-500 hover:text-green-700"
              }`}
              aria-label="Close notification"
              onTouchStart={handleTouchStart}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles animation - only on desktop or with reduced count on mobile */}
      {!isMobile &&
        typeof window !== "undefined" &&
        Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-200/30 rounded-full"
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            aria-hidden="true"
          />
        ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="flex flex-col md:flex-row">
            {/* Left Panel - Form */}
            <div className="w-full md:w-1/2 p-6 md:p-12 relative order-2 md:order-1">
              {/* Background linear animation */}
              <motion.div
                className="absolute inset-0 bg-linear-to-br from-amber-50/30 via-transparent to-transparent"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                aria-hidden="true"
              />

              {/* Header - Simplified for mobile */}
              <div className="relative z-10">
                <div className="text-center mb-6 md:mb-10">
                  <Link to="/" className="inline-block group">
                    <motion.div
                      whileHover={{ scale: isMobile ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center space-x-2 md:space-x-3"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-r from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-500/50 transition-shadow">
                        <motion.span
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-white font-bold text-xl md:text-2xl"
                          aria-hidden="true"
                        >
                          ✈️
                        </motion.span>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                          SkyDrive Africa
                        </h1>
                        <p className="text-gray-600 text-xs md:text-sm mt-1 hidden md:block">
                          Premium Vehicle & Helicopter Rentals
                        </p>
                      </div>
                    </motion.div>
                  </Link>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 md:mt-8"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      Welcome Back
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">
                      Sign in to access your bookings
                    </p>
                  </motion.div>
                </div>

                {/* Demo Alert - Mobile optimized */}
                <AnimatePresence>
                  {showDemoAlert && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4 mb-4 md:mb-6 relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-linear-to-r from-transparent via-amber-200/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        aria-hidden="true"
                      />
                      <div className="relative z-10 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs md:text-sm text-amber-800 font-medium">
                            🎉 Demo Mode
                          </p>
                          <p className="text-xs text-amber-600 mt-1 wrap-break-word">
                            john@example.com / password123
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <motion.button
                            whileHover={{ scale: isMobile ? 1 : 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fillDemoCredentials}
                            onMouseEnter={throttledHoverConfetti}
                            onTouchStart={handleTouchStart}
                            className="text-xs bg-amber-600 text-white px-2 md:px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                            aria-label="Auto-fill demo credentials"
                          >
                            Auto-fill
                          </motion.button>
                          <button
                            onClick={() => setShowDemoAlert(false)}
                            className="text-amber-500 hover:text-amber-700 p-1"
                            aria-label="Close demo alert"
                            onTouchStart={handleTouchStart}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs md:text-sm text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <GoogleLoginButton />

                <div className="pt-4 md:pt-6"></div>

                {/* Form */}
                <Form
                  method="post"
                  onSubmit={handleDemoSubmit}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Email */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-gray-700 font-medium mb-1 md:mb-2 text-sm md:text-base"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        ref={emailInputRef}
                        id="email"
                        type="email"
                        name="email"
                        defaultValue={actionData?.values?.email}
                        placeholder="you@example.com"
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        onTouchStart={handleTouchStart}
                        className="w-full p-3 md:p-4 pl-10 md:pl-12 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-sm md:text-base"
                        required
                        aria-required="true"
                        aria-invalid={!!actionData?.fieldErrors?.email}
                        aria-describedby={
                          actionData?.fieldErrors?.email
                            ? "email-error"
                            : undefined
                        }
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                      />
                      <span
                        className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-lg md:text-xl"
                        aria-hidden="true"
                      >
                        📧
                      </span>
                      {focusedField === "email" && !isMobile && (
                        <motion.div
                          layoutId="focusIndicator"
                          className="absolute inset-0 border-2 border-amber-500 rounded-xl pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    {actionData?.fieldErrors?.email && (
                      <motion.span
                        id="email-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs md:text-sm mt-1 block"
                        role="alert"
                      >
                        {actionData.fieldErrors.email}
                      </motion.span>
                    )}
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label
                      htmlFor="password"
                      className="block text-gray-700 font-medium mb-1 md:mb-2 text-sm md:text-base"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-lg md:text-xl"
                        aria-hidden="true"
                      >
                        🔒
                      </span>
                      <input
                        ref={passwordInputRef}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        onTouchStart={handleTouchStart}
                        className="w-full p-3 md:p-4 pl-10 md:pl-12 pr-10 md:pr-12 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-sm md:text-base"
                        required
                        aria-required="true"
                        aria-invalid={!!actionData?.fieldErrors?.password}
                        aria-describedby={
                          actionData?.fieldErrors?.password
                            ? "password-error"
                            : undefined
                        }
                        autoCapitalize="none"
                        autoCorrect="off"
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: isMobile ? 1 : 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute inset-y-0 right-3 md:right-4 flex items-center text-gray-500 hover:text-amber-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        onTouchStart={handleTouchStart}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <span className="text-lg md:text-xl">
                          {showPassword ? "🙈" : "👁️"}
                        </span>
                      </motion.button>
                      {focusedField === "password" && !isMobile && (
                        <motion.div
                          layoutId="focusIndicator"
                          className="absolute inset-0 border-2 border-amber-500 rounded-xl pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    {actionData?.fieldErrors?.password && (
                      <motion.span
                        id="password-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs md:text-sm mt-1 block"
                        role="alert"
                      >
                        {actionData.fieldErrors.password}
                      </motion.span>
                    )}
                  </motion.div>

                  {/* Remember Me */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        name="remember"
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        aria-label="Remember me for 30 days"
                        onTouchStart={handleTouchStart}
                      />
                      <span className="ml-2 text-xs md:text-sm text-gray-600 group-hover:text-amber-600 transition-colors">
                        Remember me
                      </span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs md:text-sm text-amber-600 hover:text-amber-700 hover:underline transition-colors"
                      onTouchStart={handleTouchStart}
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <button
                      ref={loginButtonRef}
                      type="submit"
                      disabled={isSubmitting}
                      onMouseEnter={throttledHoverConfetti}
                      onTouchStart={handleTouchStart}
                      className="relative w-full bg-linear-to-r from-amber-600 to-amber-700 text-white p-3 md:p-4 rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                      aria-label={isSubmitting ? "Signing in..." : "Sign in"}
                    >
                      {/* Shine effect - disabled on mobile for performance */}
                      {!isSubmitting && !isMobile && (
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          aria-hidden="true"
                        />
                      )}

                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full"
                              aria-hidden="true"
                            />
                            <span>Signing in...</span>
                          </>
                        ) : (
                          <>
                            Sign In
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              aria-hidden="true"
                            >
                              →
                            </motion.span>
                          </>
                        )}
                      </span>
                    </button>
                  </motion.div>
                </Form>

                {/* Footer Links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 md:mt-8 text-center"
                >
                  <p className="text-xs md:text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-amber-600 font-semibold hover:underline inline-flex items-center gap-1 group"
                      onMouseEnter={throttledHoverConfetti}
                      onTouchStart={handleTouchStart}
                    >
                      Create Account
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        aria-hidden="true"
                      >
                        →
                      </motion.span>
                    </Link>
                  </p>

                  <p className="text-gray-500 text-xs mt-4 md:mt-6 px-4">
                    By signing in, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="text-amber-600 hover:underline"
                      onTouchStart={handleTouchStart}
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-amber-600 hover:underline"
                      onTouchStart={handleTouchStart}
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Right Panel - Hero (Hidden on mobile for better performance) */}
            <div className="hidden md:block md:w-1/2 bg-linear-to-br from-amber-600 to-amber-800 text-white p-12 relative overflow-hidden order-1 md:order-2">
              {/* Animated background patterns */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundImage:
                    "radial-linear(circle at 30% 40%, white 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
                aria-hidden="true"
              />

              {/* Floating orbs */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white/5"
                  style={{
                    width: i * 100,
                    height: i * 100,
                    left: `${i * 20}%`,
                    top: `${i * 15}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 5 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  }}
                  aria-hidden="true"
                />
              ))}

              <div className="relative z-10 h-full flex flex-col justify-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <motion.h2
                    animate={{
                      textShadow: [
                        "0 0 10px rgba(255,255,255,0.5)",
                        "0 0 20px rgba(255,255,255,0.8)",
                        "0 0 10px rgba(255,255,255,0.5)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-3xl font-bold mb-4"
                  >
                    Experience Luxury Travel
                  </motion.h2>
                  <p className="text-amber-100 text-lg">
                    Access Kenya's finest fleet of premium vehicles and
                    helicopters
                  </p>
                </motion.div>

                <div className="space-y-6">
                  {[
                    {
                      icon: "🚗",
                      title: "Premium Cars",
                      desc: "Mercedes, Range Rover, Porsche & more",
                    },
                    {
                      icon: "🚁",
                      title: "Luxury Helicopters",
                      desc: "Bell, Airbus, Robinson - scenic flights",
                    },
                    {
                      icon: "👔",
                      title: "VIP Service",
                      desc: "Chauffeur-driven, 24/7 support",
                    },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      whileHover={{ x: 10 }}
                      className="flex items-start group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="bg-white/20 rounded-lg p-3 mr-4 group-hover:bg-white/30 transition-colors"
                      >
                        <span className="text-2xl" aria-hidden="true">
                          {item.icon}
                        </span>
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-amber-100">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-10 pt-8 border-t border-amber-500"
                >
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-white/20 rounded-xl p-3 mr-4"
                    >
                      <span className="text-2xl" aria-hidden="true">
                        ⭐
                      </span>
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-lg">
                        Trusted by 500+ clients
                      </h4>
                      <p className="text-amber-200 mt-1">
                        Corporate and leisure travel
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                >
                  <span className="text-sm">🇰🇪 Since 2014</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
