// Onboarding — 3 passos divertidos para configurar o "Tá Liso".
// (1) nome opcional + renda mensal; (2) nível de sarcasmo com prévia;
// (3) aceitar o destino financeiro. Ao concluir, chama
// store.completeOnboarding(...) e onDone().

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, PiggyBank } from "lucide-react";

import useStore from "../hooks/useStore.js";
import { maskAmountInput, parseAmount, formatBRL } from "../lib/format.js";
import { getMessage } from "../lib/sarcasm.js";

import Mascote from "../components/Mascote.jsx";
import Card from "../components/Card.jsx";
import Chip from "../components/Chip.jsx";

// Opções de sarcasmo com rótulo, descrição e frase-exemplo (no tom de cada nível).
const SARCASM_OPTIONS = [
  {
    value: "leve",
    label: "Leve",
    emoji: "😊",
    desc: "Carinho com uns cutucões bem suaves.",
    sample: "Tá indo bem! Um pouquinho de cuidado e a gente chega lá.",
    mood: "feliz",
  },
  {
    value: "medio",
    label: "Médio",
    emoji: "😏",
    desc: "O equilíbrio perfeito entre deboche e abraço.",
    sample: "Voltou? Achei que tinha fugido da realidade financeira.",
    mood: "neutro",
  },
  {
    value: "brutal",
    label: "Brutal",
    emoji: "💀",
    desc: "Sem dó. Você pediu, agora aguenta.",
    sample: "Tá liso. Liso igual careca no sol.",
    mood: "preocupado",
  },
];

const TOTAL_STEPS = 3;

export default function Onboarding({ onDone }) {
  const store = useStore();
  const reduce = useReducedMotion();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [incomeMasked, setIncomeMasked] = useState("");
  const [sarcasm, setSarcasm] = useState("medio");
  // Frase-prévia do nível tocado no passo 2 (começa pela do nível padrão).
  const [previewSample, setPreviewSample] = useState(
    SARCASM_OPTIONS.find((o) => o.value === "medio").sample
  );

  const incomeValue = useMemo(() => parseAmount(incomeMasked), [incomeMasked]);

  const selectedOption = useMemo(
    () => SARCASM_OPTIONS.find((o) => o.value === sarcasm) || SARCASM_OPTIONS[1],
    [sarcasm]
  );

  // Humor do mascote por passo (com prévia reativa no passo do sarcasmo).
  const mascotMood =
    step === 0 ? "neutro" : step === 1 ? selectedOption.mood : "feliz";

  function handleIncomeChange(e) {
    setIncomeMasked(maskAmountInput(e.target.value));
  }

  function pickSarcasm(option) {
    setSarcasm(option.value);
    setPreviewSample(option.sample);
  }

  function goNext() {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function finish() {
    store.completeOnboarding({
      userName: name.trim(),
      monthlyIncome: incomeValue,
      sarcasmLevel: sarcasm,
    });
    if (typeof onDone === "function") onDone();
  }

  // Frase final do Sr. Cofre: boas-vindas no nível escolhido, com nome e renda.
  const closingLine = useMemo(
    () =>
      getMessage("boasVindas", {
        level: sarcasm,
        nome: name.trim(),
        valor: formatBRL(incomeValue),
      }),
    [sarcasm, name, incomeValue]
  );

  // Transições de slide entre passos (fade puro com reduced-motion).
  const slide = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
        transition: { type: "spring", stiffness: 320, damping: 30 },
      };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      {/* Cabeçalho fixo: marca + indicador de progresso */}
      <header className="px-5 pt-safe pt-6 pb-2">
        <div className="flex items-center gap-2 text-ink-dim">
          <PiggyBank size={20} className="text-accent" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight">Tá Liso</span>
        </div>

        <div
          className="mt-4 flex items-center gap-2"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step + 1}
          aria-label={`Passo ${step + 1} de ${TOTAL_STEPS}`}
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-accent" : "bg-surface-2"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Conteúdo do passo */}
      <main className="flex-1 px-5 pb-4 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.section
              key="step-nome"
              {...slide}
              className="flex flex-col items-center text-center pt-2"
            >
              <Mascote mood={mascotMood} size={104} />
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
                Oi! Eu sou o Sr. Cofre.
              </h1>
              <p className="mt-2 text-ink-dim leading-relaxed">
                Vou cuidar (e julgar carinhosamente) das suas finanças. Antes,
                me conta duas coisinhas.
              </p>

              <div className="w-full mt-6 space-y-4 text-left">
                <div>
                  <label
                    htmlFor="ob-nome"
                    className="block text-sm font-semibold mb-2"
                  >
                    Como te chamo?{" "}
                    <span className="text-ink-dim font-normal">(opcional)</span>
                  </label>
                  <input
                    id="ob-nome"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    autoComplete="given-name"
                    maxLength={32}
                    className="w-full min-h-[52px] rounded-2xl bg-surface border border-line px-4 text-ink placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ob-renda"
                    className="block text-sm font-semibold mb-2"
                  >
                    Quanto entra por mês?{" "}
                    <span className="text-ink-dim font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-dim font-semibold pointer-events-none">
                      R$
                    </span>
                    <input
                      id="ob-renda"
                      type="text"
                      inputMode="decimal"
                      value={incomeMasked}
                      onChange={handleIncomeChange}
                      placeholder="0,00"
                      aria-describedby="ob-renda-help"
                      className="w-full min-h-[52px] rounded-2xl bg-surface border border-line pl-12 pr-4 text-ink text-right text-lg font-bold tabular-nums placeholder:text-ink-dim/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition"
                    />
                  </div>
                  <p id="ob-renda-help" className="mt-2 text-xs text-ink-dim">
                    Serve só pra eu calibrar o quanto devo me preocupar. Pode
                    deixar zerado.
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section
              key="step-sarcasmo"
              {...slide}
              className="flex flex-col items-center text-center pt-2"
            >
              <Mascote mood={selectedOption.mood} size={96} />
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
                Escolha seu veneno
              </h1>
              <p className="mt-2 text-ink-dim leading-relaxed">
                Qual o nível de deboche que você aguenta? Toca pra ouvir uma
                amostra.
              </p>

              <div className="w-full mt-6 flex flex-wrap justify-center gap-2">
                {SARCASM_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    active={sarcasm === option.value}
                    onClick={() => pickSarcasm(option)}
                  >
                    <span aria-hidden="true">{option.emoji}</span>
                    {option.label}
                  </Chip>
                ))}
              </div>

              <Card className="w-full mt-5 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-dim">
                  {selectedOption.label} · {selectedOption.desc}
                </p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={previewSample}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 text-ink font-medium leading-relaxed"
                  >
                    “{previewSample}”
                  </motion.p>
                </AnimatePresence>
              </Card>

              <p className="mt-4 text-xs text-ink-dim">
                Relaxa: dá pra mudar isso depois lá nos ajustes.
              </p>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="step-aceitar"
              {...slide}
              className="flex flex-col items-center text-center pt-2"
            >
              <Mascote mood={mascotMood} size={112} />
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
                Tudo pronto{name.trim() ? `, ${name.trim()}` : ""}!
              </h1>

              <Card className="w-full mt-5 text-left space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-dim text-sm">Nível de sarcasmo</span>
                  <span className="font-semibold">
                    {selectedOption.emoji} {selectedOption.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-dim text-sm">Renda mensal</span>
                  <span className="font-bold tabular-nums">
                    {formatBRL(incomeValue)}
                  </span>
                </div>
              </Card>

              <div className="w-full mt-5 rounded-3xl bg-surface-2 border border-line p-4">
                <p className="text-sm text-ink leading-relaxed italic">
                  “{closingLine}”
                </p>
                <p className="mt-1 text-xs text-ink-dim">— Sr. Cofre</p>
              </div>

              <p className="mt-4 text-ink-dim text-sm leading-relaxed">
                Bora registrar seus gastos sem medo (ou com um pouquinho dele).
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Rodapé de navegação */}
      <footer className="px-5 pb-safe pb-6 pt-2">
        <div className="flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Voltar ao passo anterior"
              className="inline-flex items-center justify-center gap-1 min-h-[52px] px-4 rounded-2xl bg-surface-2 border border-line text-ink font-semibold active:scale-[0.98] transition"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </button>
          ) : null}

          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 inline-flex items-center justify-center gap-2 min-h-[52px] px-5 rounded-2xl bg-gradient-to-r from-accent to-accent-2 text-white font-bold shadow-soft active:scale-[0.98] transition"
            >
              Continuar
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="flex-1 inline-flex items-center justify-center gap-2 min-h-[52px] px-5 rounded-2xl bg-gradient-to-r from-accent to-accent-2 text-white font-bold shadow-soft active:scale-[0.98] transition"
            >
              <Check size={18} aria-hidden="true" />
              Aceitar meu destino financeiro
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
