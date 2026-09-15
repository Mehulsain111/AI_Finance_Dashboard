"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

export default function NLPExpenseQuery({ transactions }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "query", financialData: transactions, query }),
      });
      if (!res.ok) throw new Error("Failed to process query");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResult(json.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-card p-3 mb-4">
      <form onSubmit={handleSearch} className="position-relative d-flex align-items-center">
        <Sparkles size={18} className="position-absolute ms-3" color="#3b82f6" />
        <input
          type="text"
          className="form-control border-0 bg-transparent ps-5 py-2 shadow-none"
          placeholder="Ask AI: e.g. 'How much did I spend on dining last month?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary rounded-pill px-4 ms-2" disabled={loading}>
          {loading ? (
             <div className="spinner-border spinner-border-sm" role="status">
               <span className="visually-hidden">Loading...</span>
             </div>
          ) : (
            <Search size={18} />
          )}
        </button>
      </form>
      
      {error && <div className="text-danger small mt-2 ms-3">{error}</div>}
      
      {result && (
        <div className="mt-3 p-3 rounded-3" style={{ background: "rgba(59, 130, 246, 0.05)" }}>
          <div className="small fw-medium">{result.answer}</div>
          {result.matchedTransactionIds && result.matchedTransactionIds.length > 0 && (
             <div className="mt-2" style={{ fontSize: "0.75rem", opacity: 0.7 }}>
               Matched {result.matchedTransactionIds.length} transactions
             </div>
          )}
        </div>
      )}
    </div>
  );
}
