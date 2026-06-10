// Gera os ícones PWA em /public a partir de SVG de formas vetoriais puras
// (sem emoji, sem texto) para renderizar igual em qualquer máquina.
// Estilo "Flat Fintech" — o mesmo do componente Mascote.jsx (corpo squircle,
// fenda de moeda roxa da marca, focinho elevado).
//
//   node scripts/gen-icons.mjs
//
// Saídas:
//   public/icon-192.png
//   public/icon-512.png
//   public/icon-maskable-512.png  (~22% de padding de segurança)
//   public/apple-touch-icon.png   (180x180)

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = resolve(__dirname, "..", "public");

// Sr. Cofre desenhado em espaço 120x120 (mesma geometria do Mascote.jsx,
// humor "feliz" com moedinha). Reaproveitado em todos os ícones via transform.
const PIGGY_120 = `
  <path d="M30 34 L34 20 L47 31 Z" fill="#F0578F"/>
  <path d="M90 34 L86 20 L73 31 Z" fill="#F0578F"/>
  <rect x="22" y="28" width="76" height="68" rx="28" fill="url(#bodyGrad)"/>
  <rect x="48" y="41" width="24" height="4.5" rx="2.25" fill="#7C5CFF"/>
  <rect x="49" y="66" width="22" height="12" rx="6" fill="#FF8FB3"/>
  <circle cx="55.5" cy="72" r="1.7" fill="#C9577E"/>
  <circle cx="64.5" cy="72" r="1.7" fill="#C9577E"/>
  <path d="M44 55 q4 -5 8 0" fill="none" stroke="#2A1722" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M68 55 q4 -5 8 0" fill="none" stroke="#2A1722" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M52 85 q8 6 16 0" fill="none" stroke="#2A1722" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="60" cy="30" r="5" fill="url(#coinGrad)" stroke="#C98A00" stroke-width="1.2"/>
`;

// `scale` (0..1) controla o tamanho do porquinho dentro do quadro,
// permitindo a margem de segurança da versão maskable.
function piggySvg(size, { rounded = true, scale = 1 } = {}) {
  const s = size;
  const r = Math.round(s * 0.22); // raio do fundo arredondado

  // Porquinho (120-space) escalado e centralizado no quadro.
  const ps = (s / 120) * scale;
  const tx = s / 2 - 60 * ps;
  const ty = s / 2 - 62 * ps;

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

  <g transform="translate(${tx} ${ty}) scale(${ps})">
    ${PIGGY_120}
  </g>
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

  // Maskable: fundo quadrado cheio + ~22% de padding de segurança no porquinho.
  await renderPng(piggySvg(512, { rounded: false, scale: 0.78 }), 512, resolve(PUBLIC_DIR, "icon-maskable-512.png"));

  console.log("Ícones gerados em", PUBLIC_DIR);
}

main().catch((err) => {
  console.error("Falha ao gerar ícones:", err);
  process.exit(1);
});
