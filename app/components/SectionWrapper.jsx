import { motion } from "framer-motion";

export default function SectionWrapper({
  children,
  id,
  ariaLabel,
  className = "",
  variant = "default",
}) {
  const spacing = {
    default: "py-12 sm:py-16 lg:py-20",
    compact: "py-8 sm:py-12 lg:py-16",
    spacious: "py-16 sm:py-20 lg:py-24",
    none: "",
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      id={id}
      aria-label={ariaLabel}
      className={`scroll-mt-20 ${spacing[variant]} ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </motion.section>
  );
}
