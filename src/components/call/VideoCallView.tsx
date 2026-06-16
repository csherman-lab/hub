"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LiveAvatar } from "@/components/avatar/LiveAvatar";
import { CallControls } from "@/components/call/CallControls";
import { LiveCallStatus } from "@/components/call/LiveCallStatus";
import { getAvatarById } from "@/lib/avatars";
import { captureVideoFrame } from "@/lib/capture-video-frame";
import { useLiveConversation } from "@/hooks/useLiveConversation";
import { useHubStore } from "@/lib/store";
import { stopSpeaking } from "@/lib/voice";
import type { AvatarEmotion } from "@/types";

export function VideoCallView() {
  const { selectedAvatarId, agentName, setEmotion } = useHubStore();
  const avatar = getAvatarById(selectedAvatarId);

  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [emotion, setLocalEmotion] = useState<AvatarEmotion>("happy");

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoOnRef = useRef(videoOn);

  videoOnRef.current = videoOn;

  const getUserImage = useCallback(() => {
    if (!videoOnRef.current || !userVideoRef.current) return undefined;
    return captureVideoFrame(userVideoRef.current) ?? undefined;
  }, []);

  const attachUserStream = useCallback((stream: MediaStream) => {
    const video = userVideoRef.current;
    if (!video) return;
    video.srcObject = stream;
    void video.play().catch(() => undefined);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: true,
      });
      streamRef.current = stream;
      attachUserStream(stream);
      setCameraError(false);
      setCameraReady(true);
    } catch {
      setCameraError(true);
      setCameraReady(true);
    }
  }, [attachUserStream]);

  useEffect(() => {
    void startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  useEffect(() => {
    if (streamRef.current) attachUserStream(streamRef.current);
  }, [attachUserStream, videoOn, cameraError]);

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
    channel: "video",
    enabled: cameraReady && !!avatar,
    muted,
    getUserImage,
  });

  useEffect(() => {
    if (speaking) {
      setLocalEmotion("happy");
      setEmotion("happy");
      return;
    }
    if (listening || phase === "thinking") {
      setLocalEmotion("thinking");
      setEmotion("thinking");
      return;
    }
    setLocalEmotion("happy");
    setEmotion("happy");
  }, [speaking, listening, phase, setEmotion]);

  const toggleVideo = () => {
    const next = !videoOn;
    setVideoOn(next);
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = next;
    });
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenSharing(false);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = s;
      if (screenRef.current) {
        screenRef.current.srcObject = s;
        void screenRef.current.play().catch(() => undefined);
      }
      setScreenSharing(true);
      s.getVideoTracks()[0].onended = () => setScreenSharing(false);
    } catch {
      /* cancelled */
    }
  };

  const handleEndCall = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    endConversation();
  };

  if (!avatar) return null;

  const mins = Math.floor(duration / 60).toString().padStart(2, "0");
  const secs = (duration % 60).toString().padStart(2, "0");

  return (
    <div className="relative flex h-screen flex-col bg-zinc-950">
      <div className="flex flex-1 items-center justify-center p-4 pb-24">
        <div className="relative w-full max-w-3xl">
          {screenSharing && (
            <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl">
              <video
                ref={screenRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full bg-black object-contain"
              />
            </div>
          )}
          <div className={screenSharing ? "opacity-0" : ""}>
            <LiveAvatar
              avatar={avatar}
              size="hero"
              emotion={emotion}
              speaking={speaking}
              listening={listening}
              lipSyncLevel={lipLevel}
            />
          </div>
        </div>
      </div>

      <div className="absolute left-5 top-5 z-10 text-white">
        <p className="font-medium">{agentName || avatar.name}</p>
        <p className="text-xs text-zinc-400">
          Video · {mins}:{secs}
        </p>
      </div>

      <div className="absolute left-1/2 top-16 z-10 -translate-x-1/2">
        <LiveCallStatus
          phase={phase}
          interimTranscript={interimTranscript}
          variant="dark"
        />
      </div>

      <div className="absolute bottom-24 right-4 z-10 h-32 w-24 overflow-hidden rounded-2xl border-2 border-white/20 bg-zinc-900 shadow-lg sm:h-36 sm:w-28">
        {videoOn && !cameraError ? (
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full scale-x-[-1] object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center text-[10px] text-zinc-500">
            <span>{cameraError ? "Camera unavailable" : "Camera off"}</span>
          </div>
        )}
      </div>

      <CallControls
        variant="video"
        muted={muted}
        videoOn={videoOn}
        screenSharing={screenSharing}
        onToggleMute={() => {
          const next = !muted;
          setMuted(next);
          if (next) stopSpeaking();
        }}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onEndCall={handleEndCall}
      />
    </div>
  );
}
