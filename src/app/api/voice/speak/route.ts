import { NextRequest, NextResponse } from "next/server";
import { getXaiApiKey, grokTts } from "@/lib/xai";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();
    const apiKey = getXaiApiKey();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "XAI_API_KEY not configured in .env.local" },
        { status: 503 },
      );
    }

    const audio = await grokTts({
      apiKey,
      text,
      voiceId: voiceId || "eve",
    });

    return new NextResponse(audio, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
