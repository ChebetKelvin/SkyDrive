// routes/contact.jsx
import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Form, Link } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaHeadset,
  FaWhatsapp,
  FaTelegram,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    preferredContact: "email",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Message sent successfully! We'll respond within 24 hours.", {
      icon: "✈️",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });

    setSubmitted(true);
    setIsSubmitting(false);
    setFormState({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      preferredContact: "email",
    });

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: <FaPhone className="w-6 h-6" />,
      title: "Phone Support",
      details: ["+254 700 000 000", "+254 711 111 111"],
      action: "Call now",
      link: "tel:+254700000000",
      bg: "from-amber-500 to-amber-600",
    },
    {
      icon: <FaEnvelope className="w-6 h-6" />,
      title: "Email Us",
      details: ["info@skydrive.co.ke", "support@skydrive.co.ke"],
      action: "Send email",
      link: "mailto:info@skydrive.co.ke",
      bg: "from-amber-600 to-amber-700",
    },
    {
      icon: <FaMapMarkerAlt className="w-6 h-6" />,
      title: "Visit Us",
      details: ["Westlands Business Park", "Nairobi, Kenya"],
      action: "Get directions",
      link: "https://maps.google.com/?q=Westlands+Nairobi",
      bg: "from-amber-500 to-amber-600",
    },
    {
      icon: <FaClock className="w-6 h-6" />,
      title: "Working Hours",
      details: ["24/7 Support", "Office: Mon-Fri 8am-6pm"],
      action: "Always available",
      link: "#",
      bg: "from-amber-600 to-amber-700",
    },
  ];

  const socialLinks = [
    {
      icon: <FaFacebookF />,
      href: "#",
      label: "Facebook",
      color: "hover:bg-[#1877f2]",
    },
    {
      icon: <FaTwitter />,
      href: "#",
      label: "Twitter",
      color: "hover:bg-[#1da1f2]",
    },
    {
      icon: <FaInstagram />,
      href: "#",
      label: "Instagram",
      color: "hover:bg-[#e4405f]",
    },
    {
      icon: <FaLinkedinIn />,
      href: "#",
      label: "LinkedIn",
      color: "hover:bg-[#0a66c2]",
    },
    {
      icon: <FaWhatsapp />,
      href: "#",
      label: "WhatsApp",
      color: "hover:bg-[#25d366]",
    },
    {
      icon: <FaTelegram />,
      href: "#",
      label: "Telegram",
      color: "hover:bg-[#0088cc]",
    },
  ];

  const faqs = [
    {
      question: "How quickly do you respond to inquiries?",
      answer:
        "We respond to all inquiries within 2 hours during business hours and within 12 hours for after-hours submissions.",
    },
    {
      question: "Can I book a vehicle through WhatsApp?",
      answer:
        "Yes! You can reach us on WhatsApp at +254 700 000 000 for quick bookings and inquiries.",
    },
    {
      question: "Do you offer airport pickup services?",
      answer:
        "Absolutely. We provide premium airport transfer services with meet-and-greet at Jomo Kenyatta International Airport.",
    },
    {
      question: "What areas do you serve?",
      answer:
        "We serve Nairobi, Mombasa, Kisumu, and major tourist destinations across Kenya. Special arrangements can be made for other locations.",
    },
  ];

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
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      <Toaster position="top-center" />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
      >
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-linear-to-br from-amber-50/30 via-transparent to-amber-50/20" />
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-amber-200/20"
                style={{
                  width: Math.random() * 250 + 50,
                  height: Math.random() * 250 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 50 - 25, 0],
                  y: [0, Math.random() * 50 - 25, 0],
                }}
                transition={{
                  duration: Math.random() * 15 + 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-linear(circle at 70% 30%, #b8932f 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.span
            variants={itemVariants}
            className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6"
          >
            Get in Touch
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            <span className="bg-linear-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
              Contact SkyDrive
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            We're here to help 24/7. Reach out for bookings, inquiries, or any
            assistance you need.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Contact Info Cards */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative -mt-20 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              className="group relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${info.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 bg-linear-to-br ${info.bg} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {info.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {info.title}
                </h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-gray-600 text-sm">
                    {detail}
                  </p>
                ))}
                <a
                  href={info.link}
                  className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium mt-4 group-hover:gap-3 transition-all"
                >
                  {info.action}
                  <FaArrowRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Main Contact Section */}
      <motion.section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Send Us a Message
              </h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you within 2
                hours.
              </p>
            </div>

            <Form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="Booking Inquiry"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      checked={formState.preferredContact === "email"}
                      onChange={handleChange}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="phone"
                      checked={formState.preferredContact === "phone"}
                      onChange={handleChange}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-gray-700">Phone</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="whatsapp"
                      checked={formState.preferredContact === "whatsapp"}
                      onChange={handleChange}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-gray-700">WhatsApp</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl overflow-hidden shadow-lg hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : submitted ? (
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="w-5 h-5" />
                    Message Sent!
                  </div>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-2">
                      Send Message
                      <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-linear-to-r from-amber-700 to-amber-800"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting this form, you agree to our privacy policy and
                consent to being contacted by our team.
              </p>
            </Form>
          </motion.div>

          {/* Right Column - Map & Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Map */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Our Location
              </h3>
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8462962765164!2d36.8219!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d2b7f1d7c5%3A0x3b3f1d9c8c9f9b9!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="SkyDrive Location"
                  className="w-full h-full"
                />
              </div>
              <p className="text-gray-600 text-sm mt-4">
                <FaMapMarkerAlt className="inline text-amber-600 mr-2" />
                Westlands Business Park, Nairobi, Kenya
              </p>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Connect With Us
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 transition-all duration-300 ${social.color} hover:text-white`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* FAQ Preview */}
            <div className="bg-linear-to-br from-amber-50 to-white rounded-3xl shadow-2xl p-6 border border-amber-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Answers
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-amber-100 last:border-0 pb-4 last:pb-0"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium mt-4 hover:gap-3 transition-all"
              >
                View all FAQs
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Emergency Support Banner */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
      >
        <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-linear(circle at 30% 40%, #b8932f 2px, transparent 2px)`,
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                <FaHeadset className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  24/7 Emergency Support
                </h3>
                <p className="text-gray-300">
                  For urgent assistance, call our emergency hotline
                </p>
              </div>
            </div>
            <a
              href="tel:+254700000000"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/30"
            >
              <FaPhone className="w-4 h-4" />
              +254 700 000 000
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="bg-linear-to-br from-amber-50 to-white rounded-3xl p-12 shadow-2xl border border-amber-100"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Book your vehicle or helicopter now and experience luxury travel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/fleet/vehicles"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
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
        </motion.div>
      </motion.section>
    </div>
  );
}
