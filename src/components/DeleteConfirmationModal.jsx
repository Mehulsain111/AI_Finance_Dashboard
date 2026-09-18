"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteConfirmationModal({ open, onClose, onConfirm, transaction }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 1060, background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          className="card overflow-hidden shadow-2xl border-0"
          style={{
            maxWidth: 420,
            width: "100%",
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            boxShadow: "0 20px 50px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            color: "#f8fafc"
          }}
        >
          <div className="card-body p-4 text-center position-relative">
            <button
              onClick={onClose}
              className="btn btn-link text-white-50 position-absolute top-0 end-0 p-3 text-decoration-none"
              style={{ border: "none" }}
            >
              <X size={20} />
            </button>

            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-25 mb-3"
              style={{ width: 64, height: 64, boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)" }}
            >
              <AlertTriangle className="text-danger" size={32} />
            </div>

            <h3 className="h5 fw-bold mb-2">Delete Transaction?</h3>
            <p className="text-white-50 small mb-4">
              Are you sure you want to remove <strong className="text-white">{transaction?.category || "this transaction"}</strong> for <strong className="text-white">${transaction?.amount}</strong>? This action cannot be undone.
            </p>

            <div className="d-flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="btn btn-outline-light w-100 py-2 border-secondary text-white-50"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onConfirm(transaction?.id);
                  onClose();
                }}
                className="btn btn-danger w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  border: "none",
                }}
              >
                <Trash2 size={16} /> Delete
              </motion.button>
            </div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
