"use client";

import { useMemo, useState, useEffect } from "react";
import PageShell from "@/components/PageShell";
import SummaryCards from "@/components/SummaryCards";
import Card from "@/components/Card";
import BalanceLineChart from "@/charts/BalanceLineChart";
import SpendingPieChart from "@/charts/SpendingPieChart";
import TransactionsSection from "@/components/TransactionsSection";
import AddTransactionModal from "@/components/AddTransactionModal";
import AIFinancialAdvisor from "@/components/AIFinancialAdvisor";
import SkeletonLoader from "@/components/SkeletonLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MotionStagger, MotionItem } from "@/components/MotionSection";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import FintechCard3D from "@/components/FintechCard3D";
import { totals } from "@/utils/finance";
import { Home, List, PieChart, Sparkles, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardPage() {
  const { role, transactions, hydrated, startingBalance } = useApp();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Mobile UI State
  const [mobileTab, setMobileTab] = useState("home"); // home | transactions | analytics | ai
  const [isMobile, setIsMobile] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 992);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const hasData = useMemo(() => transactions.length > 0, [transactions.length]);
  const modalOpen = addOpen || Boolean(selectedTransaction);
  
  const currentBalance = useMemo(() => totals(transactions, startingBalance).balance, [transactions, startingBalance]);

  function closeModal() {
    setAddOpen(false);
    setSelectedTransaction(null);
  }

  const renderHome = () => (
    <div className="col-12">
      <div className="row g-4 g-lg-5">
        <MotionItem className="col-12 col-lg-5">
          <div 
            className="h-100 d-flex flex-column align-items-center justify-content-center rounded-4 overflow-hidden position-relative app-card" 
            style={{ minHeight: "340px", background: "radial-gradient(circle at center, color-mix(in srgb, var(--bs-primary) 10%, transparent), transparent 70%)" }}
          >
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
              <FintechCard3D name={user?.name || ""} balance={currentBalance} />
            </div>
          </div>
        </MotionItem>
        <MotionItem className="col-12 col-lg-7 d-flex flex-column justify-content-center">
          <SummaryCards />
        </MotionItem>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="col-12">
      <div className="row g-4 g-lg-5">
        <MotionItem className="col-12 col-lg-7">
          <Card title="Balance Trend" subtitle="Running balance trajectory over time">
            <div className="app-chart-box scroll-x-mobile hide-scrollbar">
              <div style={{ minWidth: isMobile ? "500px" : "100%", height: "100%" }}>
                <BalanceLineChart disabled={!hasData} />
              </div>
            </div>
          </Card>
        </MotionItem>
        <MotionItem className="col-12 col-lg-5">
          <Card title="Spending Breakdown" subtitle="Categorical distribution of expenses">
            <div className="app-chart-box scroll-x-mobile hide-scrollbar">
              <div style={{ minWidth: isMobile ? "400px" : "100%", height: "100%" }}>
                <SpendingPieChart disabled={!hasData} />
              </div>
            </div>
          </Card>
        </MotionItem>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="col-12">
      <MotionItem className="col-12">
        <TransactionsSection onEdit={setSelectedTransaction} />
      </MotionItem>
    </div>
  );

  const renderAI = () => (
    <div className="col-12">
      <MotionItem className="col-12">
        <AIFinancialAdvisor financialData={transactions} />
      </MotionItem>
    </div>
  );

  return (
    <PageShell
      title="Finance Dashboard"
      subtitle="Track balances, spending, and AI insights."
      onAddTransaction={role === "admin" && !isMobile ? () => setAddOpen(true) : null}
      isMobile={isMobile}
    >
      {!hydrated ? (
        <div className="app-card p-4">
          <SkeletonLoader lines={8} />
        </div>
      ) : (
        <>
          {/* DESKTOP LAYOUT (All sections in feed) or MOBILE TABBED VIEW */}
          <MotionStagger className="row g-4 g-lg-5 pb-5">
            {isMounted && isMobile ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileTab}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeInOut", staggerChildren: 0.1 } },
                    exit: { opacity: 0, y: -12, transition: { duration: 0.15 } }
                  }}
                  className="col-12 p-0"
                >
                  <ErrorBoundary>
                    {mobileTab === "home" && renderHome()}
                    {mobileTab === "analytics" && renderAnalytics()}
                    {mobileTab === "transactions" && renderTransactions()}
                    {mobileTab === "ai" && renderAI()}
                  </ErrorBoundary>
                </motion.div>
              </AnimatePresence>
            ) : (
              <>
                {renderHome()}
                {renderAnalytics()}
                {renderTransactions()}
                {renderAI()}
              </>
            )}
          </MotionStagger>

          {/* MOBILE BOTTOM NAVIGATION & FAB */}
          {isMobile && (
            <>
              {role === "admin" && (
                <button 
                  className="mobile-fab" 
                  onClick={() => setAddOpen(true)}
                  aria-label="Add Transaction"
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              )}
              <nav className="mobile-bottom-nav">
                <button className={`btn btn-link mobile-nav-item ${mobileTab === 'home' ? 'active' : ''}`} onClick={() => setMobileTab('home')}>
                  <Home size={22} />
                  <span>Home</span>
                </button>
                <button className={`btn btn-link mobile-nav-item ${mobileTab === 'transactions' ? 'active' : ''}`} onClick={() => setMobileTab('transactions')}>
                  <List size={22} />
                  <span>Log</span>
                </button>
                <button className={`btn btn-link mobile-nav-item ${mobileTab === 'analytics' ? 'active' : ''}`} onClick={() => setMobileTab('analytics')}>
                  <PieChart size={22} />
                  <span>Charts</span>
                </button>
                <button className={`btn btn-link mobile-nav-item ${mobileTab === 'ai' ? 'active' : ''}`} onClick={() => setMobileTab('ai')}>
                  <Sparkles size={22} />
                  <span>AI Chat</span>
                </button>
              </nav>
            </>
          )}
        </>
      )}

      <AddTransactionModal open={modalOpen} onClose={closeModal} transaction={selectedTransaction} />
    </PageShell>
  );
}
