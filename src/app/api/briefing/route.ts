import { NextRequest, NextResponse } from "next/server";
import { buildAgentContext } from "@/lib/agent-context";
import { fetchCalendarSummary, fetchGmailSummary } from "@/lib/tools/integrations";
import { getXaiApiKey, grokChat } from "@/lib/xai";

export async function POST(req: NextRequest) {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    return NextResponse.json({
      briefing:
        "Add your xAI key to .env.local for a personalized morning briefing.",
      mode: "mock",
    });
  }

  const body = await req.json().catch(() => ({}));
  const { agentName, goals, memories } = body;

  const [gmail, calendar] = await Promise.all([
    fetchGmailSummary(),
    fetchCalendarSummary(),
  ]);

  const context = buildAgentContext({
    agentName,
    goals,
    memories,
    connectorSummary: [gmail, calendar].filter(Boolean).join("\n\n"),
  });

  const content = await grokChat({
    apiKey,
    systemPrompt: `You are ${agentName || "a personal assistant"} giving a brief, warm morning briefing in 3-4 sentences. Be actionable.\n\n${context}`,
    messages: [
      {
        role: "user",
        content: `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Give my morning briefing.`,
      },
    ],
  });

  return NextResponse.json({ briefing: content, mode: "grok" });
}

export async function GET() {
  return POST(
    new NextRequest("http://local/api/briefing", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  );
}
