import { NextResponse } from "next/server";
import { getConnectionStatus } from "@/lib/connectors/tokens";
import { getServerXaiApiKey } from "@/lib/xai";

export async function GET() {
  const connections = await getConnectionStatus();
  connections.xai = { connected: !!(await getServerXaiApiKey()) };
  return NextResponse.json({ connections });
}
