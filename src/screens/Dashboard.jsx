// Dashboard — tela inicial do "Tá Liso".
// Topo: Sr. Cofre (mood vindo do saldo) + saudação sarcástica dinâmica.
// Card de saldo grande com CountUp (shake quando negativo).
// Seletor de mês controlando o resumo. Top 3 categorias do mês com orçamento.
// EmptyState sarcástico quando ainda não há nada lançado.

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Plus } from "lucide-react";

import useStore from "../hooks/useStore";
import {
  getBalance,
  monthSummary,
  topCategories,
  budgetStatus,
  categorySpend,
  moodFromState,
  transactionsForMonth,
} from "../lib/finance";
import { formatBRL, monthLabel } from "../lib/format";
import { getMessage } from "../lib/sarcasm";

import Card from "../components/Card";
import CountUp from "../components/CountUp";
import MoneyText from "../components/MoneyText";
import ProgressBar from "../components/ProgressBar";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import Mascote from "../components/Mascote";

// Faixa horária para a saudação (manhã/tarde/noite) usada no contexto.
function horaDoDia(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "manha";
  if (h < 18) return "tarde";
  return "noite";
}

// Mapeia o saldo do mês selecionado para o trigger de saudação adequado.
function triggerSaldo(saldo, renda) {
  const ref = renda > 0 ? renda : 1000;
  if (saldo < 0) return "saldoNegativo";
  if (saldo < ref * 0.15) return "saldoBaixo";
  if (saldo < ref * 0.6) return "saldoMedio";
  return "saldoAlto";
}

export default function Dashboard({ onSeeAll, onAdd }) {
  const { state } = useStore();
  const reduce = useReducedMotion();

  // Mês/ano selecionado (default = mês atual).
  const hoje = useMemo(() => new Date(), []);
  const [year, setYear] = useState(hoje.getFullYear());
  const [month, setMonth] = useState(hoje.getMonth());

  const level = state.settings.sarcasmLevel;
  const nome = state.settings.userName;
  const renda = state.settings.monthlyIncome;

  // Saldo global (todas as transações) e resumo do mês selecionado.
  const saldoGlobal = getBalance(state);
  const resumo = monthSummary(state, year, month);
  const mood = moodFromState(state);

  const hasAnyTx = state.transactions.length > 0;
  const txDoMes = transactionsForMonth(state, year, month);
  const spendMap = categorySpend(state, year, month);
  const top3 = topCategories(state, year, month, 3);

  // Saudação: sorteada uma vez por nível/horário/nome para não "piscar" a cada render.
  const hora = horaDoDia();
  const saudacao = useMemo(
    () => getMessage("saudacao", { state, level, nome, hora }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, nome, hora]
  );

  // Comentário sobre a faixa de saldo global (mesmo número exibido no card).
  const comentarioSaldo = useMemo(() => {
    const trig = triggerSaldo(saldoGlobal, renda);
    return getMessage(trig, { state, level, nome });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saldoGlobal, renda, level, nome, state.settings.userName]);

  const saldoNegativo = saldoGlobal < 0;

  // Animação de "shake" no card de saldo quando o global está no vermelho.
  const [shakeKey, setShakeKey] = useState(0);
  useEffect(() => {
    if (saldoNegativo) setShakeKey((k) => k + 1);
  }, [saldoNegativo]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // Proporção entradas x saídas (para a mini barra de comparação).
  const totalFluxo = resumo.income + resumo.expense;
  const pctEntrada = totalFluxo > 0 ? (resumo.income / totalFluxo) * 100 : 0;
  const pctSaida = totalFluxo > 0 ? (resumo.expense / totalFluxo) * 100 : 0;

  return (
    <div className="px-4 pt-safe pb-4 space-y-5">
      {/* Cabeçalho: mascote + saudação dinâmica */}
      <header className="flex items-center gap-3 pt-2">
        <Mascote mood={mood} size={64} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-dim">
            {nome ? `Olá, ${nome}` : "Olá"}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-ink">{saudacao}</p>
        </div>
      </header>

      {/* Card de saldo grande */}
      <motion.div
        key={saldoNegativo ? `shake-${shakeKey}` : "calm"}
        animate={
          saldoNegativo && !reduce
            ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
            : { x: 0 }
        }
        transition={
          saldoNegativo && !reduce
            ? { duration: 0.5, ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        <Card
          className={
            saldoNegativo ? "border-expense/40 ring-1 ring-expense/20" : ""
          }
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-dim">
            Saldo total
          </p>
          <CountUp
            value={saldoGlobal}
            format={(n) => formatBRL(n)}
            className={`mt-1 block font-extrabold tracking-tight text-4xl ${
              saldoNegativo ? "text-expense" : "text-income"
            }`}
          />
          <p className="mt-2 text-sm leading-snug text-ink-dim">
            {comentarioSaldo}
          </p>
        </Card>
      </motion.div>

      {/* Seletor de mês + resumo */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mês anterior"
            className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 border border-line text-ink-dim hover:text-ink transition-colors"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <h2 className="flex-1 text-center text-base font-bold tracking-tight text-ink">
            {monthLabel(year, month)}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 border border-line text-ink-dim hover:text-ink transition-colors"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Entradas x Saídas */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-2 p-3">
            <p className="text-xs font-medium text-ink-dim">Entradas</p>
            <MoneyText
              value={resumo.income}
              type="income"
              className="mt-0.5 block text-lg font-bold"
            />
          </div>
          <div className="rounded-2xl bg-surface-2 p-3">
            <p className="text-xs font-medium text-ink-dim">Saídas</p>
            <MoneyText
              value={resumo.expense}
              type="expense"
              className="mt-0.5 block text-lg font-bold"
            />
          </div>
        </div>

        {/* Mini barra de proporção entradas vs saídas */}
        <div className="mt-3">
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
            role="img"
            aria-label={`Entradas ${formatBRL(
              resumo.income
            )}, saídas ${formatBRL(resumo.expense)}`}
          >
            <div
              className="h-full bg-income"
              style={{ width: `${pctEntrada}%` }}
            />
            <div
              className="h-full bg-expense"
              style={{ width: `${pctSaida}%` }}
            />
          </div>
        </div>

        {/* Sobra ou falta do mês */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-ink-dim">
            {resumo.saldo >= 0 ? "Sobrou no mês" : "Faltou no mês"}
          </span>
          <MoneyText
            value={resumo.saldo}
            signed
            className="text-base font-extrabold tracking-tight"
          />
        </div>
      </Card>

      {/* Top categorias OU estado vazio */}
      {hasAnyTx ? (
        <section>
          <SectionHeader title="Onde o dinheiro foi" />
          {top3.length > 0 ? (
            <Card className="space-y-4">
              {top3.map(({ category, total, pct }) => {
                const spent = spendMap[category.id] || 0;
                const status = budgetStatus(spent, category.budget);
                const barTone =
                  status?.level === "over"
                    ? "expense"
                    : status?.level === "warn"
                    ? "warn"
                    : "accent";
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl text-lg"
                        style={{ backgroundColor: `${category.color}22` }}
                        aria-hidden="true"
                      >
                        {category.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {category.name}
                        </p>
                        <p className="text-xs text-ink-dim">
                          {Math.round(pct)}% das saídas
                        </p>
                      </div>
                      <MoneyText
                        value={total}
                        type="expense"
                        className="text-sm font-bold"
                      />
                    </div>

                    {category.budget ? (
                      <div className="mt-2">
                        <ProgressBar
                          value={spent}
                          max={category.budget}
                          tone={barTone}
                        />
                        <p className="mt-1 text-[11px] text-ink-dim">
                          {formatBRL(spent)} de {formatBRL(category.budget)}
                          {status?.level === "over"
                            ? " · estourou 💥"
                            : status?.level === "warn"
                            ? " · quase lá 😬"
                            : ""}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </Card>
          ) : (
            <Card>
              <p className="text-center text-sm text-ink-dim">
                Nenhuma saída em {monthLabel(year, month).toLowerCase()}. Ou você
                segurou a carteira, ou o dinheiro fugiu sem avisar. 🐷
              </p>
            </Card>
          )}

          {/* Ver todas as transações */}
          <button
            type="button"
            onClick={onSeeAll}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            Ver todas as transações
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>
      ) : (
        <Card className="px-0 py-2">
          <EmptyState
            title="Cofre zerado por enquanto"
            message={getMessage("estadoVazio", { state, level, nome })}
            actionLabel="Lançar primeira transação"
            onAction={onAdd}
          />
          <div className="mt-1 flex justify-center pb-2">
            <button
              type="button"
              onClick={onAdd}
              aria-label="Adicionar transação"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-dim hover:text-ink transition-colors"
            >
              <Plus size={14} aria-hidden="true" /> Toque para começar
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
