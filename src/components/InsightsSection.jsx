"use client";

import Card from "./Card";
import { useApp } from "@/context/AppContext";
import { highestSpendingCategory, monthlyComparison, totals } from "@/utils/finance";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

function StatRow({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "green"
      ? "text-success"
      : tone === "red"
        ? "text-danger"
        : "text-body";

  return (
    <div className="d-flex align-items-start justify-content-between gap-3 rounded-3 border bg-body-tertiary px-3 py-2">
      <div className="small fw-medium text-body-secondary">
        {label}
      </div>
      <div className={cn("fw-semibold tabular-nums", toneClass)}>
        {value}
      </div>
    </div>
  );
}

export default function InsightsSection() {
  const { rawTransactions } = useApp();
  const top = highestSpendingCategory(rawTransactions);
  const month = monthlyComparison(rawTransactions, new Date());
  const { expenses } = totals(rawTransactions);

  const currentExpenses = month?.current?.expenses ?? 0;
  const prevExpenses = month?.previous?.expenses ?? 0;
  const diff = currentExpenses - prevExpenses;
  const pct = prevExpenses > 0 ? (diff / prevExpenses) * 100 : null;
  const pctLabel = pct == null ? "N/A" : `${diff > 0 ? "+" : ""}${pct.toFixed(0)}%`;
  const isWorse = diff > 0;

  return (
    <Card title="Insights" subtitle="Quick takeaways from your data">
      <div className="d-grid gap-2">
        <StatRow
          label="Highest spending category"
          value={top ? `${top.name} | ${formatCurrency(top.value)}` : "N/A"}
          tone="red"
        />

        <StatRow
          label="Monthly expense change"
          value={`${formatCurrency(currentExpenses)} (${pctLabel})`}
          tone={isWorse ? "red" : "green"}
        />

        <StatRow
          label="Total transactions"
          value={String(rawTransactions.length)}
        />

        <StatRow
          label="Lifetime expenses"
          value={formatCurrency(expenses)}
          tone="red"
        />
      </div>

      {month ? (
        <div className="mt-3 rounded-3 border bg-body-tertiary px-3 py-2 small text-body-secondary">
          Comparing <span className="fw-semibold">{month.nowKey}</span> vs{" "}
          <span className="fw-semibold">{month.prevKey}</span>.
        </div>
      ) : null}
    </Card>
  );
}
