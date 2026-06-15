import { NextResponse } from "next/server";
import { getConnectionStatus } from "@/lib/connectors/tokens";
import { getXaiApiKey } from "@/lib/xai";

export async function GET() {
  const connections = await getConnectionStatus();
  connections.xai = { connected: !!getXaiApiKey() };
  return NextResponse.json({ connections });
}
