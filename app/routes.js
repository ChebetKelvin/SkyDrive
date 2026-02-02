import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("fleet", "routes/vehicles.jsx"),
  route("fleet/:id", "routes/vehicleDetails.jsx"),
  route("book/:id", "routes/booking.jsx"),
  route("confirmation", "routes/confirmation.jsx"),
];
