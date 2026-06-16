"use client";

import { LiveAvatar } from "@/components/avatar/LiveAvatar";
import { CallControls } from "@/components/call/CallControls";
import { LiveCallStatus } from "@/components/call/LiveCallStatus";
import { getAvatarById } from "@/lib/avatars";
import { useLiveConversation } from "@/hooks/useLiveConversation";
import { useHubStore } from "@/lib/store";
import { stopSpeaking } from "@/lib/voice";
import { useState } from "react";

export function VoiceCallView() {
  const { selectedAvatarId, agentName } = useHubStore();
  const avatar = getAvatarById(selectedAvatarId);
  const [muted, setMuted] = useState(false);

  const {
    phase,
    speaking,
    listening,
    lipLevel,
    duration,
    interimTranscript,
    endConversation,
  } = useLiveConversation({
    avatar,
    channel: "voice",
    enabled: !!avatar,
    muted,
  });

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
        emotion={
          speaking ? "happy" : listening || phase === "thinking" ? "thinking" : "neutral"
        }
        speaking={speaking}
        listening={listening}
        lipSyncLevel={lipLevel}
      />

      <div className="mt-6">
        <LiveCallStatus phase={phase} interimTranscript={interimTranscript} />
      </div>

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
        onEndCall={endConversation}
      />
    </div>
  );
}
