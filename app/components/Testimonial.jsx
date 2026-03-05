// components/PremiumTestimonials.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaQuoteLeft,
  FaStar,
  FaArrowLeft,
  FaArrowRight,
  FaCrown,
  FaCheckCircle,
  FaGlobe,
  FaCar,
  FaHeart,
  FaGem,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";
import { MapPin, Users, Award, Clock, Sparkles } from "lucide-react";

export default function PremiumTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Marcus Johnson",
      role: "CEO, TechCorp Africa",
      rating: 5,
      content:
        "SkyDrive transformed our executive transportation. The professionalism, attention to detail, and reliability are unmatched. Our international clients are consistently impressed.",
      location: "Nairobi, Kenya",
      trip: "Mercedes-Benz S-Class",
      duration: "3 months",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "Corporate",
      categoryColor: "from-amber-600 to-amber-700",
      icon: <Award className="w-4 h-4" />,
      trips: "45+",
      tag: "Premium Client",
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Wedding Planner",
      rating: 5,
      content:
        "For our luxury wedding packages, SkyDrive is our go-to partner. The Range Rover Autobiography made the bride's entrance absolutely magical. Flawless service!",
      location: "Mombasa, Kenya",
      trip: "Range Rover Autobiography",
      duration: "2 years",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "Events",
      categoryColor: "from-amber-500 to-amber-600",
      icon: <FaHeart className="w-4 h-4" />,
      trips: "32+",
      tag: "Event Specialist",
    },
    {
      id: 3,
      name: "David Omondi",
      role: "International Investor",
      rating: 5,
      content:
        "As someone who travels frequently between Nairobi and regional capitals, SkyDrive's helicopter service has saved me countless hours. The safety standards are exceptional.",
      location: "Across East Africa",
      trip: "Helicopter Service",
      duration: "1 year",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "Executive",
      categoryColor: "from-amber-700 to-amber-800",
      icon: <FaGlobe className="w-4 h-4" />,
      trips: "28+",
      tag: "Frequent Flyer",
    },
    {
      id: 4,
      name: "Amina Hassan",
      role: "Fashion Director",
      rating: 5,
      content:
        "For fashion week and VIP events, presentation is everything. SkyDrive's fleet is immaculate and the drivers are incredibly professional. They understand luxury.",
      location: "Dubai & Nairobi",
      trip: "Multiple Vehicles",
      duration: "8 months",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "VIP",
      categoryColor: "from-amber-600 to-amber-700",
      icon: <Sparkles className="w-4 h-4" />,
      trips: "19+",
      tag: "VIP Client",
    },
    {
      id: 5,
      name: "Robert Kimani",
      role: "Family Vacation Planner",
      rating: 5,
      content:
        "Our family safari with SkyDrive was exceptional. The customized Land Cruiser with panoramic roof made wildlife viewing incredible. Safe, comfortable, and unforgettable.",
      location: "Masai Mara",
      trip: "Land Cruiser VX",
      duration: "Multiple trips",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "Adventure",
      categoryColor: "from-amber-500 to-amber-600",
      icon: <MapPin className="w-4 h-4" />,
      trips: "12+",
      tag: "Adventure Seeker",
    },
  ];

  const stats = [
    {
      value: "98%",
      label: "Client Satisfaction",
      icon: <FaStar className="w-5 h-5" />,
      color: "from-amber-500 to-amber-600",
    },
    {
      value: "2,500+",
      label: "Trips Completed",
      icon: <FaCar className="w-5 h-5" />,
      color: "from-amber-600 to-amber-700",
    },
    {
      value: "4.9/5",
      label: "Average Rating",
      icon: <Award className="w-5 h-5" />,
      color: "from-amber-500 to-amber-600",
    },
    {
      value: "24/7",
      label: "Premium Support",
      icon: <Clock className="w-5 h-5" />,
      color: "from-amber-700 to-amber-800",
    },
  ];

  const trustFeatures = [
    {
      icon: <FaShieldAlt />,
      text: "Real-time GPS tracking",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: <FaHeadset />,
      text: "24/7 concierge support",
      color: "from-amber-600 to-amber-700",
    },
    {
      icon: <FaGem />,
      text: "Premium insurance coverage",
      color: "from-amber-700 to-amber-800",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -400 : 400,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-linear-to-b from-gray-50 via-white to-gray-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-96 bg-linear-to-r from-transparent via-amber-100/20 to-transparent" />
      </div>

      {/* Subtle Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-linear(circle at 30px 30px, #b8932f 2px, transparent 2px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-3 px-5 py-3 bg-amber-100/50 backdrop-blur-sm rounded-full border border-amber-200/50 mb-8"
          >
            <FaCrown className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800 uppercase tracking-widest">
              Verified Experiences
            </span>
            <FaCrown className="text-amber-600" />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Trusted by <span className="text-amber-600">Premium Clients</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
          >
            Join thousands of satisfied clients who experience luxury travel
            redefined with SkyDrive Africa.
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-6 text-center shadow-xl border border-gray-100 hover:shadow-2xl hover:shadow-amber-200/30 transition-all duration-300">
                <div
                  className={`w-14 h-14 bg-linear-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}
                >
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
              <div className="absolute inset-0 bg-linear-to-br from-amber-100/0 to-amber-100/0 group-hover:from-amber-100/20 group-hover:to-amber-200/20 rounded-2xl transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Testimonial Carousel */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-20 w-14 h-14 rounded-full bg-white border-2 border-amber-200 text-amber-600 flex items-center justify-center hover:border-amber-400 hover:scale-110 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 shadow-lg"
              aria-label="Previous testimonial"
            >
              <FaArrowLeft className="text-lg" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-20 w-14 h-14 rounded-full bg-white border-2 border-amber-200 text-amber-600 flex items-center justify-center hover:border-amber-400 hover:scale-110 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 shadow-lg"
              aria-label="Next testimonial"
            >
              <FaArrowRight className="text-lg" />
            </button>

            {/* Testimonial Content */}
            <div className="relative overflow-hidden min-h-150 lg:min-h-125">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
                    {/* Client Image Card */}
                    <div className="relative h-full">
                      <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl">
                        {/* Premium Badge */}
                        <div className="absolute top-6 left-6 z-10">
                          <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl border border-amber-200">
                            <span className="text-sm font-semibold text-amber-700">
                              {testimonials[activeIndex].tag}
                            </span>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-6 right-6 z-10">
                          <div
                            className={`bg-linear-to-r ${testimonials[activeIndex].categoryColor} text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2`}
                          >
                            {testimonials[activeIndex].icon}
                            <span>{testimonials[activeIndex].category}</span>
                          </div>
                        </div>

                        <img
                          src={testimonials[activeIndex].image}
                          alt={testimonials[activeIndex].name}
                          className="w-full h-full object-cover"
                        />

                        {/* linear Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

                        {/* Client Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <div className="flex items-end justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-1">
                                {testimonials[activeIndex].name}
                              </h3>
                              <p className="text-amber-200/90 text-sm">
                                {testimonials[activeIndex].role}
                              </p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                              {[...Array(testimonials[activeIndex].rating)].map(
                                (_, i) => (
                                  <FaStar
                                    key={i}
                                    className="text-amber-400 w-4 h-4"
                                  />
                                ),
                              )}
                            </div>
                          </div>

                          {/* Trip Details */}
                          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                            <div className="text-center">
                              <div className="text-xs text-amber-300/80 uppercase tracking-widest mb-1">
                                Vehicle
                              </div>
                              <div className="flex items-center justify-center gap-2 text-sm text-white">
                                <FaCar className="w-3 h-3" />
                                <span className="truncate max-w-20">
                                  {testimonials[activeIndex].trip}
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-amber-300/80 uppercase tracking-widest mb-1">
                                Trips
                              </div>
                              <div className="text-sm font-semibold text-white">
                                {testimonials[activeIndex].trips}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-amber-300/80 uppercase tracking-widest mb-1">
                                Location
                              </div>
                              <div className="flex items-center justify-center gap-1 text-sm text-white">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-20">
                                  {testimonials[activeIndex].location}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial Quote Card */}
                    <div className="relative">
                      <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                        {/* Large Quote Icon */}
                        <div className="absolute -top-4 -left-4">
                          <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xl">
                            <FaQuoteLeft className="text-xl text-white" />
                          </div>
                        </div>

                        <div className="mt-8 mb-6">
                          <h4 className="text-xl text-gray-800 mb-6 leading-relaxed italic">
                            "{testimonials[activeIndex].content}"
                          </h4>

                          {/* Verified Badge */}
                          <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
                            <div className="w-6 h-6 bg-linear-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                              <FaCheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-amber-800">
                                Verified Experience
                              </div>
                              <div className="text-xs text-amber-600">
                                {testimonials[activeIndex].duration} of premium
                                service
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="pt-6 border-t border-gray-100">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                                Client Since
                              </div>
                              <div className="text-sm font-semibold text-gray-800">
                                {testimonials[activeIndex].duration}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                                Total Trips
                              </div>
                              <div className="text-sm font-semibold text-gray-800">
                                {testimonials[activeIndex].trips}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                                Rating
                              </div>
                              <div className="text-sm font-semibold text-amber-600">
                                5.0/5.0
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-amber-200/30 rounded-2xl -z-10" />
                      <div className="absolute -top-4 -left-4 w-16 h-16 bg-linear-to-br from-amber-300 to-amber-400 rounded-full blur-xl opacity-50 -z-10" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Testimonial Dots */}
          <div className="flex justify-center items-center gap-3 mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > activeIndex ? 1 : -1);
                  setActiveIndex(index);
                }}
                className="group"
                aria-label={`Go to testimonial ${index + 1}`}
              >
                <motion.div whileHover={{ scale: 1.3 }} className="relative">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "bg-amber-600 w-6"
                        : "bg-amber-200 group-hover:bg-amber-300"
                    }`}
                  />
                  {index === activeIndex && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-amber-400/30"
                      animate={{ scale: [1, 2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </motion.div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 pt-16 border-t border-amber-200"
        >
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-100/50 rounded-full border border-amber-200 mb-8">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                Premium Safety & Service Guarantee
              </span>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Experience the SkyDrive Difference
            </h3>
            <p className="text-gray-600 mb-10">
              Join our community of premium clients who trust us with their most
              important journeys.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {trustFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-3 px-5 py-3 bg-white rounded-full border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`w-8 h-8 bg-linear-to-br ${feature.color} rounded-full flex items-center justify-center text-white`}
                  >
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="mt-12"
            >
              <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-amber-500/30 transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  Share Your Experience
                  <FaStar className="group-hover:rotate-12 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-amber-700 to-amber-800"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
