import { buildAgentContext } from "@/lib/agent-context";
import { parseGrokJson, sanitizeReply } from "@/lib/chat-utils";
import { gatherToolContext } from "@/lib/tools/integrations";
import { getXaiApiKey, grokChat } from "@/lib/xai";
import type {
  AutonomyLevel,
  AvatarEmotion,
  ProactivityMode,
  TaughtSkill,
} from "@/types";

const MOCK_REPLIES = [
  {
    keywords: ["email", "draft", "send", "inbox"],
    reply:
      "I'd be happy to help with email. Connect Gmail in Connectors and I can read your inbox and draft replies.",
    emotion: "happy" as AvatarEmotion,
  },
  {
    keywords: ["meeting", "schedule", "calendar"],
    reply:
      "Connect Google Calendar and tell me when you're free — I'll help schedule.",
    emotion: "thinking" as AvatarEmotion,
  },
  {
    keywords: ["research", "search", "find"],
    reply:
      "Give me a topic and I'll research it. Add a Tavily key under Connectors for live web search.",
    emotion: "happy" as AvatarEmotion,
  },
];

function mockResponse(message: string) {
  const lower = message.toLowerCase();
  for (const mock of MOCK_REPLIES) {
    if (mock.keywords.some((k) => lower.includes(k))) return mock;
  }
  return {
    reply: "I'm here to help! What would you like to work on?",
    emotion: "happy" as AvatarEmotion,
  };
}

export interface ChatRequest {
  message: string;
  personality?: string;
  agentName?: string;
  history?: { role: string; content: string }[];
  goals?: string[];
  skills?: TaughtSkill[];
  memories?: string[];
  proactivity?: ProactivityMode;
  autonomy?: AutonomyLevel;
  tavilyKey?: string;
}

export interface ChatResult {
  reply: string;
  emotion: AvatarEmotion;
  mode: "grok" | "mock";
  activity?: { type: "draft" | "research" | "meeting"; title: string; detail: string };
  approval?: { type: "email" | "calendar" | "other"; title: string; detail: string; draft: string };
  memory?: string;
}

export async function runChat(req: ChatRequest): Promise<ChatResult> {
  const {
    message,
    personality,
    agentName,
    history,
    goals,
    skills,
    memories,
    proactivity,
    autonomy,
    tavilyKey,
  } = req;

  const apiKey = getXaiApiKey();
  if (!apiKey) {
    const mock = mockResponse(message);
    return { ...mock, mode: "mock" };
  }

  const { context: toolContext, activity } = await gatherToolContext(
    message,
    tavilyKey,
  );

  const systemPrompt = `You are ${agentName || "an AI assistant"} on Hub.
${personality || ""}

${buildAgentContext({ agentName, goals, skills, memories, proactivity, autonomy, connectorSummary: toolContext })}

Rules:
- Reply in plain conversational text inside JSON "reply" only.
- ONE short paragraph max. Never repeat sentences.
- If drafting email or scheduling, put the draft in "draft" field for user approval.
- If user asks you to remember something, set "memory" to a short fact string.

Respond ONLY with valid JSON:
{"reply":"message","emotion":"happy|neutral|thinking|surprised|empathetic","draft":null,"memory":null}`;

  const messages = [
    ...(history || []).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  const content = await grokChat({ apiKey, systemPrompt, messages });

  try {
    const parsed = parseGrokJson<{
      reply: string;
      emotion?: AvatarEmotion;
      draft?: string | null;
      memory?: string | null;
    }>(content);

    const reply = sanitizeReply(parsed.reply || content);
    const result: ChatResult = {
      reply,
      emotion: parsed.emotion || "neutral",
      mode: "grok",
      activity,
    };

    if (parsed.memory?.trim()) {
      result.memory = parsed.memory.trim();
    }

    if (parsed.draft?.trim() && autonomy !== "autopilot") {
      const isEmail = /email|mail|inbox/i.test(message);
      result.approval = {
        type: isEmail ? "email" : "other",
        title: isEmail ? "Email draft ready" : "Draft ready for approval",
        detail: message.slice(0, 100),
        draft: parsed.draft.trim(),
      };
      result.reply = `${reply} I've prepared a draft — check your approval inbox on the dashboard.`;
    }

    return result;
  } catch {
    return {
      reply: sanitizeReply(content),
      emotion: "neutral",
      mode: "grok",
      activity,
    };
  }
}
