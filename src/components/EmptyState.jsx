// EmptyState — estado vazio amigável, com Sr. Cofre opcional.
// EmptyState({emoji, title, message, actionLabel, onAction, mascote=true})

import Mascote from "./Mascote";

export default function EmptyState({
  emoji,
  title,
  message,
  actionLabel,
  onAction,
  mascote = true,
}) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10">
      {mascote ? (
        <Mascote mood="neutro" size={96} className="mb-1" />
      ) : emoji ? (
        <div className="text-5xl mb-3" aria-hidden="true">
          {emoji}
        </div>
      ) : null}

      {title ? (
        <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
      ) : null}

      {message ? (
        <p className="mt-1.5 max-w-[34ch] text-sm leading-relaxed text-ink-dim">
          {message}
        </p>
      ) : null}

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 min-h-[44px] rounded-full px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
