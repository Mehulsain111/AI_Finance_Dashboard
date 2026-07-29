"use client";

import { motion } from "framer-motion";

// Drop-in replacements for a plain <div>: pass the exact same className
// (including Bootstrap grid classes like "row" or "col-12 col-lg-8") and
// nothing about the layout changes -- only entrance animation is added.
// MotionStagger is the container (usually the ".row"); each direct child
// section goes in its own MotionItem. Items don't declare their own
// initial/animate -- they inherit the container's "hidden"/"visible" state
// and stagger automatically via Framer Motion's variant propagation.

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function MotionStagger({ children, className }) {
  return (
    <motion.div className={className} initial="hidden" animate="visible" variants={containerVariants}>
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
