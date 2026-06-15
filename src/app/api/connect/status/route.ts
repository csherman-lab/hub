import { NextResponse } from "next/server";
import { getConnectionStatus } from "@/lib/connectors/tokens";

export async function GET() {
  const status = await getConnectionStatus();
  return NextResponse.json({ connections: status });
}
