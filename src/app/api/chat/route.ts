import { NextRequest, NextResponse } from "next/server";
import type { AvatarEmotion } from "@/types";

const MOCK_REPLIES = [
  {
    keywords: ["email", "draft", "send", "inbox"],
    reply:
      "I'd be happy to help with email. Once Gmail is connected, I can read your inbox, draft replies, and send them after you approve. Want me to walk you through connecting Gmail?",
    emotion: "happy" as AvatarEmotion,
    activity: {
      type: "draft" as const,
      title: "Email assistance ready",
      detail: "Connect Gmail to start managing your inbox.",
      needsApproval: false,
    },
  },
  {
    keywords: ["meeting", "schedule", "calendar"],
    reply:
      "I can help schedule meetings. Connect Google Calendar and tell me who you'd like to meet with and when you're free — I'll find a time and send the invite.",
    emotion: "thinking" as AvatarEmotion,
    activity: {
      type: "meeting" as const,
      title: "Calendar scheduling",
      detail: "Connect Google Calendar to enable scheduling.",
      needsApproval: true,
    },
  },
  {
    keywords: ["research", "search", "find", "look up"],
    reply:
      "Research is one of my strengths. Add a web search API key (Tavily recommended) and I'll search, summarize, and cite sources for you.",
    emotion: "happy" as AvatarEmotion,
    activity: {
      type: "research" as const,
      title: "Research request noted",
      detail: "Connect web search to enable live research.",
    },
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
    reply:
      "I'm here to help! I can manage email, schedule meetings, research topics, and learn skills you teach me. What would you like to work on?",
    emotion: "happy" as AvatarEmotion,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, apiKey, personality, agentName, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    if (!apiKey) {
      const mock = mockResponse(message);
      return NextResponse.json({
        reply: mock.reply,
        emotion: mock.emotion,
        activity: "activity" in mock ? mock.activity : undefined,
        mode: "mock",
      });
    }

    const systemPrompt = `You are ${agentName || "an AI assistant"} on the Hub platform.
${personality || ""}
You help users manage email, calendar, research, and daily tasks.
Keep responses concise, warm, and actionable. Use plain English.
If asked to send email or schedule meetings, mention whether approval is needed based on user settings.
Respond with JSON only in this format: {"reply": "your message", "emotion": "happy|neutral|thinking|surprised|empathetic"}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "OpenAI API error", detail: err },
        { status: res.status },
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({
        reply: parsed.reply,
        emotion: parsed.emotion || "neutral",
        mode: "live",
      });
    } catch {
      return NextResponse.json({
        reply: content,
        emotion: "neutral",
        mode: "live",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 },
    );
  }
}
