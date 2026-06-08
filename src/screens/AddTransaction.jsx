// AddTransaction — Sheet para lançar (ou editar) uma transação.
// Toggle Entrada/Saída, valor grande inputmode="decimal", grade de chips de
// categoria, descrição e data. Ao salvar: add/update + efeitos + frase do Sr. Cofre.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import useStore from "../hooks/useStore.js";
import { categoryById } from "../lib/finance.js";
import { formatBRL, parseAmount, maskAmountInput } from "../lib/format.js";
import { getMessage } from "../lib/sarcasm.js";
import { rainCoins, flyMoney } from "../lib/effects.js";

import Sheet from "../components/Sheet.jsx";
import Chip from "../components/Chip.jsx";

// data de hoje em "YYYY-MM-DD" no fuso local (sem shift de timezone).
function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// classe utilitária de junção.
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function AddTransaction({ open, onClose, editingTx = null }) {
  const reduce = useReducedMotion();
  const {
    state,
    addTransaction,
    updateTransaction,
  } = useStore();

  const isEditing = Boolean(editingTx);

  // ---- estado local do formulário ----
  const [type, setType] = useState("expense");
  const [amountStr, setAmountStr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [touchedAmount, setTouchedAmount] = useState(false);
  const [touchedCategory, setTouchedCategory] = useState(false);

  const amountRef = useRef(null);

  // Categorias disponíveis para o tipo selecionado.
  const categories = useMemo(
    () => (state.categories || []).filter((c) => c.type === type),
    [state.categories, type]
  );

  const amountValue = parseAmount(amountStr);
  const amountInvalid = amountValue <= 0;
  const categoryInvalid = !categoryId;
  const canSave = !amountInvalid && !categoryInvalid;

  // (Re)inicializa o formulário sempre que o sheet abre ou troca o item editado.
  useEffect(() => {
    if (!open) return;

    if (editingTx) {
      setType(editingTx.type === "income" ? "income" : "expense");
      setAmountStr(maskAmountInput(String(Math.round((editingTx.amount || 0) * 100))));
      setCategoryId(editingTx.categoryId || "");
      setDescription(editingTx.description || "");
      setDate(editingTx.date || todayIso());
    } else {
      setType("expense");
      setAmountStr("");
      setCategoryId("");
      setDescription("");
      setDate(todayIso());
    }
    setTouchedAmount(false);
    setTouchedCategory(false);
  }, [open, editingTx]);

  // Foco automático no campo de valor quando abre.
  useEffect(() => {
    if (!open) return undefined;
    const id = window.setTimeout(() => {
      amountRef.current?.focus();
    }, 250);
    return () => window.clearTimeout(id);
  }, [open]);

  // Se a categoria selecionada não existe mais no tipo atual, limpa a seleção.
  useEffect(() => {
    if (!categoryId) return;
    const stillValid = categories.some((c) => c.id === categoryId);
    if (!stillValid) setCategoryId("");
  }, [categories, categoryId]);

  function handleAmountChange(e) {
    setAmountStr(maskAmountInput(e.target.value));
  }

  function switchType(nextType) {
    if (nextType === type) return;
    setType(nextType);
    setCategoryId(""); // categorias diferem por tipo
    setTouchedCategory(false);
  }

  function handleSave() {
    setTouchedAmount(true);
    setTouchedCategory(true);
    if (!canSave) {
      amountRef.current?.focus();
      return;
    }

    const safeDate = (!date || date > todayIso()) ? todayIso() : date;
    const payload = {
      type,
      amount: amountValue,
      categoryId,
      description: description.trim(),
      date: safeDate,
    };

    const cat = categoryById(state, categoryId);
    const nome = state.settings?.userName || "";
    const valorFmt = formatBRL(amountValue);
    const catName = cat?.name || "Sem categoria";

    if (isEditing) {
      updateTransaction(editingTx.id, payload);
    } else {
      addTransaction(payload);
    }

    // Efeitos + frase do Sr. Cofre (só para novos lançamentos: edição é mais sóbria).
    let frase;
    if (isEditing) {
      frase = "Anotação corrigida. Eu finjo que não vi a versão anterior.";
    } else if (type === "income") {
      // moedas proporcionais à renda mensal (entrada gorda = mais moedas felizes).
      const ref = state.settings?.monthlyIncome || 1000;
      const intensity = Math.max(0.4, Math.min(3, (amountValue / Math.max(1, ref)) * 2.5));
      rainCoins(intensity);
      frase = getMessage("addReceita", {
        state,
        nome,
        valor: valorFmt,
        categoria: catName,
      });
    } else {
      flyMoney();
      // gasto "grande" se passa de 20% da renda mensal (ou R$ 300 sem renda definida).
      const refBig = state.settings?.monthlyIncome
        ? state.settings.monthlyIncome * 0.2
        : 300;
      const trigger = amountValue >= refBig ? "addDespesaGrande" : "addDespesa";
      frase = getMessage(trigger, {
        state,
        nome,
        valor: valorFmt,
        categoria: catName,
      });
    }

    if (frase) onClose?.(frase);
    else onClose?.();
  }

  const footer = (
    <button
      type="button"
      onClick={handleSave}
      aria-disabled={!canSave}
      className={cx(
        "w-full min-h-[52px] rounded-2xl px-5 py-3 text-base font-bold",
        "transition-opacity active:opacity-90",
        canSave
          ? "bg-gradient-to-r from-accent to-accent-2 text-white shadow-fab"
          : "bg-surface-2 text-ink-dim border border-line cursor-not-allowed"
      )}
    >
      {isEditing ? "Salvar alterações" : "Salvar lançamento"}
    </button>
  );

  return (
    <Sheet
      open={open}
      onClose={() => onClose?.()}
      title={isEditing ? "Editar lançamento" : "Novo lançamento"}
      footer={footer}
    >
      <div className="space-y-5 pb-2">
        {/* Toggle Entrada / Saída */}
        <div
          role="group"
          aria-label="Tipo de lançamento"
          className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1 border border-line"
        >
          <TypeToggleButton
            active={type === "expense"}
            onClick={() => switchType("expense")}
            tone="expense"
            icon={<ArrowDownLeft size={18} aria-hidden="true" />}
            label="Saída"
          />
          <TypeToggleButton
            active={type === "income"}
            onClick={() => switchType("income")}
            tone="income"
            icon={<ArrowUpRight size={18} aria-hidden="true" />}
            label="Entrada"
          />
        </div>

        {/* Valor */}
        <div>
          <label
            htmlFor="tx-amount"
            className="block text-sm font-semibold text-ink-dim mb-2"
          >
            Quanto foi?
          </label>
          <div
            className={cx(
              "flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 border transition-colors",
              touchedAmount && amountInvalid ? "border-expense" : "border-line"
            )}
          >
            <span
              className={cx(
                "text-2xl font-extrabold tracking-tight",
                type === "income" ? "text-income" : "text-expense"
              )}
              aria-hidden="true"
            >
              R$
            </span>
            <input
              id="tx-amount"
              ref={amountRef}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              enterKeyHint="done"
              placeholder="0,00"
              value={amountStr}
              onChange={handleAmountChange}
              onBlur={() => setTouchedAmount(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              aria-label="Valor em reais"
              aria-invalid={touchedAmount && amountInvalid}
              className={cx(
                "flex-1 min-w-0 bg-transparent outline-none",
                "text-3xl font-extrabold tracking-tight tabular-nums",
                "placeholder:text-ink-dim/50",
                type === "income" ? "text-income" : "text-expense"
              )}
            />
          </div>
          {touchedAmount && amountInvalid ? (
            <p className="mt-1.5 text-xs font-medium text-expense">
              Bota um valor de verdade aí, o cofre não lê pensamento.
            </p>
          ) : null}
        </div>

        {/* Categoria */}
        <div>
          <label
            id="tx-category-label"
            className="block text-sm font-semibold text-ink-dim mb-2"
          >
            Categoria
          </label>
          {categories.length === 0 ? (
            <p className="text-sm text-ink-dim">
              Nenhuma categoria de {type === "income" ? "entrada" : "saída"}{" "}
              cadastrada. Crie uma em Ajustes.
            </p>
          ) : (
            <div
              role="group"
              aria-labelledby="tx-category-label"
              className="flex flex-wrap gap-2"
            >
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  active={categoryId === cat.id}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setTouchedCategory(true);
                  }}
                >
                  <span aria-hidden="true">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </Chip>
              ))}
            </div>
          )}
          {touchedCategory && categoryInvalid && categories.length > 0 ? (
            <p className="mt-1.5 text-xs font-medium text-expense">
              Escolhe uma categoria. Tudo tem que ir pra alguma gaveta.
            </p>
          ) : null}
        </div>

        {/* Descrição */}
        <div>
          <label
            htmlFor="tx-description"
            className="block text-sm font-semibold text-ink-dim mb-2"
          >
            Descrição{" "}
            <span className="font-normal text-ink-dim/70">(opcional)</span>
          </label>
          <input
            id="tx-description"
            type="text"
            maxLength={80}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              type === "income" ? "Ex: salário, freela, aquele Pix..." : "Ex: lanche, uber, presente..."
            }
            className="w-full rounded-2xl bg-surface-2 px-4 py-3 text-base text-ink border border-line outline-none placeholder:text-ink-dim/60"
          />
        </div>

        {/* Data */}
        <div>
          <label
            htmlFor="tx-date"
            className="block text-sm font-semibold text-ink-dim mb-2"
          >
            Quando?
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            max={todayIso()}
            onChange={(e) => setDate(e.target.value || todayIso())}
            className="w-full rounded-2xl bg-surface-2 px-4 py-3 text-base text-ink border border-line outline-none [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Pré-visualização sarcástica do impacto (some sem motion se reduzido). */}
      <AnimatePresence initial={false}>
        {!amountInvalid && !categoryInvalid ? (
          <motion.p
            key="preview"
            className="mt-1 text-center text-sm text-ink-dim"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            {type === "income" ? "Vai entrar " : "Vai sair "}
            <span
              className={cx(
                "font-bold tabular-nums",
                type === "income" ? "text-income" : "text-expense"
              )}
            >
              {formatBRL(amountValue)}
            </span>
            {type === "income" ? " 🤑" : " 😬"}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </Sheet>
  );
}

// Botão do toggle de tipo (Entrada / Saída).
function TypeToggleButton({ active, onClick, tone, icon, label }) {
  const toneActive =
    tone === "income"
      ? "bg-income/15 text-income border-income/40"
      : "bg-expense/15 text-expense border-expense/40";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "flex items-center justify-center gap-2 min-h-[44px] rounded-xl px-3 py-2",
        "text-sm font-bold border transition-colors",
        active
          ? toneActive
          : "bg-transparent text-ink-dim border-transparent hover:text-ink"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
