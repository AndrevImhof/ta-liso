// Sheet — bottom-sheet que sobe com spring + backdrop clicável para fechar.
// Sheet({open, onClose, title, children, footer})
// AnimatePresence + respeita prefers-reduced-motion.

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

export default function Sheet({ open, onClose, title, children, footer }) {
  const reduce = useReducedMotion();
  const panelRef = useRef(null);

  // Fecha com Esc e trava o scroll do body enquanto aberto.
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // A11y de modal: move o foco para o painel ao abrir e restaura ao fechar.
  useEffect(() => {
    if (!open) return undefined;

    const prevFocus = document.activeElement;
    panelRef.current?.focus?.();

    return () => {
      prevFocus?.focus?.();
    };
  }, [open]);

  const panelMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", stiffness: 320, damping: 34 },
      };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
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

          {/* Painel */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Painel"}
            className="relative w-full max-w-[460px] max-h-[92dvh] flex flex-col rounded-t-4xl bg-surface border-t border-x border-line shadow-soft pb-safe"
            {...panelMotion}
          >
            {/* Alça */}
            <div className="flex justify-center pt-3" aria-hidden="true">
              <div className="h-1.5 w-10 rounded-full bg-line" />
            </div>

            {(title || onClose) && (
              <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
                <h2 className="text-lg font-bold tracking-tight text-ink">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar painel"
                  className="grid h-10 w-10 place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-surface-2 transition-colors"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Conteúdo rolável */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-2">
              {children}
            </div>

            {footer ? (
              <div className="px-5 pt-3 pb-4 border-t border-line bg-surface">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
