import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Mascote — Sr. Cofre, o porquinho-cofre julgador (estilo "Flat Fintech").
 *
 * Props:
 *  - mood: "feliz" | "neutro" | "preocupado" | "chorando" | "morto"
 *  - size: número (px) — largura/altura do SVG (default 96)
 *  - animate: boolean — liga a animação de bounce/wiggle (default true)
 *  - className: string opcional aplicada ao wrapper
 *
 * Corpo squircle achatado com leve gradiente, orelhas geométricas, fenda de
 * moeda na cor de marca (roxo) e focinho com narinas. Muda de EXPRESSÃO e
 * empalidece até o cinza conforme o mood. Respeita prefers-reduced-motion.
 */

const MOODS = ["feliz", "neutro", "preocupado", "chorando", "morto"];

// Fenda de moeda sempre na cor de marca (roxo do accent), em qualquer humor.
const ACCENT = "#7C5CFF";

// Tonalidades por humor (empalidece até o cinza quando o bicho não vai bem).
const SKIN = {
  feliz: { body: "#FF9DBE", body2: "#FF6FA0", ear: "#F0578F", snout: "#FF8FB3", nostril: "#C9577E" },
  neutro: { body: "#FF9DBE", body2: "#FF6FA0", ear: "#F0578F", snout: "#FF8FB3", nostril: "#C9577E" },
  preocupado: { body: "#F2B6C7", body2: "#DE8FAA", ear: "#D98FA8", snout: "#EAA7BD", nostril: "#C97E99" },
  chorando: { body: "#E9B2C2", body2: "#D389A2", ear: "#CE8499", snout: "#E2A1B7", nostril: "#BE7791" },
  morto: { body: "#CBBFC6", body2: "#AEA0AA", ear: "#A89AA3", snout: "#C2B4BC", nostril: "#9A8B95" },
};

export default function Mascote({
  mood = "neutro",
  size = 96,
  animate = true,
  className = "",
}) {
  const reduce = useReducedMotion();
  const safeMood = MOODS.includes(mood) ? mood : "neutro";
  const skin = SKIN[safeMood];

  // Movimento idle por humor. Reduced-motion ou animate=false => parado.
  const idle = useMemo(() => {
    if (reduce || !animate) return undefined;
    switch (safeMood) {
      case "feliz":
        return {
          animate: { y: [0, -6, 0], rotate: [0, -2, 2, 0] },
          transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
        };
      case "neutro":
        return {
          animate: { y: [0, -3, 0] },
          transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
        };
      case "preocupado":
        return {
          animate: { x: [0, -1.5, 1.5, -1.5, 0], rotate: [0, -1, 1, 0] },
          transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
        };
      case "chorando":
        return {
          animate: { y: [0, 2, 0], rotate: [0, 1.5, -1.5, 0] },
          transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
        };
      case "morto":
        return {
          animate: { rotate: [-90, -89, -91, -90] },
          transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
        };
      default:
        return undefined;
    }
  }, [reduce, animate, safeMood]);

  const moodLabel = {
    feliz: "Sr. Cofre feliz",
    neutro: "Sr. Cofre neutro",
    preocupado: "Sr. Cofre preocupado",
    chorando: "Sr. Cofre chorando",
    morto: "Sr. Cofre desmaiado",
  }[safeMood];

  return (
    <motion.div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      animate={idle?.animate}
      transition={idle?.transition}
      role="img"
      aria-label={moodLabel}
    >
      <svg
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <linearGradient id="cofre-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skin.body} />
            <stop offset="100%" stopColor={skin.body2} />
          </linearGradient>
          <linearGradient id="cofre-coin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE08A" />
            <stop offset="100%" stopColor="#F4B400" />
          </linearGradient>
        </defs>

        {/* sombra no chão */}
        <ellipse cx="60" cy="104" rx="30" ry="5" fill="#000" opacity="0.18" />

        {/* orelhas geométricas */}
        <path d="M30 34 L34 20 L47 31 Z" fill={skin.ear} />
        <path d="M90 34 L86 20 L73 31 Z" fill={skin.ear} />

        {/* corpo squircle */}
        <rect x="22" y="28" width="76" height="68" rx="28" fill="url(#cofre-body)" />

        {/* fenda de moeda (cor de marca) */}
        <rect x="48" y="41" width="24" height="4.5" rx="2.25" fill={ACCENT} />

        {/* focinho (posicionado ligeiramente acima do centro-baixo) */}
        <rect x="49" y="66" width="22" height="12" rx="6" fill={skin.snout} />
        <circle cx="55.5" cy="72" r="1.7" fill={skin.nostril} />
        <circle cx="64.5" cy="72" r="1.7" fill={skin.nostril} />

        {/* EXPRESSÃO por humor */}
        <MoodFace mood={safeMood} animate={animate && !reduce} />
      </svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Rostos por humor: olhos, sobrancelhas, boca e adereços específicos. */
/* ------------------------------------------------------------------ */

function MoodFace({ mood, animate }) {
  const eyeFill = "#2A1722";

  if (mood === "feliz") {
    return (
      <g>
        {/* olhos sorridentes (arcos) */}
        <path d="M44 55 q4 -5 8 0" fill="none" stroke={eyeFill} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M68 55 q4 -5 8 0" fill="none" stroke={eyeFill} strokeWidth="2.4" strokeLinecap="round" />
        {/* bochechas coradas */}
        <circle cx="36" cy="68" r="4" fill="#FF6FA0" opacity="0.5" />
        <circle cx="84" cy="68" r="4" fill="#FF6FA0" opacity="0.5" />
        {/* sorrisão */}
        <path d="M52 85 q8 6 16 0" fill="none" stroke={eyeFill} strokeWidth="2.2" strokeLinecap="round" />
        {/* moedinha caindo na fenda */}
        <circle cx="60" cy="30" r="5" fill="url(#cofre-coin)" stroke="#C98A00" strokeWidth="1.2" />
      </g>
    );
  }

  if (mood === "neutro") {
    return (
      <g>
        {/* olhos redondos com brilho */}
        <circle cx="48" cy="54" r="3.2" fill={eyeFill} />
        <circle cx="72" cy="54" r="3.2" fill={eyeFill} />
        <circle cx="49" cy="53" r="1" fill="#fff" />
        <circle cx="73" cy="53" r="1" fill="#fff" />
        {/* boca levemente curva */}
        <path d="M53 86 q7 3 14 0" fill="none" stroke={eyeFill} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    );
  }

  if (mood === "preocupado") {
    return (
      <g>
        {/* sobrancelhas tensas */}
        <path d="M43 48 L53 51" stroke={eyeFill} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M77 48 L67 51" stroke={eyeFill} strokeWidth="2.4" strokeLinecap="round" />
        {/* olhos pequenos e atentos */}
        <circle cx="48" cy="57" r="2.6" fill={eyeFill} />
        <circle cx="72" cy="57" r="2.6" fill={eyeFill} />
        {/* gota de suor */}
        <path d="M85 50 q2.6 4 0 6 q-2.6 -2 0 -6 Z" fill="#7FD8FF" opacity="0.9" />
        {/* boca ondulada (incerteza) */}
        <path d="M52 87 q4 -3 8 0 q4 3 8 0" fill="none" stroke={eyeFill} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    );
  }

  if (mood === "chorando") {
    return (
      <g>
        {/* olhos apertados (arcos para baixo) */}
        <path d="M44 56 q4 4 8 0" fill="none" stroke={eyeFill} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M68 56 q4 4 8 0" fill="none" stroke={eyeFill} strokeWidth="2.4" strokeLinecap="round" />
        {/* sobrancelhas tristes */}
        <path d="M43 49 L52 47" stroke={eyeFill} strokeWidth="2" strokeLinecap="round" />
        <path d="M77 49 L68 47" stroke={eyeFill} strokeWidth="2" strokeLinecap="round" />
        {/* lágrimas (caem se animate) */}
        <motion.ellipse
          cx="46"
          cy="62"
          rx="2.4"
          ry="3.4"
          fill="#7FD8FF"
          animate={animate ? { cy: [62, 80], opacity: [0.95, 0], scaleY: [1, 1.3] } : undefined}
          transition={animate ? { duration: 1.3, repeat: Infinity, ease: "easeIn" } : undefined}
        />
        <motion.ellipse
          cx="74"
          cy="62"
          rx="2.4"
          ry="3.4"
          fill="#7FD8FF"
          animate={animate ? { cy: [62, 80], opacity: [0.95, 0], scaleY: [1, 1.3] } : undefined}
          transition={animate ? { duration: 1.3, repeat: Infinity, ease: "easeIn", delay: 0.45 } : undefined}
        />
        {/* boca chorosa (curva para baixo) */}
        <path d="M52 90 q8 -6 16 0" fill="none" stroke={eyeFill} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    );
  }

  // morto / desmaiado
  return (
    <g>
      {/* olhos X */}
      <path d="M44 50 L52 58 M52 50 L44 58" stroke={eyeFill} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M68 50 L76 58 M76 50 L68 58" stroke={eyeFill} strokeWidth="2.4" strokeLinecap="round" />
      {/* boca de O (sem reação) */}
      <ellipse cx="60" cy="88" rx="3" ry="4" fill="none" stroke={eyeFill} strokeWidth="2.2" />
      {/* alminha/fantasma subindo (se animate) */}
      <motion.g
        animate={animate ? { y: [-1, -10], opacity: [0.85, 0] } : undefined}
        transition={animate ? { duration: 2.4, repeat: Infinity, ease: "easeOut" } : undefined}
      >
        <circle cx="92" cy="30" r="2.6" fill="#CFE8FF" opacity="0.85" />
        <circle cx="96" cy="22" r="1.8" fill="#CFE8FF" opacity="0.7" />
      </motion.g>
    </g>
  );
}
