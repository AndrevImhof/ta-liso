// CountUp — anima do valor anterior até `value`, formatando o número exibido.
// CountUp({value, duration=0.9, format=(n)=>n, className})
// Respeita prefers-reduced-motion (mostra direto o valor final).

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

function toNumber(n) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

export default function CountUp({
  value,
  duration = 0.9,
  format = (n) => n,
  className,
}) {
  const target = toNumber(value);
  const reduce = useReducedMotion();

  // Mantém o valor anterior para animar a partir dele.
  const fromRef = useRef(target);
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const from = fromRef.current;

    if (reduce || from === target || duration <= 0) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const controls = animate(from, target, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
      onComplete: () => setDisplay(target),
    });

    fromRef.current = target;
    return () => controls.stop();
  }, [target, duration, reduce]);

  return <span className={className}>{format(display)}</span>;
}
