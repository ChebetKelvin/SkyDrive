import { useState } from "react";
import { Form, Link, redirect, useActionData } from "react-router";
import {
  getSession,
  commitSession,
  setErrorMessage,
  setSuccessMessage,
} from "../.server/session.js";
import bcrypt from "bcryptjs";
import { addUser } from "../models/user.js";
import {
  validateText,
  validateEmail,
  validatePassword,
  validatePhone,
} from "../.server/validation.js";

export async function action({ request }) {
  let session = await getSession(request.headers.get("Cookie"));
  let formData = await request.formData();

  let name = formData.get("name");
  let email = formData.get("email");
  let password = formData.get("password");
  let confirmPassword = formData.get("confirmPassword");
  let phone = formData.get("phone") || "";
  let accountType = formData.get("accountType");

  // Validation
  let fieldErrors = {
    name: validateText(name, 2, 50),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword:
      password !== confirmPassword ? "Passwords do not match" : null,
    phone: validatePhone(phone),
    accountType:
      !accountType || !["individual", "corporate"].includes(accountType)
        ? "Please select an account type"
        : null,
  };

  // Remove null errors
  Object.keys(fieldErrors).forEach((key) => {
    if (!fieldErrors[key]) delete fieldErrors[key];
  });

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { name, email, phone, accountType } };
  }

  try {
    // Hash password
    let hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    let user = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim() || null,
      accountType,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      verified: false,
      bookings: [],
      favorites: [],
    };

    let result = await addUser(user);

    if (result.acknowledged) {
      setSuccessMessage(
        session,
        `Account created successfully! Welcome to SkyDrive Africa ${accountType === "corporate" ? "🏢" : "👤"}`,
      );
    } else {
      setErrorMessage(
        session,
        "Email already registered. Please use a different email.",
      );
    }
  } catch (error) {
    setErrorMessage(session, "Registration failed. Please try again.");
  }

  return redirect("/login", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Signup() {
  let actionData = useActionData();
  let [showPassword, setShowPassword] = useState(false);
  let [showConfirmPassword, setShowConfirmPassword] = useState(false);
  let [accountType, setAccountType] = useState(
    actionData?.values?.accountType || "individual",
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="md:flex">
          {/* Left Panel - Form - COMPACT DESIGN */}
          <div className="md:w-1/2 p-6 md:p-8">
            {/* Header - More Compact */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-block">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-10 h-10 bg-linear-to-r from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">✈️</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                      SkyDrive Africa
                    </h1>
                    <p className="text-gray-600 text-xs mt-0.5">
                      Premium Vehicle & Helicopter Rentals
                    </p>
                  </div>
                </div>
              </Link>

              <div className="mt-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Create Account
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Join Kenya's premium mobility service
                </p>
              </div>
            </div>

            {/* Form - 2 COLUMN LAYOUT */}
            <Form method="post" className="space-y-4">
              {/* Row 1: Name & Email - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-gray-700 font-medium text-xs mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={actionData?.values?.name}
                    placeholder="John Doe"
                    className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    required
                  />
                  {actionData?.fieldErrors?.name && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {actionData.fieldErrors.name}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium text-xs mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={actionData?.values?.email}
                    placeholder="you@example.com"
                    className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    required
                  />
                  {actionData?.fieldErrors?.email && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {actionData.fieldErrors.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Phone (Full Width - Optional) */}
              <div>
                <label className="block text-gray-700 font-medium text-xs mb-1">
                  Phone Number{" "}
                  <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={actionData?.values?.phone}
                  placeholder="0712 345 678"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                />
                {actionData?.fieldErrors?.phone && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {actionData.fieldErrors.phone}
                  </span>
                )}
              </div>

              {/* Row 3: Password & Confirm Password - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="block text-gray-700 font-medium text-xs mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create password"
                      className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-amber-600 text-sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {actionData?.fieldErrors?.password && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {actionData.fieldErrors.password}
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-700 font-medium text-xs mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-amber-600 text-sm"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {actionData?.fieldErrors?.confirmPassword && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {actionData.fieldErrors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              {/* Account Type Selection - Compact */}
              <div>
                <label className="block text-gray-700 font-medium text-xs mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`
                      relative border-2 rounded-lg p-3 cursor-pointer transition-all duration-200
                      ${
                        accountType === "individual"
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-amber-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value="individual"
                      checked={accountType === "individual"}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${accountType === "individual" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}
                        `}
                      >
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium block">
                          Individual
                        </span>
                        <span className="text-xs text-gray-500">
                          Personal travel
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`
                      relative border-2 rounded-lg p-3 cursor-pointer transition-all duration-200
                      ${
                        accountType === "corporate"
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-amber-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value="corporate"
                      checked={accountType === "corporate"}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${accountType === "corporate" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}
                        `}
                      >
                        <span className="text-lg">🏢</span>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium block">
                          Corporate
                        </span>
                        <span className="text-xs text-gray-500">
                          Business account
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
                {actionData?.fieldErrors?.accountType && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {actionData.fieldErrors.accountType}
                  </span>
                )}
              </div>

              {/* Submit Button - Compact */}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-amber-600 to-amber-700 text-white p-3 rounded-lg font-semibold text-sm hover:from-amber-700 hover:to-amber-800 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Account
              </button>
            </Form>

            {/* Footer Links - Compact */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-amber-600 font-semibold hover:underline text-sm"
                >
                  Sign In
                </Link>
              </p>

              <p className="text-gray-500 text-xs mt-4">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-amber-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-amber-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Right Panel - Benefits - COMPACT & DYNAMIC */}
          <div className="md:w-1/2 bg-linear-to-br from-amber-600 to-amber-800 text-white p-6 md:p-8 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16" />

            <div className="relative z-10 h-full flex flex-col">
              {/* Dynamic Header Based on Account Type */}
              <div className="mb-6">
                <div className="inline-block bg-white/20 rounded-full px-3 py-1 text-xs mb-3">
                  {accountType === "corporate"
                    ? "🏢 CORPORATE"
                    : "👤 INDIVIDUAL"}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {accountType === "corporate"
                    ? "Grow Your Business"
                    : "Experience Luxury"}
                </h2>
                <p className="text-amber-100 text-sm">
                  {accountType === "corporate"
                    ? "Priority booking & dedicated account manager"
                    : "Access Kenya's finest premium fleet"}
                </p>
              </div>

              {/* Benefits Grid - 2x2 Layout */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {accountType === "corporate" ? (
                  <>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="bg-amber-500/30 rounded-lg w-8 h-8 flex items-center justify-center mb-2">
                        <span className="text-lg">🏢</span>
                      </div>
                      <h4 className="font-semibold text-sm">Account Manager</h4>
                      <p className="text-amber-100 text-xs mt-1">
                        Dedicated support
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="bg-amber-500/30 rounded-lg w-8 h-8 flex items-center justify-center mb-2">
                        <span className="text-lg">💰</span>
                      </div>
                      <h4 className="font-semibold text-sm">Corporate Rates</h4>
                      <p className="text-amber-100 text-xs mt-1">
                        Monthly invoicing
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="bg-amber-500/30 rounded-lg w-8 h-8 flex items-center justify-center mb-2">
                        <span className="text-lg">📋</span>
                      </div>
                      <h4 className="font-semibold text-sm">Multi-Vehicle</h4>
                      <p className="text-amber-100 text-xs mt-1">
                        Fleet bookings
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="bg-amber-500/30 rounded-lg w-8 h-8 flex items-center justify-center mb-2">
                        <span className="text-lg">🎯</span>
                      </div>
                      <h4 className="font-semibold text-sm">Priority</h4>
                      <p className="text-amber-100 text-xs mt-1">
                        Airport transfers
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="bg-amber-500/30 rounded-lg w-8 h-8 flex items-center justify-center mb-2">
                        <span className="text-lg">🚗</span>
                      </div>
                      <h4 className="font-semibold text-sm">Premium Fleet</h4>
                      <p className="text-amber-100 text-xs mt-1">
                        All vehicles access
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="bg-amber-500/30 rounded-lg w-8 h-8 flex items-center justify-center mb-2">
                        <span className="text-lg">❤️</span>
                      </div>
                      <h4 className="font-semibold text-sm">Favorites</h4>
                      <p className="text-amber-100 text-xs mt-1">
                        Save vehicles
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="bg-amber-500/30 rounded-lg w-8 h-8 flex items-center justify-center mb-2">
                        <span className="text-lg">⭐</span>
                      </div>
                      <h4 className="font-semibold text-sm">Loyalty Points</h4>
                      <p className="text-amber-100 text-xs mt-1">
                        Earn rewards
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="bg-amber-500/30 rounded-lg w-8 h-8 flex items-center justify-center mb-2">
                        <span className="text-lg">🎁</span>
                      </div>
                      <h4 className="font-semibold text-sm">Special Offers</h4>
                      <p className="text-amber-100 text-xs mt-1">
                        Birthday & anniversary
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Kenya Badge */}
              <div className="mt-auto pt-4 border-t border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-2">
                    <span className="text-xl">🇰🇪</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      Kenya's Premium Choice
                    </h4>
                    <p className="text-amber-200 text-xs mt-0.5">
                      Nairobi • Mombasa • Diani • Maasai Mara
                    </p>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center gap-2 mt-3 text-xs text-amber-200">
                  <span>✅ 100% Secure</span>
                  <span className="w-1 h-1 bg-amber-400/50 rounded-full"></span>
                  <span>⭐ 4.9/5 Rating</span>
                  <span className="w-1 h-1 bg-amber-400/50 rounded-full"></span>
                  <span>🚀 Instant Booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
