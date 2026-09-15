"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import Button from "./Button";
import { makeId } from "@/utils/id";

const DEFAULT_FORM = {
  date: "",
  type: "expense",
  category: "",
  amount: "",
};

export default function AddTransactionModal({ open, onClose, transaction }) {
  const { role, rawTransactions, setTransactions } = useApp();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState("");
  const isEditing = Boolean(transaction);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        date: transaction.date ?? today,
        type: transaction.type ?? "expense",
        category: transaction.category ?? "",
        amount: String(transaction.amount ?? ""),
      });
    } else {
      setForm((f) => ({ ...f, date: f.date || today }));
    }
    setError("");
  }, [open, today, transaction]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || role !== "admin") return null;

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function submit(e) {
    e.preventDefault();
    setError("");

    const date = String(form.date || "").trim();
    const type = form.type === "income" ? "income" : "expense";
    const category = String(form.category || "").trim();
    const amountNum = Number(form.amount);

    if (!date) return setError("Please pick a date.");
    if (!category) return setError("Please enter a category.");
    if (!Number.isFinite(amountNum) || amountNum <= 0)
      return setError("Amount must be a positive number.");

    const next = {
      id: transaction?.id ?? makeId("t"),
      date,
      type,
      category,
      amount: Number(amountNum.toFixed(2)),
    };

    if (isEditing) {
      setTransactions(
        rawTransactions.map((item) => (item.id === next.id ? next : item)),
      );
    } else {
      setTransactions([...rawTransactions, next]);
    }
    onClose?.();
    setForm({ ...DEFAULT_FORM, date: today });
  }

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "Edit transaction" : "Add transaction"}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
          <div className="modal-content app-card">
            <div className="modal-header">
              <div>
                <div className="modal-title fs-6 fw-semibold">
                  {isEditing ? "Edit Transaction" : "Add Transaction"}
                </div>
                <div className="small text-body-secondary">Admin-only (saved locally)</div>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-medium">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => update({ date: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-medium">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => update({ type: e.target.value })}
                      className="form-select"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-medium d-flex justify-content-between">
                      Category / Description
                      <button 
                        type="button" 
                        className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1"
                        onClick={async () => {
                          if (!form.category) return setError("Enter a description to categorize.");
                          setError("");
                          try {
                            const res = await fetch("/api/gemini", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "categorize", description: form.category }),
                            });
                            const json = await res.json();
                            if (json.error) throw new Error(json.error);
                            if (json.result) {
                              update({ category: json.result.category, type: json.result.type });
                            }
                          } catch (err) {
                            setError(err.message);
                          }
                        }}
                      >
                        <span aria-hidden="true">✨</span> AI Suggest
                      </button>
                    </label>
                    <input
                      value={form.category}
                      onChange={(e) => update({ category: e.target.value })}
                      placeholder="e.g., Groceries or 'Uber ride'"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-medium">Amount</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={form.amount}
                      onChange={(e) => update({ amount: e.target.value })}
                      placeholder="0.00"
                      className="form-control"
                      required
                    />
                  </div>

                  {error ? (
                    <div className="col-12">
                      <div className="alert alert-danger py-2 small mb-0">
                        {error}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="default" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {isEditing ? "Save Changes" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
