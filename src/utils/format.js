export function formatCurrency(amount) {
  const num = Number(amount || 0);
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function formatNumber(amount) {
  const num = Number(amount || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

