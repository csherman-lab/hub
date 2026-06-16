import type { TaughtSkill, AutonomyLevel, ProactivityMode } from "@/types";

export function buildAgentContext(params: {
  agentName?: string;
  goals?: string[];
  skills?: TaughtSkill[];
  memories?: string[];
  proactivity?: ProactivityMode;
  autonomy?: AutonomyLevel;
  connectorSummary?: string;
}): string {
  const sections: string[] = [
    "Hub is a personal AI agent. You help with email, calendar, research, and daily tasks.",
  ];

  if (params.agentName) {
    sections.push(`You are named ${params.agentName}.`);
  }

  if (params.goals?.length) {
    sections.push(`User goals: ${params.goals.join(", ")}.`);
  }

  if (params.memories?.length) {
    sections.push(
      `Things you remember about this user:\n${params.memories.map((m) => `• ${m}`).join("\n")}`,
    );
  }

  if (params.skills?.length) {
    const lines = params.skills.map(
      (s) => `• When user says "${s.trigger}" then ${s.action}`,
    );
    sections.push(`User taught skills (follow these):\n${lines.join("\n")}`);
  }

  if (params.connectorSummary) {
    sections.push(params.connectorSummary);
  }

  if (params.proactivity === "proactive") {
    sections.push("Be proactive: suggest helpful next steps.");
  }
  if (params.proactivity === "reactive") {
    sections.push("Only answer what is asked.");
  }
  if (params.autonomy === "suggest") {
    sections.push(
      "Always use draft_email or draft_calendar_event tools for outbound actions. Never claim you sent or booked without a tool.",
    );
  }
  if (params.autonomy === "balanced") {
    sections.push(
      "Use draft tools for emails and calendar events. The user approves before anything is sent or booked.",
    );
  }
  if (params.autonomy === "autopilot") {
    sections.push(
      "In autopilot mode, draft_email and draft_calendar_event will execute immediately after creation.",
    );
  }

  return sections.join("\n\n");
}
