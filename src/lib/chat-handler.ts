import { buildAgentContext } from "@/lib/agent-context";
import { sanitizeReply } from "@/lib/chat-utils";
import { HUB_TOOLS, TOOL_LABELS, type ToolName } from "@/lib/tools/definitions";
import { mergeSideEffects, runTool, type ToolSideEffects } from "@/lib/tools/runner";
import {
  getXaiApiKey,
  grokChat,
  grokChatStream,
  type GrokMessage,
} from "@/lib/xai";
import type {
  AutonomyLevel,
  AvatarEmotion,
  ProactivityMode,
  TaughtSkill,
} from "@/types";

const MAX_TOOL_ROUNDS = 4;

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
  executed?: string;
}

export type StreamEvent =
  | { type: "tool_start"; tool: string; label: string }
  | { type: "tool_done"; tool: string }
  | { type: "token"; text: string }
  | { type: "done"; result: ChatResult }
  | { type: "error"; message: string };

type ToolEventHandler = (event: { type: "start" | "done"; tool: string; label?: string }) => void;

function buildSystemPrompt(req: ChatRequest): string {
  return `You are ${req.agentName || "an AI assistant"} on Hub.
${req.personality || ""}

${buildAgentContext({
  agentName: req.agentName,
  goals: req.goals,
  skills: req.skills,
  memories: req.memories,
  proactivity: req.proactivity,
  autonomy: req.autonomy,
})}

You have tools to read Gmail, read Calendar, search the web, remember facts, and create drafts.
- Use tools when you need live data or to take action.
- For email/calendar drafts, use draft_email or draft_calendar_event tools — never claim you sent or booked without using those tools.
- Keep replies concise (1-3 sentences) unless the user asks for detail.
- Match the user's energy. Be warm and capable.`;
}

function inferEmotion(reply: string): AvatarEmotion {
  const lower = reply.toLowerCase();
  if (/sorry|unfortunately|can't|issue|problem/.test(lower)) return "empathetic";
  if (/\?|wondering|let me|checking|looking/.test(lower)) return "thinking";
  if (/great|done|sent|booked|ready|perfect|happy/.test(lower)) return "happy";
  return "neutral";
}

function sideEffectsToResult(
  effects: ToolSideEffects,
  reply: string,
  mode: "grok" | "mock",
): ChatResult {
  const result: ChatResult = {
    reply: sanitizeReply(reply),
    emotion: inferEmotion(reply),
    mode,
  };
  if (effects.memory) result.memory = effects.memory;
  if (effects.approval) result.approval = effects.approval;
  if (effects.activity) result.activity = effects.activity;
  if (effects.executed) result.executed = effects.executed.message;
  return result;
}

async function runToolLoop(
  req: ChatRequest,
  apiKey: string,
  onTool?: ToolEventHandler,
): Promise<{ messages: GrokMessage[]; sideEffects: ToolSideEffects }> {
  const systemPrompt = buildSystemPrompt(req);
  const messages: GrokMessage[] = [
    ...(req.history || []).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: req.message },
  ];

  let sideEffects: ToolSideEffects = {};

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await grokChat({
      apiKey,
      systemPrompt,
      messages,
      tools: HUB_TOOLS,
    });

    if (!response.tool_calls?.length) {
      messages.push(response);
      return { messages, sideEffects };
    }

    messages.push(response);

    for (const call of response.tool_calls) {
      const name = call.function.name as ToolName;
      onTool?.({ type: "start", tool: name, label: TOOL_LABELS[name] });

      let args: Record<string, string> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        args = {};
      }

      const { output, sideEffects: toolEffects } = await runTool(name, args, {
        tavilyKey: req.tavilyKey,
        autonomy: req.autonomy,
      });
      sideEffects = mergeSideEffects(sideEffects, toolEffects);

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name,
        content: output,
      });
      onTool?.({ type: "done", tool: name });
    }
  }

  return { messages, sideEffects };
}

export async function runChat(req: ChatRequest): Promise<ChatResult> {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    const mock = mockResponse(req.message);
    return { ...mock, mode: "mock" };
  }

  const { messages, sideEffects } = await runToolLoop(req, apiKey);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  let reply = lastAssistant?.content?.trim() || "";

  if (!reply) {
    const systemPrompt = buildSystemPrompt(req);
    const streamed = await grokChat({
      apiKey,
      systemPrompt,
      messages,
    });
    reply = streamed.content || "Done.";
  }

  return sideEffectsToResult(sideEffects, reply, "grok");
}

export async function* runChatStream(req: ChatRequest): AsyncGenerator<StreamEvent> {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    const mock = mockResponse(req.message);
    for (const token of mock.reply.split(/(?=\s)/)) {
      yield { type: "token", text: token };
      await new Promise((r) => setTimeout(r, 16));
    }
    yield { type: "done", result: { ...mock, mode: "mock" } };
    return;
  }

  try {
    const toolEvents: StreamEvent[] = [];
    const { messages, sideEffects } = await runToolLoop(req, apiKey, (ev) => {
      if (ev.type === "start") {
        toolEvents.push({
          type: "tool_start",
          tool: ev.tool,
          label: ev.label || ev.tool,
        });
      } else {
        toolEvents.push({ type: "tool_done", tool: ev.tool });
      }
    });

    for (const ev of toolEvents) yield ev;

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    let fullReply = lastAssistant?.content?.trim() || "";
    const systemPrompt = buildSystemPrompt(req);

    if (fullReply) {
      for (const token of fullReply.split(/(?=\s)/)) {
        yield { type: "token", text: token };
        await new Promise((r) => setTimeout(r, 10));
      }
    } else {
      for await (const token of grokChatStream({
        apiKey,
        systemPrompt,
        messages,
      })) {
        fullReply += token;
        yield { type: "token", text: token };
      }
    }

    yield {
      type: "done",
      result: sideEffectsToResult(sideEffects, fullReply || "Done.", "grok"),
    };
  } catch (e) {
    yield { type: "error", message: String(e) };
  }
}
