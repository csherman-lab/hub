import { NextResponse } from "next/server";
import { getXaiApiKey, verifyXaiKey } from "@/lib/xai";

export async function GET() {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      chat: false,
      voice: false,
    });
  }

  try {
    const { chat, voice } = await verifyXaiKey(apiKey);
    return NextResponse.json({ configured: true, chat, voice });
  } catch {
    return NextResponse.json({
      configured: true,
      chat: false,
      voice: false,
    });
  }
}
