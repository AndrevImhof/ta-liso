import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Mascote — Sr. Cofre, o porquinho-cofre julgador.
 *
 * Props:
 *  - mood: "feliz" | "neutro" | "preocupado" | "chorando" | "morto"
 *  - size: número (px) — largura/altura do SVG (default 96)
 *  - animate: boolean — liga a animação de bounce/wiggle (default true)
 *  - className: string opcional aplicada ao wrapper
 *
 * O SVG é desenhado inline (corpo rosa, orelha, focinho com narinas,
 * fenda de moeda, patas e olhos) e muda de EXPRESSÃO conforme o mood.
 * Respeita prefers-reduced-motion (Framer Motion useReducedMotion).
 */

const MOODS = ["feliz", "neutro", "preocupado", "chorando", "morto"];

// Tonalidades de rosa por humor (mais pálido quando o bicho não vai bem).
const SKIN = {
  feliz: { body: "#FFA9C9", shade: "#F582AD", ear: "#F06FA0", snout: "#FF93BD" },
  neutro: { body: "#FFA9C9", shade: "#F582AD", ear: "#F06FA0", snout: "#FF93BD" },
  preocupado: { body: "#F7A0BE", shade: "#E98AAA", ear: "#E07A9C", snout: "#F58FB1" },
  chorando: { body: "#EFA6BD", shade: "#DF8FA9", ear: "#D67E98", snout: "#EC96B0" },
  morto: { body: "#CDB7C2", shade: "#B89FAC", ear: "#A98E9C", snout: "#C4AEB9" },
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
        // pulinho alegre
        return {
          animate: { y: [0, -6, 0], rotate: [0, -2, 2, 0] },
          transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
        };
      case "neutro":
        // respiração leve
        return {
          animate: { y: [0, -3, 0] },
          transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
        };
      case "preocupado":
        // tremidinha nervosa
        return {
          animate: { x: [0, -1.5, 1.5, -1.5, 0], rotate: [0, -1, 1, 0] },
          transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
        };
      case "chorando":
        // soluço/balanço triste
        return {
          animate: { y: [0, 2, 0], rotate: [0, 1.5, -1.5, 0] },
          transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
        };
      case "morto":
        // tombado, quase imóvel
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
          <radialGradient id="cofre-body" cx="42%" cy="36%" r="72%">
            <stop offset="0%" stopColor={skin.body} />
            <stop offset="100%" stopColor={skin.shade} />
          </radialGradient>
        </defs>

        {/* sombra no chão */}
        <ellipse cx="60" cy="108" rx="34" ry="6" fill="#000" opacity="0.18" />

        {/* patas dianteiras */}
        <ellipse cx="44" cy="96" rx="9" ry="7" fill={skin.shade} />
        <ellipse cx="76" cy="96" rx="9" ry="7" fill={skin.shade} />

        {/* orelhas */}
        <path
          d="M40 30 L34 16 L52 26 Z"
          fill={skin.ear}
          transform="rotate(-8 43 24)"
        />
        <path
          d="M80 30 L86 16 L68 26 Z"
          fill={skin.ear}
          transform="rotate(8 77 24)"
        />

        {/* corpo / cabeça do porquinho-cofre */}
        <ellipse cx="60" cy="62" rx="40" ry="34" fill="url(#cofre-body)" />

        {/* fenda de moeda no topo */}
        <rect
          x="50"
          y="28"
          width="20"
          height="5"
          rx="2.5"
          fill={skin.shade}
          opacity="0.85"
        />

        {/* focinho */}
        <ellipse cx="60" cy="70" rx="17" ry="13" fill={skin.snout} />
        <ellipse cx="53" cy="70" rx="3.1" ry="4.2" fill="#7A4A5E" />
        <ellipse cx="67" cy="70" rx="3.1" ry="4.2" fill="#7A4A5E" />

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
  const eyeFill = "#241019";

  if (mood === "feliz") {
    return (
      <g>
        {/* olhos sorridentes (arcos) */}
        <path
          d="M40 48 q5 -7 10 0"
          fill="none"
          stroke={eyeFill}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M70 48 q5 -7 10 0"
          fill="none"
          stroke={eyeFill}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* bochechas coradas */}
        <circle cx="37" cy="60" r="5" fill="#FF6FA0" opacity="0.55" />
        <circle cx="83" cy="60" r="5" fill="#FF6FA0" opacity="0.55" />
        {/* sorrisão */}
        <path
          d="M48 82 q12 12 24 0"
          fill="none"
          stroke={eyeFill}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (mood === "neutro") {
    return (
      <g>
        {/* olhos redondos com brilho */}
        <circle cx="45" cy="50" r="5" fill={eyeFill} />
        <circle cx="75" cy="50" r="5" fill={eyeFill} />
        <circle cx="46.6" cy="48.4" r="1.5" fill="#fff" />
        <circle cx="76.6" cy="48.4" r="1.5" fill="#fff" />
        {/* boca reta/levemente curva */}
        <path
          d="M50 84 q10 4 20 0"
          fill="none"
          stroke={eyeFill}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (mood === "preocupado") {
    return (
      <g>
        {/* sobrancelhas inclinadas (tensão) */}
        <path
          d="M38 40 L52 45"
          stroke={eyeFill}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M82 40 L68 45"
          stroke={eyeFill}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* olhos pequenos e atentos */}
        <circle cx="45" cy="52" r="4.4" fill={eyeFill} />
        <circle cx="75" cy="52" r="4.4" fill={eyeFill} />
        {/* gota de suor */}
        <path
          d="M90 46 q4 6 0 9 q-4 -3 0 -9 Z"
          fill="#7FD8FF"
          opacity="0.9"
        />
        {/* boca ondulada (incerteza) */}
        <path
          d="M49 85 q5 -5 10 0 q5 5 10 0"
          fill="none"
          stroke={eyeFill}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (mood === "chorando") {
    return (
      <g>
        {/* olhos apertados (arcos para baixo) */}
        <path
          d="M40 52 q5 6 10 0"
          fill="none"
          stroke={eyeFill}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M70 52 q5 6 10 0"
          fill="none"
          stroke={eyeFill}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* sobrancelhas tristes */}
        <path
          d="M39 44 L51 41"
          stroke={eyeFill}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M81 44 L69 41"
          stroke={eyeFill}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* lágrimas (caem se animate) */}
        <motion.ellipse
          cx="44"
          cy="60"
          rx="3"
          ry="4.5"
          fill="#7FD8FF"
          animate={
            animate
              ? { cy: [60, 78], opacity: [0.95, 0], scaleY: [1, 1.3] }
              : undefined
          }
          transition={
            animate
              ? { duration: 1.3, repeat: Infinity, ease: "easeIn" }
              : undefined
          }
        />
        <motion.ellipse
          cx="76"
          cy="60"
          rx="3"
          ry="4.5"
          fill="#7FD8FF"
          animate={
            animate
              ? { cy: [60, 78], opacity: [0.95, 0], scaleY: [1, 1.3] }
              : undefined
          }
          transition={
            animate
              ? { duration: 1.3, repeat: Infinity, ease: "easeIn", delay: 0.45 }
              : undefined
          }
        />
        {/* boca chorosa (curva para baixo) */}
        <path
          d="M50 88 q10 -8 20 0"
          fill="none"
          stroke={eyeFill}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  }

  // morto / desmaiado
  return (
    <g>
      {/* olhos X */}
      <path
        d="M40 46 L50 54 M50 46 L40 54"
        stroke={eyeFill}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M70 46 L80 54 M80 46 L70 54"
        stroke={eyeFill}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* boca de O (sem reação) */}
      <ellipse
        cx="60"
        cy="85"
        rx="4.5"
        ry="5.5"
        fill="none"
        stroke={eyeFill}
        strokeWidth="2.8"
      />
      {/* alminha/fantasma subindo (se animate) */}
      <motion.g
        animate={
          animate ? { y: [-2, -12], opacity: [0.85, 0] } : undefined
        }
        transition={
          animate
            ? { duration: 2.4, repeat: Infinity, ease: "easeOut" }
            : undefined
        }
      >
        <circle cx="96" cy="34" r="3" fill="#CFE8FF" opacity="0.85" />
        <circle cx="100" cy="26" r="2.2" fill="#CFE8FF" opacity="0.7" />
      </motion.g>
    </g>
  );
}
