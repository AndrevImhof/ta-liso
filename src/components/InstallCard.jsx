// InstallCard — seção "Instalar o app" usada na tela de Ajustes.
// Sempre acessível (mesmo após dispensar o banner). Mostra estado instalado,
// botão nativo (Android) ou instruções (iOS / fallback).

import { useState } from "react";
import { Smartphone, Download, CheckCircle2 } from "lucide-react";

import Card from "./Card.jsx";
import usePwaInstall from "../hooks/usePwaInstall.js";
import InstallInstructions from "./InstallInstructions.jsx";

export default function InstallCard() {
  const { platform, isStandalone, canPrompt, promptInstall } = usePwaInstall();
  const [showSteps, setShowSteps] = useState(false);

  return (
    <Card className="mt-3">
      <div className="mb-3 flex items-center gap-2">
        <Smartphone size={18} className="text-accent" aria-hidden="true" />
        <h3 className="text-base font-bold tracking-tight text-ink">
          Instalar o app
        </h3>
      </div>

      {isStandalone ? (
        <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink-dim">
          <CheckCircle2 size={16} className="text-income" aria-hidden="true" />
          App já instalado. Tamo junto! 🐷
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm leading-relaxed text-ink-dim">
            {platform === "ios"
              ? "Adicione o Tá Liso à tela de início do iPhone pra abrir igual app de verdade."
              : "Tenha o Tá Liso na tela inicial, sem precisar abrir o navegador."}
          </p>

          {platform !== "ios" && canPrompt ? (
            <button
              type="button"
              onClick={() => promptInstall()}
              className="flex w-full items-center justify-center gap-2 min-h-[48px] rounded-2xl px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
            >
              <Download size={18} aria-hidden="true" /> Instalar app
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSteps(true)}
              className="flex w-full items-center justify-center gap-2 min-h-[48px] rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-semibold text-ink hover:bg-surface transition-colors"
            >
              <Smartphone size={18} aria-hidden="true" />
              {platform === "ios" ? "Como instalar no iPhone" : "Como instalar"}
            </button>
          )}
        </>
      )}

      <InstallInstructions open={showSteps} onClose={() => setShowSteps(false)} />
    </Card>
  );
}
