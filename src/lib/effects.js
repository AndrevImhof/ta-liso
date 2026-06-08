// Animações com canvas-confetti. Cada função checa prefers-reduced-motion
// e NÃO faz nada se o usuário pediu menos movimento.

import confetti from "canvas-confetti";

function reducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// Cache de "shapes" de texto (moedas/notas) para reuso.
let coinShape = null;
let moneyShape = null;

function getCoinShape() {
  if (coinShape) return coinShape;
  if (typeof confetti.shapeFromText !== "function") return null;
  try {
    coinShape = confetti.shapeFromText({ text: "🪙", scalar: 2 });
  } catch {
    coinShape = null;
  }
  return coinShape;
}

function getMoneyShape() {
  if (moneyShape) return moneyShape;
  if (typeof confetti.shapeFromText !== "function") return null;
  try {
    moneyShape = confetti.shapeFromText({ text: "💸", scalar: 2.2 });
  } catch {
    moneyShape = null;
  }
  return moneyShape;
}

// Moedas caindo do topo. intensity proporcional (baixa = poucas moedas tristes).
export function rainCoins(intensity = 1) {
  if (reducedMotion()) return;

  const i = Math.max(0.1, Math.min(3, Number(intensity) || 1));
  const shape = getCoinShape();
  const shapes = shape ? [shape] : undefined;
  const particleCount = Math.round(8 + i * 14); // ~10 (triste) até ~50

  const duration = 1100 + i * 300;
  const end = Date.now() + duration;

  const tick = () => {
    confetti({
      particleCount: Math.max(2, Math.round(particleCount / 6)),
      startVelocity: 0,
      ticks: 200,
      gravity: 0.7,
      spread: 80,
      scalar: 1.4,
      origin: { x: Math.random(), y: -0.1 },
      angle: 270,
      shapes,
      colors: shapes ? undefined : ["#FFD166", "#F4B400", "#FFE08A"],
      disableForReducedMotion: true,
    });
    if (Date.now() < end) {
      requestAnimationFrame(tick);
    }
  };
  tick();
}

// Notas voando para fora da tela (despesa).
export function flyMoney() {
  if (reducedMotion()) return;

  const shape = getMoneyShape();
  const shapes = shape ? [shape] : undefined;

  confetti({
    particleCount: 14,
    startVelocity: 45,
    spread: 60,
    ticks: 120,
    gravity: 0.6,
    scalar: 1.6,
    angle: 60,
    origin: { x: 0.2, y: 0.7 },
    shapes,
    colors: shapes ? undefined : ["#2BD98D", "#34D399", "#A7F3D0"],
    disableForReducedMotion: true,
  });
  confetti({
    particleCount: 14,
    startVelocity: 45,
    spread: 60,
    ticks: 120,
    gravity: 0.6,
    scalar: 1.6,
    angle: 120,
    origin: { x: 0.8, y: 0.7 },
    shapes,
    colors: shapes ? undefined : ["#2BD98D", "#34D399", "#A7F3D0"],
    disableForReducedMotion: true,
  });
}

// Confete de comemoração (meta batida).
export function celebrate() {
  if (reducedMotion()) return;

  const colors = ["#7C5CFF", "#A78BFA", "#2BD98D", "#FFD166", "#FF5C7C"];
  const duration = 1400;
  const end = Date.now() + duration;

  // Estouro central inicial
  confetti({
    particleCount: 80,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
