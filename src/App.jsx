// App — integração do "Tá Liso".
// Gate de onboarding, tema (dark/light), lançamento de recorrências vencidas no
// mount, navegação por abas (inicio/relatorios/metas/ajustes) com AnimatePresence,
// sub-view de Transações e o Sheet de AddTransaction (novo/editar) com toast
// sarcástico do Sr. Cofre ao salvar.

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

import useStore from "./hooks/useStore.js";
import * as storage from "./lib/storage.js";
import { applyDueRecurring } from "./lib/finance.js";

import Onboarding from "./screens/Onboarding.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import Transactions from "./screens/Transactions.jsx";
import Reports from "./screens/Reports.jsx";
import Goals from "./screens/Goals.jsx";
import Settings from "./screens/Settings.jsx";
import AddTransaction from "./screens/AddTransaction.jsx";

import BottomNav from "./components/BottomNav.jsx";

const TAB_ORDER = ["inicio", "relatorios", "metas", "ajustes"];

export default function App() {
  const { state } = useStore();
  const reduce = useReducedMotion();

  const onboarded = state.settings.onboarded;
  const theme = state.settings.theme;

  // Aba ativa + sub-view (transações) acessada a partir do Dashboard.
  const [activeTab, setActiveTab] = useState("inicio");
  const [showTransactions, setShowTransactions] = useState(false);

  // Sheet de lançamento (novo ou edição).
  const [addOpen, setAddOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Toast sarcástico do Sr. Cofre (frase retornada ao salvar uma transação).
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // ---- Tema: aplica/remove a classe "light" em <html> conforme settings. ----
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [theme]);

  // ---- Recorrências vencidas: aplica uma vez no mount e persiste se mudou. ----
  const didApplyRecurring = useRef(false);
  useEffect(() => {
    if (didApplyRecurring.current) return;
    didApplyRecurring.current = true;
    const current = storage.getState();
    const next = applyDueRecurring(current);
    if (next !== current) storage.setState(next);
  }, []);

  // ---- Toast: agenda o desaparecimento da frase. ----
  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message) {
    const msg = (message || "").trim();
    if (!msg) return;
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 4200);
  }

  // ---- Navegação ----
  function handleTabChange(tabId) {
    setShowTransactions(false);
    setActiveTab(tabId);
  }

  function openAdd() {
    setEditingTx(null);
    setAddOpen(true);
  }

  function openEdit(tx) {
    setEditingTx(tx || null);
    setAddOpen(true);
  }

  // onClose do AddTransaction recebe (opcionalmente) a frase do Sr. Cofre.
  function handleAddClose(frase) {
    setAddOpen(false);
    setEditingTx(null);
    if (typeof frase === "string") showToast(frase);
  }

  // ---- Gate de onboarding ----
  if (!onboarded) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[460px] bg-bg text-ink">
        <Onboarding onDone={() => setActiveTab("inicio")} />
      </div>
    );
  }

  // Conteúdo da aba ativa (ou sub-view de transações).
  function renderActive() {
    if (showTransactions) {
      return (
        <Transactions
          onBack={() => setShowTransactions(false)}
          onEdit={openEdit}
        />
      );
    }
    switch (activeTab) {
      case "relatorios":
        return <Reports />;
      case "metas":
        return <Goals />;
      case "ajustes":
        return <Settings />;
      case "inicio":
      default:
        return (
          <Dashboard
            onSeeAll={() => setShowTransactions(true)}
            onAdd={openAdd}
          />
        );
    }
  }

  // Chave única para o AnimatePresence (sub-view conta como "vista" separada).
  const viewKey = showTransactions ? "transactions" : activeTab;

  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.22, ease: "easeOut" };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[460px] bg-bg text-ink">
      {/* Conteúdo rolável das telas (espaço inferior para a BottomNav). */}
      <main className="min-h-screen pb-28">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewKey}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
            transition={transition}
          >
            {renderActive()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast sarcástico do Sr. Cofre. */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            key="toast"
            className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
          >
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-auto max-w-[400px] rounded-2xl border border-line bg-surface-2/95 px-4 py-3 text-center text-sm font-medium text-ink shadow-soft backdrop-blur"
            >
              <span className="mr-1" aria-hidden="true">
                🐷
              </span>
              {toast}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Navegação inferior fixa. */}
      <BottomNav
        active={activeTab}
        onChange={handleTabChange}
        onAdd={openAdd}
      />

      {/* Sheet de lançamento (novo / edição). */}
      <AddTransaction
        open={addOpen}
        onClose={handleAddClose}
        editingTx={editingTx}
      />
    </div>
  );
}
