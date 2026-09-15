"use client";

import Card from "./Card";
import { totals, STARTING_BALANCE } from "@/utils/finance";
import { formatCurrency } from "@/utils/format";
import { useApp } from "@/context/AppContext";
import { cn } from "@/utils/cn";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import CountUpNumber from "./CountUpNumber";

function SummaryCard({ label, value, sub, tone = "neutral", icon: Icon }) {
  const tones = {
    neutral: "text-body",
    green: "text-success",
    red: "text-danger",
  };
  
  const iconColors = {
    neutral: "var(--bs-primary)",
    green: "#10b981",
    red: "#ef4444",
  };

  return (
    <Card className="h-100 overflow-hidden position-relative" style={{ "--glow-color": `color-mix(in srgb, ${iconColors[tone]} 30%, transparent)` }}>
      {/* Background Icon Glow */}
      <div 
        className="position-absolute" 
        style={{ 
          top: "-20px", 
          right: "-20px", 
          opacity: 0.05, 
          transform: "scale(3)" 
        }}
      >
        <Icon size={64} color={iconColors[tone]} />
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="small text-body-secondary fw-semibold text-uppercase app-kpi-label d-flex align-items-center gap-2">
          {label}
        </div>
        <div className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: `color-mix(in srgb, ${iconColors[tone]} 10%, transparent)`}}>
          <Icon size={20} color={iconColors[tone]} />
        </div>
      </div>
      
      <div className={cn("fs-3 fw-bold tabular-nums app-kpi-value", tones[tone])}>
        <CountUpNumber value={value} prefix="$" decimals={2} />
      </div>
      
      {sub ? (
        <div className="mt-3 small text-body-secondary d-flex align-items-center gap-1">
          {sub}
        </div>
      ) : null}
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
          value={balance}
          sub={`Starting balance: ${formatCurrency(STARTING_BALANCE)}`}
          tone={balance >= 0 ? "green" : "red"}
          icon={Wallet}
        />
      </div>
      <div className="col-12 col-sm-4">
        <SummaryCard
          label="Total Income"
          value={income}
          tone="green"
          icon={TrendingUp}
        />
      </div>
      <div className="col-12 col-sm-4">
        <SummaryCard
          label="Total Expenses"
          value={expenses}
          tone="red"
          icon={TrendingDown}
        />
      </div>
    </div>
  );
}
