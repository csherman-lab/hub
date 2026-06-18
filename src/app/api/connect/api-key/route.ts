import { NextRequest, NextResponse } from "next/server";
import { verifyXaiKey } from "@/lib/xai";
import {
  deleteConnectorApiKey,
  setConnectorApiKey,
} from "@/lib/connectors/tokens";
import type { ConnectorId } from "@/types";

const API_KEY_CONNECTORS: ConnectorId[] = [
  "xai",
  "openai",
  "anthropic",
  "web_search",
  "telegram",
];

export async function POST(req: NextRequest) {
  const { connectorId, apiKey } = await req.json();

  if (!connectorId || !apiKey?.trim()) {
    return NextResponse.json({ error: "Connector and key required" }, { status: 400 });
  }

  if (!API_KEY_CONNECTORS.includes(connectorId as ConnectorId)) {
    return NextResponse.json({ error: "Invalid connector" }, { status: 400 });
  }

  const key = apiKey.trim();

  if (connectorId === "xai") {
    try {
      const verify = verifyXaiKey(key);
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 6000),
      );
      const { chat } = await Promise.race([verify, timeout]);
      if (!chat) {
        return NextResponse.json(
          { error: "Could not verify Grok key. Check and try again." },
          { status: 422 },
        );
      }
    } catch (error) {
      if (!key.startsWith("xai-")) {
        return NextResponse.json(
          { error: "Invalid Grok key format. Keys start with xai-" },
          { status: 422 },
        );
      }
      // Network timeout — save key so onboarding can continue; chat verifies later.
      if (error instanceof Error && error.message !== "timeout") {
        return NextResponse.json(
          { error: "Could not verify Grok key. Check and try again." },
          { status: 422 },
        );
      }
    }
  }

  await setConnectorApiKey(connectorId as ConnectorId, key);

  return NextResponse.json({ ok: true, connectorId });
}

export async function DELETE(req: NextRequest) {
  const { connectorId } = await req.json();
  if (!connectorId) {
    return NextResponse.json({ error: "Connector required" }, { status: 400 });
  }
  await deleteConnectorApiKey(connectorId as ConnectorId);
  return NextResponse.json({ ok: true });
}
