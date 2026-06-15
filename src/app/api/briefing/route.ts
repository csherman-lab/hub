import { NextResponse } from "next/server";
import { buildAgentContext } from "@/lib/agent-context";
import { fetchCalendarSummary, fetchGmailSummary } from "@/lib/tools/integrations";
import { getXaiApiKey, grokChat } from "@/lib/xai";

export async function GET() {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    return NextResponse.json({
      briefing:
        "Connect your xAI key in .env.local for a personalized morning briefing.",
      mode: "mock",
    });
  }

  const [gmail, calendar] = await Promise.all([
    fetchGmailSummary(),
    fetchCalendarSummary(),
  ]);

  const context = buildAgentContext({
    connectorSummary: [gmail, calendar].filter(Boolean).join("\n\n"),
  });

  const content = await grokChat({
    apiKey,
    systemPrompt: `You are a personal assistant giving a brief morning briefing (3-4 sentences max). Be warm and actionable.\n\n${context}`,
    messages: [
      {
        role: "user",
        content: `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Give my morning briefing.`,
      },
    ],
  });

  return NextResponse.json({ briefing: content, mode: "grok" });
}
