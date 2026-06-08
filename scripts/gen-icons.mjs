// Gera os ícones PWA em /public a partir de SVG de formas vetoriais puras
// (sem emoji, sem texto) para renderizar igual em qualquer máquina.
//
//   node scripts/gen-icons.mjs
//
// Saídas:
//   public/icon-192.png
//   public/icon-512.png
//   public/icon-maskable-512.png  (~20% de padding de segurança)
//   public/apple-touch-icon.png   (180x180)

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = resolve(__dirname, "..", "public");

// Desenha o Sr. Cofre (porquinho-cofre) numa viewBox 0..size.
// `scale` (0..1) controla o tamanho do porquinho dentro do quadro,
// permitindo a margem de segurança da versão maskable.
function piggySvg(size, { rounded = true, scale = 1 } = {}) {
  const s = size;
  const r = Math.round(s * 0.22); // raio do fundo arredondado
  const cx = s / 2;
  const cy = s / 2;

  // Dimensões do corpo proporcionais ao quadro e ao scale.
  const bodyRx = s * 0.30 * scale;
  const bodyRy = s * 0.225 * scale;
  const bodyCy = cy + s * 0.02;

  const snoutRx = s * 0.11 * scale;
  const snoutRy = s * 0.085 * scale;
  const snoutCx = cx + bodyRx * 0.72;
  const snoutCy = bodyCy + s * 0.01;

  const nostrilR = s * 0.018 * scale;

  const earW = s * 0.12 * scale;
  const earH = s * 0.14 * scale;
  const earCx = cx + bodyRx * 0.30;
  const earTopY = bodyCy - bodyRy * 0.95;

  const eyeR = s * 0.026 * scale;
  const eyeCx = cx + bodyRx * 0.36;
  const eyeCy = bodyCy - bodyRy * 0.20;

  // Fenda de moeda no topo do corpo.
  const slotW = s * 0.16 * scale;
  const slotH = s * 0.028 * scale;
  const slotX = cx - slotW / 2 - bodyRx * 0.10;
  const slotY = bodyCy - bodyRy * 0.78;
  const slotR = slotH / 2;

  // Perninhas.
  const legW = s * 0.055 * scale;
  const legH = s * 0.07 * scale;
  const legY = bodyCy + bodyRy * 0.72;
  const legGap = bodyRx * 0.55;

  // Moeda/brilho (coin) acima da fenda.
  const coinR = s * 0.075 * scale;
  const coinCx = cx - bodyRx * 0.28;
  const coinCy = bodyCy - bodyRy * 1.15;

  const bgRectAttrs = rounded
    ? `x="0" y="0" width="${s}" height="${s}" rx="${r}" ry="${r}"`
    : `x="0" y="0" width="${s}" height="${s}"`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1A1430"/>
      <stop offset="0.55" stop-color="#0F0C1C"/>
      <stop offset="1" stop-color="#0C0C11"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.65">
      <stop offset="0" stop-color="#7C5CFF" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#7C5CFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FF9DBE"/>
      <stop offset="1" stop-color="#FF6FA0"/>
    </linearGradient>
    <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE08A"/>
      <stop offset="1" stop-color="#F4B400"/>
    </linearGradient>
  </defs>

  <rect ${bgRectAttrs} fill="url(#bgGrad)"/>
  <rect ${bgRectAttrs} fill="url(#glow)"/>

  <!-- moeda / brilho -->
  <circle cx="${coinCx}" cy="${coinCy}" r="${coinR}" fill="url(#coinGrad)" stroke="#C98A00" stroke-width="${s * 0.006}"/>
  <circle cx="${coinCx}" cy="${coinCy}" r="${coinR * 0.55}" fill="none" stroke="#C98A00" stroke-width="${s * 0.006}" opacity="0.8"/>
  <rect x="${coinCx - s * 0.012}" y="${coinCy - coinR * 0.45}" width="${s * 0.024}" height="${coinR * 0.9}" rx="${s * 0.01}" fill="#C98A00" opacity="0.85"/>

  <!-- orelha -->
  <path d="M ${earCx - earW / 2} ${earTopY + earH}
           Q ${earCx - earW * 0.1} ${earTopY - earH * 0.2} ${earCx + earW / 2} ${earTopY + earH}
           Z"
        fill="#FF6FA0"/>

  <!-- perninhas -->
  <rect x="${cx - legGap - legW / 2}" y="${legY}" width="${legW}" height="${legH}" rx="${legW / 2}" fill="#F0578F"/>
  <rect x="${cx + legGap - legW / 2}" y="${legY}" width="${legW}" height="${legH}" rx="${legW / 2}" fill="#F0578F"/>

  <!-- corpo -->
  <ellipse cx="${cx}" cy="${bodyCy}" rx="${bodyRx}" ry="${bodyRy}" fill="url(#bodyGrad)"/>

  <!-- fenda de moeda -->
  <rect x="${slotX}" y="${slotY}" width="${slotW}" height="${slotH}" rx="${slotR}" fill="#B83A6B"/>

  <!-- focinho -->
  <ellipse cx="${snoutCx}" cy="${snoutCy}" rx="${snoutRx}" ry="${snoutRy}" fill="#FF8FB3"/>
  <circle cx="${snoutCx - snoutRx * 0.4}" cy="${snoutCy}" r="${nostrilR}" fill="#B83A6B"/>
  <circle cx="${snoutCx + snoutRx * 0.4}" cy="${snoutCy}" r="${nostrilR}" fill="#B83A6B"/>

  <!-- olho -->
  <circle cx="${eyeCx}" cy="${eyeCy}" r="${eyeR}" fill="#2A1722"/>
  <circle cx="${eyeCx + eyeR * 0.35}" cy="${eyeCy - eyeR * 0.35}" r="${eyeR * 0.35}" fill="#FFFFFF"/>
</svg>`.trim();
}

async function renderPng(svg, size, outPath) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log("gerado:", outPath);
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });

  // Ícones "any" (porquinho cheio, fundo arredondado).
  await renderPng(piggySvg(192, { rounded: true, scale: 1 }), 192, resolve(PUBLIC_DIR, "icon-192.png"));
  await renderPng(piggySvg(512, { rounded: true, scale: 1 }), 512, resolve(PUBLIC_DIR, "icon-512.png"));

  // Apple touch icon (180), fundo arredondado.
  await renderPng(piggySvg(180, { rounded: true, scale: 1 }), 180, resolve(PUBLIC_DIR, "apple-touch-icon.png"));

  // Maskable: fundo quadrado cheio + ~20% de padding de segurança no porquinho.
  await renderPng(piggySvg(512, { rounded: false, scale: 0.78 }), 512, resolve(PUBLIC_DIR, "icon-maskable-512.png"));

  console.log("Ícones gerados em", PUBLIC_DIR);
}

main().catch((err) => {
  console.error("Falha ao gerar ícones:", err);
  process.exit(1);
});
