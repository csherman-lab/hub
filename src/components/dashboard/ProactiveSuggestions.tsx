"use client";

import { useHubStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Connector } from "@/types";

const SUGGESTIONS: {
  when: (connectors: Connector[]) => boolean;
  text: string;
  href: string;
}[] = [
  {
    when: (c) => c.find((x) => x.id === "gmail")?.status === "connected",
    text: "Summarize my unread emails and flag anything urgent.",
    href: "/dashboard/chat?q=Summarize%20my%20unread%20emails",
  },
  {
    when: (c) => c.find((x) => x.id === "google_calendar")?.status === "connected",
    text: "What meetings do I have tomorrow? Help me prep.",
    href: "/dashboard/chat?q=What%20meetings%20do%20I%20have%20tomorrow%3F",
  },
  {
    when: () => true,
    text: "Teach me a skill, go to Skills and add a plain English rule.",
    href: "/dashboard/skills",
  },
  {
    when: (c) => c.find((x) => x.id === "gmail")?.status !== "connected",
    text: "Connect Gmail so I can help with your inbox.",
    href: "/dashboard/connectors",
  },
];

export function ProactiveSuggestions({ embedded = false }: { embedded?: boolean }) {
  const { proactivity, connectors } = useHubStore();
  const router = useRouter();

  if (proactivity === "reactive") return null;

  const picks = SUGGESTIONS.filter((s) => s.when(connectors)).slice(0, 2);
  if (!picks.length) return null;

  return (
    <div className={embedded ? "" : "border-t border-zinc-200 p-6 dark:border-zinc-800"}>
      <div
        className={cn(
          "flex items-center gap-2",
          embedded && "border-b border-zinc-100 px-5 py-4 dark:border-zinc-800",
        )}
      >
        <Lightbulb className="h-4 w-4 text-blue-500" />
        <h2 className="text-sm font-semibold">
          {proactivity === "proactive" ? "Suggested for you" : "Ideas"}
        </h2>
      </div>
      <div className={cn("space-y-2", embedded ? "p-5" : "mt-3")}>
        {picks.map((s) => (
          <button
            key={s.text}
            type="button"
            onClick={() => router.push(s.href)}
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-left text-sm transition-colors hover:bg-blue-50 dark:bg-zinc-800/50 dark:hover:bg-blue-950/30"
          >
            <span className="text-zinc-700 dark:text-zinc-300">{s.text}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-blue-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
