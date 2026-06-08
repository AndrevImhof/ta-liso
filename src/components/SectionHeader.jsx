// SectionHeader — título de seção + ação opcional à direita.
// SectionHeader({title, action}).

export default function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );
}
