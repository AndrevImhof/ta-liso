// Persistência em localStorage com defaults, migração por schemaVersion e
// notificação de subscribers (para useSyncExternalStore).

const STORAGE_KEY = "talisoState";
const SCHEMA_VERSION = 1;

export const DEFAULT_STATE = {
  schemaVersion: SCHEMA_VERSION,
  settings: {
    onboarded: false,
    userName: "",
    monthlyIncome: 0,
    sarcasmLevel: "medio", // "leve" | "medio" | "brutal"
    theme: "dark", // "dark" | "light"
  },
  transactions: [], // { id, type, amount, categoryId, description, date, recurringId }
  categories: [], // preenchido no onboarding via seed
  goals: [], // { id, name, icon, targetAmount, currentAmount, deadline }
  recurring: [], // { id, type, amount, categoryId, description, dayOfMonth, active }
};

// ---- internals ----

const subscribers = new Set();
let cache = null; // snapshot estável para useSyncExternalStore

function deepClone(obj) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(obj);
    } catch {
      /* fallback abaixo */
    }
  }
  return JSON.parse(JSON.stringify(obj));
}

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Garante que o estado lido tenha todas as chaves/typos esperados.
function migrate(raw) {
  const base = deepClone(DEFAULT_STATE);
  if (!isObject(raw)) return base;

  const next = base;

  if (isObject(raw.settings)) {
    next.settings = { ...base.settings, ...raw.settings };
    // sanitiza enums
    if (!["leve", "medio", "brutal"].includes(next.settings.sarcasmLevel)) {
      next.settings.sarcasmLevel = "medio";
    }
    if (!["dark", "light"].includes(next.settings.theme)) {
      next.settings.theme = "dark";
    }
    next.settings.onboarded = Boolean(next.settings.onboarded);
    next.settings.userName =
      typeof next.settings.userName === "string" ? next.settings.userName : "";
    next.settings.monthlyIncome = Number(next.settings.monthlyIncome) || 0;
  }

  if (Array.isArray(raw.transactions)) next.transactions = raw.transactions;
  if (Array.isArray(raw.categories)) next.categories = raw.categories;
  if (Array.isArray(raw.goals)) next.goals = raw.goals;
  if (Array.isArray(raw.recurring)) next.recurring = raw.recurring;

  next.schemaVersion = SCHEMA_VERSION;
  return next;
}

function readFromStorage() {
  if (typeof localStorage === "undefined") {
    return deepClone(DEFAULT_STATE);
  }
  try {
    const rawStr = localStorage.getItem(STORAGE_KEY);
    if (!rawStr) return deepClone(DEFAULT_STATE);
    const parsed = JSON.parse(rawStr);
    return migrate(parsed);
  } catch {
    // Estado corrompido: recupera defaults sem crashar.
    return deepClone(DEFAULT_STATE);
  }
}

// ---- API pública ----

export function getState() {
  if (cache === null) {
    cache = readFromStorage();
  }
  return cache;
}

// Snapshot estável (mesma referência enquanto não houver setState).
export function getSnapshot() {
  return getState();
}

// SSR / ambiente sem window: snapshot inicial determinístico.
export function getServerSnapshot() {
  return DEFAULT_STATE;
}

export function setState(next) {
  cache = next;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // Sem espaço/privado: mantém em memória, não crasha.
  }
  for (const cb of subscribers) {
    try {
      cb();
    } catch {
      /* nunca deixa um subscriber quebrado derrubar os outros */
    }
  }
}

export function subscribe(cb) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

// Força releitura do storage (usado após import/reset externos, se necessário).
export function reloadFromStorage() {
  cache = readFromStorage();
  for (const cb of subscribers) {
    try {
      cb();
    } catch {
      /* noop */
    }
  }
}

export { STORAGE_KEY, SCHEMA_VERSION };
