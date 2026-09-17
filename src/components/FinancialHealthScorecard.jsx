"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SkeletonLoader from "./SkeletonLoader";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";

export default function FinancialHealthScorecard({ transactions }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchRef = useRef(false);

  const fetchRisk = useCallback(async () => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "risk", financialData: transactions }),
      });
      if (!res.ok) throw new Error("Failed to fetch risk analysis");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.result);
    } catch (err) {
      setError(err.message);
      fetchRef.current = false; // Allow retrying on error
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0 && !data && !loading && !error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRisk();
    }
  }, [transactions, data, loading, error, fetchRisk]);

  return (
    <div className="w-100">
      <div className="mb-3">
        <h6 className="fw-semibold mb-1">Financial Health Audit</h6>
        <p className="small text-body-secondary mb-0">AI Anomaly & Risk Detection</p>
      </div>
      {loading && <SkeletonLoader lines={4} />}
      {error && (
        <div className="d-flex flex-column align-items-start gap-2">
          <div className="text-danger small">{error}</div>
          <button className="btn btn-sm btn-outline-danger" onClick={() => { setError(""); fetchRef.current = false; fetchRisk(); }}>Retry</button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-3">
            {/* Score Ring */}
            <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
              <svg viewBox="0 0 36 36" className="w-100 h-100">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={data.healthScore > 75 ? "#10b981" : data.healthScore > 50 ? "#fbbf24" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${data.healthScore}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="position-absolute fs-4 fw-bold">{data.healthScore}</div>
            </div>
            <div>
              <div className="fw-semibold mb-1">Health Score</div>
              <div className="small text-body-secondary">
                {data.healthScore > 75 ? "Looking solid! Keep it up." : "Some areas need attention."}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h6 className="fw-semibold small text-uppercase mb-3">AI Alerts</h6>
            {data.alerts && data.alerts.length > 0 ? (
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                {data.alerts.map((alert, i) => {
                  const Icon = alert.severity === "high" ? AlertTriangle : alert.severity === "medium" ? Info : ShieldCheck;
                  const iconColor = alert.severity === "high" ? "#ef4444" : alert.severity === "medium" ? "#fbbf24" : "#3b82f6";
                  const bg = alert.severity === "high" ? "rgba(239, 68, 68, 0.1)" : alert.severity === "medium" ? "rgba(251, 191, 36, 0.1)" : "rgba(59, 130, 246, 0.1)";
                  return (
                    <li key={i} className="d-flex gap-3 p-2 rounded-3" style={{ background: bg }}>
                      <Icon color={iconColor} size={20} className="mt-1 flex-shrink-0" />
                      <div>
                        <div className="fw-semibold small">{alert.title}</div>
                        <div className="small" style={{ fontSize: "0.8rem", opacity: 0.8 }}>{alert.description}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="small text-body-secondary">No alerts detected.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
