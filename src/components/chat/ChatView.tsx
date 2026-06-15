"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Trash2, Copy, Check, Download, RotateCcw } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/Button";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { getAvatarById } from "@/lib/avatars";
import {
  applyChatResult,
  inferToolActivity,
} from "@/lib/chat-side-effects";
import { useHubStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  "Draft a professional email",
  "What's on my calendar this week?",
  "Research the latest AI agent trends",
  "Remember that I prefer concise replies",
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

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
    removeLastAssistantMessage,
    setAgentActivity,
  } = useHubStore();
  const pushToast = useToastStore((s) => s.push);

  const searchParams = useSearchParams();
  const avatar = getAvatarById(selectedAvatarId);
  const chatMessages = messages.filter(
    (m) => !m.channel || m.channel === "chat",
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prefilledSent = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading, streamingText, toolStatus]);

  const sideEffectActions = {
    addActivity,
    addMemory,
    addPendingApproval,
    onExecuted: (msg: string) => pushToast(msg, "success"),
  };

  const sendMessage = useCallback(
    async (textOverride?: string, options?: { skipUserMessage?: boolean }) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      if (!options?.skipUserMessage) {
        setInput("");
        addMessage("user", text, "chat");
      }

      setLoading(true);
      setStreamingText("");
      setToolStatus(null);
      setEmotion("thinking");
      setAgentActivity(inferToolActivity(text));

      const freshChat = useHubStore
        .getState()
        .messages.filter((m) => !m.channel || m.channel === "chat");
      const history = freshChat
        .slice(0, options?.skipUserMessage ? undefined : -1)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = JSON.parse(line.slice(6));

            if (data.type === "tool_start") {
              setToolStatus(data.label);
              setAgentActivity(data.label);
            }
            if (data.type === "tool_done") {
              setToolStatus(null);
            }
            if (data.type === "token") {
              fullText += data.text;
              setStreamingText(fullText);
              setToolStatus(null);
            }
            if (data.type === "done") {
              const result = data.result;
              const reply = result.reply || fullText;
              addMessage("assistant", reply, "chat");
              setEmotion(result.emotion || "happy");
              applyChatResult(result, sideEffectActions);
            }
            if (data.type === "error") throw new Error(data.message);
          }
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
        setToolStatus(null);
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
      pushToast,
    ],
  );

  const regenerate = () => {
    const lastUser = removeLastAssistantMessage();
    if (lastUser) sendMessage(lastUser, { skipUserMessage: true });
  };

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
        `### ${m.role === "user" ? "You" : agentName || avatar?.name} (${formatTime(m.timestamp)})\n${m.content}\n`,
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

  const statusLine = toolStatus || agentActivity || "Text chat";

  return (
    <div className="flex h-[calc(100dvh-env(safe-area-inset-bottom))] flex-col md:h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-4">
          <AvatarDisplay avatar={avatar} size="sm" emotion="neutral" />
          <div>
            <h1 className="font-semibold">{agentName || avatar.name}</h1>
            <p className={cn("text-xs", toolStatus ? "text-blue-500" : "text-zinc-500")}>
              {statusLine}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerate}
            disabled={loading || chatMessages.length < 2}
            aria-label="Regenerate"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
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
        {chatMessages.length === 0 && !streamingText && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <AvatarDisplay avatar={avatar} size="md" emotion="happy" />
            <p className="mt-4 text-lg font-medium">
              Hey! I&apos;m {agentName || avatar.name}.
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              I can read your inbox, check your calendar, search the web, and draft emails — with your approval.
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
                "group flex flex-col",
                msg.role === "user" ? "items-end" : "items-start",
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
              <span className="mt-1 px-1 text-[10px] text-zinc-400">
                {formatTime(msg.timestamp)}
              </span>
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
              <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-800">
                {toolStatus || (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] dark:border-zinc-800 dark:bg-zinc-900 md:pb-4">
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
