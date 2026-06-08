// Formatação de dinheiro (R$) e datas em pt-BR. Funções puras.

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MESES_LONGOS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function toNumber(n) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

// formatBRL(1234.5) -> "R$ 1.234,50"
export function formatBRL(n) {
  return brlFormatter.format(toNumber(n));
}

// Versão compacta para eixos de gráfico: "R$ 1,2 mil", "R$ 3,4 mi".
export function formatBRLShort(n) {
  const v = toNumber(n);
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    return `${sign}R$ ${trimDecimal(abs / 1_000_000)} mi`;
  }
  if (abs >= 1_000) {
    return `${sign}R$ ${trimDecimal(abs / 1_000)} mil`;
  }
  return `${sign}R$ ${Math.round(abs)}`;
}

function trimDecimal(value) {
  // 1 casa decimal, vírgula pt-BR, sem ",0" desnecessário.
  const rounded = Math.round(value * 10) / 10;
  const str = rounded.toFixed(1).replace(".", ",");
  return str.endsWith(",0") ? str.slice(0, -2) : str;
}

// Converte texto digitado em Number.
// Aceita "1.234,56" (pt-BR) e "1234.56" (en). Ignora "R$", espaços e letras.
export function parseAmount(str) {
  if (typeof str === "number") return Number.isFinite(str) ? str : 0;
  if (str == null) return 0;

  let s = String(str).trim();
  if (!s) return 0;

  // Mantém apenas dígitos, vírgula, ponto e sinal de menos.
  s = s.replace(/[^\d.,-]/g, "");
  if (!s) return 0;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    // O último separador é o decimal.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      // pt-BR: ponto é milhar, vírgula é decimal
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // en: vírgula é milhar, ponto é decimal
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    // só vírgula -> decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    // só ponto (ou nenhum): assume decimal padrão
    // (não removemos o ponto pois pode ser "1234.56")
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// Formata progressivamente enquanto digita.
// Mantém apenas dígitos e devolve "1.234,56" usando os 2 últimos dígitos como centavos.
export function maskAmountInput(str) {
  if (str == null) return "";
  const digits = String(str).replace(/\D/g, "");
  if (!digits) return "";

  const cents = digits.padStart(3, "0");
  const intPart = cents.slice(0, -2).replace(/^0+(?=\d)/, "");
  const decPart = cents.slice(-2);
  const intGrouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${intGrouped},${decPart}`;
}

function parseIso(iso) {
  // Interpreta "YYYY-MM-DD" como data local (evita shift de fuso).
  if (iso instanceof Date) return iso;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

// formatDateBR("2025-06-05") -> "05/06/2025"
export function formatDateBR(iso) {
  const d = parseIso(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// dayLabel -> "Hoje" / "Ontem" / "qua, 04 jun"
export function dayLabel(iso) {
  const d = parseIso(iso);
  const today = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round((startOf(today) - startOf(d)) / 86400000);

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";

  const dia = DIAS_CURTOS[d.getDay()];
  const num = String(d.getDate()).padStart(2, "0");
  const mes = MESES_CURTOS[d.getMonth()];
  return `${dia}, ${num} ${mes}`;
}

// monthLabel(2025, 5) -> "junho de 2025" (mês 0-11), capitalizado.
export function monthLabel(year, month) {
  const nome = MESES_LONGOS[month] || "";
  const cap = nome.charAt(0).toUpperCase() + nome.slice(1);
  return `${cap} de ${year}`;
}

// monthShort(5) -> "jun" (mês 0-11)
export function monthShort(month) {
  return MESES_CURTOS[month] || "";
}
