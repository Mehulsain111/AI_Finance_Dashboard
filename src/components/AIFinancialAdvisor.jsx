"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Card from "./Card";
import EmptyState from "./EmptyState";
import PredictiveWealthForecast from "./PredictiveWealthForecast";
import FinancialHealthScorecard from "./FinancialHealthScorecard";
import SkeletonLoader from "./SkeletonLoader";

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

  const [activeTab, setActiveTab] = useState("advisor"); // advisor | forecast | risk
  const [status, setStatus] = useState(() => (hasData ? "loading" : "idle"));
  const [insight, setInsight] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const latestRequestId = useRef(0);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      runAnalysis();
    }
  }, [runAnalysis, activeTab]);

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

      <div className="d-flex border-bottom border-secondary border-opacity-10 px-3">
        {["advisor", "forecast", "risk"].map((tab) => (
          <button
            key={tab}
            className={`btn btn-link text-decoration-none px-4 py-3 fw-medium ${activeTab === tab ? "text-primary border-bottom border-2 border-primary rounded-0" : "text-body-secondary"}`}
            onClick={() => setActiveTab(tab)}
            style={{ marginBottom: "-1px" }}
          >
            {tab === "advisor" && "General Advice"}
            {tab === "forecast" && "Wealth Forecast"}
            {tab === "risk" && "Risk Audit"}
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
              <div className="p-4 bg-black bg-opacity-10 h-100 w-100">
                <PredictiveWealthForecast transactions={financialData} />
              </div>
            )}

            {activeTab === "risk" && (
              <div className="p-4 bg-black bg-opacity-10 h-100 w-100">
                <FinancialHealthScorecard transactions={financialData} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
