"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SkeletonLoader from "./SkeletonLoader";

export default function PredictiveWealthForecast({ transactions }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchRef = useRef(false);

  const fetchForecast = useCallback(async () => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forecast", financialData: transactions }),
      });
      if (!res.ok) throw new Error("Failed to fetch forecast");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.result || []);
    } catch (err) {
      setError(err.message);
      fetchRef.current = false; // Allow retrying on error
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0 && data.length === 0 && !loading && !error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchForecast();
    }
  }, [transactions, data, loading, error, fetchForecast]);

  return (
    <div className="w-100">
      <div className="mb-3">
        <h6 className="fw-semibold mb-1">AI Wealth Forecast</h6>
        <p className="small text-body-secondary mb-0">Projected balance over the next 6 months</p>
      </div>

      {loading && <SkeletonLoader lines={6} />}
      {error && (
        <div className="d-flex flex-column align-items-start gap-2">
          <div className="text-danger small">{error}</div>
          <button className="btn btn-sm btn-outline-danger" onClick={() => { setError(""); fetchRef.current = false; fetchForecast(); }}>Retry</button>
        </div>
      )}
      
      {!loading && !error && data.length > 0 && (
        <div style={{ height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWorst" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(val) => `$${val.toLocaleString()}`} 
                tick={{ fontSize: 12, fill: "#94a3b8" }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                itemStyle={{ color: '#f8fafc', fontWeight: '600' }}
                labelStyle={{ color: '#94a3b8', fontWeight: '500', marginBottom: '4px' }}
                formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
              />
              <Area type="monotone" dataKey="bestCase" stroke="#10b981" fillOpacity={1} fill="url(#colorBest)" name="Best Case" />
              <Area type="monotone" dataKey="projectedBalance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorExpected)" name="Expected" />
              <Area type="monotone" dataKey="worstCase" stroke="#ef4444" fillOpacity={1} fill="url(#colorWorst)" name="Worst Case" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
