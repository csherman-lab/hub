import type { HubState } from "@/types";

type ActivityInput = {
  type: "draft" | "research" | "meeting";
  title: string;
  detail: string;
  needsApproval?: boolean;
};

type ApprovalInput = {
  type: "email" | "calendar" | "other";
  title: string;
  detail: string;
  draft: string;
};

export function applyChatSideEffects(
  data: Record<string, unknown>,
  actions: {
    addActivity: (a: ActivityInput) => void;
    addMemory: (text: string) => void;
    addPendingApproval: (a: ApprovalInput) => void;
    onExecuted?: (message: string) => void;
  },
) {
  if (data.activity) {
    const a = data.activity as ActivityInput;
    actions.addActivity(a);
  }
  if (data.memory && typeof data.memory === "string") {
    actions.addMemory(data.memory);
  }
  if (data.approval) {
    const ap = data.approval as ApprovalInput;
    actions.addPendingApproval(ap);
    actions.addActivity({
      type: "draft",
      title: ap.title,
      detail: "Waiting for your approval",
      needsApproval: true,
    });
  }
  if (data.executed && typeof data.executed === "string") {
    actions.onExecuted?.(data.executed);
    actions.addActivity({
      type: "draft",
      title: "Action completed",
      detail: data.executed,
    });
  }
}

export function applyChatResult(
  result: {
    activity?: ActivityInput;
    memory?: string;
    approval?: ApprovalInput;
    executed?: string;
  },
  actions: {
    addActivity: (a: ActivityInput) => void;
    addMemory: (text: string) => void;
    addPendingApproval: (a: ApprovalInput) => void;
    onExecuted?: (message: string) => void;
  },
) {
  if (result.activity) actions.addActivity(result.activity);
  if (result.memory) actions.addMemory(result.memory);
  if (result.approval) {
    actions.addPendingApproval(result.approval);
    actions.addActivity({
      type: "draft",
      title: result.approval.title,
      detail: "Waiting for your approval",
      needsApproval: true,
    });
  }
  if (result.executed) {
    actions.onExecuted?.(result.executed);
    actions.addActivity({
      type: "draft",
      title: "Action completed",
      detail: result.executed,
    });
  }
}

export function inferToolActivity(message: string): string | null {
  const lower = message.toLowerCase();
  if (/email|inbox|gmail|draft/.test(lower)) return "Checking Gmail…";
  if (/calendar|meeting|schedule/.test(lower)) return "Checking Calendar…";
  if (/research|search|find|look up/.test(lower)) return "Searching the web…";
  return "Thinking…";
}
