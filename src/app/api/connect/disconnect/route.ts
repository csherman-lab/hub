import { NextRequest, NextResponse } from "next/server";
import { deleteConnectorTokens } from "@/lib/connectors/tokens";
import type { ConnectorId } from "@/types";

const VALID_IDS: ConnectorId[] = [
  "gmail",
  "google_calendar",
  "slack",
  "openai",
  "anthropic",
  "web_search",
  "telegram",
];

export async function POST(req: NextRequest) {
  const { connectorId } = await req.json();

  if (!VALID_IDS.includes(connectorId)) {
    return NextResponse.json({ error: "Invalid connector" }, { status: 400 });
  }

  await deleteConnectorTokens(connectorId);
  return NextResponse.json({ success: true });
}
