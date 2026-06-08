// Hook de estado global via useSyncExternalStore.
// Retorna { state, ...actions }. Toda action persiste via storage.setState
// com um novo objeto imutável.

import { useSyncExternalStore, useMemo } from "react";
import * as storage from "../lib/storage.js";
import { uid } from "../lib/finance.js";
import { seedCategories } from "../lib/seed.js";

function toPositive(n) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? Math.round(Math.abs(v) * 100) / 100 : 0;
}

function num(n) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

function createActions() {
  const get = storage.getState;
  const set = storage.setState;

  // ---- Transações ----
  function addTransaction(tx) {
    const s = get();
    const next = {
      ...s,
      transactions: [
        ...s.transactions,
        {
          id: uid(),
          type: tx.type === "income" ? "income" : "expense",
          amount: toPositive(tx.amount),
          categoryId: tx.categoryId,
          description: tx.description || "",
          date: tx.date,
          recurringId: tx.recurringId ?? null,
        },
      ],
    };
    set(next);
  }

  function updateTransaction(id, patch) {
    const s = get();
    const next = {
      ...s,
      transactions: s.transactions.map((t) => {
        if (t.id !== id) return t;
        const merged = { ...t, ...patch };
        if (patch && "amount" in patch) merged.amount = toPositive(patch.amount);
        if (patch && "type" in patch)
          merged.type = patch.type === "income" ? "income" : "expense";
        return merged;
      }),
    };
    set(next);
  }

  function deleteTransaction(id) {
    const s = get();
    set({ ...s, transactions: s.transactions.filter((t) => t.id !== id) });
  }

  // ---- Metas ----
  function addGoal(goal) {
    const s = get();
    const next = {
      ...s,
      goals: [
        ...s.goals,
        {
          id: uid(),
          name: goal.name || "",
          icon: goal.icon || "🎯",
          targetAmount: toPositive(goal.targetAmount),
          currentAmount: toPositive(goal.currentAmount),
          deadline: goal.deadline ?? null,
        },
      ],
    };
    set(next);
  }

  function updateGoal(id, patch) {
    const s = get();
    const next = {
      ...s,
      goals: s.goals.map((g) => {
        if (g.id !== id) return g;
        const merged = { ...g, ...patch };
        if (patch && "targetAmount" in patch)
          merged.targetAmount = toPositive(patch.targetAmount);
        if (patch && "currentAmount" in patch)
          merged.currentAmount = toPositive(patch.currentAmount);
        return merged;
      }),
    };
    set(next);
  }

  function deleteGoal(id) {
    const s = get();
    set({ ...s, goals: s.goals.filter((g) => g.id !== id) });
  }

  // Soma/subtrai currentAmount; nunca deixa abaixo de 0.
  function contributeGoal(id, delta) {
    const s = get();
    const next = {
      ...s,
      goals: s.goals.map((g) => {
        if (g.id !== id) return g;
        const novo = Math.max(0, num(g.currentAmount) + num(delta));
        return { ...g, currentAmount: novo };
      }),
    };
    set(next);
  }

  // ---- Categorias ----
  function addCategory(cat) {
    const s = get();
    const next = {
      ...s,
      categories: [
        ...s.categories,
        {
          id: uid(),
          name: cat.name || "",
          emoji: cat.emoji || "🏷️",
          color: cat.color || "#9A9AA8",
          type: cat.type === "income" ? "income" : "expense",
          budget: cat.budget == null ? null : num(cat.budget),
        },
      ],
    };
    set(next);
  }

  function updateCategory(id, patch) {
    const s = get();
    const next = {
      ...s,
      categories: s.categories.map((c) => {
        if (c.id !== id) return c;
        const merged = { ...c, ...patch };
        if (patch && "budget" in patch)
          merged.budget = patch.budget == null ? null : num(patch.budget);
        if (patch && "type" in patch)
          merged.type = patch.type === "income" ? "income" : "expense";
        return merged;
      }),
    };
    set(next);
  }

  function deleteCategory(id) {
    const s = get();
    set({ ...s, categories: s.categories.filter((c) => c.id !== id) });
  }

  // ---- Recorrências ----
  function addRecurring(r) {
    const s = get();
    const next = {
      ...s,
      recurring: [
        ...s.recurring,
        {
          id: uid(),
          type: r.type === "income" ? "income" : "expense",
          amount: toPositive(r.amount),
          categoryId: r.categoryId,
          description: r.description || "",
          dayOfMonth: Math.min(31, Math.max(1, Math.round(num(r.dayOfMonth)) || 1)),
          active: r.active === false ? false : true,
        },
      ],
    };
    set(next);
  }

  function updateRecurring(id, patch) {
    const s = get();
    const next = {
      ...s,
      recurring: s.recurring.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...patch };
        if (patch && "amount" in patch) merged.amount = toPositive(patch.amount);
        if (patch && "type" in patch)
          merged.type = patch.type === "income" ? "income" : "expense";
        if (patch && "dayOfMonth" in patch)
          merged.dayOfMonth = Math.min(
            31,
            Math.max(1, Math.round(num(patch.dayOfMonth)) || 1)
          );
        if (patch && "active" in patch) merged.active = Boolean(patch.active);
        return merged;
      }),
    };
    set(next);
  }

  function deleteRecurring(id) {
    const s = get();
    set({ ...s, recurring: s.recurring.filter((r) => r.id !== id) });
  }

  // ---- Configurações / ciclo de vida ----
  function updateSettings(patch) {
    const s = get();
    set({ ...s, settings: { ...s.settings, ...patch } });
  }

  function completeOnboarding({ userName, monthlyIncome, sarcasmLevel } = {}) {
    const s = get();
    const level = ["leve", "medio", "brutal"].includes(sarcasmLevel)
      ? sarcasmLevel
      : "medio";
    const next = {
      ...s,
      settings: {
        ...s.settings,
        onboarded: true,
        userName: userName || "",
        monthlyIncome: toPositive(monthlyIncome),
        sarcasmLevel: level,
      },
      // só semeia se ainda não houver categorias (idempotente).
      categories:
        s.categories && s.categories.length > 0
          ? s.categories
          : seedCategories(),
    };
    set(next);
  }

  function resetAll() {
    set(JSON.parse(JSON.stringify(storage.DEFAULT_STATE)));
  }

  // Valida e substitui o estado inteiro. Aceita string JSON ou objeto.
  function importData(jsonStringOuObj) {
    let parsed;
    try {
      parsed =
        typeof jsonStringOuObj === "string"
          ? JSON.parse(jsonStringOuObj)
          : jsonStringOuObj;
    } catch {
      throw new Error("Arquivo inválido: não é um JSON válido.");
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Arquivo inválido: conteúdo inesperado.");
    }

    const base = JSON.parse(JSON.stringify(storage.DEFAULT_STATE));
    const next = {
      ...base,
      ...parsed,
      schemaVersion: storage.SCHEMA_VERSION,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [],
    };
    // garante que continua "onboarded" para não jogar o usuário no setup.
    next.settings.onboarded = true;
    set(next);
  }

  function exportData() {
    return JSON.stringify(get(), null, 2);
  }

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeGoal,
    addCategory,
    updateCategory,
    deleteCategory,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    updateSettings,
    completeOnboarding,
    resetAll,
    importData,
    exportData,
  };
}

export default function useStore() {
  const state = useSyncExternalStore(
    storage.subscribe,
    storage.getSnapshot,
    storage.getServerSnapshot
  );

  // Actions são estáveis (acessam storage diretamente), criadas uma vez.
  const actions = useMemo(() => createActions(), []);

  return { state, ...actions };
}
