"use client";

import { useEffect, useState } from "react";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { CallControls } from "@/components/call/CallControls";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";

export function VoiceCallView() {
  const { selectedAvatarId, agentName, apiKeys, setEmotion } = useHubStore();
  const avatar = getAvatarById(selectedAvatarId);

  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setEmotion("happy");
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [setEmotion]);

  useEffect(() => {
    const pulse = setInterval(() => {
      setSpeaking((s) => !s);
    }, 2000);
    return () => clearInterval(pulse);
  }, []);

  if (!avatar) return null;

  const mins = Math.floor(duration / 60)
    .toString()
    .padStart(2, "0");
  const secs = (duration % 60).toString().padStart(2, "0");

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="absolute left-6 top-6 text-white">
        <p className="text-lg font-medium">{agentName || avatar.name}</p>
        <p className="text-sm text-zinc-400">
          {apiKeys.openai ? "Voice call" : "Demo mode"} · {mins}:{secs}
        </p>
      </div>

      <AvatarDisplay
        avatar={avatar}
        size="xl"
        emotion={speaking ? "happy" : "neutral"}
        speaking={speaking}
      />

      <p className="mt-8 max-w-sm text-center text-sm text-zinc-400">
        {apiKeys.openai
          ? "OpenAI Realtime API will power live voice here."
          : "Add your OpenAI API key in Connections to enable live voice."}
      </p>

      <CallControls
        variant="voice"
        muted={muted}
        videoOn={false}
        screenSharing={false}
        onToggleMute={() => setMuted(!muted)}
        onToggleVideo={() => {}}
        onToggleScreenShare={() => {}}
        onEndCall={() => {}}
      />
    </div>
  );
}
