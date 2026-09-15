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
import NLPExpenseQuery from "@/components/NLPExpenseQuery";
import SkeletonLoader from "@/components/SkeletonLoader";
import LiveMarketTicker from "@/components/LiveMarketTicker";
import { MotionStagger, MotionItem } from "@/components/MotionSection";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import FintechCard3D from "@/components/FintechCard3D";
import { totals } from "@/utils/finance";

export default function DashboardPage() {
  const { role, transactions, hydrated } = useApp();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const hasData = useMemo(() => transactions.length > 0, [transactions.length]);
  const modalOpen = addOpen || Boolean(selectedTransaction);
  
  const currentBalance = useMemo(() => totals(transactions).balance, [transactions]);

  function closeModal() {
    setAddOpen(false);
    setSelectedTransaction(null);
  }

  return (
    <PageShell
      title="Finance Dashboard"
      subtitle="Track balances, spending, and AI insights."
      onAddTransaction={role === "admin" ? () => setAddOpen(true) : null}
    >
      {!hydrated ? (
        <div className="app-card p-4">
          <SkeletonLoader lines={8} />
        </div>
      ) : (
        <MotionStagger className="row g-4 g-lg-5">
          {/* Live Market Ticker */}
          <MotionItem className="col-12 p-0 mb-n4">
            <div className="app-card rounded-3">
              <LiveMarketTicker />
            </div>
          </MotionItem>
          {/* Top section with 3D Card and Summary */}
          <MotionItem className="col-12 col-lg-5">
            <div className="h-100 d-flex flex-column align-items-center justify-content-center rounded-4 overflow-hidden position-relative app-card" style={{ minHeight: "340px", background: "radial-gradient(circle at center, color-mix(in srgb, var(--bs-primary) 10%, transparent), transparent 70%)" }}>
              <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
                <FintechCard3D name={user?.name || ""} balance={currentBalance} />
              </div>
            </div>
          </MotionItem>

          <MotionItem className="col-12 col-lg-7 d-flex flex-column justify-content-center">
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
            <NLPExpenseQuery transactions={transactions} />
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
