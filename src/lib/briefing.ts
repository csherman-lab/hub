import type { ActivityItem, Connector, PendingApproval, TaughtSkill } from "@/types";

export interface BriefingItem {
  text: string;
  href?: string;
}

export interface BriefingSection {
  id: string;
  title: string;
  items: BriefingItem[];
  emptyMessage?: string;
  href?: string;
}

export interface BriefingSnapshot {
  sections: BriefingSection[];
  hasContent: boolean;
}

export interface IntegrationBriefing {
  gmail: string | null;
  calendar: string | null;
}

export function buildBriefingSnapshot(params: {
  goals: string[];
  memories: string[];
  skills: TaughtSkill[];
  pendingApprovals: PendingApproval[];
  activities: ActivityItem[];
  connectors: Connector[];
  chatMessageCount: number;
  integration?: IntegrationBriefing;
}): BriefingSnapshot {
  const connected = params.connectors.filter((c) => c.status === "connected");
  const sections: BriefingSection[] = [];

  const statusItems: BriefingItem[] = [];

  if (params.pendingApprovals.length > 0) {
    statusItems.push({
      text: `${params.pendingApprovals.length} item${params.pendingApprovals.length === 1 ? "" : "s"} waiting for your approval`,
      href: "/dashboard",
    });
    for (const item of params.pendingApprovals.slice(0, 3)) {
      statusItems.push({ text: item.title });
    }
  } else {
    statusItems.push({ text: "Nothing waiting for approval" });
  }

  if (params.chatMessageCount > 0) {
    statusItems.push({
      text: `${params.chatMessageCount} chat message${params.chatMessageCount === 1 ? "" : "s"} in this session`,
      href: "/dashboard/chat",
    });
  }

  sections.push({
    id: "status",
    title: "Status",
    items: statusItems,
  });

  const appItems: BriefingItem[] = connected.map((c) => ({ text: `${c.name} connected` }));

  const gmailConnected = connected.some((c) => c.id === "gmail");
  const calendarConnected = connected.some((c) => c.id === "google_calendar");

  if (gmailConnected) {
    if (params.integration?.gmail) {
      for (const line of params.integration.gmail.split("\n").filter(Boolean)) {
        appItems.push({ text: line.replace(/^- /, "") });
      }
    } else {
      appItems.push({ text: "Gmail connected — inbox summary unavailable right now" });
    }
  }

  if (calendarConnected) {
    if (params.integration?.calendar) {
      for (const line of params.integration.calendar.split("\n").filter(Boolean)) {
        appItems.push({ text: line.replace(/^- /, "") });
      }
    } else {
      appItems.push({ text: "Calendar connected — schedule summary unavailable right now" });
    }
  }

  sections.push({
    id: "apps",
    title: "Connected apps",
    items: appItems,
    emptyMessage: "No apps connected yet",
    href: "/dashboard/connectors",
  });

  if (params.goals.length > 0) {
    sections.push({
      id: "goals",
      title: "Your goals",
      items: params.goals.map((goal) => ({ text: goal })),
    });
  }

  if (params.memories.length > 0) {
    sections.push({
      id: "memories",
      title: "Memories",
      items: params.memories.slice(0, 4).map((memory) => ({ text: memory })),
      href: "/dashboard/settings",
    });
  }

  if (params.skills.length > 0) {
    sections.push({
      id: "skills",
      title: "Skills taught",
      items: params.skills.slice(0, 4).map((skill) => ({
        text: `When you say "${skill.trigger}" → ${skill.action}`,
      })),
      href: "/dashboard/skills",
    });
  }

  const recentActivities = params.activities.filter(
    (a) => a.title !== "Welcome to Hub",
  );
  if (recentActivities.length > 0) {
    sections.push({
      id: "recent",
      title: "Recent activity",
      items: recentActivities.slice(0, 4).map((activity) => ({
        text: activity.detail ? `${activity.title} — ${activity.detail}` : activity.title,
      })),
    });
  }

  const hasContent =
    params.pendingApprovals.length > 0 ||
    connected.length > 0 ||
    params.goals.length > 0 ||
    params.memories.length > 0 ||
    params.skills.length > 0 ||
    recentActivities.length > 0 ||
    params.chatMessageCount > 0 ||
    Boolean(params.integration?.gmail) ||
    Boolean(params.integration?.calendar);

  return { sections, hasContent };
}

export function getBriefingEmptyMessage(avatarName: string): string {
  return `${avatarName} is set up and ready. Connect Gmail or Calendar, teach a skill, or start a chat to build your briefing from real activity — nothing is invented here.`;
}
