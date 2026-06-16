import { NextResponse } from "next/server";
import { getServerXaiApiKey, verifyXaiKey } from "@/lib/xai";

export async function GET() {
  const apiKey = await getServerXaiApiKey();
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
    // Key is stored — don't block setup if x.ai verification is slow or offline.
    return NextResponse.json({
      configured: true,
      chat: true,
      voice: false,
    });
  }
}
