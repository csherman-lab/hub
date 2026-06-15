"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ChatView() {
  const {
    selectedAvatarId,
    agentName,
    messages,
    goals,
    proactivity,
    autonomy,
    addMessage,
    setEmotion,
  } = useHubStore();

  const avatar = getAvatarById(selectedAvatarId);
  const chatMessages = messages.filter(
    (m) => !m.channel || m.channel === "chat",
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  if (!avatar) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    addMessage("user", text, "chat");
    setLoading(true);
    setEmotion("thinking");

    const history = [
      ...chatMessages.slice(-10),
      { role: "user" as const, content: text },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          personality: avatar.personality,
          agentName: agentName || avatar.name,
          history,
          goals,
          proactivity,
          autonomy,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "No reply");
      }

      addMessage("assistant", data.reply, "chat");
      setEmotion(data.emotion || "happy");
    } catch {
      addMessage(
        "assistant",
        "I'm having trouble connecting right now. Check XAI_API_KEY in .env.local and restart the server.",
        "chat",
      );
      setEmotion("empathetic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col md:h-screen">
      <header className="flex items-center gap-4 border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <AvatarDisplay avatar={avatar} size="sm" emotion="neutral" />
        <div>
          <h1 className="font-semibold">{agentName || avatar.name}</h1>
          <p className="text-xs text-zinc-500">Text chat</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        {chatMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <AvatarDisplay avatar={avatar} size="md" emotion="happy" />
            <p className="mt-4 text-lg font-medium">
              Hey! I&apos;m {agentName || avatar.name}.
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              Ask me to draft an email, research something, or schedule a meeting.
            </p>
          </div>
        )}

        <div className="mx-auto max-w-2xl space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Message your agent..."
            className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
