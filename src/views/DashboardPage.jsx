"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SummaryCards from "@/components/SummaryCards";
import Card from "@/components/Card";
import BalanceLineChart from "@/charts/BalanceLineChart";
import SpendingPieChart from "@/charts/SpendingPieChart";
import TransactionsSection from "@/components/TransactionsSection";
import InsightsSection from "@/components/InsightsSection";
import AddTransactionModal from "@/components/AddTransactionModal";
import AIFinancialAdvisor from "@/components/AIFinancialAdvisor";
import { MotionStagger, MotionItem } from "@/components/MotionSection";
import { useApp } from "@/context/AppContext";

export default function DashboardPage() {
  const { role, transactions, hydrated } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const hasData = useMemo(() => transactions.length > 0, [transactions.length]);
  const modalOpen = addOpen || Boolean(selectedTransaction);

  function closeModal() {
    setAddOpen(false);
    setSelectedTransaction(null);
  }

  return (
    <PageShell
      title="Finance Dashboard"
      subtitle="Track balances, spending, and transactions in one place."
      onAddTransaction={role === "admin" ? () => setAddOpen(true) : null}
    >
      {!hydrated ? (
        // Briefly shown while /api/user/data loads for this account.
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 320 }}>
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading your dashboard...</span>
          </div>
        </div>
      ) : (
        <MotionStagger className="row g-4 g-lg-5">
          <MotionItem className="col-12">
            <SummaryCards />
          </MotionItem>

          <MotionItem className="col-12 col-lg-8">
            <Card title="Balance Trend" subtitle="Running balance over time">
              <div className="app-chart-box">
                <BalanceLineChart disabled={!hasData} />
              </div>
            </Card>
          </MotionItem>

          <MotionItem className="col-12 col-lg-4">
            <Card title="Spending Breakdown" subtitle="Expenses by category">
              <div className="app-chart-box">
                <SpendingPieChart disabled={!hasData} />
              </div>
            </Card>
          </MotionItem>

          <MotionItem className="col-12 col-lg-4">
            <InsightsSection />
          </MotionItem>

          <MotionItem className="col-12 col-lg-8">
            <TransactionsSection onEdit={setSelectedTransaction} />
          </MotionItem>

          <MotionItem className="col-12">
            <AIFinancialAdvisor financialData={transactions} />
          </MotionItem>
        </MotionStagger>
      )}

      <AddTransactionModal open={modalOpen} onClose={closeModal} transaction={selectedTransaction} />
    </PageShell>
  );
}
