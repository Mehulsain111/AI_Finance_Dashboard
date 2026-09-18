"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import Button from "./Button";
import { makeId } from "@/utils/id";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 992);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState(null);
  const fileInputRef = useRef(null);
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
    setScanPreview(null);
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return setError("Please upload an image or PDF.");
    }

    // Show preview for images
    if (file.type.startsWith("image/")) {
      setScanPreview(URL.createObjectURL(file));
    } else {
      setScanPreview("PDF");
    }

    setIsScanning(true);
    setError("");

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });

      const base64Data = reader.result.split(",")[1];
      const mimeType = file.type;

      const res = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to scan receipt");
      if (json.error) throw new Error(json.error);
      
      if (json.result) {
        update({
          date: json.result.date || form.date || today,
          type: json.result.type === "income" ? "income" : "expense",
          category: json.result.category || form.category,
          amount: json.result.amount ? String(json.result.amount) : form.amount,
        });
      }
    } catch (err) {
      setError(err.message);
      setScanPreview(null);
    } finally {
      setIsScanning(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function clearScan() {
    setScanPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const modalVariants = isMobile ? {
    hidden: { y: "100%", opacity: 1 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { y: "100%", opacity: 1, transition: { damping: 20, stiffness: 200 } }
  } : {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop bg-dark position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1055 }}
            onClick={onClose}
          />
          <div 
            className={cn("modal d-block", isMobile && "position-fixed bottom-0 top-auto")} 
            tabIndex="-1" 
            style={{ zIndex: 1060, ...(isMobile ? { height: "auto", maxHeight: "90vh", bottom: 0, left: 0, right: 0 } : {}) }}
          >
            <div className={cn("modal-dialog", !isMobile && "modal-dialog-centered", isMobile && "m-0 mx-auto w-100")}>
              <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn("modal-content shadow-lg border-0", isMobile && "rounded-bottom-0 rounded-top-4 overflow-hidden d-flex flex-column")}
                style={isMobile ? { maxHeight: "88vh", paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" } : {}}
              >
                <div className="modal-header border-bottom-0 pb-0 flex-shrink-0">
                  {isMobile ? (
                    <div className="w-100 d-flex flex-column align-items-center">
                      <div className="bg-secondary rounded-pill mb-3" style={{ width: 40, height: 4, opacity: 0.3 }} />
                      <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="modal-title fw-bold">{isEditing ? "Edit Transaction" : "Add Transaction"}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h5 className="modal-title fw-bold">{isEditing ? "Edit Transaction" : "Add Transaction"}</h5>
                      <button type="button" className="btn-close" onClick={onClose} />
                    </>
                  )}
                </div>
                <form onSubmit={submit} className="d-flex flex-column overflow-hidden flex-grow-1">
                  <div className="modal-body overflow-y-auto" style={{ WebkitOverflowScrolling: "touch", maxHeight: isMobile ? "65vh" : undefined }}>
                    <div className="row g-3">
                  {!isEditing && (
                    <div className="col-12">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*,application/pdf" 
                        className="d-none" 
                      />
                      {!scanPreview ? (
                        <div 
                          className="border border-2 border-dashed rounded-3 p-4 text-center cursor-pointer position-relative bg-body-tertiary transition-all"
                          style={{ borderColor: "var(--bs-border-color)" }}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--bs-primary)"; }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--bs-border-color)"; }}
                          onDrop={(e) => { 
                            e.preventDefault(); 
                            e.currentTarget.style.borderColor = "var(--bs-border-color)";
                            const files = e.dataTransfer.files;
                            if (files?.length) {
                              // Manually trigger the handler by faking an event
                              handleFileUpload({ target: { files: [files[0]] } });
                            }
                          }}
                        >
                          {isScanning ? (
                            <div className="py-3">
                              <div className="spinner-border text-primary mb-2" role="status">
                                <span className="visually-hidden">Scanning...</span>
                              </div>
                              <div className="small fw-medium">Extracting receipt data with AI...</div>
                            </div>
                          ) : (
                            <div className="py-2" style={{ cursor: "pointer" }}>
                              <UploadCloud className="text-primary mb-2 mx-auto" size={32} />
                              <div className="fw-medium mb-1">Scan Receipt or Invoice</div>
                              <div className="small text-body-secondary">Drag & drop or click to upload (Image/PDF)</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="position-relative rounded-3 overflow-hidden border bg-body-tertiary d-flex align-items-center justify-content-center" style={{ height: "120px" }}>
                          {scanPreview === "PDF" ? (
                            <div className="text-center text-body-secondary">
                               <ImageIcon size={32} className="mb-2 opacity-50 mx-auto" />
                               <div className="small fw-medium">PDF Document Attached</div>
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={scanPreview} alt="Receipt Preview" className="h-100 w-100 object-fit-cover opacity-75" />
                          )}
                          {isScanning && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
                               <div className="spinner-border text-white" role="status" />
                            </div>
                          )}
                          {!isScanning && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2 rounded-circle p-2 d-flex align-items-center justify-content-center"
                              style={{ width: "44px", height: "44px" }}
                              onClick={clearScan}
                              aria-label="Remove receipt"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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
                        className="btn btn-link btn-sm p-2 text-decoration-none d-flex align-items-center gap-1"
                        style={{ minHeight: "44px" }}
                        disabled={isCategorizing}
                        onClick={async () => {
                          if (!form.category) return setError("Enter a description to categorize.");
                          setError("");
                          setIsCategorizing(true);
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
                          } finally {
                            setIsCategorizing(false);
                          }
                        }}
                      >
                        {isCategorizing ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <span aria-hidden="true">✨</span>
                        )}
                        AI Suggest
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

              <div className="modal-footer flex-shrink-0">
                <Button type="button" variant="default" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {isEditing ? "Save Changes" : "Add"}
                </Button>
              </div>
            </form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}