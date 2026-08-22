"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTipo = "success" | "error" | "info";

interface ToastItem {
  id: number;
  mensagem: string;
  tipo: ToastTipo;
}

interface ToastContextValue {
  toast: (mensagem: string, tipo?: ToastTipo) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONES: Record<ToastTipo, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remover = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (mensagem: string, tipo: ToastTipo = "info") => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, mensagem, tipo }]);
      setTimeout(() => remover(id), 4000);
    },
    [remover]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-lg animate-check-pop min-w-[260px]"
            )}
          >
            {ICONES[item.tipo]}
            <span className="flex-1 text-sm">{item.mensagem}</span>
            <button onClick={() => remover(item.id)} aria-label="Fechar">
              <X className="h-4 w-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}
