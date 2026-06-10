// Estado de instalação do PWA via "external store" (mesmo padrão de storage.js).
// Captura beforeinstallprompt (Android/desktop Chromium) e appinstalled, e expõe
// detecção de plataforma/standalone + promptInstall(). Os listeners são
// registrados na importação do módulo (por isso main.jsx o importa cedo).

let deferredPrompt = null; // evento beforeinstallprompt adiado
let installed = false; // virou standalone / appinstalled disparou
const subscribers = new Set();

let snapshot = { canPrompt: false, installed: false };

function emit() {
  // Novo objeto a cada mudança (referência só muda quando algo muda de fato).
  snapshot = { canPrompt: !!deferredPrompt, installed };
  for (const cb of subscribers) {
    try {
      cb();
    } catch {
      /* nunca deixa um subscriber quebrado derrubar os outros */
    }
  }
}

// ---- detecção ----
function ua() {
  return typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
}

export function isIOS() {
  if (typeof navigator === "undefined") return false;
  const iOSDevice = /iphone|ipad|ipod/i.test(ua());
  // iPadOS 13+ se apresenta como Mac; detecta pelo touch.
  const iPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

export function isAndroid() {
  return /android/i.test(ua());
}

export function isInStandalone() {
  if (typeof window === "undefined") return false;
  const mm =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  return Boolean(mm) || window.navigator.standalone === true;
}

// iOS dentro do Safari de verdade (não Chrome/in-app webview, que não têm
// "Adicionar à Tela de Início").
export function isSafariIOS() {
  if (!isIOS()) return false;
  const s = ua();
  // CriOS=Chrome, FxiOS=Firefox, EdgiOS=Edge, GSA=Google app; in-app: FBAN/FBAV/Instagram/Line.
  const naoSafari = /crios|fxios|edgios|gsa|fban|fbav|instagram|line\//i.test(s);
  return /safari/i.test(s) && !naoSafari;
}

// ---- listeners (registrados na importação) ----
if (typeof window !== "undefined") {
  if (isInStandalone()) installed = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // evita o mini-infobar; guardamos pra disparar depois
    deferredPrompt = e;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    emit();
  });

  // snapshot inicial coerente com a detecção acima
  snapshot = { canPrompt: !!deferredPrompt, installed };
}

// ---- API do store ----
export function subscribe(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function getSnapshot() {
  return snapshot;
}

export function getServerSnapshot() {
  return snapshot;
}

// Dispara o prompt nativo (Android/desktop). Retorna "accepted"/"dismissed"
// ou null se não havia prompt disponível. Uso único.
export async function promptInstall() {
  if (!deferredPrompt) return null;
  const evt = deferredPrompt;
  deferredPrompt = null;
  emit();
  try {
    evt.prompt();
    const choice = await evt.userChoice;
    return choice?.outcome ?? null;
  } catch {
    return null;
  }
}
