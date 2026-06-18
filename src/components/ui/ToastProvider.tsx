"use client";

import { X } from "lucide-react";
import { useToastStore } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

export function ToastProvider() {
  const { toasts, dismiss } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg backdrop-blur-xl",
            t.type === "success" && "bg-emerald-600 text-white",
            t.type === "error" && "bg-red-600 text-white",
            t.type === "info" && "bg-zinc-900 text-white",
          )}
        >
          <span>{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <X className="h-4 w-4 opacity-70" />
          </button>
        </div>
      ))}
    </div>
  );
}
