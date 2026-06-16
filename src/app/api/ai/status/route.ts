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
    const verify = verifyXaiKey(apiKey);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 4000),
    );
    const { chat, voice } = await Promise.race([verify, timeout]);
    return NextResponse.json({ configured: true, chat, voice });
  } catch {
    // Key is stored — unblock onboarding even if x.ai is slow or offline.
    return NextResponse.json({
      configured: true,
      chat: true,
      voice: false,
    });
  }
}
