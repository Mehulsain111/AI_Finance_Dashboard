"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_TRANSACTIONS } from "@/data/transactions";
import { sortTransactions } from "@/utils/finance";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, authLoading } = useAuth();

  // Same idea as before (start with fixed defaults, load the real values in
  // an effect after mount) -- except now "the real values" come from Mongo
  // via /api/user/data instead of localStorage, scoped to whoever is logged
  // in. hydrated only flips true once THIS user's data has loaded, and flips
  // back to false if they log out, so a save-effect can never fire with
  // stale data for the wrong account.
  const [role, setRole] = useState("viewer");
  const [darkMode, setDarkMode] = useState(false);
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
  const [hydrated, setHydrated] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    type: "all", // all | income | expense
    sortBy: "date", // date | amount
    sortDir: "desc", // asc | desc
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/data");
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const data = await res.json();
        if (cancelled) return;
        setRole(data.role === "admin" ? "admin" : "viewer");
        setDarkMode(Boolean(data.darkMode));
        setTransactions(
          Array.isArray(data.transactions) && data.transactions.length
            ? data.transactions
            : DEFAULT_TRANSACTIONS,
        );
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  // These wait for the load above to finish, so they don't fire on mount (or
  // right after logging in) with the starting defaults and overwrite what's
  // actually saved.
  useEffect(() => {
    if (!hydrated) return;
    fetch("/api/user/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions }),
    }).catch((err) => console.error("Failed to save transactions:", err));
  }, [hydrated, transactions]);

  useEffect(() => {
    if (!hydrated) return;
    fetch("/api/user/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }).catch((err) => console.error("Failed to save role:", err));
  }, [hydrated, role]);

  useEffect(() => {
    if (!hydrated) return;
    fetch("/api/user/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ darkMode }),
    }).catch((err) => console.error("Failed to save dark mode:", err));

    const root = document.documentElement;
    if (darkMode) root.dataset.bsTheme = "dark";
    else delete root.dataset.bsTheme;
  }, [hydrated, darkMode]);

  const sortedTransactions = useMemo(() => {
    return sortTransactions(transactions, filters.sortBy, filters.sortDir);
  }, [transactions, filters.sortBy, filters.sortDir]);

  const value = useMemo(
    () => ({
      role,
      setRole,
      darkMode,
      setDarkMode,
      transactions: sortedTransactions,
      rawTransactions: transactions,
      setTransactions,
      filters,
      setFilters,
      hydrated,
    }),
    [
      role,
      darkMode,
      sortedTransactions,
      transactions,
      filters,
      hydrated,
      setRole,
      setDarkMode,
      setTransactions,
      setFilters,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
