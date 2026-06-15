"use client";

import { cn } from "@/lib/utils";
import { useHubStore } from "@/lib/store";

export function GrokStatusBadge({ className }: { className?: string }) {
  const grokStatus = useHubStore((s) => s.grokStatus);

  if (!grokStatus) {
    return (
      <span className={cn("text-xs text-zinc-400", className)}>Checking AI…</span>
    );
  }

  if (grokStatus.chat && grokStatus.voice) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Grok live
      </span>
    );
  }

  if (grokStatus.configured) {
    return (
      <span className={cn("text-xs text-amber-600", className)}>
        Grok key set — verify API
      </span>
    );
  }

  return (
    <span className={cn("text-xs text-zinc-400", className)}>Mock mode</span>
  );
}
