"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Trash2, Copy, Check, Download } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/Button";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { getAvatarById } from "@/lib/avatars";
import {
  applyChatSideEffects,
  inferToolActivity,
} from "@/lib/chat-side-effects";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  "Draft a professional email",
  "What's on my calendar this week?",
  "Research the latest AI agent trends",
  "Remember that I prefer concise replies",
];

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
    agentActivity,
    addMessage,
    setEmotion,
    addActivity,
    addMemory,
    addPendingApproval,
    clearChatMessages,
    setAgentActivity,
  } = useHubStore();

  const searchParams = useSearchParams();
  const avatar = getAvatarById(selectedAvatarId);
  const chatMessages = messages.filter(
    (m) => !m.channel || m.channel === "chat",
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prefilledSent = useRef(false);
  const useStream = true;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading, streamingText]);

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      setInput("");
      addMessage("user", text, "chat");
      setLoading(true);
      setStreamingText("");
      setEmotion("thinking");
      setAgentActivity(inferToolActivity(text));

      const history = [
        ...chatMessages.slice(-10),
        { role: "user" as const, content: text },
      ];

      const payload = {
        message: text,
        personality: avatar?.personality,
        agentName: agentName || avatar?.name,
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
          applyChatSideEffects(finalData, {
            addActivity,
            addMemory,
            addPendingApproval,
          });
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
          applyChatSideEffects(data, {
            addActivity,
            addMemory,
            addPendingApproval,
          });
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
        setAgentActivity(null);
      }
    },
    [
      input,
      loading,
      chatMessages,
      avatar,
      agentName,
      goals,
      skills,
      memories,
      proactivity,
      autonomy,
      apiKeys.web_search,
      addMessage,
      setEmotion,
      addActivity,
      addMemory,
      addPendingApproval,
      setAgentActivity,
    ],
  );

  useEffect(() => {
    const q = searchParams.get("q");
    if (!q || prefilledSent.current || !avatar) return;
    prefilledSent.current = true;
    setInput(q);
    const timer = setTimeout(() => sendMessage(q), 300);
    return () => clearTimeout(timer);
  }, [searchParams, avatar, sendMessage]);

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChat = () => {
    const lines = chatMessages.map(
      (m) =>
        `### ${m.role === "user" ? "You" : agentName || avatar?.name}\n${m.content}\n`,
    );
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hub-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!avatar) return null;

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col md:h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-4">
          <AvatarDisplay avatar={avatar} size="sm" emotion="neutral" />
          <div>
            <h1 className="font-semibold">{agentName || avatar.name}</h1>
            <p className="text-xs text-zinc-500">
              {agentActivity || "Text chat"}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportChat}
            disabled={chatMessages.length === 0}
            aria-label="Export chat"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatMessages}
            disabled={chatMessages.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
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
            <div className="mt-6 flex max-w-md flex-wrap justify-center gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => sendMessage(action)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-700"
                >
                  {action}
                </button>
              ))}
            </div>
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
                    className="absolute -right-8 top-2 text-zinc-400 opacity-0 transition-opacity hover:text-zinc-600 group-hover:opacity-100"
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
          <Button onClick={() => sendMessage()} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
