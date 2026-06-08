// Goals — telas de metas do "Tá Liso".
// Lista de metas como cards (emoji, nome, ProgressBar, current/target, %, prazo).
// Criar/editar/excluir meta via Sheet. Contribuir (+) e resgatar (-).
// Reações do Sr. Cofre: perto -> metaPerto; 100% -> celebrate() + metaBatida; longe -> metaLonge.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Pencil, Trash2, PiggyBank, ArrowDownToLine } from "lucide-react";

import useStore from "../hooks/useStore";
import { formatBRL, formatDateBR, parseAmount, maskAmountInput } from "../lib/format";
import { getMessage } from "../lib/sarcasm";
import { celebrate } from "../lib/effects";

import Card from "../components/Card";
import SectionHeader from "../components/SectionHeader";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";
import Sheet from "../components/Sheet";
import ConfirmDialog from "../components/ConfirmDialog";
import Chip from "../components/Chip";

// Emojis sugeridos para escolher ao criar/editar uma meta.
const ICON_OPTIONS = [
  "🎯", "✈️", "🏠", "🚗", "💍", "🎓", "🏖️", "📱",
  "💻", "🎮", "🛟", "🐷", "👶", "🐶", "🎸", "🎁",
];

function clampPct(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Goals() {
  const store = useStore();
  const { state, addGoal, updateGoal, deleteGoal, contributeGoal } = store;
  const goals = state.goals || [];
  const reduce = useReducedMotion();

  // ---- Toast com a frase do Sr. Cofre ----
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  function showToast(msg) {
    if (!msg) return;
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4200);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ---- Sheet de criar/editar meta ----
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fName, setFName] = useState("");
  const [fIcon, setFIcon] = useState("🎯");
  const [fTarget, setFTarget] = useState("");
  const [fDeadline, setFDeadline] = useState("");
  const [formError, setFormError] = useState("");

  function openCreate() {
    setEditingId(null);
    setFName("");
    setFIcon("🎯");
    setFTarget("");
    setFDeadline("");
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(goal) {
    setEditingId(goal.id);
    setFName(goal.name || "");
    setFIcon(goal.icon || "🎯");
    setFTarget(goal.targetAmount ? maskAmountInput(String(Math.round(goal.targetAmount * 100))) : "");
    setFDeadline(goal.deadline || "");
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
  }

  function handleSaveGoal() {
    const nome = fName.trim();
    const target = parseAmount(fTarget);

    if (!nome) {
      setFormError("Dá um nome pra essa meta, vai. Até sonho precisa de título.");
      return;
    }
    if (!(target > 0)) {
      setFormError("Quanto você quer juntar? Zero não conta como meta, {nome}.".replace("{nome}", state.settings.userName || "amigo"));
      return;
    }

    const deadline = fDeadline ? fDeadline : null;

    if (editingId) {
      updateGoal(editingId, {
        name: nome,
        icon: fIcon || "🎯",
        targetAmount: target,
        deadline,
      });
      showToast("Meta atualizada. Agora é com você cumprir, hein.");
    } else {
      addGoal({
        name: nome,
        icon: fIcon || "🎯",
        targetAmount: target,
        currentAmount: 0,
        deadline,
      });
      showToast(
        getMessage("metaLonge", { state, nome: state.settings.userName }) ||
          "Meta criada! Bora encher esse cofrinho."
      );
    }
    setFormOpen(false);
  }

  // ---- Sheet de contribuir / resgatar ----
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveMode, setMoveMode] = useState("add"); // "add" | "withdraw"
  const [moveGoalId, setMoveGoalId] = useState(null);
  const [moveValue, setMoveValue] = useState("");
  const [moveError, setMoveError] = useState("");

  const moveGoal = useMemo(
    () => goals.find((g) => g.id === moveGoalId) || null,
    [goals, moveGoalId]
  );

  function openMove(goal, mode) {
    setMoveGoalId(goal.id);
    setMoveMode(mode);
    setMoveValue("");
    setMoveError("");
    setMoveOpen(true);
  }

  function closeMove() {
    setMoveOpen(false);
  }

  function reactToProgress(goalBefore, valor) {
    // Calcula o novo estado para reagir corretamente (state ainda não atualizou neste tick).
    const target = goalBefore.targetAmount || 0;
    const currentAnterior = goalBefore.currentAmount || 0;
    const novoAtual = Math.max(0, currentAnterior + valor);
    const pct = target > 0 ? (novoAtual / target) * 100 : 0;
    const nome = state.settings.userName;
    const jaCompleta = target > 0 && currentAnterior >= target;

    if (!jaCompleta && target > 0 && novoAtual >= target) {
      celebrate();
      showToast(getMessage("metaBatida", { state, nome }) || "Meta batida! 🎉");
    } else if (jaCompleta && novoAtual >= target) {
      showToast(`Guardado! +${formatBRL(valor)} numa meta já batida. Caprichoso, hein.`);
    } else if (pct >= 80) {
      showToast(getMessage("metaPerto", { state, nome }) || "Tá quase lá!");
    } else if (pct < 25) {
      showToast(getMessage("metaLonge", { state, nome }) || "Ainda falta bastante.");
    } else {
      showToast(`Guardado! +${formatBRL(valor)} nessa meta. O cofre agradece.`);
    }
  }

  function handleMoveConfirm() {
    if (!moveGoal) return;
    const valor = parseAmount(moveValue);

    if (!(valor > 0)) {
      setMoveError("Coloca um valor de verdade, {nome}.".replace("{nome}", state.settings.userName || "vai"));
      return;
    }

    if (moveMode === "add") {
      contributeGoal(moveGoal.id, valor);
      reactToProgress(moveGoal, valor);
    } else {
      const disponivel = moveGoal.currentAmount || 0;
      const retirada = Math.min(valor, disponivel);
      if (!(retirada > 0)) {
        setMoveError("Não tem nada guardado aqui pra resgatar. Cofre vazio é cofre triste.");
        return;
      }
      contributeGoal(moveGoal.id, -retirada);
      showToast(
        retirada < valor
          ? `Resgatei os ${formatBRL(retirada)} que tinham. Mais que isso, nem eu invento.`
          : `Lá se foram ${formatBRL(retirada)} da meta. Espero que tenha sido importante.`
      );
    }
    setMoveOpen(false);
  }

  // ---- ConfirmDialog de exclusão ----
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const deleteGoalRef = useMemo(
    () => goals.find((g) => g.id === deleteId) || null,
    [goals, deleteId]
  );

  function askDelete(goal) {
    setDeleteId(goal.id);
    setConfirmOpen(true);
  }

  function confirmDelete() {
    if (deleteId) {
      deleteGoal(deleteId);
      showToast("Meta apagada. Sonho adiado não é sonho perdido, dizem por aí.");
    }
    setConfirmOpen(false);
    setDeleteId(null);
  }

  // ---- Render ----
  return (
    <div className="px-4 pt-4 pb-28">
      <SectionHeader
        title="Suas metas"
        action={
          <button
            type="button"
            onClick={openCreate}
            aria-label="Criar nova meta"
            className="inline-flex items-center gap-1.5 min-h-[44px] rounded-full px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
          >
            <Plus size={18} aria-hidden="true" />
            Nova meta
          </button>
        }
      />

      {goals.length === 0 ? (
        <Card className="mt-2">
          <EmptyState
            emoji="🎯"
            title="Nenhuma meta por aqui"
            message={
              getMessage("estadoVazio", { state, nome: state.settings.userName }) ||
              "Sem metas, o dinheiro vai embora sem rumo. Bora criar um objetivo?"
            }
            actionLabel="Criar minha primeira meta"
            onAction={openCreate}
          />
        </Card>
      ) : (
        <ul className="mt-2 flex flex-col gap-3" aria-label="Lista de metas">
          {goals.map((goal) => {
            const target = goal.targetAmount || 0;
            const current = goal.currentAmount || 0;
            const pct = target > 0 ? clampPct((current / target) * 100) : 0;
            const completed = target > 0 && current >= target;
            const tone = completed ? "income" : "accent";

            return (
              <li key={goal.id}>
                <Card>
                  <div className="flex items-start gap-3">
                    <div
                      className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-surface-2 text-2xl"
                      aria-hidden="true"
                    >
                      {goal.icon || "🎯"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-bold tracking-tight text-ink">
                          {goal.name}
                        </h3>
                        {completed ? (
                          <span className="flex-shrink-0 rounded-full bg-income/15 px-2 py-0.5 text-[11px] font-bold text-income">
                            batida! 🎉
                          </span>
                        ) : null}
                      </div>
                      {goal.deadline ? (
                        <p className="mt-0.5 text-xs text-ink-dim">
                          Prazo: {formatDateBR(goal.deadline)}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-ink-dim">Sem prazo definido</p>
                      )}
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(goal)}
                        aria-label={`Editar meta ${goal.name}`}
                        className="grid h-10 w-10 place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-surface-2 transition-colors"
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => askDelete(goal)}
                        aria-label={`Excluir meta ${goal.name}`}
                        className="grid h-10 w-10 place-items-center rounded-full text-ink-dim hover:text-expense hover:bg-surface-2 transition-colors"
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProgressBar value={current} max={target} tone={tone} />
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-ink tabular-nums">
                        {formatBRL(current)}
                        <span className="font-normal text-ink-dim">
                          {" "}/ {formatBRL(target)}
                        </span>
                      </span>
                      <span
                        className={`text-sm font-extrabold tabular-nums ${
                          completed ? "text-income" : "text-accent"
                        }`}
                      >
                        {completed ? 100 : Math.min(99, Math.floor(pct))}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openMove(goal, "add")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 min-h-[44px] rounded-2xl px-3 py-2 text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
                    >
                      <PiggyBank size={18} aria-hidden="true" />
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => openMove(goal, "withdraw")}
                      disabled={current <= 0}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 min-h-[44px] rounded-2xl border border-line bg-surface-2 px-3 py-2 text-sm font-semibold text-ink hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowDownToLine size={18} aria-hidden="true" />
                      Resgatar
                    </button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* ---- Sheet: criar / editar meta ---- */}
      <Sheet
        open={formOpen}
        onClose={closeForm}
        title={editingId ? "Editar meta" : "Nova meta"}
        footer={
          <button
            type="button"
            onClick={handleSaveGoal}
            className="w-full min-h-[48px] rounded-2xl px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
          >
            {editingId ? "Salvar alterações" : "Criar meta"}
          </button>
        }
      >
        <div className="flex flex-col gap-4 py-1">
          <div>
            <label
              htmlFor="goal-name"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Nome da meta
            </label>
            <input
              id="goal-name"
              type="text"
              autoFocus
              value={fName}
              onChange={(e) => setFName(e.target.value)}
              placeholder="Ex: Viagem dos sonhos"
              maxLength={48}
              className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Escolha um emoji
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Emoji da meta">
              {ICON_OPTIONS.map((ic) => {
                const active = ic === fIcon;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFIcon(ic)}
                    aria-label={`Emoji ${ic}`}
                    aria-pressed={active}
                    className={`grid h-11 w-11 place-items-center rounded-2xl text-xl transition-colors ${
                      active
                        ? "bg-accent/20 ring-2 ring-accent"
                        : "bg-surface-2 border border-line hover:bg-surface"
                    }`}
                  >
                    {ic}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="goal-target"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Valor alvo
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-ink-dim">
                R$
              </span>
              <input
                id="goal-target"
                type="text"
                inputMode="decimal"
                value={fTarget}
                onChange={(e) => setFTarget(maskAmountInput(e.target.value))}
                placeholder="0,00"
                className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-12 pr-4 text-lg font-bold text-ink tabular-nums placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="goal-deadline"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Prazo <span className="font-normal text-ink-dim">(opcional)</span>
            </label>
            <input
              id="goal-deadline"
              type="date"
              value={fDeadline}
              min={editingId ? undefined : todayIso()}
              onChange={(e) => setFDeadline(e.target.value)}
              className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
            />
            {fDeadline ? (
              <button
                type="button"
                onClick={() => setFDeadline("")}
                className="mt-1.5 text-xs font-semibold text-ink-dim underline hover:text-ink"
              >
                Remover prazo
              </button>
            ) : null}
          </div>

          {formError ? (
            <p className="text-sm font-semibold text-expense" role="alert">
              {formError}
            </p>
          ) : null}
        </div>
      </Sheet>

      {/* ---- Sheet: guardar / resgatar ---- */}
      <Sheet
        open={moveOpen}
        onClose={closeMove}
        title={
          moveMode === "add"
            ? `Guardar em ${moveGoal?.name || "meta"}`
            : `Resgatar de ${moveGoal?.name || "meta"}`
        }
        footer={
          <button
            type="button"
            onClick={handleMoveConfirm}
            className={`w-full min-h-[48px] rounded-2xl px-4 py-3 text-base font-bold text-white shadow-soft hover:opacity-90 transition-opacity ${
              moveMode === "add"
                ? "bg-gradient-to-r from-accent to-accent-2"
                : "bg-expense"
            }`}
          >
            {moveMode === "add" ? "Guardar" : "Resgatar"}
          </button>
        }
      >
        <div className="flex flex-col gap-4 py-1">
          {moveGoal ? (
            <div className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink-dim">
              Guardado:{" "}
              <span className="font-bold text-ink tabular-nums">
                {formatBRL(moveGoal.currentAmount || 0)}
              </span>{" "}
              de{" "}
              <span className="font-bold text-ink tabular-nums">
                {formatBRL(moveGoal.targetAmount || 0)}
              </span>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="move-value"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              {moveMode === "add" ? "Quanto guardar?" : "Quanto resgatar?"}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-ink-dim">
                R$
              </span>
              <input
                id="move-value"
                type="text"
                inputMode="decimal"
                autoFocus
                value={moveValue}
                onChange={(e) => setMoveValue(maskAmountInput(e.target.value))}
                placeholder="0,00"
                className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-12 pr-4 text-2xl font-extrabold text-ink tabular-nums placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
              />
            </div>
          </div>

          {moveMode === "withdraw" && moveGoal && (moveGoal.currentAmount || 0) > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Chip
                onClick={() =>
                  setMoveValue(
                    maskAmountInput(
                      String(Math.round((moveGoal.currentAmount || 0) * 100))
                    )
                  )
                }
              >
                Resgatar tudo
              </Chip>
            </div>
          ) : null}

          {moveError ? (
            <p className="text-sm font-semibold text-expense" role="alert">
              {moveError}
            </p>
          ) : null}
        </div>
      </Sheet>

      {/* ---- Confirmação de exclusão ---- */}
      <ConfirmDialog
        open={confirmOpen}
        title="Apagar essa meta?"
        message={
          (deleteGoalRef
            ? `Você vai apagar "${deleteGoalRef.name}". `
            : "") +
          (getMessage("confirmarExclusao", {
            state,
            nome: state.settings.userName,
          }) || "Tem certeza? Não tem como desfazer.")
        }
        confirmLabel="Apagar mesmo"
        cancelLabel="Deixa pra lá"
        danger
        onConfirm={confirmDelete}
        onClose={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
      />

      {/* ---- Toast do Sr. Cofre ---- */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            key="goal-toast"
            role="status"
            aria-live="polite"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-[420px] rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-ink shadow-soft">
              <span className="mr-1" aria-hidden="true">
                🐷
              </span>
              {toast}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
