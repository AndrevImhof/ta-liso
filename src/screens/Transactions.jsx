// Transactions — lista de transações agrupada por dia (desc), com filtros
// (mês, tipo, categoria), busca por texto, edição via onEdit e exclusão com
// ConfirmDialog sarcástico ("confirmarExclusao").
// Transactions({ onBack, onEdit })

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Filter,
  X,
} from "lucide-react";

import useStore from "../hooks/useStore";
import { categoryById, transactionsForMonth } from "../lib/finance";
import { formatBRL, monthLabel, dayLabel, monthShort } from "../lib/format";
import { getMessage } from "../lib/sarcasm";

import Card from "../components/Card";
import Chip from "../components/Chip";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// Ordena os dias (YYYY-MM-DD) do mais recente para o mais antigo.
function sortDayKeysDesc(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

// Soma das transações de um grupo, considerando sinal (income +, expense -).
function groupNet(items) {
  let net = 0;
  for (const t of items) {
    const amt = Number(t.amount) || 0;
    net += t.type === "income" ? amt : -amt;
  }
  return net;
}

export default function Transactions({ onBack, onEdit }) {
  const { state, deleteTransaction } = useStore();
  const reduce = useReducedMotion();

  const now = new Date();
  const [ref, setRef] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [typeFilter, setTypeFilter] = useState("all"); // "all"|"income"|"expense"
  const [catFilter, setCatFilter] = useState("all"); // "all"|categoryId
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [toDelete, setToDelete] = useState(null); // transação pendente de exclusão

  const categories = Array.isArray(state.categories) ? state.categories : [];

  // Mascote/sarcasmo dependem do nível e do nome do usuário.
  const nome = state.settings?.userName || "";
  const level = state.settings?.sarcasmLevel || "medio";

  // Navegação de mês.
  function shiftMonth(delta) {
    setRef((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  // Transações do mês selecionado, já filtradas e ordenadas.
  const monthTx = useMemo(
    () => transactionsForMonth(state, ref.year, ref.month),
    [state, ref.year, ref.month]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return monthTx.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (catFilter !== "all" && t.categoryId !== catFilter) return false;
      if (q) {
        const cat = categoryById(state, t.categoryId);
        const haystack = `${t.description || ""} ${cat?.name || ""} ${
          cat?.emoji || ""
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [monthTx, typeFilter, catFilter, query, state]);

  // Agrupa por dia (YYYY-MM-DD), ordenado desc; dentro do dia também desc por data/id.
  const groups = useMemo(() => {
    const byDay = new Map();
    for (const t of filtered) {
      const day = String(t.date).slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(t);
    }
    const keys = Array.from(byDay.keys()).sort(sortDayKeysDesc);
    return keys.map((day) => ({
      day,
      items: byDay
        .get(day)
        .slice()
        .sort((a, b) =>
          a.date < b.date
            ? 1
            : a.date > b.date
            ? -1
            : a.id < b.id
            ? 1
            : a.id > b.id
            ? -1
            : 0
        ),
    }));
  }, [filtered]);

  // Categorias presentes no mês (para o seletor de categoria não ficar gigante).
  const catsInMonth = useMemo(() => {
    const ids = new Set(monthTx.map((t) => t.categoryId));
    return categories.filter((c) => ids.has(c.id));
  }, [monthTx, categories]);

  const hasAnyInMonth = monthTx.length > 0;
  const hasResults = filtered.length > 0;
  const activeFilters =
    typeFilter !== "all" || catFilter !== "all" || query.trim() !== "";

  function clearFilters() {
    setTypeFilter("all");
    setCatFilter("all");
    setQuery("");
  }

  // ----- Exclusão -----
  function requestDelete(tx, e) {
    e.stopPropagation();
    setToDelete(tx);
  }

  function confirmDelete() {
    if (toDelete) deleteTransaction(toDelete.id);
    setToDelete(null);
  }

  const delMessage = useMemo(
    () => getMessage("confirmarExclusao", { nome, level }),
    // Recalcula só ao abrir o diálogo (evita trocar a frase a cada render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toDelete?.id]
  );

  const listMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.2 },
      };

  return (
    <div className="px-4 pt-3 pb-28">
      {/* Cabeçalho */}
      <header className="flex items-center gap-2 mb-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="grid h-11 w-11 -ml-1 place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
        ) : null}
        <h1 className="text-xl font-extrabold tracking-tight text-ink">
          Transações
        </h1>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-label={showFilters ? "Esconder filtros" : "Mostrar filtros"}
          aria-pressed={showFilters}
          className={cx(
            "ml-auto grid h-11 w-11 place-items-center rounded-full transition-colors",
            showFilters || activeFilters
              ? "bg-accent text-white"
              : "text-ink-dim hover:text-ink hover:bg-surface-2"
          )}
        >
          <Filter size={20} aria-hidden="true" />
        </button>
      </header>

      {/* Seletor de mês */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Mês anterior"
          className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 border border-line text-ink-dim hover:text-ink transition-colors"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div className="text-center">
          <div className="text-base font-bold tracking-tight text-ink">
            {monthLabel(ref.year, ref.month)}
          </div>
          <div className="text-xs text-ink-dim">
            {filtered.length}{" "}
            {filtered.length === 1 ? "lançamento" : "lançamentos"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Próximo mês"
          className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 border border-line text-ink-dim hover:text-ink transition-colors"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-3">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-dim"
        />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por descrição ou categoria..."
          aria-label="Buscar transações"
          className="w-full min-h-[48px] rounded-2xl bg-surface-2 border border-line pl-11 pr-11 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:border-accent transition-colors"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpar busca"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-surface transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* Filtros (tipo + categoria) */}
      <AnimatePresence initial={false}>
        {showFilters ? (
          <motion.div
            key="filters"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={reduce ? {} : { opacity: 1, height: "auto" }}
            exit={reduce ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mb-3 space-y-3">
              {/* Tipo */}
              <div>
                <div className="text-xs font-semibold text-ink-dim mb-2">
                  Tipo
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    active={typeFilter === "all"}
                    onClick={() => setTypeFilter("all")}
                  >
                    Tudo
                  </Chip>
                  <Chip
                    active={typeFilter === "income"}
                    onClick={() => setTypeFilter("income")}
                  >
                    💰 Entradas
                  </Chip>
                  <Chip
                    active={typeFilter === "expense"}
                    onClick={() => setTypeFilter("expense")}
                  >
                    💸 Saídas
                  </Chip>
                </div>
              </div>

              {/* Categoria */}
              {catsInMonth.length > 0 ? (
                <div>
                  <div className="text-xs font-semibold text-ink-dim mb-2">
                    Categoria
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                    <Chip
                      active={catFilter === "all"}
                      onClick={() => setCatFilter("all")}
                      className="flex-shrink-0"
                    >
                      Todas
                    </Chip>
                    {catsInMonth.map((c) => (
                      <Chip
                        key={c.id}
                        active={catFilter === c.id}
                        onClick={() => setCatFilter(c.id)}
                        className="flex-shrink-0"
                      >
                        <span aria-hidden="true">{c.emoji}</span>
                        {c.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-accent hover:opacity-80 transition-opacity"
                >
                  Limpar filtros
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Conteúdo */}
      {!hasAnyInMonth ? (
        <Card className="mt-2">
          <EmptyState
            title="Mês vazio por aqui"
            message={getMessage("estadoVazio", { nome, level })}
          />
        </Card>
      ) : !hasResults ? (
        <Card className="mt-2">
          <EmptyState
            mascote={false}
            emoji="🔍"
            title="Nada encontrado"
            message="Nenhuma transação bate com esses filtros. Solta a mão deles e tenta de novo."
            actionLabel={activeFilters ? "Limpar filtros" : undefined}
            onAction={activeFilters ? clearFilters : undefined}
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => {
            const net = groupNet(group.items);
            return (
              <section key={group.day}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-sm font-bold text-ink">
                    {dayLabel(group.day)}
                  </h2>
                  <span
                    className={cx(
                      "text-xs font-semibold tabular-nums",
                      net >= 0 ? "text-income" : "text-expense"
                    )}
                  >
                    {net >= 0 ? "+" : "−"}
                    {formatBRL(Math.abs(net))}
                  </span>
                </div>

                <Card className="p-0 overflow-hidden divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {group.items.map((t) => {
                      const cat = categoryById(state, t.categoryId);
                      const emoji = cat?.emoji || "🤷";
                      const catName = cat?.name || "Sem categoria";
                      const isIncome = t.type === "income";
                      const amt = Number(t.amount) || 0;
                      return (
                        <motion.div
                          key={t.id}
                          layout={!reduce}
                          {...listMotion}
                          className="group relative flex items-center gap-3 px-3 py-3"
                        >
                          <button
                            type="button"
                            onClick={() => onEdit?.(t)}
                            aria-label={`Editar ${
                              t.description || catName
                            }, ${formatBRL(amt)}`}
                            className="flex flex-1 items-center gap-3 text-left min-w-0"
                          >
                            <span
                              className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-surface-2 text-xl"
                              aria-hidden="true"
                              style={
                                cat?.color
                                  ? { boxShadow: `inset 0 0 0 1.5px ${cat.color}33` }
                                  : undefined
                              }
                            >
                              {emoji}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-ink">
                                {t.description || catName}
                              </span>
                              <span className="block truncate text-xs text-ink-dim">
                                {t.description ? catName : "Sem descrição"}
                              </span>
                            </span>
                            <span
                              className={cx(
                                "flex-shrink-0 text-sm font-bold tabular-nums",
                                isIncome ? "text-income" : "text-expense"
                              )}
                            >
                              {isIncome ? "+" : "−"}
                              {formatBRL(amt)}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => requestDelete(t, e)}
                            aria-label={`Apagar ${t.description || catName}`}
                            className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-ink-dim hover:text-expense hover:bg-surface-2 transition-colors"
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </Card>
              </section>
            );
          })}

          <p className="pt-1 text-center text-xs text-ink-dim">
            {monthShort(ref.month)} • {filtered.length}{" "}
            {filtered.length === 1 ? "transação" : "transações"}
          </p>
        </div>
      )}

      {/* Confirmação de exclusão (sarcástica) */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Apagar transação?"
        message={
          toDelete
            ? `${delMessage}${
                delMessage ? "\n\n" : ""
              }${formatBRL(Number(toDelete.amount) || 0)} em ${
                categoryById(state, toDelete.categoryId)?.name ||
                "Sem categoria"
              }.`
            : ""
        }
        confirmLabel="Apagar mesmo"
        cancelLabel="Deixa pra lá"
        danger
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
