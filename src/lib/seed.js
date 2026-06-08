// Categorias padrão criadas no onboarding.
// 11 despesas + 4 receitas. Cada item: { id, name, emoji, color, type, budget:null }.
// As cores são strings hex usadas tanto na UI quanto nos gráficos (Recharts).

export const SEED_CATEGORIES = [
  // ===== Despesas =====
  { id: "alimentacao", name: "Alimentação", emoji: "🍔", color: "#FF8A5C", type: "expense", budget: null },
  { id: "mercado", name: "Mercado", emoji: "🛒", color: "#2BD98D", type: "expense", budget: null },
  { id: "transporte", name: "Transporte", emoji: "🚗", color: "#4DA6FF", type: "expense", budget: null },
  { id: "moradia", name: "Moradia", emoji: "🏠", color: "#A78BFA", type: "expense", budget: null },
  { id: "contas", name: "Contas", emoji: "🧾", color: "#FFD166", type: "expense", budget: null },
  { id: "lazer", name: "Lazer", emoji: "🎮", color: "#FF5C7C", type: "expense", budget: null },
  { id: "saude", name: "Saúde", emoji: "💊", color: "#36E0C8", type: "expense", budget: null },
  { id: "educacao", name: "Educação", emoji: "📚", color: "#7C5CFF", type: "expense", budget: null },
  { id: "assinaturas", name: "Assinaturas", emoji: "📺", color: "#F472B6", type: "expense", budget: null },
  { id: "roupas", name: "Roupas", emoji: "👕", color: "#FB923C", type: "expense", budget: null },
  { id: "outros", name: "Outros", emoji: "🤷", color: "#9A9AA8", type: "expense", budget: null },

  // ===== Receitas =====
  { id: "salario", name: "Salário", emoji: "💰", color: "#2BD98D", type: "income", budget: null },
  { id: "freela", name: "Freela", emoji: "🛠️", color: "#36E0C8", type: "income", budget: null },
  { id: "presente", name: "Presente", emoji: "🎁", color: "#A78BFA", type: "income", budget: null },
  { id: "outros_in", name: "Outros", emoji: "✨", color: "#FFD166", type: "income", budget: null },
];

// Retorna uma cópia profunda das categorias padrão (para não mutar o array fonte).
export function seedCategories() {
  return SEED_CATEGORIES.map((c) => ({ ...c }));
}
