// routes/about.jsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router";
import {
  FaCar,
  FaHelicopter,
  FaClock,
  FaCheckCircle,
  FaShieldAlt,
  FaHeadset,
  FaArrowRight,
  FaStar,
  FaGem,
  FaLeaf,
} from "react-icons/fa";

export default function About() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    }),
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const services = [
    {
      icon: <FaCar className="w-8 h-8" />,
      title: "Premium Vehicle Rentals",
      description:
        "Access Kenya's finest fleet of luxury vehicles, from executive sedans to rugged SUVs for any occasion.",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: <FaHelicopter className="w-8 h-8" />,
      title: "Luxury Helicopter Charters",
      description:
        "Experience breathtaking aerial views with our fleet of modern helicopters, perfect for scenic flights and VIP transport.",
      color: "from-amber-600 to-amber-700",
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: "Flexible Scheduling",
      description:
        "Book by the hour, day, or week with our flexible scheduling system. Cancel or modify with 24-hour notice.",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: <FaCheckCircle className="w-8 h-8" />,
      title: "Conflict-Free Booking",
      description:
        "Real-time availability checking ensures you never double-book. Our system automatically prevents scheduling conflicts.",
      color: "from-amber-600 to-amber-700",
    },
  ];

  const whyChooseUs = [
    {
      icon: <FaGem className="w-6 h-6" />,
      title: "Unmatched Convenience",
      description:
        "Book anytime, anywhere with our intuitive platform. Choose your vehicle, select your time, and you're ready to go.",
    },
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: "Reliability You Can Trust",
      description:
        "Every vehicle and helicopter in our fleet is meticulously maintained and fully insured for your peace of mind.",
    },
    {
      icon: <FaStar className="w-6 h-6" />,
      title: "Complete Transparency",
      description:
        "No hidden fees, no surprises. What you see is what you pay, with all taxes and insurance included in the price.",
    },
    {
      icon: <FaHeadset className="w-6 h-6" />,
      title: "24/7 Premium Support",
      description:
        "Our dedicated concierge team is available around the clock to assist with any questions or special requests.",
    },
  ];

  const stats = [
    { value: "500+", label: "Happy Clients", suffix: "clients" },
    { value: "50+", label: "Premium Vehicles", suffix: "vehicles" },
    { value: "8", label: "Helicopters", suffix: "aircraft" },
    { value: "98%", label: "Satisfaction Rate", suffix: "satisfaction" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-linear-to-br from-amber-50/30 via-transparent to-amber-50/20" />
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-amber-200/20"
                style={{
                  width: Math.random() * 300 + 100,
                  height: Math.random() * 300 + 100,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 100 - 50, 0],
                }}
                transition={{
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-linear(circle at 30% 40%, #b8932f 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              Welcome to the Future of Travel
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
          >
            <span className="bg-linear-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
              SkyDrive
            </span>
            <br />
            <span className="text-4xl md:text-5xl text-gray-700">
              Elevate Your Journey
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Experience the pinnacle of luxury travel with Kenya's premier
            platform for premium vehicles and helicopter charters.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/fleet"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Fleet
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-amber-700 to-amber-800"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>

            <Link
              to="/helicopters"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-amber-600 text-amber-600 font-semibold rounded-full hover:bg-amber-50 transition-all duration-300"
            >
              View Helicopters
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative -mt-20 z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* What is SkyDrive Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-amber-600 font-semibold tracking-wider uppercase mb-4 block">
              About Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Redefining Luxury
              <br />
              <span className="text-amber-600">Travel in Kenya</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              SkyDrive is Kenya's premier platform for booking luxury vehicles
              and helicopter charters. Founded in 2014, we've been dedicated to
              providing unparalleled travel experiences for both corporate and
              leisure clients.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you need a sophisticated sedan for a business meeting, a
              rugged SUV for a safari adventure, or a helicopter for a scenic
              flight over Nairobi, SkyDrive makes it seamless, secure, and
              spectacular.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Luxury vehicle"
                className="w-full h-full object-cover"
              />
            </div>
            <motion.div
              className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-100 rounded-full -z-10"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section
        className="py-24 bg-linear-to-b from-white to-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-amber-600 font-semibold tracking-wider uppercase">
              Our Services
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6">
              Premium Fleet at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive range of luxury transportation options
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div
                  className={`w-16 h-16 bg-linear-to-br ${service.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-200 rounded-2xl transition-all duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-amber-600 font-semibold tracking-wider uppercase"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mt-4 mb-6"
          >
            The SkyDrive Difference
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {whyChooseUs.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-6"
            >
              <div className="shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  {item.icon}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section className="py-24 bg-linear-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-linear(circle at 30% 40%, #b8932f 2px, transparent 2px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <div className="inline-block p-3 bg-amber-500/20 rounded-xl mb-6">
                <FaGem className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                To revolutionize luxury travel in Kenya by providing seamless
                access to premium vehicles and helicopters, combined with
                exceptional service and uncompromising safety standards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center md:text-left"
            >
              <div className="inline-block p-3 bg-amber-500/20 rounded-xl mb-6">
                <FaLeaf className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                To become East Africa's most trusted name in luxury
                transportation, setting new standards for convenience,
                reliability, and customer experience in the region.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-linear-to-br from-amber-50 to-white rounded-3xl p-12 shadow-2xl border border-amber-100"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Experience Luxury?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose your ride and start your journey with SkyDrive today
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/fleet/vehicles"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                <FaCar />
                Book a Vehicle
              </span>
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-amber-700 to-amber-800"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>

            <Link
              to="/fleet/helicopters"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                <FaHelicopter />
                Book a Helicopter
              </span>
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-amber-700 to-amber-800"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            ✈️ 24/7 Support • Instant Confirmation • Best Price Guarantee
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}
