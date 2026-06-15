import { NextRequest } from "next/server";
import { runChat } from "@/lib/chat-handler";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  if (!message) {
    return new Response(JSON.stringify({ error: "Message required" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runChat(body);
        const words = result.reply.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "token", text: chunk })}\n\n`,
            ),
          );
          await new Promise((r) => setTimeout(r, 28));
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done", ...result })}\n\n`,
          ),
        );
      } catch (e) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: String(e) })}\n\n`,
          ),
        );
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
