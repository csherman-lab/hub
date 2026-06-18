export const GOAL_LABELS: Record<string, string> = {
  email: "Email & calendar",
  research: "Research",
  writing: "Writing & drafts",
  slack: "Work (Slack)",
  life: "Personal life",
  everything: "Everything",
};

export function formatGoalLabel(id: string): string {
  return GOAL_LABELS[id] || id;
}
