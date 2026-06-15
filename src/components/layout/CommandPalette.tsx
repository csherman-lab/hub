"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  MessageSquare,
  Phone,
  Video,
  Plug,
  Sparkles,
  Settings,
  Search,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPaletteStore } from "@/lib/command-palette-store";

const ACTIONS = [
  { id: "home", label: "Go to Home", href: "/dashboard", icon: Home },
  { id: "chat", label: "Open Chat", href: "/dashboard/chat", icon: MessageSquare },
  { id: "voice", label: "Start Voice Call", href: "/dashboard/call/voice", icon: Phone },
  { id: "video", label: "Start Video Call", href: "/dashboard/call/video", icon: Video },
  { id: "skills", label: "Skills", href: "/dashboard/skills", icon: Sparkles },
  { id: "connectors", label: "Connectors", href: "/dashboard/connectors", icon: Plug },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
  {
    id: "draft-email",
    label: "Ask: Draft an email",
    href: "/dashboard/chat?q=Draft%20a%20professional%20email%20for%20me",
    icon: Mail,
  },
  {
    id: "schedule",
    label: "Ask: What's on my calendar?",
    href: "/dashboard/chat?q=What%27s%20on%20my%20calendar%20this%20week%3F",
    icon: Calendar,
  },
  {
    id: "research",
    label: "Ask: Research a topic",
    href: "/dashboard/chat?q=Research%20the%20latest%20AI%20agent%20trends",
    icon: Search,
  },
];

export function CommandPalette() {
  const { open, setOpen } = useCommandPaletteStore();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );

  const run = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router, setOpen],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useCommandPaletteStore.getState().toggle();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions…"
            className="flex-1 bg-transparent py-4 text-sm outline-none"
          />
          <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
            esc
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => run(a.href)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <a.icon className="h-4 w-4 text-zinc-400" />
                {a.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-zinc-400">
              No matching actions
            </li>
          )}
        </ul>
        <p className="border-t border-zinc-200 px-4 py-2 text-[10px] text-zinc-400 dark:border-zinc-800">
          Tip: ⌘K anywhere to open
        </p>
      </div>
    </div>
  );
}

export function CommandPaletteTrigger() {
  const toggle = useCommandPaletteStore((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "hidden items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-500",
        "hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 md:flex",
      )}
    >
      <Search className="h-3 w-3" />
      <span>Actions</span>
      <kbd className="rounded bg-white px-1 text-[10px] dark:bg-zinc-900">⌘K</kbd>
    </button>
  );
}
