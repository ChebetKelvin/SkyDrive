// app/routes/home.jsx
import { data } from "react-router";
import { useLoaderData, Link } from "react-router";
import { motion } from "framer-motion";
import { FaStar, FaArrowRight } from "react-icons/fa";

import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonial";
import { getVehicles } from "../models/vehicles";

/* =========================
   META
========================= */
export function meta() {
  return [
    {
      title: "SkyDrive | Luxury Car Rentals & Helicopter Experiences in Kenya",
    },
    {
      name: "description",
      content:
        "Discover premium car rentals and exclusive helicopter experiences with SkyDrive. Luxury vehicles, professional service, and seamless booking for extraordinary journeys across Kenya.",
    },
    {
      name: "keywords",
      content:
        "luxury car rental Kenya, helicopter hire Kenya, premium vehicle rental, SkyDrive rentals, private helicopter experience",
    },
  ];
}

/* =========================
   LOADER
========================= */
export async function loader() {
  const vehicles = await getVehicles();

  const formattedVehicles = vehicles.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toString(),
  }));

  // Get all vehicles by category
  const allCars = formattedVehicles.filter(
    (v) => v.category?.toLowerCase() !== "helicopter",
  );

  const allHelicopters = formattedVehicles.filter(
    (v) => v.category?.toLowerCase() === "helicopter",
  );

  // Limit to only a few for homepage
  const fleetData = {
    cars: allCars.slice(0, 3),
    helicopters: allHelicopters.slice(0, 3),
    totalCars: allCars.length,
    totalHelicopters: allHelicopters.length,
  };

  return data({ fleetData });
}

/* =========================
   COMPONENT
========================= */
export default function Home() {
  const { fleetData } = useLoaderData();

  const stats = [
    { value: `${fleetData.totalCars}+`, label: "Vehicles" },
    { value: `${fleetData.totalHelicopters}`, label: "Helicopters" },
    { value: "100%", label: "Safety" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
    hover: {
      y: -4,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div>
      <Hero />

      <section className="relative py-24 md:py-32 bg-white">
        <div className="absolute inset-0 bg-linear-to-b from-slate-50/50 to-white pointer-events-none" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADER */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-20"
          >
            <motion.p
              variants={itemVariants}
              className="text-sm font-medium text-amber-600 uppercase tracking-widest mb-3"
            >
              Our Collection
            </motion.p>

            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-light text-slate-900 mb-5"
            >
              Curated for{" "}
              <span className="font-semibold text-amber-600">
                Extraordinary Journeys
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-600 leading-relaxed"
            >
              Handpicked vehicles maintained to the highest standards. Each
              journey is an experience in comfort, safety, and luxury.
            </motion.p>
          </motion.div>

          {/* STATS */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-24"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-3xl font-light text-slate-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CARS SECTION - Only show if we have cars */}
          {fleetData.cars.length > 0 && (
            <>
              <SectionTitle title="Luxury Vehicles" />
              <VehicleGrid
                vehicles={fleetData.cars}
                cardVariants={cardVariants}
                containerVariants={containerVariants}
              />
            </>
          )}

          {/* HELICOPTERS SECTION - Only show if we have helicopters */}
          {fleetData.helicopters.length > 0 && (
            <>
              <SectionTitle title="Aerial Experiences" />
              <VehicleGrid
                vehicles={fleetData.helicopters}
                cardVariants={cardVariants}
                containerVariants={containerVariants}
              />
            </>
          )}

          {/* CTA */}
          <div className="mt-20 text-center">
            <p className="text-slate-600 mb-6">
              Explore our complete fleet and find the perfect vehicle for your
              journey
            </p>
            <Link
              to="/fleet"
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all duration-300"
            >
              Browse All Vehicles
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Testimonials />
    </div>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================= */

function SectionTitle({ title }) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-light text-slate-900 mb-3">{title}</h3>
      <div className="h-0.5 w-16 bg-linear-to-r from-amber-400 to-transparent" />
    </div>
  );
}

function VehicleGrid({ vehicles, cardVariants, containerVariants }) {
  if (!vehicles?.length) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid md:grid-cols-3 gap-8 mb-24"
    >
      {vehicles.map((vehicle) => (
        <motion.div
          key={vehicle.id}
          variants={cardVariants}
          whileHover="hover"
          className="group"
        >
          <div className="bg-white rounded-lg overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300">
            <div className="relative h-80 overflow-hidden bg-slate-100">
              <img
                src={
                  vehicle.thumbnail ||
                  vehicle.images?.[0] ||
                  "/default-vehicle.jpg"
                }
                alt={vehicle.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "/default-vehicle.jpg";
                }}
              />

              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-full shadow-sm">
                <FaStar className="text-amber-400 text-xs" />
                <span className="text-sm font-semibold text-slate-900">
                  {vehicle.rating || 4.8}
                </span>
              </div>
            </div>

            <div className="p-6">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-2">
                {vehicle.category || "Luxury Vehicle"}
              </p>

              <h3 className="text-xl font-light text-slate-900 mb-4">
                {vehicle.name}
              </h3>

              <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">From</p>
                  <p className="text-lg font-semibold text-slate-900">
                    Ksh{" "}
                    {(
                      vehicle.pricing?.hourly?.rate ||
                      Math.round((vehicle.pricing?.daily || 0) / 24)
                    )?.toLocaleString()}
                    <span className="text-xs text-slate-500">/hr</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Trips</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {vehicle.trips?.toLocaleString() ||
                      Math.floor(Math.random() * 1000 + 500).toLocaleString()}
                  </p>
                </div>
              </div>

              <Link
                to={`/fleet/${vehicle.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                View Details
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
