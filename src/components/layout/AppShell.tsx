"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Phone,
  Sparkles,
  Plug,
  Settings,
  Video,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { GrokStatusBadge } from "@/components/ai/GrokStatusBadge";
import { CommandPaletteTrigger } from "@/components/layout/CommandPalette";
import { useCommandPaletteStore } from "@/lib/command-palette-store";

const TALK_NAV = [
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/call/voice", label: "Voice", icon: Phone },
  { href: "/dashboard/call/video", label: "Video", icon: Video },
] as const;

const WORKSPACE_NAV = [
  { href: "/dashboard/skills", label: "Skills", icon: Sparkles },
  { href: "/dashboard/connectors", label: "Connectors", icon: Plug },
] as const;

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/call/voice", label: "Voice", icon: Phone },
  { href: "/dashboard/connectors", label: "Apps", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  pathname: string | null;
}) {
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(href);

  return (
    <Link
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
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedAvatarId, agentName, currentEmotion, agentActivity } =
    useHubStore();
  const togglePalette = useCommandPaletteStore((s) => s.toggle);
  const avatar = getAvatarById(selectedAvatarId);

  const isCallView = pathname?.includes("/call/");
  const isChatView = pathname?.startsWith("/dashboard/chat");
  const isHome = pathname === "/dashboard";
  const showMobileFab = isHome;

  if (isCallView) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-black md:pb-0">
      <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-[var(--hub-border)] bg-white/60 backdrop-blur-xl dark:bg-zinc-900/60 md:flex">
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard" className="text-base font-semibold tracking-tight">
              Hub
            </Link>
            <CommandPaletteTrigger />
          </div>
          {avatar && (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
              <AvatarDisplay
                avatar={avatar}
                size="xs"
                emotion={currentEmotion}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{agentName || avatar.name}</p>
                {agentActivity ? (
                  <p className="truncate text-xs text-blue-500">{agentActivity}</p>
                ) : (
                  <GrokStatusBadge />
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          <div className="space-y-0.5">
            <NavLink href="/dashboard" label="Home" icon={Home} pathname={pathname} />
          </div>

          <div>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Talk to agent
            </p>
            <div className="space-y-0.5">
              {TALK_NAV.map((item) => (
                <NavLink key={item.href} {...item} pathname={pathname} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Workspace
            </p>
            <div className="space-y-0.5">
              {WORKSPACE_NAV.map((item) => (
                <NavLink key={item.href} {...item} pathname={pathname} />
              ))}
            </div>
          </div>

          <div className="space-y-0.5 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <NavLink
              href="/dashboard/settings"
              label="Settings"
              icon={Settings}
              pathname={pathname}
            />
          </div>
        </nav>
      </aside>

      <main className="hub-main flex-1 overflow-auto">{children}</main>

      {showMobileFab && (
        <button
          type="button"
          onClick={togglePalette}
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 md:hidden"
          aria-label="Open actions"
        >
          <Search className="h-5 w-5" />
        </button>
      )}

      <nav className="hub-bottom-nav fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-200 bg-white/95 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 md:hidden">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                active ? "text-blue-600" : "text-zinc-500",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
