// Reports — Relatórios do mês com gráficos (Recharts) e indicadores,
// tudo regado a deboche carinhoso do Sr. Cofre.
//
// Conteúdo:
//  - Seletor de mês (anterior/próximo).
//  - PieChart de gastos por categoria do mês (cores das próprias categorias).
//  - BarChart de entradas x saídas dos últimos 6 meses.
//  - Indicadores: maior gasto, categoria campeã, média diária e
//    "dias até o fim do mês x dinheiro restante" (com deboche se não fecha).
//  - Comentário do mascote (analiseRelatorio).
//  - Estado vazio sarcástico quando não há despesas no mês.

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight, Trophy, Flame, CalendarClock, Gauge } from "lucide-react";

import useStore from "../hooks/useStore";
import Card from "../components/Card";
import SectionHeader from "../components/SectionHeader";
import MoneyText from "../components/MoneyText";
import Mascote from "../components/Mascote";
import EmptyState from "../components/EmptyState";

import {
  monthSummary,
  categorySpend,
  topCategories,
  last6Months,
  categoryById,
  biggestExpense,
  dailyAverage,
  daysLeftInMonth,
  getBalance,
} from "../lib/finance";
import {
  formatBRL,
  formatBRLShort,
  monthLabel,
  formatDateBR,
} from "../lib/format";
import { getMessage } from "../lib/sarcasm";

const FALLBACK_COLOR = "#9A9AA8";

export default function Reports() {
  const { state } = useStore();
  const reduce = useReducedMotion();

  // Mês de referência (default = mês atual).
  const today = useMemo(() => new Date(), []);
  const [ref, setRef] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const goPrev = () =>
    setRef((r) => {
      const d = new Date(r.year, r.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const goNext = () =>
    setRef((r) => {
      const d = new Date(r.year, r.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const isCurrentMonth =
    ref.year === today.getFullYear() && ref.month === today.getMonth();

  // ---- Cálculos do mês selecionado ----
  const summary = useMemo(
    () => monthSummary(state, ref.year, ref.month),
    [state, ref.year, ref.month]
  );

  const spend = useMemo(
    () => categorySpend(state, ref.year, ref.month),
    [state, ref.year, ref.month]
  );

  // Dados do gráfico de pizza (gastos por categoria), ordenados desc.
  const pieData = useMemo(() => {
    const rows = Object.entries(spend)
      .map(([categoryId, total]) => {
        const cat = categoryById(state, categoryId);
        return {
          id: categoryId,
          name: cat ? `${cat.emoji} ${cat.name}` : "🤷 Sem categoria",
          value: total,
          color: (cat && cat.color) || FALLBACK_COLOR,
        };
      })
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);
    return rows;
  }, [spend, state]);

  const hasExpenses = pieData.length > 0;

  // Barras de 6 meses (entradas x saídas).
  const barData = useMemo(() => {
    const ref6 = new Date(ref.year, ref.month, 1);
    return last6Months(state, ref6).map((m) => ({
      label: m.label,
      entradas: m.income,
      saidas: m.expense,
    }));
  }, [state, ref.year, ref.month]);

  const hasAnySixMonths = useMemo(
    () => barData.some((m) => m.entradas > 0 || m.saidas > 0),
    [barData]
  );

  // Indicadores.
  const maior = useMemo(
    () => biggestExpense(state, ref.year, ref.month),
    [state, ref.year, ref.month]
  );
  const maiorCat = maior ? categoryById(state, maior.categoryId) : null;

  const campea = useMemo(
    () => topCategories(state, ref.year, ref.month, 1)[0] || null,
    [state, ref.year, ref.month]
  );

  const media = useMemo(
    () => dailyAverage(state, ref.year, ref.month),
    [state, ref.year, ref.month]
  );

  // Dias restantes só fazem sentido no mês corrente; em meses passados é 0,
  // em meses futuros usamos o total de dias do mês.
  const diasRestantes = useMemo(() => {
    if (isCurrentMonth) return daysLeftInMonth(today);
    const refDate = new Date(ref.year, ref.month, 1);
    if (refDate > today) {
      return new Date(ref.year, ref.month + 1, 0).getDate();
    }
    return 0;
  }, [isCurrentMonth, ref.year, ref.month, today]);

  const saldoGlobal = useMemo(() => getBalance(state), [state]);

  // Frase do mascote sobre o relatório (sorteada uma vez por mês/nível).
  const sarcasmLevel = state.settings.sarcasmLevel;
  const userName = state.settings.userName;
  const analiseMsg = useMemo(() => {
    return getMessage("analiseRelatorio", { state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.year, ref.month, sarcasmLevel, userName, hasExpenses]);

  const emptyMsg = useMemo(() => {
    return getMessage("estadoVazio", { state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.year, ref.month, sarcasmLevel, userName]);

  // Frase debochada sobre fechar (ou não) o mês.
  const fechamentoMsg = useMemo(() => {
    if (!hasExpenses) return null;
    if (summary.saldo < 0) {
      if (isCurrentMonth) {
        return "Saldo no vermelho e o mês ainda nem acabou. Corajoso.";
      }
      return "Esse mês fechou no negativo. O Sr. Cofre anotou na cadernetinha.";
    }
    if (isCurrentMonth) {
      // No último dia do mês daysLeftInMonth retorna 0; garante ao menos 1
      // para a divisão por-dia não estourar nem sumir.
      const diasDiv = Math.max(1, diasRestantes);
      const porDia = summary.saldo / diasDiv;
      if (porDia <= 0) {
        return "Faltam dias e sobrou nada. Hora de fazer amizade com o miojo.";
      }
      if (diasRestantes <= 0) {
        return `Último dia do mês e sobra ${formatBRL(
          summary.saldo
        )}. Fecha no azul, herói.`;
      }
      return `Sobra ${formatBRL(summary.saldo)} pra ${diasRestantes} ${
        diasRestantes === 1 ? "dia" : "dias"
      }. Dá ${formatBRL(porDia)} por dia — racione, herói.`;
    }
    return "Mês fechado no azul. Anota essa raridade no calendário.";
  }, [hasExpenses, summary.saldo, isCurrentMonth, diasRestantes]);

  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25 },
      };

  return (
    <div className="px-4 pb-28 pt-4">
      {/* Cabeçalho da tela */}
      <header className="mb-4">
        <div className="flex items-center gap-3">
          <Mascote mood="neutro" size={56} className="flex-shrink-0" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-ink">
              Relatórios
            </h1>
            <p className="text-sm text-ink-dim">
              A real dos seus números, sem filtro.
            </p>
          </div>
        </div>
      </header>

      {/* Seletor de mês */}
      <MonthSelector
        label={monthLabel(ref.year, ref.month)}
        onPrev={goPrev}
        onNext={goNext}
      />

      {/* Resumo rápido do mês */}
      <Card className="mb-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <SummaryCell title="Entradas" value={summary.income} type="income" />
          <SummaryCell title="Saídas" value={summary.expense} type="expense" />
          <SummaryCell
            title={summary.saldo < 0 ? "Falta" : "Sobra"}
            value={summary.saldo}
          />
        </div>
      </Card>

      {!hasExpenses ? (
        <Card className="mb-4">
          <EmptyState
            mascote
            title="Sem gastos pra dissecar"
            message={
              emptyMsg ||
              "Nenhuma despesa nesse mês. Ou você é um milagre da economia, ou esqueceu de lançar."
            }
          />
        </Card>
      ) : (
        <>
          {/* Pizza: gastos por categoria */}
          <motion.div {...motionProps}>
            <Card className="mb-4">
              <SectionHeader title="Pra onde foi a grana" />
              <div className="h-64 w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={88}
                      paddingAngle={2}
                      stroke="none"
                      isAnimationActive={!reduce}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda acessível com valores */}
              <ul className="mt-2 space-y-1.5">
                {pieData.map((row) => {
                  const pct =
                    summary.expense > 0
                      ? Math.round((row.value / summary.expense) * 100)
                      : 0;
                  return (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: row.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate text-ink">{row.name}</span>
                      </span>
                      <span className="flex flex-shrink-0 items-center gap-2 tabular-nums">
                        <span className="text-ink-dim">{pct}%</span>
                        <MoneyText value={row.value} type="expense" />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </motion.div>

          {/* Barras: 6 meses entradas x saídas */}
          <motion.div {...motionProps}>
            <Card className="mb-4">
              <SectionHeader title="Últimos 6 meses" />
              {hasAnySixMonths ? (
                <div className="h-56 w-full" aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
                      barGap={2}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgb(var(--line))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "rgb(var(--ink-dim))", fontSize: 12 }}
                        axisLine={{ stroke: "rgb(var(--line))" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "rgb(var(--ink-dim))", fontSize: 11 }}
                        tickFormatter={(v) => formatBRLShort(v)}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                      />
                      <Tooltip
                        cursor={{ fill: "rgb(var(--surface2))", opacity: 0.4 }}
                        content={<BarTooltip />}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, color: "rgb(var(--ink-dim))" }}
                      />
                      <Bar
                        dataKey="entradas"
                        name="Entradas"
                        fill="rgb(var(--income))"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={!reduce}
                      />
                      <Bar
                        dataKey="saidas"
                        name="Saídas"
                        fill="rgb(var(--expense))"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={!reduce}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-ink-dim">
                  Histórico mais vazio que cofre de estudante. Lance umas
                  transações que eu desenho o gráfico.
                </p>
              )}
            </Card>
          </motion.div>

          {/* Indicadores */}
          <motion.div {...motionProps}>
            <SectionHeader title="Os números que doem" />
            <div className="grid grid-cols-2 gap-3">
              <IndicatorCard
                icon={<Flame size={18} aria-hidden="true" />}
                title="Maior gasto"
              >
                {maior ? (
                  <>
                    <MoneyText
                      value={maior.amount}
                      type="expense"
                      className="text-lg font-extrabold"
                    />
                    <p className="mt-0.5 truncate text-xs text-ink-dim">
                      {maiorCat ? `${maiorCat.emoji} ${maiorCat.name}` : "Sem categoria"}
                      {" · "}
                      {formatDateBR(maior.date)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-dim">Nada digno de pânico.</p>
                )}
              </IndicatorCard>

              <IndicatorCard
                icon={<Trophy size={18} aria-hidden="true" />}
                title="Categoria campeã"
              >
                {campea ? (
                  <>
                    <p className="truncate text-lg font-extrabold text-ink">
                      {campea.category.emoji} {campea.category.name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-dim">
                      {Math.round(campea.pct)}% dos gastos ·{" "}
                      {formatBRL(campea.total)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-dim">Empate técnico no zero.</p>
                )}
              </IndicatorCard>

              <IndicatorCard
                icon={<Gauge size={18} aria-hidden="true" />}
                title="Média diária"
              >
                <MoneyText
                  value={media}
                  type="expense"
                  className="text-lg font-extrabold"
                />
                <p className="mt-0.5 text-xs text-ink-dim">
                  Por dia, em média. Multiplica e chora.
                </p>
              </IndicatorCard>

              <IndicatorCard
                icon={<CalendarClock size={18} aria-hidden="true" />}
                title="Até o fim do mês"
              >
                <p className="text-lg font-extrabold text-ink">
                  {isCurrentMonth && diasRestantes <= 0
                    ? "Último dia"
                    : `${diasRestantes} ${diasRestantes === 1 ? "dia" : "dias"}`}
                </p>
                <p className="mt-0.5 text-xs text-ink-dim">
                  Sobra geral:{" "}
                  <MoneyText value={saldoGlobal} colored />
                </p>
              </IndicatorCard>
            </div>
          </motion.div>

          {/* Veredito de fechamento do mês */}
          {fechamentoMsg ? (
            <Card
              className={`mt-4 ${
                summary.saldo < 0 ? "border-expense/40" : "border-line"
              }`}
            >
              <p className="text-sm leading-relaxed text-ink">{fechamentoMsg}</p>
            </Card>
          ) : null}

          {/* Comentário do mascote */}
          <Card className="mt-4">
            <div className="flex items-start gap-3">
              <Mascote
                mood={summary.saldo < 0 ? "preocupado" : "neutro"}
                size={56}
                className="flex-shrink-0"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-dim">
                  Veredito do Sr. Cofre
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink">
                  {analiseMsg}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes locais                                              */
/* ------------------------------------------------------------------ */

function MonthSelector({ label, onPrev, onNext }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Mês anterior"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-ink transition-opacity hover:opacity-80"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>

      <span className="flex-1 text-center text-base font-bold tracking-tight text-ink">
        {label}
      </span>

      <button
        type="button"
        onClick={onNext}
        aria-label="Próximo mês"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-ink transition-opacity hover:opacity-80"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

function SummaryCell({ title, value, type }) {
  return (
    <div>
      <p className="text-xs text-ink-dim">{title}</p>
      <MoneyText
        value={value}
        type={type}
        className="mt-0.5 block text-sm font-extrabold sm:text-base"
      />
    </div>
  );
}

function IndicatorCard({ icon, title, children }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-1.5 flex items-center gap-2 text-ink-dim">
        <span className="text-accent">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="min-w-0">{children}</div>
    </Card>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-2xl border border-line bg-surface-2 px-3 py-2 text-sm shadow-soft">
      <p className="font-bold text-ink">{item.name}</p>
      <p className="tabular-nums text-expense">{formatBRL(item.value)}</p>
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-2xl border border-line bg-surface-2 px-3 py-2 text-sm shadow-soft">
      <p className="mb-1 font-bold capitalize text-ink">{label}</p>
      {payload.map((p) => (
        <p
          key={p.dataKey}
          className="tabular-nums"
          style={{ color: p.color }}
        >
          {p.name}: {formatBRL(p.value)}
        </p>
      ))}
    </div>
  );
}
