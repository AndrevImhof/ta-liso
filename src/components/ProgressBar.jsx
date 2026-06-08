// ProgressBar — barra de progresso animada.
// ProgressBar({value, max, tone="accent", className, showOverflow=true})
// - tone: "accent" | "income" | "expense" | "warn"
// - se value>max e showOverflow, aplica estilo de transbordo (faixa de alerta).

import { motion, useReducedMotion } from "framer-motion";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function toNumber(n) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

const FILL_TONES = {
  accent: "bg-gradient-to-r from-accent to-accent-2",
  income: "bg-income",
  expense: "bg-expense",
  warn: "bg-warn",
};

export default function ProgressBar({
  value,
  max,
  tone = "accent",
  className,
  showOverflow = true,
}) {
  const reduce = useReducedMotion();

  const v = Math.max(0, toNumber(value));
  const m = toNumber(max);
  const ratio = m > 0 ? v / m : 0;
  const over = ratio > 1;

  // Largura visível limitada a 100%; o transbordo é sinalizado pela cor/estilo.
  const pct = Math.max(0, Math.min(100, ratio * 100));
  const widthPct = m <= 0 ? 0 : pct;

  const showOver = over && showOverflow;
  const fillClass = showOver ? "bg-expense" : FILL_TONES[tone] || FILL_TONES.accent;

  return (
    <div
      className={cx(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-surface-2",
        showOver && "ring-1 ring-expense/40",
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={m > 0 ? Math.round(m) : 100}
      aria-valuenow={Math.round(v)}
    >
      <motion.div
        className={cx("h-full rounded-full", fillClass)}
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${widthPct}%` }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 120, damping: 20 }
        }
      />
    </div>
  );
}
