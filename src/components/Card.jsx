// Card — superfície básica para conteúdo agrupado.
// Card({children, className, ...rest}) -> div bg-surface rounded-3xl p-4 border border-line.

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function Card({ children, className, ...rest }) {
  return (
    <div
      className={cx(
        "bg-surface rounded-3xl p-4 border border-line shadow-soft",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
