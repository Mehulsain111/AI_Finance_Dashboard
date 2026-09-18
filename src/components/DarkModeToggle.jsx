"use client";

import { useApp } from "@/context/AppContext";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DarkModeToggle() {
  const { darkMode, setDarkMode } = useApp();

  return (
    <button
      type="button"
      onClick={() => setDarkMode((v) => !v)}
      aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="btn rounded-circle d-flex align-items-center justify-content-center p-0 border shadow-sm"
      style={{
        width: 44,
        height: 44,
        background: "var(--app-card-bg)",
        borderColor: "var(--app-card-border)",
        backdropFilter: "blur(12px)",
        color: "inherit",
        transition: "all 0.25s ease",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={darkMode ? "dark" : "light"}
          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="d-flex align-items-center justify-content-center"
        >
          {darkMode ? (
            <Sun size={18} className="text-warning" />
          ) : (
            <Moon size={18} className="text-primary" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
