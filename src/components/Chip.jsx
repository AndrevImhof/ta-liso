// Chip — pílula selecionável (filtros, categorias, opções).
// Chip({active, onClick, children, className}) rounded-full; ativo usa accent.

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function Chip({ active = false, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-full",
        "min-h-[44px] px-4 py-2 text-sm font-semibold leading-none",
        "border transition-colors select-none",
        active
          ? "bg-accent text-white border-accent shadow-soft"
          : "bg-surface-2 text-ink-dim border-line hover:text-ink active:bg-surface",
        className
      )}
    >
      {children}
    </button>
  );
}
