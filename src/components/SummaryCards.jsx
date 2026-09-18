"use client";

import { useState } from "react";
import Card from "./Card";
import { totals } from "@/utils/finance";
import { formatCurrency } from "@/utils/format";
import { useApp } from "@/context/AppContext";
import { cn } from "@/utils/cn";
import { Wallet, TrendingUp, TrendingDown, Edit2, Check, X } from "lucide-react";
import CountUpNumber from "./CountUpNumber";

function SummaryCard({ label, value, sub, tone = "neutral", icon: Icon, onEdit, isEditing, editValue, setEditValue, onSaveEdit, onCancelEdit }) {
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
        <div className="small text-body-secondary fw-semibold text-uppercase app-kpi-label d-flex align-items-center flex-wrap gap-2">
          {label}
          {onEdit && !isEditing && (
            <button onClick={onEdit} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 ms-1 px-2 py-1 rounded-pill" title="Edit Total Balance">
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
          )}
        </div>
        <div className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: `color-mix(in srgb, ${iconColors[tone]} 10%, transparent)`}}>
          <Icon size={20} color={iconColors[tone]} />
        </div>
      </div>
      
      {isEditing ? (
        <div className="d-flex align-items-center gap-2 my-1">
          <div className="input-group flex-grow-1">
            <span className="input-group-text bg-transparent border-end-0 fw-bold fs-5">$</span>
            <input 
              type="number" 
              className="form-control border-start-0 ps-0 fw-bold fs-4" 
              value={editValue} 
              onChange={e => setEditValue(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
            />
          </div>
          <button className="btn btn-sm btn-success p-2 flex-shrink-0" onClick={onSaveEdit} title="Save"><Check size={16} /></button>
          <button className="btn btn-sm btn-outline-secondary p-2 flex-shrink-0" onClick={onCancelEdit} title="Cancel"><X size={16} /></button>
        </div>
      ) : (
        <div className={cn("fs-3 fw-bold tabular-nums app-kpi-value", tones[tone])}>
          <CountUpNumber value={value} prefix="$" decimals={2} />
        </div>
      )}
      
      {sub ? (
        <div className="mt-3 small text-body-secondary d-flex align-items-center gap-1">
          {sub}
        </div>
      ) : null}
    </Card>
  );
}

export default function SummaryCards() {
  const { rawTransactions, startingBalance, setStartingBalance, role } = useApp();
  const { income, expenses, balance } = totals(rawTransactions, startingBalance);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const handleEdit = () => {
    setEditValue(balance.toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    const newTotal = parseFloat(editValue);
    if (!isNaN(newTotal)) {
      // newTotal = newStartingBalance + income - expenses
      // newStartingBalance = newTotal - income + expenses
      const newStartingBalance = newTotal - income + expenses;
      setStartingBalance(newStartingBalance);
    }
    setIsEditing(false);
  };

  return (
    <div className="row g-3 g-lg-4">
      <div className="col-12 col-md-4">
        <SummaryCard
          label="Total Balance"
          value={balance}
          sub={`Starting balance: ${formatCurrency(startingBalance)}`}
          tone={balance >= 0 ? "green" : "red"}
          icon={Wallet}
          onEdit={handleEdit}
          isEditing={isEditing}
          editValue={editValue}
          setEditValue={setEditValue}
          onSaveEdit={handleSave}
          onCancelEdit={() => setIsEditing(false)}
        />
      </div>
      <div className="col-12 col-md-4">
        <SummaryCard
          label="Total Income"
          value={income}
          tone="green"
          icon={TrendingUp}
        />
      </div>
      <div className="col-12 col-md-4">
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
