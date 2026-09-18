"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/context/AppContext";
import { balanceTrend } from "@/utils/finance";
import { formatCurrency, formatDate } from "@/utils/format";
import EmptyState from "@/components/EmptyState";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-3 border bg-body px-3 py-2 small shadow-sm">
      <div className="fw-medium">{formatDate(label)}</div>
      <div className="mt-1 text-body-secondary">
        Balance: <span className="fw-semibold">{formatCurrency(value)}</span>
      </div>
    </div>
  );
}

export default function BalanceLineChart({ disabled }) {
  const { rawTransactions, startingBalance, darkMode } = useApp();
  const data = balanceTrend(rawTransactions, startingBalance);

  if (disabled || !data.length) {
    return <EmptyState title="No transactions yet" hint="Add a transaction to see your balance trend." />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid
          strokeDasharray="4 4"
          stroke={darkMode ? "rgba(148,163,184,0.20)" : "rgba(148,163,184,0.35)"}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
          tick={{
            fill: darkMode ? "rgba(226,232,240,0.85)" : "rgba(100,116,139,1)",
            fontSize: 12,
          }}
          axisLine={{ stroke: darkMode ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.6)" }}
          tickLine={{ stroke: darkMode ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.6)" }}
        />
        <YAxis
          tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
          tick={{
            fill: darkMode ? "rgba(226,232,240,0.85)" : "rgba(100,116,139,1)",
            fontSize: 12,
          }}
          width={70}
          axisLine={{ stroke: darkMode ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.6)" }}
          tickLine={{ stroke: darkMode ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.6)" }}
        />
        <Tooltip content={<TooltipContent />} />
        <Line
          type="monotone"
          dataKey="balance"
          stroke={darkMode ? "#e2e8f0" : "#0f172a"}
          strokeWidth={2.5}
          dot={{ r: 2, strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
