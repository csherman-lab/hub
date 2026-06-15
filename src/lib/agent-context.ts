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
      `Things you remember about this user:\n${params.memories.map((m) => `- ${m}`).join("\n")}`,
    );
  }

  if (params.skills?.length) {
    const lines = params.skills.map(
      (s) => `- When user says "${s.trigger}" → ${s.action}`,
    );
    sections.push(`User-taught skills (follow these):\n${lines.join("\n")}`);
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
      "Never claim you sent email or booked meetings — only draft or suggest.",
    );
  }
  if (params.autonomy === "autopilot") {
    sections.push("You may describe actions you would take automatically.");
  }

  return sections.join("\n\n");
}
