// InstallInstructions — bottom-sheet com o passo a passo de instalação,
// adaptado por plataforma (iOS = Compartilhar→Adicionar à Tela de Início;
// Android = botão nativo ou menu do navegador).

import { Share, Plus, Download } from "lucide-react";
import Sheet from "./Sheet.jsx";
import usePwaInstall from "../hooks/usePwaInstall.js";

function Step({ n, children }) {
  return (
    <li className="flex gap-3">
      <span
        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-bold text-accent"
        aria-hidden="true"
      >
        {n}
      </span>
      <span className="pt-0.5 text-sm leading-relaxed text-ink">{children}</span>
    </li>
  );
}

function IosSteps({ isSafariIOS }) {
  return (
    <div className="pb-2">
      <p className="mb-4 text-sm leading-relaxed text-ink-dim">
        <span className="mr-1" aria-hidden="true">
          🐷
        </span>
        No iPhone o app não baixa sozinho (coisa da Apple) — mas instala em 3
        toques. Bora:
      </p>

      {!isSafariIOS ? (
        <p className="mb-4 rounded-2xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm leading-relaxed text-ink">
          ⚠️ Isso só funciona no <b>Safari</b>. Abra o{" "}
          <b>ta-liso.vercel.app</b> no Safari e volte aqui.
        </p>
      ) : null}

      <ol className="space-y-3">
        <Step n={1}>
          Toque no botão <b>Compartilhar</b>
          <Share
            size={16}
            className="mx-1 inline align-text-bottom text-accent"
            aria-label="ícone Compartilhar"
          />
          na barra do Safari.
        </Step>
        <Step n={2}>
          Role e toque em <b>“Adicionar à Tela de Início”</b>
          <Plus
            size={16}
            className="mx-1 inline align-text-bottom text-accent"
            aria-hidden="true"
          />
          .
        </Step>
        <Step n={3}>
          Toque em <b>“Adicionar”</b> no canto. Pronto — o Sr. Cofre já tá na sua
          tela. 🐷
        </Step>
      </ol>
    </div>
  );
}

function AndroidSteps({ canPrompt, promptInstall, onClose }) {
  return (
    <div className="pb-2">
      <p className="mb-4 text-sm leading-relaxed text-ink-dim">
        <span className="mr-1" aria-hidden="true">
          🐷
        </span>
        Bora botar o Tá Liso na sua tela inicial.
      </p>

      {canPrompt ? (
        <button
          type="button"
          onClick={async () => {
            await promptInstall();
            onClose?.();
          }}
          className="flex w-full items-center justify-center gap-2 min-h-[48px] rounded-2xl px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
        >
          <Download size={18} aria-hidden="true" /> Instalar app
        </button>
      ) : (
        <ol className="space-y-3">
          <Step n={1}>
            Toque no menu <b>⋮</b> do navegador (canto superior).
          </Step>
          <Step n={2}>
            Escolha <b>“Instalar app”</b> ou <b>“Adicionar à tela inicial”</b>.
          </Step>
          <Step n={3}>Confirme e pronto! 🐷</Step>
        </ol>
      )}
    </div>
  );
}

export default function InstallInstructions({ open, onClose }) {
  const { platform, isSafariIOS, canPrompt, promptInstall } = usePwaInstall();

  return (
    <Sheet open={open} onClose={onClose} title="Instalar o Tá Liso">
      {platform === "ios" ? (
        <IosSteps isSafariIOS={isSafariIOS} />
      ) : (
        <AndroidSteps
          canPrompt={canPrompt}
          promptInstall={promptInstall}
          onClose={onClose}
        />
      )}
    </Sheet>
  );
}
