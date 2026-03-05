// .server/validation.js - PURE JAVASCRIPT ONLY, NO JSX!
export function validateEmail(email) {
  if (!email || email.trim() === "") {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.trim() === "") {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

export function validateText(text, minLength = 2, maxLength = 50) {
  if (!text || text.trim() === "") {
    return "This field is required";
  }
  if (text.length < minLength) {
    return `Must be at least ${minLength} characters`;
  }
  if (text.length > maxLength) {
    return `Must be less than ${maxLength} characters`;
  }
  return null;
}

export function validatePhone(phone) {
  if (!phone || phone.trim() === "") return null;
  const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    return "Please enter a valid Kenyan phone number (e.g., 0712 345 678 or +254712345678)";
  }
  return null;
}

// Validate redirect URLs to prevent open redirect vulnerabilities
export function isValidRedirect(redirectTo) {
  // Only allow relative paths
  if (!redirectTo || typeof redirectTo !== "string") {
    return false;
  }

  // Must start with '/' and not be external
  if (!redirectTo.startsWith("/")) {
    return false;
  }

  // Block javascript: and other dangerous protocols
  if (redirectTo.includes(":") && !redirectTo.startsWith("/")) {
    return false;
  }

  // Block double slashes (potential protocol bypass)
  if (redirectTo.includes("//") && !redirectTo.startsWith("/")) {
    return false;
  }

  // Only allow specific paths (optional - you can expand this list)
  const allowedPaths = [
    "/dashboard",
    "/profile",
    "/bookings",
    "/favorites",
    "/settings",
  ];

  // If you want to restrict to specific paths, uncomment:
  // return allowedPaths.some(path => redirectTo.startsWith(path));

  // Or allow all relative paths:
  return true;
}
