import { motion, useReducedMotion } from "framer-motion";
import { Home, BarChart3, Plus, Target, Settings } from "lucide-react";

const TABS = [
  { id: "inicio", label: "Início", Icon: Home },
  { id: "relatorios", label: "Relatórios", Icon: BarChart3 },
  { id: "metas", label: "Metas", Icon: Target },
  { id: "ajustes", label: "Ajustes", Icon: Settings },
];

function NavItem({ id, label, Icon, active, onChange, reduced }) {
  return (
    <button
      type="button"
      onClick={() => onChange(id)}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={
        "relative flex h-full min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 px-1 pt-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface " +
        (active ? "text-accent" : "text-ink-dim hover:text-ink")
      }
    >
      <motion.span
        className="flex items-center justify-center"
        animate={reduced ? undefined : { scale: active ? 1.1 : 1, y: active ? -1 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
      >
        <Icon size={22} strokeWidth={active ? 2.6 : 2} aria-hidden="true" />
      </motion.span>
      <span className="text-[11px] font-semibold leading-none tracking-tight">
        {label}
      </span>
      {active ? (
        <motion.span
          layoutId={reduced ? undefined : "bottomnav-dot"}
          className="absolute bottom-1 h-1 w-1 rounded-full bg-accent"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

export default function BottomNav({ active, onChange, onAdd }) {
  const reduced = useReducedMotion();
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <nav
      aria-label="Navegação principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
    >
      <div className="pointer-events-auto relative w-full max-w-[460px] px-3 pb-safe">
        <div className="relative mx-auto mb-2 flex h-16 items-stretch rounded-3xl border border-line bg-surface/95 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-surface/80">
          <div className="flex flex-1 items-stretch">
            {left.map((t) => (
              <NavItem
                key={t.id}
                id={t.id}
                label={t.label}
                Icon={t.Icon}
                active={active === t.id}
                onChange={onChange}
                reduced={reduced}
              />
            ))}
          </div>

          {/* Espaço reservado para o FAB central */}
          <div className="w-16 shrink-0" aria-hidden="true" />

          <div className="flex flex-1 items-stretch">
            {right.map((t) => (
              <NavItem
                key={t.id}
                id={t.id}
                label={t.label}
                Icon={t.Icon}
                active={active === t.id}
                onChange={onChange}
                reduced={reduced}
              />
            ))}
          </div>

          {/* FAB central elevado */}
          <motion.button
            type="button"
            onClick={onAdd}
            aria-label="Adicionar transação"
            whileTap={reduced ? undefined : { scale: 0.9 }}
            whileHover={reduced ? undefined : { scale: 1.05 }}
            transition={{ type: "spring", stiffness: 480, damping: 24 }}
            className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-white shadow-fab outline-none ring-4 ring-bg focus-visible:ring-4 focus-visible:ring-accent"
          >
            <Plus size={30} strokeWidth={2.8} aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
