// InstallBanner — faixa dismissível no topo que convida a instalar o app.
// iOS → abre as instruções (Compartilhar→Adicionar à Tela de Início).
// Android (com beforeinstallprompt) → botão "Instalar" nativo.
// Some quando já instalado (standalone) ou após o usuário dispensar.

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, X } from "lucide-react";

import usePwaInstall from "../hooks/usePwaInstall.js";
import useStore from "../hooks/useStore.js";
import InstallInstructions from "./InstallInstructions.jsx";

export default function InstallBanner() {
  const reduce = useReducedMotion();
  const { state, updateSettings } = useStore();
  const { platform, isStandalone, canPrompt, promptInstall } = usePwaInstall();
  const [showSteps, setShowSteps] = useState(false);

  const dismissed = state.settings.installHintDismissed;
  // Mostra: não instalado, não dispensado e (iOS ou Android com prompt disponível).
  const show =
    !isStandalone && !dismissed && (platform === "ios" || canPrompt);

  function dismiss() {
    updateSettings({ installHintDismissed: true });
  }

  return (
    <>
      <AnimatePresence initial={false}>
        {show ? (
          <motion.div
            key="install-banner"
            className="px-4 pt-safe"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-accent/30 bg-surface-2/95 px-3 py-3 shadow-soft backdrop-blur">
              <span
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-accent/15 text-accent"
                aria-hidden="true"
              >
                <Download size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Instale o Tá Liso</p>
                <p className="text-xs leading-snug text-ink-dim">
                  {platform === "ios"
                    ? "No iPhone é rapidinho — eu te mostro o caminho. 🐷"
                    : "Acesso direto da tela inicial, sem abrir o navegador."}
                </p>
              </div>
              <button
                type="button"
                onClick={
                  platform === "ios"
                    ? () => setShowSteps(true)
                    : () => promptInstall()
                }
                className="flex-shrink-0 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-3 py-2 text-xs font-bold text-white shadow-soft hover:opacity-90 transition-opacity"
              >
                {platform === "ios" ? "Como instalar" : "Instalar"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dispensar"
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-surface transition-colors"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <InstallInstructions open={showSteps} onClose={() => setShowSteps(false)} />
    </>
  );
}
