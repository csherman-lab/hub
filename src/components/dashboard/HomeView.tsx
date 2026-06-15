"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Sun,
  Video,
  Phone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { GrokStatusBadge } from "@/components/ai/GrokStatusBadge";
import { FirstRunTips } from "@/components/dashboard/FirstRunTips";
import { ProactiveSuggestions } from "@/components/dashboard/ProactiveSuggestions";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { cn } from "@/lib/utils";
import type { ActivityItem, PendingApproval } from "@/types";

const ACTIVITY_ICONS: Record<ActivityItem["type"], typeof MessageSquare> = {
  draft: FileText,
  research: Search,
  meeting: Calendar,
  skill: CheckCircle2,
  message: MessageSquare,
};

export function HomeView() {
  const {
    selectedAvatarId,
    agentName,
    goals,
    memories,
    activities,
    pendingApprovals,
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

  const loadBriefing = useCallback(async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: agentName || avatar?.name,
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
  }, [agentName, avatar?.name, goals, memories]);

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

  const displayName = agentName || avatar.name;

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-10">
      <FirstRunTips />
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center bg-gradient-to-b from-zinc-50 to-white px-6 py-10 dark:from-zinc-900 dark:to-zinc-900">
          <AvatarDisplay avatar={avatar} size="lg" emotion="happy" />
          <h1 className="mt-6 text-2xl font-semibold">{displayName}</h1>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-500">
            <GrokStatusBadge />
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <span>{avatar.tagline}</span>
          </p>
          {goals.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {goals.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/chat">
              <Button size="lg">
                <MessageSquare className="h-5 w-5" />
                Text
              </Button>
            </Link>
            <Link href="/dashboard/call/voice">
              <Button size="lg" variant="secondary">
                <Phone className="h-5 w-5" />
                Call
              </Button>
            </Link>
            <Link href="/dashboard/call/video">
              <Button size="lg" variant="secondary">
                <Video className="h-5 w-5" />
                Video
              </Button>
            </Link>
          </div>
        </div>

        {/* Morning briefing */}
        <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Morning briefing
              </h2>
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
          {briefingLoading ? (
            <p className="mt-3 text-sm text-zinc-400">Preparing your briefing…</p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {briefing}
            </p>
          )}
        </div>

        {/* Approvals inbox */}
        {pendingApprovals.length > 0 && (
          <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-600">
              Needs your approval
            </h2>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.detail}</p>
                  <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-white p-3 text-xs whitespace-pre-wrap dark:bg-zinc-900">
                    {item.draft}
                  </pre>
                  <div className="mt-3 flex gap-2">
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
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Activity
          </h2>
          <div className="space-y-3">
            {activities.slice(0, 5).map((item) => {
              const Icon = ACTIVITY_ICONS[item.type];
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50"
                >
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      item.needsApproval
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-zinc-500">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
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
        </div>

        <ProactiveSuggestions />

        <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Connected apps
            </h2>
            <Link
              href="/dashboard/connectors"
              className="text-sm text-blue-500 hover:underline"
            >
              Manage
            </Link>
          </div>
          <ConnectedAppsSummary />
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
      <p className="mt-3 text-sm text-zinc-500">
        No apps connected yet.{" "}
        <Link href="/dashboard/connectors" className="text-blue-500">
          Add connectors
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {connected.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {c.name}
        </span>
      ))}
    </div>
  );
}
