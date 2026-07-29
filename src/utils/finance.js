export const STARTING_BALANCE = 12000;

export function normalizeType(type) {
  return type === "income" || type === "expense" ? type : "expense";
}

export function sortTransactions(transactions, sortBy, sortDir) {
  const dir = sortDir === "asc" ? 1 : -1;
  const items = Array.isArray(transactions) ? [...transactions] : [];

  items.sort((a, b) => {
    if (sortBy === "amount") {
      const diff = Number(a.amount || 0) - Number(b.amount || 0);
      if (diff !== 0) return diff * dir;
      return String(a.date || "").localeCompare(String(b.date || "")) * -dir;
    }

    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    const safeA = Number.isNaN(aTime) ? 0 : aTime;
    const safeB = Number.isNaN(bTime) ? 0 : bTime;
    if (safeA !== safeB) return (safeA - safeB) * dir;
    return (Number(a.amount || 0) - Number(b.amount || 0)) * -dir;
  });

  return items;
}

export function totals(transactions) {
  const items = Array.isArray(transactions) ? transactions : [];
  let income = 0;
  let expenses = 0;
  for (const t of items) {
    const amt = Number(t.amount || 0);
    if (normalizeType(t.type) === "income") income += amt;
    else expenses += amt;
  }
  const balance = STARTING_BALANCE + income - expenses;
  return { income, expenses, balance };
}

export function filterTransactions(transactions, { search, type }) {
  const items = Array.isArray(transactions) ? transactions : [];
  const q = String(search || "").trim().toLowerCase();

  return items.filter((t) => {
    const tType = normalizeType(t.type);
    if (type && type !== "all" && type !== tType) return false;

    if (!q) return true;
    const category = String(t.category || "").toLowerCase();
    const amount = String(t.amount ?? "").toLowerCase();
    return category.includes(q) || amount.includes(q);
  });
}

export function spendingByCategory(transactions) {
  const map = new Map();
  for (const t of transactions || []) {
    if (normalizeType(t.type) !== "expense") continue;
    const category = String(t.category || "Other");
    const amt = Number(t.amount || 0);
    map.set(category, (map.get(category) || 0) + amt);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function highestSpendingCategory(transactions) {
  const byCat = spendingByCategory(transactions);
  return byCat[0] || null;
}

export function balanceTrend(transactions) {
  const items = sortTransactions(transactions || [], "date", "asc");
  const points = [];
  let running = STARTING_BALANCE;
  for (const t of items) {
    const amt = Number(t.amount || 0);
    running += normalizeType(t.type) === "income" ? amt : -amt;
    points.push({
      date: t.date,
      balance: Number(running.toFixed(2)),
    });
  }
  return points;
}

function monthKey(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthlyComparison(transactions, nowDate = new Date()) {
  const nowKey = monthKey(nowDate.toISOString().slice(0, 10));
  if (!nowKey) return null;

  const [yearStr, monthStr] = nowKey.split("-");
  const y = Number(yearStr);
  const m = Number(monthStr);
  const prevDate = new Date(y, m - 2, 15); // previous month (0-indexed month in Date)
  const prevKey = monthKey(prevDate.toISOString().slice(0, 10));

  const acc = {
    [nowKey]: { income: 0, expenses: 0 },
    [prevKey]: { income: 0, expenses: 0 },
  };

  for (const t of transactions || []) {
    const key = monthKey(t.date);
    if (!key || !(key in acc)) continue;
    const amt = Number(t.amount || 0);
    if (normalizeType(t.type) === "income") acc[key].income += amt;
    else acc[key].expenses += amt;
  }

  const current = acc[nowKey];
  const previous = acc[prevKey];
  return { nowKey, prevKey, current, previous };
}

