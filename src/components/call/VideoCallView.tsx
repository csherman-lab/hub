"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { CallControls } from "@/components/call/CallControls";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import type { AvatarEmotion } from "@/types";

export function VideoCallView() {
  const { selectedAvatarId, agentName, currentEmotion, setEmotion, apiKeys } =
    useHubStore();
  const avatar = getAvatarById(selectedAvatarId);

  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [emotion, setLocalEmotion] = useState<AvatarEmotion>(currentEmotion);
  const [status, setStatus] = useState("Connecting...");

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      setStatus("Connected");
      setEmotion("happy");
      setLocalEmotion("happy");
    } catch {
      setStatus("Camera access denied — avatar-only mode");
      setEmotion("empathetic");
      setLocalEmotion("empathetic");
    }
  }, [setEmotion]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const toggleScreenShare = async () => {
    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenSharing(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = screenStream;
      if (screenRef.current) {
        screenRef.current.srcObject = screenStream;
      }
      setScreenSharing(true);
      setLocalEmotion("thinking");
      setSpeaking(true);

      screenStream.getVideoTracks()[0].onended = () => {
        setScreenSharing(false);
        setSpeaking(false);
      };
    } catch {
      /* user cancelled */
    }
  };

  useEffect(() => {
    if (!apiKeys.openai) {
      setStatus("Add OpenAI API key for live voice (Realtime API)");
    }
  }, [apiKeys.openai]);

  // Demo: cycle emotions to show expressiveness
  useEffect(() => {
    const interval = setInterval(() => {
      if (!speaking) {
        const emotions: AvatarEmotion[] = [
          "neutral",
          "happy",
          "thinking",
          "empathetic",
        ];
        const next = emotions[Math.floor(Math.random() * emotions.length)];
        setLocalEmotion(next);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [speaking]);

  if (!avatar) return null;

  return (
    <div className="relative flex h-screen flex-col bg-zinc-950">
      {/* Main avatar stage — matches reference layout */}
      <div className="flex flex-1 items-center justify-center p-8 pb-28">
        <div className="relative w-full max-w-4xl">
          {screenSharing && (
            <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl">
              <video
                ref={screenRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-contain bg-black"
              />
              <div className="absolute left-4 top-4 rounded-lg bg-black/60 px-3 py-1 text-xs text-white">
                Screen sharing
              </div>
            </div>
          )}

          <div
            className={`flex items-center justify-center transition-opacity ${
              screenSharing ? "opacity-0" : "opacity-100"
            }`}
          >
            <AvatarDisplay
              avatar={avatar}
              size="xl"
              emotion={emotion}
              speaking={speaking}
            />
          </div>
        </div>
      </div>

      {/* Agent name badge */}
      <div className="absolute left-6 top-6 z-10">
        <p className="text-lg font-medium text-white">
          {agentName || avatar.name}
        </p>
        <p className="text-sm text-zinc-400">{status}</p>
      </div>

      {/* User PiP — bottom right like reference */}
      <div className="absolute bottom-28 right-6 z-10 h-36 w-28 overflow-hidden rounded-2xl border-2 border-white/20 bg-zinc-800 shadow-2xl sm:h-44 sm:w-36">
        {videoOn && streamRef.current ? (
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            Camera off
          </div>
        )}
      </div>

      <CallControls
        variant="video"
        muted={muted}
        videoOn={videoOn}
        screenSharing={screenSharing}
        onToggleMute={() => setMuted(!muted)}
        onToggleVideo={() => setVideoOn(!videoOn)}
        onToggleScreenShare={toggleScreenShare}
        onEndCall={() => {
          streamRef.current?.getTracks().forEach((t) => t.stop());
        }}
      />

      {!apiKeys.openai && (
        <div className="absolute left-1/2 top-20 z-10 max-w-md -translate-x-1/2 rounded-xl bg-amber-500/90 px-4 py-2 text-center text-sm text-white">
          Draft mode: video UI works. Add OpenAI API key + Realtime API for live
          voice conversation.
        </div>
      )}
    </div>
  );
}
