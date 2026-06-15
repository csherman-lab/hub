"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Sparkles,
  Plug,
  Settings,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/call/video", label: "Video", icon: Video },
  { href: "/dashboard/skills", label: "Skills", icon: Sparkles },
  { href: "/dashboard/connectors", label: "Connectors", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedAvatarId, agentName } = useHubStore();
  const avatar = getAvatarById(selectedAvatarId);

  const isCallView = pathname?.includes("/call/");

  if (isCallView) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-black">
      <aside className="hidden w-48 flex-col border-r border-[var(--hub-border)] bg-white/60 backdrop-blur-xl dark:bg-zinc-900/60 md:flex">
        <div className="p-4">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight">
            Hub
          </Link>
          {avatar && (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
              <AvatarDisplay avatar={avatar} size="xs" emotion="happy" />
              <div>
                <p className="text-sm font-medium">{agentName || avatar.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 px-3 pb-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
