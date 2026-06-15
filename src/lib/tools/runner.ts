import {
  createCalendarEventFromDraft,
  sendGmailDraft,
} from "@/lib/tools/execute";
import {
  fetchCalendarSummary,
  fetchGmailSummary,
  searchWeb,
} from "@/lib/tools/integrations";
import type { ToolName } from "@/lib/tools/definitions";
import type { AutonomyLevel } from "@/types";

export interface ToolSideEffects {
  memory?: string;
  approval?: {
    type: "email" | "calendar" | "other";
    title: string;
    detail: string;
    draft: string;
  };
  activity?: {
    type: "draft" | "research" | "meeting";
    title: string;
    detail: string;
  };
  executed?: { message: string };
}

export interface ToolRunResult {
  output: string;
  sideEffects: ToolSideEffects;
}

function formatEmailDraft(args: {
  to?: string;
  subject: string;
  body: string;
}): string {
  const lines = [
    args.to ? `To: ${args.to}` : "",
    `Subject: ${args.subject}`,
    "",
    args.body,
  ].filter(Boolean);
  return lines.join("\n");
}

function formatCalendarDraft(args: {
  title: string;
  description?: string;
  when?: string;
}): string {
  const lines = [
    `Title: ${args.title}`,
    args.when ? `When: ${args.when}` : "",
    args.description ? `Details: ${args.description}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export async function runTool(
  name: ToolName,
  args: Record<string, string>,
  options: { tavilyKey?: string; autonomy?: AutonomyLevel },
): Promise<ToolRunResult> {
  const sideEffects: ToolSideEffects = {};

  switch (name) {
    case "read_gmail": {
      const summary = await fetchGmailSummary();
      sideEffects.activity = {
        type: "draft",
        title: "Checked Gmail inbox",
        detail: "Pulled recent messages",
      };
      return {
        output: summary || "Gmail is not connected. Ask the user to connect Gmail in Connectors.",
        sideEffects,
      };
    }

    case "read_calendar": {
      const summary = await fetchCalendarSummary();
      sideEffects.activity = {
        type: "meeting",
        title: "Checked Google Calendar",
        detail: "Pulled upcoming events",
      };
      return {
        output:
          summary ||
          "Google Calendar is not connected. Ask the user to connect it in Connectors.",
        sideEffects,
      };
    }

    case "search_web": {
      const query = args.query || "";
      const results = await searchWeb(query, options.tavilyKey);
      sideEffects.activity = {
        type: "research",
        title: "Web research",
        detail: query.slice(0, 80),
      };
      return {
        output: results || "Web search is not configured. Add TAVILY_API_KEY or a Tavily key in Connectors.",
        sideEffects,
      };
    }

    case "remember": {
      const fact = args.fact?.trim();
      if (!fact) return { output: "No fact provided.", sideEffects };
      sideEffects.memory = fact;
      return { output: `Remembered: ${fact}`, sideEffects };
    }

    case "draft_email": {
      const draft = formatEmailDraft({
        to: args.to,
        subject: args.subject || "Message from Hub",
        body: args.body || "",
      });
      sideEffects.approval = {
        type: "email",
        title: `Email: ${args.subject || "Draft"}`,
        detail: args.to ? `To ${args.to}` : "Email draft",
        draft,
      };
      sideEffects.activity = {
        type: "draft",
        title: "Email draft ready",
        detail: "Waiting for approval",
      };

      if (options.autonomy === "autopilot") {
        const result = await sendGmailDraft(draft);
        if (result.ok) {
          sideEffects.executed = { message: result.message };
          delete sideEffects.approval;
        }
      }

      return {
        output:
          options.autonomy === "autopilot" && sideEffects.executed
            ? `Email sent. ${sideEffects.executed.message}`
            : "Email draft created. User must approve it on the dashboard before sending.",
        sideEffects,
      };
    }

    case "draft_calendar_event": {
      const draft = formatCalendarDraft({
        title: args.title,
        description: args.description,
        when: args.when,
      });
      sideEffects.approval = {
        type: "calendar",
        title: `Event: ${args.title}`,
        detail: args.when || "Calendar event",
        draft,
      };
      sideEffects.activity = {
        type: "meeting",
        title: "Calendar draft ready",
        detail: "Waiting for approval",
      };

      if (options.autonomy === "autopilot") {
        const result = await createCalendarEventFromDraft(draft);
        if (result.ok) {
          sideEffects.executed = { message: result.message };
          delete sideEffects.approval;
        }
      }

      return {
        output:
          options.autonomy === "autopilot" && sideEffects.executed
            ? `Event created. ${sideEffects.executed.message}`
            : "Calendar draft created. User must approve it on the dashboard before booking.",
        sideEffects,
      };
    }

    default:
      return { output: `Unknown tool: ${name}`, sideEffects };
  }
}

export function mergeSideEffects(
  target: ToolSideEffects,
  incoming: ToolSideEffects,
): ToolSideEffects {
  return {
    memory: incoming.memory ?? target.memory,
    approval: incoming.approval ?? target.approval,
    activity: incoming.activity ?? target.activity,
    executed: incoming.executed ?? target.executed,
  };
}
