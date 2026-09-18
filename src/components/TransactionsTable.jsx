"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import Button from "./Button";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useApp } from "@/context/AppContext";

function TypePill({ type }) {
  const isIncome = type === "income";
  return (
    <span
      className={cn(
        "badge rounded-pill fw-semibold pointer-events-none",
        isIncome
          ? "bg-success-subtle text-success-emphasis"
          : "bg-danger-subtle text-danger-emphasis",
      )}
    >
      {isIncome ? "Income" : "Expense"}
    </span>
  );
}

export default function TransactionsTable({ transactions, role, onEdit }) {
  const { deleteTransaction } = useApp();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 992);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleDeleteConfirm = (id) => {
    deleteTransaction(id);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className={cn("border rounded-3 overflow-hidden", !isMobile && "table-responsive")}>
        {!isMobile ? (
          <table className="table table-hover align-middle mb-0 app-table">
            <thead className="bg-body-tertiary">
              <tr className="small text-body-secondary">
                <th className="px-3 py-3 fw-semibold">Date</th>
                <th className="px-3 py-3 fw-semibold">Category</th>
                <th className="px-3 py-3 fw-semibold">Type</th>
                <th className="px-3 py-3 text-end fw-semibold">Amount</th>
                <th className="px-3 py-3 text-end fw-semibold" style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {transactions.map((t, index) => {
                  const isIncome = t.type === "income";
                  const itemKey = t.id || t._id || `tx-${index}`;

                  return (
                    <motion.tr
                      key={itemKey}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ 
                        opacity: 0, 
                        x: -40,
                        transition: { duration: 0.2, ease: "easeOut" } 
                      }}
                      className="position-relative"
                      style={{ willChange: "opacity, transform" }}
                    >
                      <td className="px-3 py-3 text-nowrap text-body-secondary">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-3 py-3 fw-medium">{t.category}</td>
                      <td className="px-3 py-3">
                        <TypePill type={t.type} />
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 text-end fw-semibold tabular-nums text-nowrap",
                          isIncome ? "text-success" : "text-danger",
                        )}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="px-3 py-3 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onEdit?.(t)}
                              title="Edit transaction"
                              className="p-1 px-2"
                            >
                              <Edit3 size={14} className="pointer-events-none" />
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(t)}
                            className="btn btn-sm btn-outline-danger border-0 p-1 px-2 d-inline-flex align-items-center justify-content-center rounded-2"
                            title="Delete transaction"
                            style={{
                              color: "#ef4444",
                              background: "rgba(239, 68, 68, 0.1)",
                              transition: "background 0.2s ease, transform 0.15s ease",
                              transform: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                            }}
                          >
                            <Trash2 size={15} className="pointer-events-none" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        ) : (
          <div className="d-flex flex-column bg-body-tertiary p-2 gap-2">
            <AnimatePresence initial={false}>
              {transactions.map((t, index) => {
                const isIncome = t.type === "income";
                const itemKey = t.id || t._id || `tx-${index}`;

                return (
                  <motion.div 
                    layout
                    key={itemKey} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ 
                      opacity: 0, 
                      height: 0,
                      marginBottom: 0,
                      transition: { duration: 0.22, ease: "easeOut" } 
                    }}
                    className="position-relative overflow-hidden rounded-3"
                  >
                    {/* Background actions revealed on swipe */}
                    <div className="position-absolute top-0 end-0 h-100 w-100 bg-danger d-flex align-items-center justify-content-end px-4 text-white rounded-3">
                       <Trash2 size={24} />
                    </div>

                    <motion.div
                      drag="x"
                      dragConstraints={{ left: -100, right: 0 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.x < -80) {
                          setDeleteTarget(t);
                        }
                      }}
                      className="bg-body p-3 rounded-3 shadow-sm position-relative z-1 d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex flex-column gap-1 overflow-hidden me-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-body fs-6 text-truncate" title={t.category}>
                            {t.category}
                          </span>
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(t)}
                              className="btn btn-sm btn-link p-1 text-body-secondary d-inline-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ minHeight: "36px", minWidth: "36px" }}
                              title="Edit transaction"
                              aria-label="Edit transaction"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}
                        </div>
                        <div className="small text-body-secondary d-flex align-items-center gap-2 flex-wrap">
                          <span>{formatDate(t.date)}</span>
                          <span>&bull;</span>
                          <TypePill type={t.type} />
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        <div className={cn("fw-bold tabular-nums fs-6 text-nowrap", isIncome ? "text-success" : "text-danger")}>
                          {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(t)}
                          className="btn btn-sm btn-link text-danger p-1 d-flex align-items-center justify-content-center"
                          style={{ minHeight: "44px", minWidth: "44px" }}
                          title="Delete transaction"
                          aria-label="Delete transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Glassmorphism Confirmation Modal */}
      <DeleteConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        transaction={deleteTarget}
      />
    </>
  );
}
