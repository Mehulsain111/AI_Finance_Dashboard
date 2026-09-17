"use client";

import { useState } from "react";
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

  const handleDeleteConfirm = (id) => {
    deleteTransaction(id);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="table-responsive border rounded-3 overflow-hidden">
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
                        {role === "admin" && onEdit && (
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
