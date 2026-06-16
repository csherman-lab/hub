"use client";

import { cn } from "@/lib/utils";
import type { CallPhase } from "@/hooks/useLiveConversation";

const PHASE_CONFIG: Record<
  CallPhase,
  { label: string; dot: string; text: string }
> = {
  connecting: {
    label: "Connecting",
    dot: "bg-zinc-400 animate-pulse",
    text: "text-zinc-500",
  },
  listening: {
    label: "Live",
    dot: "bg-emerald-500 animate-pulse",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  thinking: {
    label: "Thinking",
    dot: "bg-amber-400 animate-pulse",
    text: "text-amber-600 dark:text-amber-400",
  },
  speaking: {
    label: "Speaking",
    dot: "bg-blue-500 animate-pulse",
    text: "text-blue-600 dark:text-blue-400",
  },
  muted: {
    label: "Muted",
    dot: "bg-zinc-400",
    text: "text-zinc-500",
  },
  error: {
    label: "Mic unavailable",
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
  },
};

export function LiveCallStatus({
  phase,
  interimTranscript,
  variant = "light",
}: {
  phase: CallPhase;
  interimTranscript?: string;
  variant?: "light" | "dark";
}) {
  const config = PHASE_CONFIG[phase];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm",
          variant === "dark"
            ? "bg-white/10 text-white"
            : "bg-white/80 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900/80 dark:ring-zinc-700",
          config.text,
        )}
      >
        <span className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)} />
        <span>{config.label}</span>
      </div>
      {interimTranscript && phase === "listening" && (
        <p
          className={cn(
            "max-w-xs truncate text-center text-sm",
            variant === "dark" ? "text-zinc-300" : "text-zinc-500",
          )}
        >
          {interimTranscript}
        </p>
      )}
    </div>
  );
}
