"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "flex items-start gap-2 rounded-lg border bg-white p-3 shadow-lg",
              t.type === "success" && "border-green-200",
              t.type === "error" && "border-red-200",
              t.type === "info" && "border-gray-200"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />}
            {t.type === "error" && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
            {t.type === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
            <p className="flex-1 text-sm text-gray-800">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
