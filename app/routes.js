import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("fleet", "routes/vehicles.jsx"),
  route("fleet/:id", "routes/vehicleDetails.jsx"),
  route("booking/:id", "routes/booking.jsx"),
  route("booking-confirmation/:id", "routes/confirmation.jsx"),
  route("api/bookings", "routes/api.bookings.js"),
  route("login", "routes/login.jsx"),
  route("logout", "routes/logout.jsx"),
  route("register", "routes/signup.jsx"),
  route("dashboard", "routes/dashboard.jsx"),
  route("auth/google", "routes/auth.google.js"),

  route("bookings", "routes/bookingId.jsx"),
  route("about", "routes/about.jsx"),
  route("contact", "routes/contact.jsx"),
  route("mpesa", "routes/pesa.jsx"),
  route("payment-status", "routes/payment-status.jsx"),
  route("success", "routes/success.jsx"),

  route("admin", "routes/admin.jsx", [
    index("routes/admin.dashboard.jsx"),
    route("bookings", "routes/admin.bookings.jsx"),
    route("vehicles", "routes/admin.vehicles.jsx"),
    route("users", "routes/admin.users.jsx"),
    route("revenue", "routes/admin.revenue.jsx"),
    route("settings", "routes/admin.settings.jsx"),
  ]),
];
