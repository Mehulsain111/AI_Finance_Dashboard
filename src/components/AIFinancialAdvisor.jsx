"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Card from "./Card";
import EmptyState from "./EmptyState";

/**
 * Calls our own Next.js API route (app/api/gemini/route.js), which calls
 * Gemini server-side. The API key never reaches the browser -- this is the
 * secure counterpart to the direct-from-the-browser version this component
 * used in the Vite build.
 *
 * @param {Array<Object>} financialData - raw transaction/expense records
 * @returns {Promise<string>} markdown text with the advisor's recommendations
 */
async function getAIInsights(financialData) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ financialData }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  const { text } = await res.json();
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

// Minimal, dependency-free markdown -> Bootstrap-styled JSX mapping.
// Rendering via react-markdown (rather than dangerouslySetInnerHTML on raw
// HTML from the model) avoids an XSS vector -- see the note below the
// component for details.
const markdownComponents = {
  p: ({ children }) => <p className="mb-2">{children}</p>,
  strong: ({ children }) => <strong className="fw-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="ps-3 mb-0 d-flex flex-column gap-2">{children}</ul>,
  ol: ({ children }) => <ol className="ps-3 mb-0 d-flex flex-column gap-2">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  h1: ({ children }) => <h3 className="h6 fw-semibold mb-2">{children}</h3>,
  h2: ({ children }) => <h3 className="h6 fw-semibold mb-2">{children}</h3>,
  h3: ({ children }) => <h3 className="h6 fw-semibold mb-2">{children}</h3>,
};

function LoadingSkeleton() {
  return (
    <div>
      <span className="visually-hidden">Loading AI insights…</span>
      <p className="placeholder-glow mb-2">
        <span className="placeholder col-8 rounded-2" />
      </p>
      <p className="placeholder-glow mb-2">
        <span className="placeholder col-12 rounded-2" />
      </p>
      <p className="placeholder-glow mb-2">
        <span className="placeholder col-10 rounded-2" />
      </p>
      <p className="placeholder-glow mb-0">
        <span className="placeholder col-6 rounded-2" />
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-2">
      <p className="text-danger small mb-3">{message}</p>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export default function AIFinancialAdvisor({ financialData }) {
  const hasData = Array.isArray(financialData) && financialData.length > 0;

  const [status, setStatus] = useState(() => (hasData ? "loading" : "idle")); // idle | loading | success | error
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
      if (requestId !== latestRequestId.current) return; // a newer request won the race
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
    runAnalysis();
  }, [runAnalysis]);

  return (
    <Card
      title={
        <span>
          AI Insights <span aria-hidden="true">✨</span>
        </span>
      }
      subtitle="Personalized recommendations from your transaction history"
      actions={
        hasData && status !== "loading" ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={runAnalysis}
            aria-label="Regenerate AI insights"
          >
            Regenerate
          </button>
        ) : null
      }
    >
      {!hasData ? (
        <EmptyState
          title="No data to analyze yet"
          hint="Add a few transactions and check back for personalized saving recommendations."
        />
      ) : (
        <div aria-live="polite" aria-atomic="true">
          {status === "loading" && <LoadingSkeleton />}
          {status === "error" && <ErrorState message={errorMessage} onRetry={runAnalysis} />}
          {status === "success" && (
            <div className="small">
              <ReactMarkdown components={markdownComponents}>{insight}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
