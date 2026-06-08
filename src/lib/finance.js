// Funções PURAS de finanças. Recebem o state e nunca mutam nada.

import { monthShort } from "./format.js";

// ---- helpers ----

let uidCounter = 0;
// id único string sem libs externas.
export function uid() {
  uidCounter += 1;
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${rand}-${uidCounter.toString(36)}`;
}

function num(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function txList(state) {
  return Array.isArray(state?.transactions) ? state.transactions : [];
}

function catList(state) {
  return Array.isArray(state?.categories) ? state.categories : [];
}

// "YYYY-MM-DD" -> "YYYY-MM"
export function monthKey(isoDate) {
  return String(isoDate).slice(0, 7);
}

// "YYYY-MM-DD" -> { year, month(0-11) }
export function ymOf(isoDate) {
  const s = String(isoDate);
  const year = Number(s.slice(0, 4));
  const month = Number(s.slice(5, 7)) - 1;
  return { year, month };
}

// Saldo global: soma de TODAS as transações (income - expense).
export function getBalance(state) {
  let total = 0;
  for (const t of txList(state)) {
    if (t.type === "income") total += num(t.amount);
    else if (t.type === "expense") total -= num(t.amount);
  }
  return total;
}

export function transactionsForMonth(state, year, month) {
  return txList(state).filter((t) => {
    const { year: y, month: m } = ymOf(t.date);
    return y === year && m === month;
  });
}

export function monthSummary(state, year, month) {
  let income = 0;
  let expense = 0;
  for (const t of transactionsForMonth(state, year, month)) {
    if (t.type === "income") income += num(t.amount);
    else if (t.type === "expense") expense += num(t.amount);
  }
  return { income, expense, saldo: income - expense };
}

// { [categoryId]: totalExpense } no mês.
export function categorySpend(state, year, month) {
  const out = {};
  for (const t of transactionsForMonth(state, year, month)) {
    if (t.type !== "expense") continue;
    out[t.categoryId] = (out[t.categoryId] || 0) + num(t.amount);
  }
  return out;
}

// Top N categorias de DESPESA do mês, desc. [{ category, total, pct }].
export function topCategories(state, year, month, n = 3) {
  const spend = categorySpend(state, year, month);
  const totalExpense = Object.values(spend).reduce((a, b) => a + b, 0);

  const rows = Object.entries(spend).map(([categoryId, total]) => ({
    category: categoryById(state, categoryId) || {
      id: categoryId,
      name: "Sem categoria",
      emoji: "🤷",
      color: "#9A9AA8",
      type: "expense",
      budget: null,
    },
    total,
    pct: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
  }));

  rows.sort((a, b) => b.total - a.total);
  return rows.slice(0, n);
}

// 6 meses até refDate (inclusive). [{ label:"jun", year, month, income, expense }].
export function last6Months(state, refDate) {
  const ref = refDate ? new Date(refDate) : new Date();
  const out = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const { income, expense } = monthSummary(state, year, month);
    out.push({ label: monthShort(month), year, month, income, expense });
  }
  return out;
}

export function categoryById(state, id) {
  return catList(state).find((c) => c.id === id);
}

// Status de orçamento. budget vazio -> null.
export function budgetStatus(spent, budget) {
  if (budget == null || num(budget) <= 0) return null;
  const b = num(budget);
  const pct = (num(spent) / b) * 100;
  let level = "ok";
  if (pct > 100) level = "over";
  else if (pct >= 80) level = "warn";
  return { pct, level };
}

// Maior despesa do mês (ou null).
export function biggestExpense(state, year, month) {
  let max = null;
  for (const t of transactionsForMonth(state, year, month)) {
    if (t.type !== "expense") continue;
    if (max === null || num(t.amount) > num(max.amount)) max = t;
  }
  return max;
}

// Média diária de DESPESA no mês (gasto total / dias decorridos do mês).
export function dailyAverage(state, year, month) {
  const { expense } = monthSummary(state, year, month);
  if (expense <= 0) return 0;

  const today = new Date();
  const isCurrent =
    today.getFullYear() === year && today.getMonth() === month;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const divisor = isCurrent ? Math.max(1, today.getDate()) : daysInMonth;
  return expense / divisor;
}

// Dias restantes no mês de refDate (inclui hoje? não: do dia seguinte ao fim).
export function daysLeftInMonth(refDate) {
  const ref = refDate ? new Date(refDate) : new Date();
  const lastDay = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  return lastDay - ref.getDate();
}

// Humor do Sr. Cofre a partir do saldo vs renda mensal de referência.
export function moodFromState(state) {
  const saldo = getBalance(state);
  const renda = num(state?.settings?.monthlyIncome);
  // Referência: se não houver renda informada, usa um piso simbólico.
  const ref = renda > 0 ? renda : 1000;

  if (saldo < 0) {
    // muito negativo -> morto
    return saldo <= -ref ? "morto" : "chorando";
  }
  if (saldo < ref * 0.1) return "preocupado";
  if (saldo < ref * 0.5) return "neutro";
  return "feliz";
}

// Lança recorrências ativas devidas no mês corrente que ainda não existem.
// Retorna NOVO state (imutável). Idempotente. NÃO persiste.
export function applyDueRecurring(state) {
  const recurring = Array.isArray(state?.recurring) ? state.recurring : [];
  if (recurring.length === 0) return state;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDay = today.getDate();
  const mk = `${year}-${String(month + 1).padStart(2, "0")}`;

  const existing = txList(state);
  const added = [];

  for (const r of recurring) {
    if (!r || r.active === false) continue;
    if (num(r.dayOfMonth) > todayDay) continue;

    // já existe lançamento desta recorrência no mês corrente?
    const already = existing.some(
      (t) => t.recurringId === r.id && monthKey(t.date) === mk
    );
    if (already) continue;

    // dia efetivo, limitado ao último dia do mês
    const lastDay = new Date(year, month + 1, 0).getDate();
    const day = Math.min(num(r.dayOfMonth) || 1, lastDay);
    const date = `${mk}-${String(day).padStart(2, "0")}`;

    added.push({
      id: uid(),
      type: r.type,
      amount: num(r.amount),
      categoryId: r.categoryId,
      description: r.description || "",
      date,
      recurringId: r.id,
    });
  }

  if (added.length === 0) return state;

  return {
    ...state,
    transactions: [...existing, ...added],
  };
}
