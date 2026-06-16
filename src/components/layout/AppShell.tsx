"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  MessageSquare,
  Phone,
  Sparkles,
  Plug,
  Settings,
  Video,
  Search,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { useSidebarStore } from "@/lib/sidebar-store";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
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
  collapsed,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  pathname: string | null;
  collapsed: boolean;
}) {
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center rounded-xl text-sm font-medium transition-colors",
        collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
        active
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedAvatarId, currentEmotion } = useHubStore();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const togglePalette = useCommandPaletteStore((s) => s.toggle);
  const avatar = getAvatarById(selectedAvatarId);
  const [sidebarReady, setSidebarReady] = useState(false);

  const isCallView = pathname?.includes("/call/");
  const isHome = pathname === "/dashboard";
  const showMobileFab = isHome;
  const isCollapsed = sidebarReady && collapsed;

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setSidebarReady(true);
    };

    const unsub = useSidebarStore.persist.onFinishHydration(finish);
    void useSidebarStore.persist.rehydrate();

    if (useSidebarStore.persist.hasHydrated()) {
      finish();
    }

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  if (isCallView) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-black md:pb-0">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--hub-border)] bg-white/60 backdrop-blur-xl transition-[width] duration-300 ease-in-out dark:bg-zinc-900/60 md:flex",
          isCollapsed ? "w-[4.5rem]" : "w-52",
        )}
      >
        <div className={cn("p-3", isCollapsed && "px-2")}>
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "flex-col" : "justify-between",
            )}
          >
            {!isCollapsed && (
              <Link
                href="/dashboard"
                className="text-base font-semibold tracking-tight"
              >
                Hub
              </Link>
            )}
            {isCollapsed ? (
              <button
                type="button"
                onClick={togglePalette}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Open actions"
                title="Actions ⌘K"
              >
                <Search className="h-4 w-4" />
              </button>
            ) : (
              <CommandPaletteTrigger />
            )}
          </div>

          {avatar && (
            <Link
              href="/dashboard"
              title={avatar.name}
              className={cn(
                "mt-3 flex items-center justify-center rounded-2xl bg-zinc-50 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800",
                isCollapsed ? "p-2" : "p-3",
              )}
            >
              <AvatarDisplay
                avatar={avatar}
                size={isCollapsed ? "sm" : "xs"}
                emotion={currentEmotion}
              />
            </Link>
          )}
        </div>

        <nav
          className={cn(
            "flex-1 space-y-4 overflow-y-auto overflow-x-hidden pb-3",
            isCollapsed ? "px-2" : "px-3",
          )}
        >
          <div className="space-y-0.5">
            <NavLink
              href="/dashboard"
              label="Home"
              icon={Home}
              pathname={pathname}
              collapsed={isCollapsed}
            />
          </div>

          <div>
            {!isCollapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Talk to agent
              </p>
            )}
            <div className="space-y-0.5">
              {TALK_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  pathname={pathname}
                  collapsed={isCollapsed}
                />
              ))}
            </div>
          </div>

          <div>
            {!isCollapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Workspace
              </p>
            )}
            <div className="space-y-0.5">
              {WORKSPACE_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  pathname={pathname}
                  collapsed={isCollapsed}
                />
              ))}
            </div>
          </div>

          <div
            className={cn(
              "space-y-0.5 border-t border-zinc-200 pt-3 dark:border-zinc-800",
            )}
          >
            <NavLink
              href="/dashboard/settings"
              label="Settings"
              icon={Settings}
              pathname={pathname}
              collapsed={isCollapsed}
            />
          </div>
        </nav>

        <div className={cn("border-t border-zinc-200 p-2 dark:border-zinc-800", isCollapsed && "px-2")}>
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "flex w-full items-center rounded-xl text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span className="truncate">Collapse</span>
              </>
            )}
          </button>
        </div>
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
