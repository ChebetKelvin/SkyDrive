import { motion } from "framer-motion";
import { Link } from "react-router";
import { FaStar, FaArrowRight } from "react-icons/fa";

const fleetData = {
  cars: [
    {
      id: 1,
      name: "Mercedes-Benz S-Class",
      category: "Executive Sedan",
      image: "/s-class.jpg",
      pricePerHour: 12000,
      rating: 4.9,
      trips: 1200,
    },
    {
      id: 2,
      name: "Range Rover Autobiography",
      category: "Luxury SUV",
      image: "/range-rover.jpg",
      pricePerHour: 15000,
      rating: 4.8,
      trips: 850,
    },
    {
      id: 3,
      name: "Toyota Land Cruiser VX",
      category: "Premium Safari Vehicle",
      image: "/landcruiser.jpg",
      pricePerHour: 9000,
      rating: 4.9,
      trips: 2100,
    },
  ],
  helicopters: [
    {
      id: 4,
      name: "Bell 407 GXi",
      category: "Executive Transport",
      image: "/bell-407.jpg",
      pricePerHour: 180000,
      rating: 4.9,
      trips: 450,
    },
    {
      id: 5,
      name: "Airbus H125",
      category: "Aerial Safari",
      image: "/H125.jpg",
      pricePerHour: 150000,
      rating: 4.8,
      trips: 320,
    },
  ],
};

const stats = [
  { value: "50+", label: "Vehicles" },
  { value: "12", label: "Helicopters" },
  { value: "24", label: "Cities" },
  { value: "100%", label: "Safety" },
];

export default function FleetPreview() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
    hover: {
      y: -4,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section className="relative py-24 md:py-32 bg-white">
      {/* Subtle linear background */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-50/50 to-white pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
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
            className="text-4xl md:text-5xl font-light text-slate-900 mb-5 leading-tight"
          >
            Curated for{" "}
            <span className="font-semibold text-amber-600">
              Extraordinary Journeys
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-light"
          >
            Handpicked vehicles maintained to the highest standards. Each
            journey is an experience in comfort, safety, and luxury.
          </motion.p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 md:mb-28"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="text-center group"
            >
              <div className="text-3xl md:text-4xl font-light text-slate-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                {stat.label}
              </div>
              <div className="h-0.5 bg-linear-to-r from-transparent via-amber-300 to-transparent mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Luxury Vehicles Section */}
        <div className="mb-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-2xl font-light text-slate-900 mb-3">
              Luxury Vehicles
            </h3>
            <div className="h-0.5 w-16 bg-linear-to-r from-amber-400 to-transparent" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {fleetData.cars.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                variants={cardVariants}
                whileHover="hover"
                className="group cursor-pointer"
              >
                {/* Card Container */}
                <div className="bg-white rounded-lg overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative h-85 overflow-hidden bg-slate-100">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Rating Badge - Top Right */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      <FaStar className="text-amber-400 text-xs" />
                      <span className="text-sm font-semibold text-slate-900">
                        {vehicle.rating}
                      </span>
                    </div>

                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Label */}
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-2">
                      {vehicle.category}
                    </p>

                    {/* Vehicle Name */}
                    <h3 className="text-xl font-light text-slate-900 mb-4 leading-tight group-hover:text-amber-600 transition-colors duration-300">
                      {vehicle.name}
                    </h3>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          From
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          ksh{vehicle.pricePerHour.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500">
                            /hr
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Trips
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {vehicle.trips.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* CTA Link */}
                    <Link
                      to={`/fleet/${vehicle.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-300 group/link"
                    >
                      View Details
                      <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Aerial Experiences Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-2xl font-light text-slate-900 mb-3">
              Aerial Experiences
            </h3>
            <div className="h-0.5 w-16 bg-linear-to-r from-amber-400 to-transparent" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 gap-8"
          >
            {fleetData.helicopters.map((helicopter) => (
              <motion.div
                key={helicopter.id}
                variants={cardVariants}
                whileHover="hover"
                className="group cursor-pointer"
              >
                {/* Card Container */}
                <div className="bg-white rounded-lg overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative h-90 overflow-hidden bg-slate-100">
                    {/* Placeholder linear - replace with actual image */}
                    <img
                      src={helicopter.image}
                      alt={helicopter.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Rating Badge - Top Right */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      <FaStar className="text-amber-400 text-xs" />
                      <span className="text-sm font-semibold text-slate-900">
                        {helicopter.rating}
                      </span>
                    </div>

                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Label */}
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-2">
                      {helicopter.category}
                    </p>

                    {/* Helicopter Name */}
                    <h3 className="text-xl font-light text-slate-900 mb-4 leading-tight group-hover:text-amber-600 transition-colors duration-300">
                      {helicopter.name}
                    </h3>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          From
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          ksh{helicopter.pricePerHour.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500">
                            /hr
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Trips
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {helicopter.trips.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* CTA Link */}
                    <Link
                      to={`/fleet/${helicopter.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-300 group/link"
                    >
                      View Details
                      <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-slate-600 mb-6">
            Explore our complete fleet and find the perfect vehicle for your
            journey
          </p>
          <Link
            to="/fleet"
            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/20"
          >
            Browse All Vehicles
            <FaArrowRight className="text-sm" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
