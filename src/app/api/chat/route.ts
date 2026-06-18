import { NextRequest, NextResponse } from "next/server";
import { runChat } from "@/lib/chat-handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const result = await runChat(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 },
    );
  }
}
