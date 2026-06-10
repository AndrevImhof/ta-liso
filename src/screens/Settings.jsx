// Settings — central de ajustes do "Tá Liso".
// Editar nome e renda; nível de sarcasmo (muda na hora); tema escuro/claro;
// CRUD de categorias (com budget mensal); CRUD de recorrências (contas fixas);
// exportar/importar JSON; apagar tudo (confirmação DUPLA bem sarcástica).
// Rodapé com versão.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  User,
  Sparkles,
  Moon,
  Sun,
  Tag,
  Repeat,
  Database,
  Download,
  Upload,
  Trash2,
  Pencil,
  Plus,
  Power,
} from "lucide-react";

import useStore from "../hooks/useStore";
import { formatBRL, parseAmount, maskAmountInput } from "../lib/format";
import { getMessage } from "../lib/sarcasm";

import Card from "../components/Card";
import SectionHeader from "../components/SectionHeader";
import Chip from "../components/Chip";
import Sheet from "../components/Sheet";
import ConfirmDialog from "../components/ConfirmDialog";
import InstallCard from "../components/InstallCard.jsx";

const APP_VERSION = "1.0.0";

const SARCASM_OPTIONS = [
  { id: "leve", label: "Leve", emoji: "😊", trigger: "saldoMedio" },
  { id: "medio", label: "Médio", emoji: "😏", trigger: "saldoMedio" },
  { id: "brutal", label: "Brutal", emoji: "💀", trigger: "saldoMedio" },
];

// Emojis sugeridos ao criar/editar uma categoria.
const EMOJI_OPTIONS = [
  "🏷️", "🍔", "🛒", "🚗", "🏠", "🧾", "🎮", "💊", "📚", "📺",
  "👕", "🤷", "💰", "🛠️", "🎁", "✨", "☕", "🍻", "✈️", "🐶",
  "💅", "🎵", "🏋️", "🎂",
];

// Paleta de cores para categorias (hex usados na UI e nos gráficos).
const COLOR_OPTIONS = [
  "#7C5CFF", "#A78BFA", "#4DA6FF", "#36E0C8", "#2BD98D",
  "#FFD166", "#FB923C", "#FF8A5C", "#FF5C7C", "#F472B6",
  "#9A9AA8",
];

const DEFAULT_NEW_COLOR = "#9A9AA8";
const DEFAULT_NEW_EMOJI = "🏷️";

function todayDownloadName() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `ta-liso-backup-${yyyy}-${mm}-${dd}.json`;
}

// Converte um número (R$) para a string mascarada "1.234,56" usada nos inputs.
function amountToMask(value) {
  if (!value || !Number.isFinite(value)) return "";
  return maskAmountInput(String(Math.round(value * 100)));
}

export default function Settings() {
  const store = useStore();
  const {
    state,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    importData,
    exportData,
    resetAll,
  } = store;

  const { settings } = state;
  const categories = state.categories || [];
  const recurring = state.recurring || [];
  const reduce = useReducedMotion();

  // ---- Toast com a frase do Sr. Cofre ----
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  function showToast(msg) {
    if (!msg) return;
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4200);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ============================================================
  // Perfil: nome + renda mensal
  // ============================================================
  const [name, setName] = useState(settings.userName || "");
  const [income, setIncome] = useState(amountToMask(settings.monthlyIncome));

  // Mantém os campos sincronizados se o estado mudar por fora (ex: importação).
  useEffect(() => {
    setName(settings.userName || "");
  }, [settings.userName]);

  useEffect(() => {
    setIncome(amountToMask(settings.monthlyIncome));
  }, [settings.monthlyIncome]);

  function saveProfile() {
    const novoNome = name.trim();
    const novaRenda = parseAmount(income);
    updateSettings({ userName: novoNome, monthlyIncome: novaRenda });
    showToast(
      novoNome
        ? `Anotado, ${novoNome}. Agora não tem desculpa pra eu errar seu nome.`
        : "Perfil salvo. Continua no anonimato, né? Tudo bem, misterioso."
    );
  }

  const profileDirty =
    name.trim() !== (settings.userName || "") ||
    parseAmount(income) !== (settings.monthlyIncome || 0);

  // ============================================================
  // Nível de sarcasmo (muda na hora)
  // ============================================================
  function setSarcasm(level) {
    if (level === settings.sarcasmLevel) return;
    updateSettings({ sarcasmLevel: level });
    showToast(
      getMessage("saudacao", { state, level, nome: settings.userName }) ||
        "Nível de sarcasmo atualizado. Você que pediu."
    );
  }

  // ============================================================
  // Tema escuro / claro (aplica na hora via updateSettings; App reage)
  // ============================================================
  function setTheme(theme) {
    if (theme === settings.theme) return;
    updateSettings({ theme });
  }

  // ============================================================
  // CRUD de categorias
  // ============================================================
  const [catOpen, setCatOpen] = useState(false);
  const [catEditingId, setCatEditingId] = useState(null);
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState(DEFAULT_NEW_EMOJI);
  const [catColor, setCatColor] = useState(DEFAULT_NEW_COLOR);
  const [catType, setCatType] = useState("expense");
  const [catBudget, setCatBudget] = useState("");
  const [catError, setCatError] = useState("");

  function openNewCategory() {
    setCatEditingId(null);
    setCatName("");
    setCatEmoji(DEFAULT_NEW_EMOJI);
    setCatColor(DEFAULT_NEW_COLOR);
    setCatType("expense");
    setCatBudget("");
    setCatError("");
    setCatOpen(true);
  }

  function openEditCategory(cat) {
    setCatEditingId(cat.id);
    setCatName(cat.name || "");
    setCatEmoji(cat.emoji || DEFAULT_NEW_EMOJI);
    setCatColor(cat.color || DEFAULT_NEW_COLOR);
    setCatType(cat.type === "income" ? "income" : "expense");
    setCatBudget(amountToMask(cat.budget));
    setCatError("");
    setCatOpen(true);
  }

  function saveCategory() {
    const nome = catName.trim();
    if (!nome) {
      setCatError("Dá um nome pra categoria. Anônima até dinheiro fica perdido.");
      return;
    }
    const budgetVal = parseAmount(catBudget);
    const budget = budgetVal > 0 ? budgetVal : null;

    if (catEditingId) {
      updateCategory(catEditingId, {
        name: nome,
        emoji: catEmoji || DEFAULT_NEW_EMOJI,
        color: catColor || DEFAULT_NEW_COLOR,
        budget,
      });
      showToast("Categoria atualizada. Caprichou na organização, hein.");
    } else {
      addCategory({
        name: nome,
        emoji: catEmoji || DEFAULT_NEW_EMOJI,
        color: catColor || DEFAULT_NEW_COLOR,
        type: catType,
        budget,
      });
      showToast(
        catType === "income"
          ? "Nova categoria de entrada criada. Otimista, eu gosto."
          : "Nova categoria de gasto. Mais um lugar pro dinheiro sumir."
      );
    }
    setCatOpen(false);
  }

  // Exclusão de categoria.
  const [catDeleteId, setCatDeleteId] = useState(null);
  const catToDelete = useMemo(
    () => categories.find((c) => c.id === catDeleteId) || null,
    [categories, catDeleteId]
  );
  // Conta quantas transações usam a categoria (alerta antes de excluir).
  const catUsageCount = useMemo(() => {
    if (!catDeleteId) return 0;
    return (state.transactions || []).filter(
      (t) => t.categoryId === catDeleteId
    ).length;
  }, [state.transactions, catDeleteId]);

  function confirmDeleteCategory() {
    if (catDeleteId) {
      deleteCategory(catDeleteId);
      showToast("Categoria apagada. Os gastos dela viraram órfãos, mas tudo bem.");
    }
    setCatDeleteId(null);
  }

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

  // ============================================================
  // CRUD de recorrências (contas fixas)
  // ============================================================
  const [recOpen, setRecOpen] = useState(false);
  const [recEditingId, setRecEditingId] = useState(null);
  const [recType, setRecType] = useState("expense");
  const [recAmount, setRecAmount] = useState("");
  const [recCategoryId, setRecCategoryId] = useState("");
  const [recDescription, setRecDescription] = useState("");
  const [recDay, setRecDay] = useState("5");
  const [recActive, setRecActive] = useState(true);
  const [recError, setRecError] = useState("");

  // Categorias disponíveis para o tipo selecionado no form de recorrência.
  const recCategoryOptions = useMemo(
    () => categories.filter((c) => c.type === recType),
    [categories, recType]
  );

  // Se o tipo mudar e a categoria atual não pertencer mais a ele, reseta.
  useEffect(() => {
    if (!recOpen) return;
    const stillValid = recCategoryOptions.some((c) => c.id === recCategoryId);
    if (!stillValid) {
      setRecCategoryId(recCategoryOptions[0]?.id || "");
    }
  }, [recType, recOpen, recCategoryOptions, recCategoryId]);

  function openNewRecurring() {
    const firstExpense =
      categories.find((c) => c.type === "expense")?.id || "";
    setRecEditingId(null);
    setRecType("expense");
    setRecAmount("");
    setRecCategoryId(firstExpense);
    setRecDescription("");
    setRecDay("5");
    setRecActive(true);
    setRecError("");
    setRecOpen(true);
  }

  function openEditRecurring(r) {
    setRecEditingId(r.id);
    setRecType(r.type === "income" ? "income" : "expense");
    setRecAmount(amountToMask(r.amount));
    setRecCategoryId(r.categoryId || "");
    setRecDescription(r.description || "");
    setRecDay(String(r.dayOfMonth || 1));
    setRecActive(r.active !== false);
    setRecError("");
    setRecOpen(true);
  }

  function saveRecurring() {
    const valor = parseAmount(recAmount);
    if (!(valor > 0)) {
      setRecError("Coloca um valor de verdade. Conta fixa de R$ 0 não existe.");
      return;
    }
    if (!recCategoryId) {
      setRecError("Escolhe uma categoria. Sem rótulo o dinheiro foge sem deixar pista.");
      return;
    }
    const dia = Math.min(31, Math.max(1, Math.round(Number(recDay)) || 1));

    if (recEditingId) {
      updateRecurring(recEditingId, {
        type: recType,
        amount: valor,
        categoryId: recCategoryId,
        description: recDescription.trim(),
        dayOfMonth: dia,
        active: recActive,
      });
      showToast("Recorrência atualizada. As contas fixas agradecem a atenção.");
    } else {
      addRecurring({
        type: recType,
        amount: valor,
        categoryId: recCategoryId,
        description: recDescription.trim(),
        dayOfMonth: dia,
        active: recActive,
      });
      showToast(
        recType === "income"
          ? "Renda fixa cadastrada. Que bom ter algo certo na vida."
          : "Conta fixa cadastrada. Todo mês ela vem te lembrar, sem dó."
      );
    }
    setRecOpen(false);
  }

  function toggleRecurringActive(r) {
    updateRecurring(r.id, { active: !r.active });
    showToast(
      r.active
        ? "Recorrência pausada. Descanso merecido pra essa conta."
        : "Recorrência reativada. Bora lançar todo mês de novo."
    );
  }

  const [recDeleteId, setRecDeleteId] = useState(null);
  const recToDelete = useMemo(
    () => recurring.find((r) => r.id === recDeleteId) || null,
    [recurring, recDeleteId]
  );

  function confirmDeleteRecurring() {
    if (recDeleteId) {
      deleteRecurring(recDeleteId);
      showToast("Recorrência removida. Uma preocupação a menos por mês.");
    }
    setRecDeleteId(null);
  }

  function categoryNameOf(id) {
    const c = categories.find((x) => x.id === id);
    if (!c) return "Sem categoria";
    return `${c.emoji} ${c.name}`;
  }

  // ============================================================
  // Exportar / Importar JSON
  // ============================================================
  function handleExport() {
    try {
      const json = exportData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = todayDownloadName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Backup baixado. Guarda bem, é a prova dos seus gastos.");
    } catch {
      showToast("Não consegui exportar agora. O cofre travou, tenta de novo.");
    }
  }

  const fileInputRef = useRef(null);

  function triggerImport() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    // Limpa o input pra permitir reimportar o mesmo arquivo depois.
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(String(reader.result || ""));
        showToast("Dados importados! Bem-vindo de volta ao caos organizado.");
      } catch (err) {
        showToast(
          (err && err.message) ||
            "Arquivo inválido. Isso aí não parece um backup do Tá Liso."
        );
      }
    };
    reader.onerror = () => {
      showToast("Não consegui ler o arquivo. Ele tá manhoso, tenta outro.");
    };
    reader.readAsText(file);
  }

  // ============================================================
  // Apagar tudo (confirmação DUPLA)
  // ============================================================
  const [resetStep, setResetStep] = useState(0); // 0 = fechado, 1 = 1ª, 2 = 2ª

  function doReset() {
    resetAll();
    setResetStep(0);
    // Sem toast: o onboarding assume a tela após o reset.
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="px-4 pt-4 pb-28">
      <SectionHeader title="Ajustes" />

      {/* ---------- Perfil ---------- */}
      <Card className="mt-2">
        <div className="mb-3 flex items-center gap-2">
          <User size={18} className="text-accent" aria-hidden="true" />
          <h3 className="text-base font-bold tracking-tight text-ink">
            Seu perfil
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="set-name"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Como devo te chamar?
            </label>
            <input
              id="set-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome (opcional)"
              maxLength={40}
              className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="set-income"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Renda mensal
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-ink-dim">
                R$
              </span>
              <input
                id="set-income"
                type="text"
                inputMode="decimal"
                value={income}
                onChange={(e) => setIncome(maskAmountInput(e.target.value))}
                placeholder="0,00"
                className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-12 pr-4 text-lg font-bold text-ink tabular-nums placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-dim">
              É só pra eu calibrar o nível de pânico. Não conto pra ninguém.
            </p>
          </div>

          <button
            type="button"
            onClick={saveProfile}
            disabled={!profileDirty}
            className="mt-1 min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar perfil
          </button>
        </div>
      </Card>

      {/* ---------- Sarcasmo ---------- */}
      <Card className="mt-3">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-accent" aria-hidden="true" />
          <h3 className="text-base font-bold tracking-tight text-ink">
            Nível de sarcasmo
          </h3>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Nível de sarcasmo">
          {SARCASM_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              active={settings.sarcasmLevel === opt.id}
              onClick={() => setSarcasm(opt.id)}
            >
              <span aria-hidden="true">{opt.emoji}</span>
              {opt.label}
            </Chip>
          ))}
        </div>

        <p className="mt-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm italic leading-relaxed text-ink-dim">
          <span className="mr-1" aria-hidden="true">
            🐷
          </span>
          {getMessage("saldoMedio", {
            state,
            level: settings.sarcasmLevel,
            nome: settings.userName,
          }) || "Escolha o nível e eu ajusto o veneno na medida."}
        </p>
      </Card>

      {/* ---------- Tema ---------- */}
      <Card className="mt-3">
        <div className="mb-3 flex items-center gap-2">
          {settings.theme === "light" ? (
            <Sun size={18} className="text-accent" aria-hidden="true" />
          ) : (
            <Moon size={18} className="text-accent" aria-hidden="true" />
          )}
          <h3 className="text-base font-bold tracking-tight text-ink">Tema</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            aria-pressed={settings.theme === "dark"}
            className={`flex items-center justify-center gap-2 min-h-[48px] rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
              settings.theme === "dark"
                ? "border-accent bg-accent/15 text-ink ring-2 ring-accent/40"
                : "border-line bg-surface-2 text-ink-dim hover:text-ink"
            }`}
          >
            <Moon size={18} aria-hidden="true" />
            Escuro
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            aria-pressed={settings.theme === "light"}
            className={`flex items-center justify-center gap-2 min-h-[48px] rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
              settings.theme === "light"
                ? "border-accent bg-accent/15 text-ink ring-2 ring-accent/40"
                : "border-line bg-surface-2 text-ink-dim hover:text-ink"
            }`}
          >
            <Sun size={18} aria-hidden="true" />
            Claro
          </button>
        </div>
      </Card>

      {/* ---------- Instalar o app ---------- */}
      <InstallCard />

      {/* ---------- Categorias ---------- */}
      <Card className="mt-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-accent" aria-hidden="true" />
            <h3 className="text-base font-bold tracking-tight text-ink">
              Categorias
            </h3>
          </div>
          <button
            type="button"
            onClick={openNewCategory}
            aria-label="Nova categoria"
            className="inline-flex items-center gap-1 min-h-[40px] rounded-full px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
          >
            <Plus size={16} aria-hidden="true" />
            Nova
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="py-2 text-sm text-ink-dim">
            Nenhuma categoria por aqui. Cria uma pra organizar a bagunça.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {expenseCats.length > 0 ? (
              <CategoryGroup
                label="Saídas"
                cats={expenseCats}
                onEdit={openEditCategory}
                onDelete={(c) => setCatDeleteId(c.id)}
              />
            ) : null}
            {incomeCats.length > 0 ? (
              <CategoryGroup
                label="Entradas"
                cats={incomeCats}
                onEdit={openEditCategory}
                onDelete={(c) => setCatDeleteId(c.id)}
              />
            ) : null}
          </div>
        )}
      </Card>

      {/* ---------- Recorrências ---------- */}
      <Card className="mt-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Repeat size={18} className="text-accent" aria-hidden="true" />
            <h3 className="text-base font-bold tracking-tight text-ink">
              Contas fixas
            </h3>
          </div>
          <button
            type="button"
            onClick={openNewRecurring}
            aria-label="Nova recorrência"
            disabled={categories.length === 0}
            className="inline-flex items-center gap-1 min-h-[40px] rounded-full px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} aria-hidden="true" />
            Nova
          </button>
        </div>

        {recurring.length === 0 ? (
          <p className="py-2 text-sm text-ink-dim">
            Sem contas fixas cadastradas. Cadastra o aluguel, a fatura, aquela
            assinatura que você esqueceu de cancelar...
          </p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Lista de recorrências">
            {recurring.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-ink">
                      {r.description || categoryNameOf(r.categoryId)}
                    </span>
                    {!r.active ? (
                      <span className="flex-shrink-0 rounded-full bg-line px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-dim">
                        pausada
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-dim">
                    {categoryNameOf(r.categoryId)} · dia {r.dayOfMonth}
                  </p>
                </div>

                <span
                  className={`flex-shrink-0 text-sm font-bold tabular-nums ${
                    r.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {r.type === "income" ? "+" : "−"}
                  {formatBRL(r.amount)}
                </span>

                <div className="flex flex-shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => toggleRecurringActive(r)}
                    aria-label={
                      r.active
                        ? `Pausar recorrência ${r.description || ""}`
                        : `Ativar recorrência ${r.description || ""}`
                    }
                    aria-pressed={r.active}
                    className={`grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-surface ${
                      r.active ? "text-income" : "text-ink-dim"
                    }`}
                  >
                    <Power size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditRecurring(r)}
                    aria-label={`Editar recorrência ${r.description || ""}`}
                    className="grid h-9 w-9 place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-surface transition-colors"
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecDeleteId(r.id)}
                    aria-label={`Excluir recorrência ${r.description || ""}`}
                    className="grid h-9 w-9 place-items-center rounded-full text-ink-dim hover:text-expense hover:bg-surface transition-colors"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ---------- Dados ---------- */}
      <Card className="mt-3">
        <div className="mb-3 flex items-center gap-2">
          <Database size={18} className="text-accent" aria-hidden="true" />
          <h3 className="text-base font-bold tracking-tight text-ink">
            Seus dados
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 min-h-[48px] rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            <Download size={18} aria-hidden="true" />
            Exportar
          </button>
          <button
            type="button"
            onClick={triggerImport}
            className="flex items-center justify-center gap-2 min-h-[48px] rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            <Upload size={18} aria-hidden="true" />
            Importar
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
        <p className="mt-2 text-xs text-ink-dim">
          Exporte um backup em JSON ou restaure de um arquivo. Importar
          substitui tudo que tá aqui agora.
        </p>

        <div className="mt-4 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setResetStep(1)}
            className="flex w-full items-center justify-center gap-2 min-h-[48px] rounded-2xl border border-expense/40 bg-expense/10 px-4 py-3 text-sm font-bold text-expense hover:bg-expense/20 transition-colors"
          >
            <Trash2 size={18} aria-hidden="true" />
            Apagar tudo
          </button>
          <p className="mt-2 text-xs text-ink-dim">
            Zera o app inteiro: transações, metas, categorias, tudo. Sem volta.
          </p>
        </div>
      </Card>

      {/* ---------- Rodapé ---------- */}
      <footer className="mt-6 pb-2 text-center">
        <p className="text-sm font-bold text-ink-dim">Tá Liso v{APP_VERSION}</p>
        <p className="mt-0.5 text-xs text-ink-dim">
          Feito com R$ 0,00 de orçamento.
        </p>
      </footer>

      {/* ============================================================
          Sheet: criar / editar CATEGORIA
      ============================================================ */}
      <Sheet
        open={catOpen}
        onClose={() => setCatOpen(false)}
        title={catEditingId ? "Editar categoria" : "Nova categoria"}
        footer={
          <button
            type="button"
            onClick={saveCategory}
            className="w-full min-h-[48px] rounded-2xl px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
          >
            {catEditingId ? "Salvar alterações" : "Criar categoria"}
          </button>
        }
      >
        <div className="flex flex-col gap-4 py-1">
          {!catEditingId ? (
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Tipo
              </span>
              <div className="flex gap-2" role="group" aria-label="Tipo da categoria">
                <Chip
                  active={catType === "expense"}
                  onClick={() => setCatType("expense")}
                  className="flex-1"
                >
                  Saída
                </Chip>
                <Chip
                  active={catType === "income"}
                  onClick={() => setCatType("income")}
                  className="flex-1"
                >
                  Entrada
                </Chip>
              </div>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="cat-name"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Nome
            </label>
            <input
              id="cat-name"
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Ex: Cafézinho"
              maxLength={32}
              className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Emoji
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Emoji da categoria">
              {EMOJI_OPTIONS.map((ic) => {
                const active = ic === catEmoji;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setCatEmoji(ic)}
                    aria-label={`Emoji ${ic}`}
                    aria-pressed={active}
                    className={`grid h-11 w-11 place-items-center rounded-2xl text-xl transition-colors ${
                      active
                        ? "bg-accent/20 ring-2 ring-accent"
                        : "bg-surface-2 border border-line hover:bg-surface"
                    }`}
                  >
                    {ic}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Cor
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Cor da categoria">
              {COLOR_OPTIONS.map((color) => {
                const active = color === catColor;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCatColor(color)}
                    aria-label={`Cor ${color}`}
                    aria-pressed={active}
                    className={`h-9 w-9 rounded-full transition-transform ${
                      active
                        ? "ring-2 ring-offset-2 ring-offset-surface ring-ink scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="cat-budget"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Orçamento mensal{" "}
              <span className="font-normal text-ink-dim">(opcional)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-ink-dim">
                R$
              </span>
              <input
                id="cat-budget"
                type="text"
                inputMode="decimal"
                value={catBudget}
                onChange={(e) => setCatBudget(maskAmountInput(e.target.value))}
                placeholder="0,00"
                className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-12 pr-4 text-lg font-bold text-ink tabular-nums placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-dim">
              Defina um teto pra eu avisar quando você passar do limite.
            </p>
          </div>

          {catError ? (
            <p className="text-sm font-semibold text-expense" role="alert">
              {catError}
            </p>
          ) : null}
        </div>
      </Sheet>

      {/* ============================================================
          Sheet: criar / editar RECORRÊNCIA
      ============================================================ */}
      <Sheet
        open={recOpen}
        onClose={() => setRecOpen(false)}
        title={recEditingId ? "Editar conta fixa" : "Nova conta fixa"}
        footer={
          <button
            type="button"
            onClick={saveRecurring}
            className="w-full min-h-[48px] rounded-2xl px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-accent to-accent-2 shadow-soft hover:opacity-90 transition-opacity"
          >
            {recEditingId ? "Salvar alterações" : "Criar recorrência"}
          </button>
        }
      >
        <div className="flex flex-col gap-4 py-1">
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Tipo
            </span>
            <div className="flex gap-2" role="group" aria-label="Tipo da recorrência">
              <Chip
                active={recType === "expense"}
                onClick={() => setRecType("expense")}
                className="flex-1"
              >
                Saída
              </Chip>
              <Chip
                active={recType === "income"}
                onClick={() => setRecType("income")}
                className="flex-1"
              >
                Entrada
              </Chip>
            </div>
          </div>

          <div>
            <label
              htmlFor="rec-amount"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Valor
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-ink-dim">
                R$
              </span>
              <input
                id="rec-amount"
                type="text"
                inputMode="decimal"
                value={recAmount}
                onChange={(e) => setRecAmount(maskAmountInput(e.target.value))}
                placeholder="0,00"
                className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-12 pr-4 text-lg font-bold text-ink tabular-nums placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
              />
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Categoria
            </span>
            {recCategoryOptions.length === 0 ? (
              <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink-dim">
                Não há categorias de{" "}
                {recType === "income" ? "entrada" : "saída"} ainda. Crie uma
                categoria primeiro.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Categoria da recorrência">
                {recCategoryOptions.map((c) => (
                  <Chip
                    key={c.id}
                    active={recCategoryId === c.id}
                    onClick={() => setRecCategoryId(c.id)}
                  >
                    <span aria-hidden="true">{c.emoji}</span>
                    {c.name}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="rec-desc"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Descrição{" "}
              <span className="font-normal text-ink-dim">(opcional)</span>
            </label>
            <input
              id="rec-desc"
              type="text"
              value={recDescription}
              onChange={(e) => setRecDescription(e.target.value)}
              placeholder="Ex: Aluguel, Netflix..."
              maxLength={48}
              className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="rec-day"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Dia do mês
            </label>
            <input
              id="rec-day"
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              value={recDay}
              onChange={(e) => setRecDay(e.target.value)}
              className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-base text-ink tabular-nums outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-shadow"
            />
            <p className="mt-1.5 text-xs text-ink-dim">
              Todo mês, nesse dia, eu lanço isso automaticamente. Sem dó.
            </p>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
            <span className="text-sm font-semibold text-ink">Ativa</span>
            <button
              type="button"
              role="switch"
              aria-checked={recActive}
              onClick={() => setRecActive((v) => !v)}
              className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
                recActive ? "bg-income" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft transition-transform ${
                  recActive ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>

          {recError ? (
            <p className="text-sm font-semibold text-expense" role="alert">
              {recError}
            </p>
          ) : null}
        </div>
      </Sheet>

      {/* ---------- Confirmação: excluir categoria ---------- */}
      <ConfirmDialog
        open={!!catDeleteId}
        title="Apagar essa categoria?"
        message={
          (catToDelete ? `Você vai apagar "${catToDelete.name}". ` : "") +
          (catUsageCount > 0
            ? `Tem ${catUsageCount} ${
                catUsageCount === 1 ? "transação usando" : "transações usando"
              } ela — elas ficam sem categoria. `
            : "") +
          (getMessage("confirmarExclusao", {
            state,
            nome: settings.userName,
          }) || "Tem certeza? Não dá pra desfazer.")
        }
        confirmLabel="Apagar mesmo"
        cancelLabel="Deixa pra lá"
        danger
        onConfirm={confirmDeleteCategory}
        onClose={() => setCatDeleteId(null)}
      />

      {/* ---------- Confirmação: excluir recorrência ---------- */}
      <ConfirmDialog
        open={!!recDeleteId}
        title="Apagar essa conta fixa?"
        message={
          (recToDelete
            ? `Você vai apagar "${
                recToDelete.description || categoryNameOf(recToDelete.categoryId)
              }". `
            : "") +
          "Os lançamentos já feitos continuam onde estão. Só não repete mais."
        }
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmDeleteRecurring}
        onClose={() => setRecDeleteId(null)}
      />

      {/* ---------- Apagar tudo: 1ª confirmação ---------- */}
      <ConfirmDialog
        open={resetStep === 1}
        title="Apagar TUDO mesmo?"
        message="Isso aqui zera o app inteirinho: transações, metas, categorias, recorrências, perfil — tudo. Sr. Cofre vai ficar de luto. Última chance de recuar."
        confirmLabel="Sim, quero apagar"
        cancelLabel="Pensando bem, não"
        danger
        onConfirm={() => setResetStep(2)}
        onClose={() => setResetStep(0)}
      />

      {/* ---------- Apagar tudo: 2ª confirmação ---------- */}
      <ConfirmDialog
        open={resetStep === 2}
        title="Sério mesmo? Tem certeza ABSOLUTA?"
        message="Tá, você pediu duas vezes. Depois não vem chorar pro porquinho dizendo que perdeu o histórico. Não tem backup automático, não tem 'Ctrl+Z', não tem milagre. Confirma só se for isso mesmo."
        confirmLabel="Apagar tudo e recomeçar"
        cancelLabel="Não, me salva!"
        danger
        onConfirm={doReset}
        onClose={() => setResetStep(0)}
      />

      {/* ---------- Toast do Sr. Cofre ---------- */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            key="settings-toast"
            role="status"
            aria-live="polite"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-[420px] rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-ink shadow-soft">
              <span className="mr-1" aria-hidden="true">
                🐷
              </span>
              {toast}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ---- Subcomponente: grupo de categorias (Saídas / Entradas) ----
function CategoryGroup({ label, cats, onEdit, onDelete }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-dim">
        {label}
      </p>
      <ul className="flex flex-col gap-2" aria-label={`Categorias de ${label}`}>
        {cats.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5"
          >
            <div
              className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl text-xl"
              style={{ backgroundColor: `${c.color}22` }}
              aria-hidden="true"
            >
              {c.emoji}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {c.name}
              </p>
              {c.budget != null && c.budget > 0 ? (
                <p className="mt-0.5 text-xs text-ink-dim">
                  Orçamento: {formatBRL(c.budget)}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-ink-dim">Sem orçamento</p>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => onEdit(c)}
                aria-label={`Editar categoria ${c.name}`}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-dim hover:text-ink hover:bg-surface transition-colors"
              >
                <Pencil size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(c)}
                aria-label={`Excluir categoria ${c.name}`}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-dim hover:text-expense hover:bg-surface transition-colors"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
