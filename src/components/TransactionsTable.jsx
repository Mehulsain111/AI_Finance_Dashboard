import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import Button from "./Button";

function TypePill({ type }) {
  const isIncome = type === "income";
  return (
    <span
      className={cn(
        "badge rounded-pill fw-semibold",
        isIncome
          ? "bg-success-subtle text-success-emphasis"
          : "bg-danger-subtle text-danger-emphasis",
      )}
    >
      {isIncome ? "Income" : "Expense"}
    </span>
  );
}

export default function TransactionsTable({ transactions, role, onEdit }) {
  return (
    <div className="table-responsive border rounded-3">
      <table className="table table-hover align-middle mb-0 app-table">
        <thead className="bg-body-tertiary">
          <tr className="small text-body-secondary">
            <th className="px-3 py-3 fw-semibold">Date</th>
            <th className="px-3 py-3 fw-semibold">Category</th>
            <th className="px-3 py-3 fw-semibold">Type</th>
            <th className="px-3 py-3 text-end fw-semibold">Amount</th>
            {role === "admin" ? (
              <th className="px-3 py-3 text-end fw-semibold">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const isIncome = t.type === "income";
            return (
              <tr key={t.id}>
                <td className="px-3 py-3 text-nowrap text-body-secondary">
                  {formatDate(t.date)}
                </td>
                <td className="px-3 py-3 fw-medium">{t.category}</td>
                <td className="px-3 py-3">
                  <TypePill type={t.type} />
                </td>
                <td
                  className={cn(
                    "px-3 py-3 text-end fw-semibold tabular-nums text-nowrap",
                    isIncome ? "text-success" : "text-danger",
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </td>
                {role === "admin" ? (
                  <td className="px-3 py-3 text-end">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onEdit?.(t)}
                    >
                      Edit
                    </Button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
