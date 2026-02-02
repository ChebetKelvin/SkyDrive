import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaQuoteLeft,
  FaStar,
  FaArrowLeft,
  FaArrowRight,
  FaCrown,
  FaCheckCircle,
} from "react-icons/fa";

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const testimonials = [
    {
      id: 1,
      name: "Marcus Johnson",
      role: "CEO, TechCorp Africa",
      rating: 5,
      content:
        "SkyDrive transformed our executive transportation. The professionalism, attention to detail, and reliability are unmatched. Our international clients are consistently impressed.",
      location: "Nairobi, Kenya",
      trip: "Mercedes S-Class",
      duration: "3 months",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "Corporate",
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
    },
  ];

  const stats = [
    { value: "98%", label: "Client Satisfaction" },
    { value: "2,500+", label: "Trips Completed" },
    { value: "4.9/5", label: "Average Rating" },
    { value: "24/7", label: "Support Available" },
  ];

  // Auto-rotate testimonials
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
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
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
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-700 via-black to-amber-800" />
      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      {/* Animated Glow Effects */}
      <div className="absolute top-1/3 -left-40 w-125 h-125 bg-amber-500/3 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 -right-40 w-125 h-125 bg-amber-600/3 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
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
            className="inline-flex items-center gap-3 px-5 py-2.5 bg-amber-900/20 backdrop-blur-sm rounded-full border border-amber-800/30 mb-8"
          >
            <FaCrown className="text-amber-400" />
            <span className="text-sm font-medium text-amber-300 uppercase tracking-widest">
              Client Experiences
            </span>
            <FaCrown className="text-amber-400" />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight"
          >
            Trusted by{" "}
            <span className="font-semibold bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-amber-100/70 leading-relaxed max-w-2xl mx-auto font-light"
          >
            Discover why executives, celebrities, and families choose SkyDrive
            for their most important journeys.
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={index}
              whileHover={{ y: -4 }}
              className="bg-linear-to-br from-gray-800/50 to-black/50 border border-amber-800/20 rounded-2xl p-8 text-center backdrop-blur-sm hover:border-amber-600/30 transition-all duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-amber-300/70 uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Testimonial Carousel */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-14 h-14 rounded-full bg-linear-to-br from-gray-800 to-black border border-amber-800/30 text-amber-400 flex items-center justify-center hover:border-amber-600 hover:scale-110 transition-all duration-300 backdrop-blur-sm shadow-2xl"
              aria-label="Previous testimonial"
            >
              <FaArrowLeft className="text-lg" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-14 h-14 rounded-full bg-linear-to-br from-gray-800 to-black border border-amber-800/30 text-amber-400 flex items-center justify-center hover:border-amber-600 hover:scale-110 transition-all duration-300 backdrop-blur-sm shadow-2xl"
              aria-label="Next testimonial"
            >
              <FaArrowRight className="text-lg" />
            </button>

            {/* Testimonial Content */}
            <div className="relative overflow-hidden min-h-125">
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
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Client Image & Info */}
                    <div className="relative">
                      <div className="relative rounded-2xl overflow-hidden border border-amber-800/30">
                        {/* Decorative Corner */}
                        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-600/50 rounded-tl-2xl" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-600/50 rounded-br-2xl" />

                        <img
                          src={testimonials[activeIndex].image}
                          alt={testimonials[activeIndex].name}
                          className="w-full h-100 object-cover opacity-90"
                        />

                        {/* Overlay linear */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                        {/* Client Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-900/30 rounded-full border border-amber-800/30 mb-2">
                                <span className="text-xs text-amber-300">
                                  {testimonials[activeIndex].category}
                                </span>
                              </div>
                              <h3 className="text-2xl font-light text-white">
                                {testimonials[activeIndex].name}
                              </h3>
                              <p className="text-amber-300/70 text-sm">
                                {testimonials[activeIndex].role}
                              </p>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex items-center gap-1">
                              {[...Array(testimonials[activeIndex].rating)].map(
                                (_, i) => (
                                  <FaStar
                                    key={i}
                                    className="text-amber-400 fill-amber-400"
                                  />
                                ),
                              )}
                            </div>
                          </div>

                          {/* Trip Details */}
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-800/30">
                            <div>
                              <p className="text-xs text-amber-500/70 uppercase tracking-widest mb-1">
                                Vehicle
                              </p>
                              <p className="text-sm text-amber-300">
                                {testimonials[activeIndex].trip}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-500/70 uppercase tracking-widest mb-1">
                                Duration
                              </p>
                              <p className="text-sm text-amber-300">
                                {testimonials[activeIndex].duration}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location Badge */}
                      <div className="absolute -top-4 -right-4 bg-linear-to-br from-amber-600 to-amber-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        {testimonials[activeIndex].location}
                      </div>
                    </div>

                    {/* Testimonial Quote */}
                    <div className="relative">
                      {/* Quote Icon */}
                      <div className="absolute -top-4 -left-4 text-amber-600/20">
                        <FaQuoteLeft className="text-6xl" />
                      </div>

                      <div className="bg-linear-to-br from-gray-800/50 to-black/50 border border-amber-800/30 rounded-2xl p-8 backdrop-blur-sm">
                        <div className="mb-8">
                          <h4 className="text-2xl font-light text-white mb-6 leading-relaxed">
                            {testimonials[activeIndex].content}
                          </h4>

                          {/* Verified Badge */}
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/20 rounded-full border border-amber-800/30">
                            <FaCheckCircle className="text-amber-400" />
                            <span className="text-sm text-amber-300">
                              Verified Experience
                            </span>
                          </div>
                        </div>

                        {/* Client Verification */}
                        <div className="pt-6 border-t border-amber-800/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-amber-500/70 uppercase tracking-widest mb-1">
                                Client Since
                              </p>
                              <p className="text-amber-300">
                                {testimonials[activeIndex].duration}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-amber-500/70 uppercase tracking-widest mb-1">
                                Total Trips
                              </p>
                              <p className="text-amber-300">15+</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute -bottom-4 -right-4 w-20 h-20 border-2 border-amber-600/20 rounded-2xl" />
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
                <div className="relative">
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "bg-linear-to-r from-amber-400 to-amber-600"
                        : "bg-amber-800/30 group-hover:bg-amber-700/50"
                    }`}
                  />
                  {index === activeIndex && (
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-400/30 animate-ping" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 pt-16 border-t border-amber-800/20"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-light text-white mb-6">
              Join Our Community of Satisfied Clients
            </h3>
            <p className="text-amber-100/60 mb-8">
              From corporate executives to families on vacation, our clients
              trust us with their most important journeys.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-3 px-5 py-3 bg-amber-900/20 rounded-full border border-amber-800/30">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-amber-300">
                  Real-time tracking
                </span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-amber-900/20 rounded-full border border-amber-800/30">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-amber-300">24/7 concierge</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-amber-900/20 rounded-full border border-amber-800/30">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-amber-300">
                  Premium insurance
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
