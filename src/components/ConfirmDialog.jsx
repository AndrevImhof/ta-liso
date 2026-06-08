// ConfirmDialog — diálogo de confirmação centralizado.
// ConfirmDialog({open, title, message, confirmLabel="Confirmar",
//   cancelLabel="Cancelar", danger=false, onConfirm, onClose})
// AnimatePresence + respeita prefers-reduced-motion.

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onClose,
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const panelMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, scale: 0.92, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
        transition: { type: "spring", stiffness: 320, damping: 26 },
      };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title || "Confirmação"}
            className="relative w-full max-w-[400px] rounded-3xl bg-surface border border-line shadow-soft p-5"
            {...panelMotion}
          >
            {title ? (
              <h2 className="text-lg font-bold tracking-tight text-ink">
                {title}
              </h2>
            ) : null}

            {message ? (
              <p className="mt-2 text-sm leading-relaxed text-ink-dim whitespace-pre-line">
                {message}
              </p>
            ) : null}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[44px] rounded-2xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={cx(
                  "flex-1 min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-soft",
                  danger
                    ? "bg-expense"
                    : "bg-gradient-to-r from-accent to-accent-2"
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
