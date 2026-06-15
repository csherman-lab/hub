"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { CallControls } from "@/components/call/CallControls";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { speakWithOpenAI, stopSpeaking } from "@/lib/voice";

export function VoiceCallView() {
  const {
    selectedAvatarId,
    agentName,
    apiKeys,
    setEmotion,
    addMessage,
    messages,
  } = useHubStore();
  const avatar = getAvatarById(selectedAvatarId);

  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState("Tap the mic and start talking");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setEmotion("happy");
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
      addMessage("user", userText);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText,
            apiKey: apiKeys.openai,
            personality: avatar.personality,
            agentName: agentName || avatar.name,
            history: messages.slice(-6),
          }),
        });
        const data = await res.json();
        const reply = data.reply || "I'm here to help.";
        addMessage("assistant", reply);
        setEmotion(data.emotion || "happy");
        setSpeaking(true);
        setStatus("Speaking...");
        await speakWithOpenAI(reply, avatar.voiceId, apiKeys.openai);
        setSpeaking(false);
        setStatus("Tap the mic and start talking");
        setEmotion("happy");
      } catch {
        setStatus("Something went wrong. Try again.");
        setEmotion("empathetic");
      }
    },
    [avatar, agentName, apiKeys.openai, messages, addMessage, setEmotion],
  );

  const startListening = useCallback(() => {
    if (muted || speaking) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    stopSpeaking();
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      setStatus("Listening...");
      setEmotion("neutral");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      handleAgentReply(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      setStatus("Didn't catch that. Try again.");
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  }, [muted, speaking, handleAgentReply, setEmotion]);

  if (!avatar) return null;

  const mins = Math.floor(duration / 60)
    .toString()
    .padStart(2, "0");
  const secs = (duration % 60).toString().padStart(2, "0");

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-[#f5f5f7] dark:bg-zinc-950">
      <div className="absolute left-6 top-6">
        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
          {agentName || avatar.name}
        </p>
        <p className="text-sm text-zinc-500">
          Voice call · {mins}:{secs}
        </p>
      </div>

      <AvatarDisplay
        avatar={avatar}
        size="hero"
        emotion={speaking ? "happy" : listening ? "thinking" : "neutral"}
        speaking={speaking}
      />

      <p className="mt-6 max-w-sm text-center text-sm text-zinc-500">{status}</p>

      {!apiKeys.openai && (
        <p className="mt-2 text-xs text-amber-600">
          Connect OpenAI in Connectors for natural voice. Using browser voice for now.
        </p>
      )}

      <button
        type="button"
        onClick={startListening}
        disabled={speaking || muted}
        className="mt-4 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
      >
        {listening ? "Listening..." : speaking ? "Speaking..." : "Tap to talk"}
      </button>

      <CallControls
        variant="voice"
        muted={muted}
        videoOn={false}
        screenSharing={false}
        onToggleMute={() => setMuted(!muted)}
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
