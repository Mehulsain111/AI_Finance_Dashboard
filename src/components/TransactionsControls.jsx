"use client";

import Button from "./Button";
import { useApp } from "@/context/AppContext";

export default function TransactionsControls() {
  const { filters, setFilters } = useApp();

  return (
    <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 align-items-stretch align-items-sm-center justify-content-sm-end w-100">
      <input
        value={filters.search}
        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        placeholder="Search category or amount..."
        className="form-control flex-grow-1 flex-md-grow-0"
        style={{ minWidth: 180, maxWidth: "100%" }}
        aria-label="Search transactions"
      />

      <select
        value={filters.type}
        onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        className="form-select w-100 w-sm-auto"
        style={{ minWidth: 125 }}
        aria-label="Filter by type"
      >
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <select
        value={filters.sortBy}
        onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
        className="form-select w-100 w-sm-auto"
        style={{ minWidth: 120 }}
        aria-label="Sort by"
      >
        <option value="date">Date</option>
        <option value="amount">Amount</option>
      </select>

      <Button
        variant="ghost"
        onClick={() =>
          setFilters((f) => ({
            ...f,
            sortDir: f.sortDir === "asc" ? "desc" : "asc",
          }))
        }
        aria-label="Toggle sort direction"
        title="Toggle sort direction"
        className="w-100 w-sm-auto"
        style={{ minWidth: 130 }}
      >
        {filters.sortDir === "asc" ? "Ascending ↑" : "Descending ↓"}
      </Button>
    </div>
  );
}
