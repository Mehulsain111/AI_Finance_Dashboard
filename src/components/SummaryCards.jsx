"use client";

import Card from "./Card";
import { totals, STARTING_BALANCE } from "@/utils/finance";
import { formatCurrency } from "@/utils/format";
import { useApp } from "@/context/AppContext";
import { cn } from "@/utils/cn";

function SummaryCard({ label, value, sub, tone = "neutral" }) {
  const tones = {
    neutral: "text-body",
    green: "text-success",
    red: "text-danger",
  };

  return (
    <Card className="h-100">
      <div className="small text-body-secondary fw-semibold text-uppercase app-kpi-label">
        {label}
      </div>
      <div className={cn("mt-2 fs-4 fw-semibold tabular-nums app-kpi-value", tones[tone])}>
        {value}
      </div>
      {sub ? <div className="mt-2 small text-body-secondary">{sub}</div> : null}
    </Card>
  );
}

export default function SummaryCards() {
  const { rawTransactions } = useApp();
  const { income, expenses, balance } = totals(rawTransactions);

  return (
    <div className="row g-3 g-lg-4">
      <div className="col-12 col-sm-4">
        <SummaryCard
          label="Total Balance"
          value={formatCurrency(balance)}
          sub={`Starting balance: ${formatCurrency(STARTING_BALANCE)}`}
          tone="neutral"
        />
      </div>
      <div className="col-12 col-sm-4">
        <SummaryCard
          label="Total Income"
          value={formatCurrency(income)}
          tone="green"
        />
      </div>
      <div className="col-12 col-sm-4">
        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(expenses)}
          tone="red"
        />
      </div>
    </div>
  );
}
