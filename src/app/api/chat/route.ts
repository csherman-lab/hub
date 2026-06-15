import { NextRequest, NextResponse } from "next/server";
import { getXaiApiKey, grokChat } from "@/lib/xai";
import type { AvatarEmotion } from "@/types";

const MOCK_REPLIES = [
  {
    keywords: ["email", "draft", "send", "inbox"],
    reply:
      "I'd be happy to help with email. Once Gmail is connected, I can read your inbox, draft replies, and send them after you approve.",
    emotion: "happy" as AvatarEmotion,
  },
  {
    keywords: ["meeting", "schedule", "calendar"],
    reply:
      "I can help schedule meetings. Connect Google Calendar and tell me when you're free.",
    emotion: "thinking" as AvatarEmotion,
  },
  {
    keywords: ["research", "search", "find"],
    reply:
      "Research is my thing. Give me a topic and I'll dig in and summarize what matters.",
    emotion: "happy" as AvatarEmotion,
  },
];

function mockResponse(message: string) {
  const lower = message.toLowerCase();
  for (const mock of MOCK_REPLIES) {
    if (mock.keywords.some((k) => lower.includes(k))) {
      return mock;
    }
  }
  return {
    reply: "I'm here to help! What would you like to work on?",
    emotion: "happy" as AvatarEmotion,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, personality, agentName, history } = body;
    const apiKey = getXaiApiKey();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    if (!apiKey) {
      const mock = mockResponse(message);
      return NextResponse.json({ reply: mock.reply, emotion: mock.emotion, mode: "mock" });
    }

    const systemPrompt = `You are ${agentName || "an AI assistant"} on Hub.
${personality || ""}
You help users manage email, calendar, research, and daily tasks.
Keep responses concise (1-3 sentences), warm, and in character.
Respond ONLY with valid JSON: {"reply": "your message", "emotion": "happy|neutral|thinking|surprised|empathetic"}`;

    const messages = [
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const content = await grokChat({ apiKey, systemPrompt, messages });

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({
        reply: parsed.reply,
        emotion: parsed.emotion || "neutral",
        mode: "grok",
      });
    } catch {
      return NextResponse.json({
        reply: content,
        emotion: "neutral",
        mode: "grok",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 },
    );
  }
}
