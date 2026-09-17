"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import PredictiveWealthForecast from "./PredictiveWealthForecast";
import FinancialHealthScorecard from "./FinancialHealthScorecard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import { Search, Sparkles } from "lucide-react";

async function getAIInsights(financialData) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "advisor", financialData }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  const json = await res.json();
  if (!json.result) throw new Error("Gemini returned an empty response.");
  return json.result;
}

const markdownComponents = {
  p: ({ children }) => <p className="mb-2">{children}</p>,
  strong: ({ children }) => <strong className="fw-semibold text-primary">{children}</strong>,
  ul: ({ children }) => <ul className="ps-3 mb-0 d-flex flex-column gap-2">{children}</ul>,
  ol: ({ children }) => <ol className="ps-3 mb-0 d-flex flex-column gap-2">{children}</ol>,
  li: ({ children }) => <li style={{listStyleType: "none", position: "relative"}}><span className="text-primary me-2 fw-bold">›</span>{children}</li>,
  h1: ({ children }) => <h3 className="h6 fw-semibold mb-2 mt-3">{children}</h3>,
  h2: ({ children }) => <h3 className="h6 fw-semibold mb-2 mt-3">{children}</h3>,
  h3: ({ children }) => <h3 className="h6 fw-semibold mb-2 mt-3">{children}</h3>,
};

function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-4">
      <p className="text-danger small mb-3">{message}</p>
      <button type="button" className="btn btn-sm btn-outline-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export default function AIFinancialAdvisor({ financialData }) {
  const hasData = Array.isArray(financialData) && financialData.length > 0;

  const [activeTab, setActiveTab] = useState("advisor"); // advisor | forecast | risk | query
  const [status, setStatus] = useState(() => (hasData ? "loading" : "idle"));
  const [insight, setInsight] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const latestRequestId = useRef(0);

  // NLP Ask AI State
  const [nlpQuery, setNlpQuery] = useState("");
  const [nlpResult, setNlpResult] = useState(null);
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpError, setNlpError] = useState("");

  const runAnalysis = useCallback(async () => {
    if (!Array.isArray(financialData) || financialData.length === 0) return;

    const requestId = ++latestRequestId.current;
    setStatus("loading");
    setErrorMessage("");

    try {
      const text = await getAIInsights(financialData);
      if (requestId !== latestRequestId.current) return;
      setInsight(text);
      setStatus("success");
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      console.error("AI Financial Advisor error:", err);
      setStatus("error");
      setErrorMessage("Unable to fetch AI insights at this time.");
    }
  }, [financialData]);

  useEffect(() => {
    if (activeTab === "advisor") {
      runAnalysis();
    }
  }, [runAnalysis, activeTab]);

  async function handleNlpSearch(e) {
    e.preventDefault();
    if (!nlpQuery.trim()) return;
    setNlpLoading(true);
    setNlpError("");
    setNlpResult(null);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "query", financialData, query: nlpQuery }),
      });
      if (!res.ok) throw new Error("Failed to process query");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setNlpResult(json.result);
    } catch (err) {
      setNlpError(err.message);
    } finally {
      setNlpLoading(false);
    }
  }

  return (
    <div className="app-card overflow-hidden">
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-10" style={{ background: "color-mix(in srgb, var(--bs-body-bg) 40%, transparent)" }}>
        <h5 className="mb-0 fw-bold fs-6 d-flex align-items-center gap-2">
          AI Command Center <span aria-hidden="true">✨</span>
        </h5>
        {activeTab === "advisor" && hasData && status !== "loading" && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={runAnalysis}
          >
            Regenerate
          </button>
        )}
      </div>

      <div className="d-flex border-bottom border-secondary border-opacity-10 px-3 overflow-x-auto">
        {["advisor", "forecast", "risk", "query"].map((tab) => (
          <button
            key={tab}
            className={`btn btn-link text-decoration-none px-4 py-3 fw-medium text-nowrap ${activeTab === tab ? "text-primary border-bottom border-2 border-primary rounded-0" : "text-body-secondary"}`}
            onClick={() => setActiveTab(tab)}
            style={{ marginBottom: "-1px" }}
          >
            {tab === "advisor" && "General Advice"}
            {tab === "forecast" && "Wealth Forecast"}
            {tab === "risk" && "Risk Audit"}
            {tab === "query" && "Ask AI Assistant"}
          </button>
        ))}
      </div>

      <div className="p-0">
        {!hasData ? (
          <div className="p-4">
             <EmptyState
              title="No data to analyze yet"
              hint="Add a few transactions and check back for personalized saving recommendations."
            />
          </div>
        ) : (
          <div aria-live="polite" aria-atomic="true" style={{ minHeight: "300px" }}>
            {activeTab === "advisor" && (
              <div className="p-4">
                {status === "loading" && <SkeletonLoader />}
                {status === "error" && <ErrorState message={errorMessage} onRetry={runAnalysis} />}
                {status === "success" && (
                  <div className="fs-6 lh-lg text-body-secondary">
                    <ReactMarkdown components={markdownComponents}>{insight}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {activeTab === "forecast" && (
              <div className="p-4">
                <PredictiveWealthForecast transactions={financialData} />
              </div>
            )}

            {activeTab === "risk" && (
              <div className="p-4">
                <FinancialHealthScorecard transactions={financialData} />
              </div>
            )}

            {activeTab === "query" && (
              <div className="p-4">
                <div className="mb-3">
                  <h6 className="fw-semibold mb-1">Natural Language Expense Query</h6>
                  <p className="small text-body-secondary mb-0">Ask questions in plain English about your transactions, spending habits, or totals.</p>
                </div>

                <form onSubmit={handleNlpSearch} className="position-relative d-flex align-items-center mb-3">
                  <Sparkles size={18} className="position-absolute ms-3" color="#3b82f6" />
                  <input
                    type="text"
                    className="form-control border bg-body-tertiary ps-5 py-2"
                    placeholder="e.g. 'How much did I spend on groceries?' or 'What was my highest expense?'"
                    value={nlpQuery}
                    onChange={(e) => setNlpQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary rounded-pill px-4 ms-2" disabled={nlpLoading}>
                    {nlpLoading ? (
                       <div className="spinner-border spinner-border-sm" role="status">
                         <span className="visually-hidden">Loading...</span>
                       </div>
                    ) : (
                      <Search size={18} />
                    )}
                  </button>
                </form>

                {nlpError && <div className="text-danger small mb-3">{nlpError}</div>}

                {nlpResult && (
                  <div className="p-3 rounded-3 border" style={{ background: "rgba(59, 130, 246, 0.05)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
                    <div className="fw-medium text-body">{nlpResult.answer}</div>
                    {nlpResult.matchedTransactionIds && nlpResult.matchedTransactionIds.length > 0 && (
                       <div className="mt-2 text-body-secondary small">
                         Matched {nlpResult.matchedTransactionIds.length} related transactions.
                       </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
