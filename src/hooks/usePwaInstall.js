// Hook sobre o external store de instalação (src/lib/pwaInstall.js), no mesmo
// estilo do useStore. Retorna plataforma, estado standalone e ações.

import { useSyncExternalStore } from "react";
import * as pwa from "../lib/pwaInstall.js";

export default function usePwaInstall() {
  const snap = useSyncExternalStore(
    pwa.subscribe,
    pwa.getSnapshot,
    pwa.getServerSnapshot
  );

  const platform = pwa.isIOS()
    ? "ios"
    : pwa.isAndroid()
    ? "android"
    : "other";

  return {
    platform, // "ios" | "android" | "other"
    isIOS: pwa.isIOS(),
    isSafariIOS: pwa.isSafariIOS(),
    isStandalone: pwa.isInStandalone() || snap.installed,
    canPrompt: snap.canPrompt, // Android/desktop com beforeinstallprompt capturado
    promptInstall: pwa.promptInstall,
  };
}
