// MoneyText — exibe um valor monetário formatado em R$ com cor por sinal/tipo.
// MoneyText({value, type, signed=false, colored=true, className})
// - cor income (verde) se positivo ou type "income"; expense (coral) se negativo ou type "expense".
// - signed: prefixa "+"/"-" conforme o sinal/tipo.

import { formatBRL } from "../lib/format";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function toNumber(n) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

export default function MoneyText({
  value,
  type,
  signed = false,
  colored = true,
  className,
}) {
  const n = toNumber(value);

  // Determina a "direção" (positivo/negativo) considerando o type quando informado.
  let positive;
  if (type === "income") positive = true;
  else if (type === "expense") positive = false;
  else positive = n >= 0;

  const colorClass = colored
    ? positive
      ? "text-income"
      : "text-expense"
    : "";

  // Formata sempre o valor absoluto e adiciona o sinal manualmente se pedido.
  const abs = Math.abs(n);
  const formatted = formatBRL(abs);
  const prefix = signed ? (positive ? "+" : "−") : positive ? "" : "−";
  const text = `${prefix}${formatted}`;

  return (
    <span className={cx("tabular-nums", colorClass, className)}>{text}</span>
  );
}
