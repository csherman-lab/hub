import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Plug,
  Sparkles,
} from "lucide-react";

export type StatKind = "approval" | "chat" | "skills" | "connectors";

export function getStatTileConfig(
  kind: StatKind,
  value: number,
): {
  icon: LucideIcon;
  iconClass: string;
  valueClass: string;
  cellClass: string;
  pulse: boolean;
} {
  switch (kind) {
    case "approval":
      if (value > 0) {
        return {
          icon: AlertCircle,
          iconClass:
            "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
          valueClass: "text-amber-600 dark:text-amber-400",
          cellClass: "bg-amber-50/60 dark:bg-amber-950/15",
          pulse: true,
        };
      }
      return {
        icon: CheckCircle2,
        iconClass:
          "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        valueClass: "text-emerald-600 dark:text-emerald-400",
        cellClass: "",
        pulse: false,
      };
    case "chat":
      return {
        icon: MessageSquare,
        iconClass:
          "bg-blue-100 text-blue-600 dark:bg-blue-900/45 dark:text-blue-400",
        valueClass: "text-blue-600 dark:text-blue-400",
        cellClass: value > 0 ? "bg-blue-50/40 dark:bg-blue-950/10" : "",
        pulse: false,
      };
    case "skills":
      return {
        icon: Sparkles,
        iconClass:
          "bg-violet-100 text-violet-600 dark:bg-violet-900/45 dark:text-violet-400",
        valueClass: "text-violet-600 dark:text-violet-400",
        cellClass: value > 0 ? "bg-violet-50/40 dark:bg-violet-950/10" : "",
        pulse: false,
      };
    case "connectors":
      if (value > 0) {
        return {
          icon: Plug,
          iconClass:
            "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/45 dark:text-emerald-400",
          valueClass: "text-emerald-600 dark:text-emerald-400",
          cellClass: "bg-emerald-50/50 dark:bg-emerald-950/15",
          pulse: false,
        };
      }
      return {
        icon: Plug,
        iconClass:
          "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
        valueClass: "text-zinc-500 dark:text-zinc-400",
        cellClass: "",
        pulse: false,
      };
  }
}

export const QUICK_ACTION_COLORS: Record<
  string,
  { icon: string; hover: string; arrow: string }
> = {
  "/dashboard/chat": {
    icon: "bg-blue-100 text-blue-600 group-hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:group-hover:bg-blue-900/60",
    hover: "group-hover:bg-blue-50/80 dark:group-hover:bg-blue-950/20",
    arrow: "group-hover:text-blue-500",
  },
  "/dashboard/call/voice": {
    icon: "bg-teal-100 text-teal-600 group-hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-400 dark:group-hover:bg-teal-900/60",
    hover: "group-hover:bg-teal-50/80 dark:group-hover:bg-teal-950/20",
    arrow: "group-hover:text-teal-500",
  },
  "/dashboard/call/video": {
    icon: "bg-rose-100 text-rose-600 group-hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:group-hover:bg-rose-900/60",
    hover: "group-hover:bg-rose-50/80 dark:group-hover:bg-rose-950/20",
    arrow: "group-hover:text-rose-500",
  },
  "/dashboard/skills": {
    icon: "bg-violet-100 text-violet-600 group-hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-400 dark:group-hover:bg-violet-900/60",
    hover: "group-hover:bg-violet-50/80 dark:group-hover:bg-violet-950/20",
    arrow: "group-hover:text-violet-500",
  },
  "/dashboard/connectors": {
    icon: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-900/60",
    hover: "group-hover:bg-emerald-50/80 dark:group-hover:bg-emerald-950/20",
    arrow: "group-hover:text-emerald-500",
  },
};

export const ACTIVITY_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  draft: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-600 dark:text-amber-400",
  },
  research: {
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-600 dark:text-sky-400",
  },
  meeting: {
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  skill: {
    bg: "bg-violet-100 dark:bg-violet-900/40",
    text: "text-violet-600 dark:text-violet-400",
  },
  message: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
  },
};
