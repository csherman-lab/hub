"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LiveAvatar } from "@/components/avatar/LiveAvatar";
import { CallControls } from "@/components/call/CallControls";
import { getAvatarById } from "@/lib/avatars";
import { applyChatResult } from "@/lib/chat-side-effects";
import { useHubStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { onLipSync, speakWithGrok, stopSpeaking } from "@/lib/voice";

export function VoiceCallView() {
  const {
    selectedAvatarId,
    agentName,
    setEmotion,
    addMessage,
    messages,
    goals,
    skills,
    memories,
    proactivity,
    autonomy,
    apiKeys,
    addActivity,
    addMemory,
    addPendingApproval,
  } = useHubStore();
  const pushToast = useToastStore((s) => s.push);
  const avatar = getAvatarById(selectedAvatarId);

  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [lipLevel, setLipLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState("Tap to talk");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setEmotion("happy");
    onLipSync(setLipLevel);
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => {
      clearInterval(interval);
      stopSpeaking();
      recognitionRef.current?.abort();
    };
  }, [setEmotion]);

  const handleAgentReply = useCallback(
    async (userText: string) => {
      if (!avatar) return;
      setStatus("Thinking...");
      setEmotion("thinking");
      addMessage("user", userText, "voice");

      const voiceHistory = messages
        .filter((m) => m.channel === "voice" || m.channel === "chat")
        .slice(-6);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText,
            personality: avatar.personality,
            agentName: agentName || avatar.name,
            history: [...voiceHistory, { role: "user", content: userText }],
            goals,
            skills,
            memories,
            proactivity,
            autonomy,
            tavilyKey: apiKeys.web_search,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.reply) throw new Error("chat failed");
        const reply = data.reply;
        addMessage("assistant", reply, "voice");
        setEmotion(data.emotion || "happy");
        applyChatResult(data, {
          addActivity,
          addMemory,
          addPendingApproval,
          onExecuted: (msg) => pushToast(msg, "success"),
        });
        setSpeaking(true);
        setStatus("Speaking...");
        await speakWithGrok(reply, avatar.voiceId);
        setSpeaking(false);
        setLipLevel(0);
        setStatus("Tap to talk");
        setEmotion("happy");
      } catch {
        setStatus("Something went wrong. Try again.");
        setEmotion("empathetic");
      }
    },
    [avatar, agentName, messages, goals, skills, memories, proactivity, autonomy, apiKeys, addMessage, setEmotion, addActivity, addMemory, addPendingApproval, pushToast],
  );

  const startListening = useCallback(() => {
    if (muted || speaking) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Use Chrome for voice input.");
      return;
    }
    stopSpeaking();
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => {
      setListening(true);
      setStatus("Listening...");
    };
    recognition.onresult = (e) => {
      setListening(false);
      handleAgentReply(e.results[0][0].transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      setStatus("Try again.");
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [muted, speaking, handleAgentReply]);

  if (!avatar) return null;

  const mins = Math.floor(duration / 60).toString().padStart(2, "0");
  const secs = (duration % 60).toString().padStart(2, "0");

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-[#f5f5f7] dark:bg-zinc-950">
      <div className="absolute left-5 top-5">
        <p className="font-semibold">{agentName || avatar.name}</p>
        <p className="text-xs text-zinc-500">
          Voice · {mins}:{secs}
        </p>
      </div>

      <LiveAvatar
        avatar={avatar}
        size="hero"
        emotion={speaking ? "happy" : listening ? "thinking" : "neutral"}
        speaking={speaking}
        listening={listening}
        lipSyncLevel={lipLevel}
      />

      <p className="mt-4 text-sm text-zinc-500">{status}</p>

      <button
        type="button"
        onClick={startListening}
        disabled={speaking || muted}
        className="mt-3 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {listening ? "Listening..." : speaking ? "Speaking..." : "Tap to talk"}
      </button>

      <CallControls
        variant="voice"
        muted={muted}
        videoOn={false}
        screenSharing={false}
        onToggleMute={() => {
          const next = !muted;
          setMuted(next);
          if (next) stopSpeaking();
        }}
        onToggleVideo={() => {}}
        onToggleScreenShare={() => {}}
        onEndCall={() => {
          stopSpeaking();
          recognitionRef.current?.abort();
        }}
      />
    </div>
  );
}
