"use client";

import { useMemo } from "react";
import Card from "./Card";
import TransactionsControls from "./TransactionsControls";
import TransactionsTable from "./TransactionsTable";
import EmptyState from "./EmptyState";
import { useApp } from "@/context/AppContext";
import { filterTransactions } from "@/utils/finance";

export default function TransactionsSection({ onEdit }) {
  const { transactions, filters, role } = useApp();

  const filtered = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters],
  );

  return (
    <Card
      title="Transactions"
      subtitle="Search, filter, and sort your activity"
      actions={<TransactionsControls />}
    >
      <div className="mt-2">
        {filtered.length ? (
          <TransactionsTable
            transactions={filtered}
            role={role}
            onEdit={role === "admin" ? onEdit : undefined}
          />
        ) : (
          <div style={{ height: 256 }}>
            <EmptyState
              title="No transactions found"
              hint="Try adjusting filters, or add a new transaction as Admin."
            />
          </div>
        )}
      </div>
    </Card>
  );
}
