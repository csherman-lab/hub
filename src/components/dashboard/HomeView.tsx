"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Phone,
  Plug,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  Video,
  X,
  AlertCircle,
  Brain,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProactiveSuggestions } from "@/components/dashboard/ProactiveSuggestions";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { formatGoalLabel } from "@/lib/goal-labels";
import { cn } from "@/lib/utils";
import type { ActivityItem, PendingApproval } from "@/types";

const ACTIVITY_ICONS: Record<ActivityItem["type"], typeof MessageSquare> = {
  draft: FileText,
  research: Search,
  meeting: Calendar,
  skill: CheckCircle2,
  message: MessageSquare,
};

const QUICK_ACTIONS = [
  { href: "/dashboard/chat", label: "Chat", desc: "Text your agent", icon: MessageSquare },
  { href: "/dashboard/call/voice", label: "Voice", desc: "Talk out loud", icon: Phone },
  { href: "/dashboard/call/video", label: "Video", desc: "Face to face call", icon: Video },
  { href: "/dashboard/skills", label: "Skills", desc: "Teach new behaviors", icon: Sparkles },
  { href: "/dashboard/connectors", label: "Connectors", desc: "Gmail, calendar & more", icon: Plug },
] as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function StatPill({
  label,
  value,
  icon: Icon,
  tone = "default",
  href,
}: {
  label: string;
  value: string | number;
  icon: typeof MessageSquare;
  tone?: "default" | "warn" | "success";
  href?: string;
}) {
  const toneClass =
    tone === "warn"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "success"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-zinc-900 dark:text-zinc-100";

  const inner = (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={cn(
          "rounded-lg p-2",
          tone === "warn"
            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40"
            : tone === "success"
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className={cn("text-lg font-semibold tabular-nums leading-none", toneClass)}>
          {value}
        </p>
        <p className="mt-1 truncate text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

export function HomeView() {
  const {
    selectedAvatarId,
    agentName,
    goals,
    memories,
    skills,
    messages,
    activities,
    pendingApprovals,
    connectors,
    approveItem,
    dismissApproval,
    connectConnector,
    addActivity,
  } = useHubStore();
  const pushToast = useToastStore((s) => s.push);
  const avatar = getAvatarById(selectedAvatarId);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const displayName = agentName || avatar?.name || "Your agent";
  const connectedCount = connectors.filter((c) => c.status === "connected").length;
  const chatMessages = messages.filter((m) => !m.channel || m.channel === "chat");

  const stats = useMemo(
    () => ({
      approvals: pendingApprovals.length,
      messages: chatMessages.length,
      skills: skills.length,
      memories: memories.length,
      connected: connectedCount,
    }),
    [pendingApprovals.length, chatMessages.length, skills.length, memories.length, connectedCount],
  );

  const loadBriefing = useCallback(async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: displayName,
          goals,
          memories,
        }),
      });
      const d = await res.json();
      const text =
        typeof d.briefing === "string"
          ? d.briefing
          : d.briefing?.content || d.briefing?.reasoning_content || null;
      setBriefing(text);
    } catch {
      setBriefing(null);
    } finally {
      setBriefingLoading(false);
    }
  }, [displayName, goals, memories]);

  const handleApprove = async (item: PendingApproval) => {
    setApprovingId(item.id);
    try {
      const res = await fetch("/api/approvals/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: item.type, draft: item.draft }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        pushToast(data.message || data.error || "Could not execute", "error");
        return;
      }
      approveItem(item.id);
      addActivity({
        type: item.type === "calendar" ? "meeting" : "draft",
        title: item.title,
        detail: data.message,
      });
      pushToast(data.message, "success");
    } catch {
      pushToast("Something went wrong. Try again.", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const syncConnectors = useCallback(async () => {
    try {
      const res = await fetch("/api/connect/status");
      const data = await res.json();
      const connections = data.connections || {};
      for (const [id, info] of Object.entries(connections)) {
        if ((info as { connected?: boolean }).connected) {
          connectConnector(id as Parameters<typeof connectConnector>[0]);
        }
      }
    } catch {
      /* offline */
    }
  }, [connectConnector]);

  useEffect(() => {
    syncConnectors();
    loadBriefing();
  }, [syncConnectors, loadBriefing]);

  if (!avatar) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-500">No agent selected.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">{formatToday()}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {getGreeting()}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Overview of your agent, apps, and recent work
            </p>
          </div>
          <Link
            href="/dashboard/chat"
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
          >
            <MessageSquare className="h-4 w-4" />
            Start chat
          </Link>
        </div>
        {goals.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {goals.map((g) => (
              <span
                key={g}
                className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {formatGoalLabel(g)}
              </span>
            ))}
          </div>
        )}
      </header>

      {pendingApprovals.length > 0 && (
        <section className="mb-6 space-y-3">
          {pendingApprovals.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/20"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/40">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.detail}</p>
                  <pre className="mt-3 max-h-28 overflow-auto rounded-xl bg-white/80 p-3 text-xs whitespace-pre-wrap dark:bg-zinc-900/80">
                    {item.draft}
                  </pre>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item)}
                      disabled={approvingId === item.id}
                    >
                      {approvingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Approve & send
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissApproval(item.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-2 divide-x divide-y divide-zinc-100 dark:divide-zinc-800 sm:grid-cols-4 sm:divide-y-0">
          <StatPill
            label="Needs approval"
            value={stats.approvals}
            icon={AlertCircle}
            tone={stats.approvals > 0 ? "warn" : "default"}
          />
          <StatPill
            label="Conversations"
            value={stats.messages}
            icon={MessageSquare}
            href="/dashboard/chat"
          />
          <StatPill
            label="Skills taught"
            value={stats.skills}
            icon={Sparkles}
            href="/dashboard/skills"
          />
          <StatPill
            label="Apps connected"
            value={stats.connected}
            icon={Plug}
            tone={stats.connected > 0 ? "success" : "default"}
            href="/dashboard/connectors"
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <section className="flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold">Agent briefing</h2>
            </div>
            <button
              type="button"
              onClick={loadBriefing}
              disabled={briefingLoading}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50 dark:hover:bg-zinc-800"
              aria-label="Refresh briefing"
            >
              <RefreshCw className={cn("h-4 w-4", briefingLoading && "animate-spin")} />
            </button>
          </div>
          <div className="flex flex-1 flex-col p-5">
            {briefingLoading ? (
              <p className="text-sm text-zinc-400">Preparing your briefing…</p>
            ) : (
              <p className="flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {briefing ||
                  `${displayName} is ready. Start a chat or connect apps to get a richer briefing.`}
              </p>
            )}
            {stats.memories > 0 && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
                <Brain className="h-3.5 w-3.5" />
                {stats.memories} memor{stats.memories === 1 ? "y" : "ies"} stored
              </p>
            )}
          </div>
        </section>

        <section className="flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold">Quick actions</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Jump in anywhere</p>
          </div>
          <div className="flex flex-1 flex-col justify-center divide-y divide-zinc-100 dark:divide-zinc-800">
            {QUICK_ACTIONS.map(({ href, label, desc, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="rounded-lg bg-zinc-100 p-2 text-zinc-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-blue-500" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            {activities.length > 5 && (
              <span className="text-xs text-zinc-400">{activities.length} total</span>
            )}
          </div>
          <div className="p-5">
            {activities.length === 0 ? (
              <div className="rounded-xl bg-zinc-50 px-4 py-8 text-center dark:bg-zinc-800/50">
                <MessageSquare className="mx-auto h-8 w-8 text-zinc-300" />
                <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No activity yet
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Start a conversation or connect an app to see updates here.
                </p>
                <Link
                  href="/dashboard/chat"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:underline"
                >
                  Open chat
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 6).map((item) => {
                  const Icon = ACTIVITY_ICONS[item.type];
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <div
                        className={cn(
                          "rounded-lg p-2",
                          item.needsApproval
                            ? "bg-amber-100 text-amber-600"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/40",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-sm text-zinc-500">{item.detail}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold">Connected apps</h2>
              <Link
                href="/dashboard/connectors"
                className="text-xs font-medium text-blue-500 hover:underline"
              >
                Manage
              </Link>
            </div>
            <div className="p-5">
              <ConnectedAppsSummary />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <ProactiveSuggestions embedded />
          </section>
        </div>
      </div>
    </div>
  );
}

function ConnectedAppsSummary() {
  const { connectors } = useHubStore();
  const connected = connectors.filter((c) => c.status === "connected");

  if (connected.length === 0) {
    return (
      <div className="text-center">
        <Plug className="mx-auto h-7 w-7 text-zinc-300" />
        <p className="mt-2 text-sm text-zinc-500">No apps connected yet</p>
        <Link
          href="/dashboard/connectors"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-500 hover:underline"
        >
          Add connectors
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {connected.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {c.name}
        </span>
      ))}
    </div>
  );
}
