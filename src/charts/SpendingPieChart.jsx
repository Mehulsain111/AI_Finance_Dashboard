"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useApp } from "@/context/AppContext";
import { spendingByCategory } from "@/utils/finance";
import { CATEGORY_COLORS } from "@/utils/colors";
import { formatCurrency } from "@/utils/format";
import EmptyState from "@/components/EmptyState";

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div className="rounded-3 border bg-body px-3 py-2 small shadow-sm">
      <div className="fw-medium">{item.name}</div>
      <div className="mt-1 text-body-secondary">
        {formatCurrency(item.value)}
      </div>
    </div>
  );
}

export default function SpendingPieChart({ disabled }) {
  const { rawTransactions, darkMode } = useApp();
  const data = spendingByCategory(rawTransactions);

  if (disabled || !data.length) {
    return <EmptyState title="No expenses yet" hint="Expenses appear here by category." />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<TooltipContent />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{
            fontSize: 12,
            color: darkMode ? "rgba(226,232,240,0.85)" : "rgba(100,116,139,1)",
          }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="rgba(148,163,184,0.25)"
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
