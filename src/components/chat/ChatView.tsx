"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Copy, Check } from "lucide-react";
import Markdown from "react-markdown";
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
    skills,
    memories,
    proactivity,
    autonomy,
    apiKeys,
    addMessage,
    setEmotion,
    addActivity,
    addMemory,
    addPendingApproval,
    clearChatMessages,
  } = useHubStore();

  const avatar = getAvatarById(selectedAvatarId);
  const chatMessages = messages.filter(
    (m) => !m.channel || m.channel === "chat",
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const useStream = true;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading, streamingText]);

  if (!avatar) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    addMessage("user", text, "chat");
    setLoading(true);
    setStreamingText("");
    setEmotion("thinking");

    const history = [
      ...chatMessages.slice(-10),
      { role: "user" as const, content: text },
    ];

    const payload = {
      message: text,
      personality: avatar.personality,
      agentName: agentName || avatar.name,
      history,
      goals,
      skills,
      memories,
      proactivity,
      autonomy,
      tavilyKey: apiKeys.web_search,
    };

    try {
      if (useStream) {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";
        let finalData: Record<string, unknown> = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = JSON.parse(line.slice(6));
            if (data.type === "token") {
              fullText += data.text;
              setStreamingText(fullText);
            }
            if (data.type === "done") finalData = data;
            if (data.type === "error") throw new Error(data.message);
          }
        }

        const reply = (finalData.reply as string) || fullText;
        addMessage("assistant", reply, "chat");
        setEmotion((finalData.emotion as "happy") || "happy");
        applySideEffects(finalData);
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.reply) throw new Error(data.error);
        addMessage("assistant", data.reply, "chat");
        setEmotion(data.emotion || "happy");
        applySideEffects(data);
      }
    } catch {
      addMessage(
        "assistant",
        "I'm having trouble connecting. Check XAI_API_KEY in .env.local and restart.",
        "chat",
      );
      setEmotion("empathetic");
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  };

  const applySideEffects = (data: Record<string, unknown>) => {
    if (data.activity) {
      const a = data.activity as { type: string; title: string; detail: string };
      addActivity({
        type: a.type as "draft" | "research" | "meeting",
        title: a.title,
        detail: a.detail,
      });
    }
    if (data.memory && typeof data.memory === "string") {
      addMemory(data.memory);
    }
    if (data.approval) {
      const ap = data.approval as {
        type: "email" | "calendar" | "other";
        title: string;
        detail: string;
        draft: string;
      };
      addPendingApproval(ap);
      addActivity({
        type: "draft",
        title: ap.title,
        detail: "Waiting for your approval",
        needsApproval: true,
      });
    }
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col md:h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-4">
          <AvatarDisplay avatar={avatar} size="sm" emotion="neutral" />
          <div>
            <h1 className="font-semibold">{agentName || avatar.name}</h1>
            <p className="text-xs text-zinc-500">Text chat</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChatMessages}
          disabled={chatMessages.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        {chatMessages.length === 0 && !streamingText && (
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
                "group flex",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div className="relative max-w-[85%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Markdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-0 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                      }}
                    >
                      {msg.content}
                    </Markdown>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                </div>
                {msg.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="absolute -right-8 top-2 opacity-0 transition-opacity group-hover:opacity-100 text-zinc-400 hover:text-zinc-600"
                    aria-label="Copy"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-zinc-100 px-4 py-3 text-sm dark:bg-zinc-800">
                <Markdown>{streamingText}</Markdown>
              </div>
            </div>
          )}
          {loading && !streamingText && (
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
