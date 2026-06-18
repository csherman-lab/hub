import { NextRequest, NextResponse } from "next/server";
import type { ConnectorId } from "@/types";
import { fetchCalendarSummary, fetchGmailSummary } from "@/lib/tools/integrations";

const INTEGRATION_CONNECTORS = new Set<ConnectorId>(["gmail", "google_calendar"]);

function parseIntegrationLines(summary: string | null): string | null {
  if (!summary) return null;
  return summary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.endsWith(":"))
    .join("\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const connectedConnectorIds: ConnectorId[] = Array.isArray(body.connectedConnectorIds)
    ? body.connectedConnectorIds.filter((id: string) => INTEGRATION_CONNECTORS.has(id as ConnectorId))
    : [];

  const fetchGmail = connectedConnectorIds.includes("gmail");
  const fetchCalendar = connectedConnectorIds.includes("google_calendar");

  if (!fetchGmail && !fetchCalendar) {
    return NextResponse.json({
      integration: { gmail: null, calendar: null },
      mode: "factual",
    });
  }

  const [gmailRaw, calendarRaw] = await Promise.all([
    fetchGmail ? fetchGmailSummary() : Promise.resolve(null),
    fetchCalendar ? fetchCalendarSummary() : Promise.resolve(null),
  ]);

  return NextResponse.json({
    integration: {
      gmail: fetchGmail ? parseIntegrationLines(gmailRaw) : null,
      calendar: fetchCalendar ? parseIntegrationLines(calendarRaw) : null,
    },
    mode: "factual",
  });
}

export async function GET() {
  return POST(
    new NextRequest("http://local/api/briefing", {
      method: "POST",
      body: JSON.stringify({ connectedConnectorIds: [] }),
    }),
  );
}
