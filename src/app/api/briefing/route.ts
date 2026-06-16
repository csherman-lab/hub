import { NextRequest, NextResponse } from "next/server";
import { buildAgentContext } from "@/lib/agent-context";
import { fetchCalendarSummary, fetchGmailSummary } from "@/lib/tools/integrations";
import { getServerXaiApiKey, grokChat, extractGrokContent } from "@/lib/xai";

export async function POST(req: NextRequest) {
  const apiKey = await getServerXaiApiKey();
  if (!apiKey) {
    return NextResponse.json({
      briefing:
        "Good morning! Connect Grok in Settings to unlock your personalized daily briefing.",
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

  const message = await grokChat({
    apiKey,
    systemPrompt: `You are ${agentName || "a personal assistant"} giving a brief, warm morning briefing in 3-4 sentences. Be actionable.\n\n${context}`,
    messages: [
      {
        role: "user",
        content: `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Give my morning briefing.`,
      },
    ],
  });

  const briefing =
    extractGrokContent(message) ||
    "Good morning! Open chat to plan your day with your agent.";

  return NextResponse.json({ briefing, mode: "grok" });
}

export async function GET() {
  return POST(
    new NextRequest("http://local/api/briefing", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  );
}
