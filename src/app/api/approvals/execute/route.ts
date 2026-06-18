import { NextRequest, NextResponse } from "next/server";
import {
  createCalendarEventFromDraft,
  sendGmailDraft,
} from "@/lib/tools/execute";

export async function POST(req: NextRequest) {
  try {
    const { type, draft } = await req.json();
    if (!draft) {
      return NextResponse.json({ error: "Draft required" }, { status: 400 });
    }

    let result: { ok: boolean; message: string };
    if (type === "email") {
      result = await sendGmailDraft(draft);
    } else if (type === "calendar") {
      result = await createCalendarEventFromDraft(draft);
    } else {
      result = { ok: true, message: "Draft saved locally" };
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
