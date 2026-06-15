"use client";

import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Search,
  Video,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const ACTIVITY_ICONS: Record<ActivityItem["type"], typeof MessageSquare> = {
  draft: FileText,
  research: Search,
  meeting: Calendar,
  skill: CheckCircle2,
  message: MessageSquare,
};

export function HomeView() {
  const { selectedAvatarId, agentName, activities } = useHubStore();
  const avatar = getAvatarById(selectedAvatarId);

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
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center bg-gradient-to-b from-zinc-50 to-white px-6 py-10 dark:from-zinc-900 dark:to-zinc-900">
          <AvatarDisplay avatar={avatar} size="lg" emotion="happy" />
          <h1 className="mt-6 text-2xl font-semibold">{displayName}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Online · {avatar.tagline}
          </p>

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

        <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Connected apps
            </h2>
            <Link
              href="/dashboard/connections"
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
        <Link href="/dashboard/connections" className="text-blue-500">
          Add connections
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
