"use client";

import { useHubStore } from "@/lib/store";
import { X } from "lucide-react";

const TIPS = [
  "Press ⌘K to jump anywhere — chat, calls, connectors.",
  "Teach your agent Skills in plain English — no code.",
  "Say “remember that…” and your agent will store it as memory.",
  "Connect Gmail to draft and send emails with your approval.",
  "Use Voice or Video for a more natural conversation.",
];

export function FirstRunTips() {
  const { hasSeenTips, setHasSeenTips } = useHubStore();

  if (hasSeenTips) return null;

  return (
    <div className="border-b border-blue-100 bg-blue-50/80 p-4 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
          Quick tips
        </p>
        <button
          type="button"
          onClick={() => setHasSeenTips(true)}
          className="text-blue-400 hover:text-blue-600"
          aria-label="Dismiss tips"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-2 space-y-1.5 text-sm text-blue-800/90 dark:text-blue-300/90">
        {TIPS.map((t) => (
          <li key={t}>• {t}</li>
        ))}
      </ul>
    </div>
  );
}
