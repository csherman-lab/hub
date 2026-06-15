"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LiveAvatar } from "@/components/avatar/LiveAvatar";
import { CallControls } from "@/components/call/CallControls";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { onLipSync, speakWithGrok, stopSpeaking } from "@/lib/voice";
import type { AvatarEmotion } from "@/types";

export function VideoCallView() {
  const {
    selectedAvatarId,
    agentName,
    setEmotion,
    addMessage,
    messages,
    goals,
    proactivity,
    autonomy,
  } = useHubStore();
  const avatar = getAvatarById(selectedAvatarId);

  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [lipLevel, setLipLevel] = useState(0);
  const [emotion, setLocalEmotion] = useState<AvatarEmotion>("happy");
  const [status, setStatus] = useState("Starting camera...");
  const [cameraError, setCameraError] = useState(false);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (userVideoRef.current) userVideoRef.current.srcObject = stream;
      setCameraError(false);
      setStatus("Tap Talk to speak");
    } catch {
      setCameraError(true);
      setStatus("Camera off — avatar only");
    }
  }, []);

  useEffect(() => {
    onLipSync(setLipLevel);
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      stopSpeaking();
      recognitionRef.current?.abort();
    };
  }, [startCamera]);

  const handleAgentReply = useCallback(
    async (userText: string) => {
      if (!avatar) return;
      setStatus("Thinking...");
      setLocalEmotion("thinking");
      setEmotion("thinking");
      addMessage("user", userText, "video");

      const videoHistory = messages
        .filter((m) => m.channel === "video" || m.channel === "chat")
        .slice(-6);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText,
            personality: avatar.personality,
            agentName: agentName || avatar.name,
            history: [...videoHistory, { role: "user", content: userText }],
            goals,
            proactivity,
            autonomy,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.reply) throw new Error("chat failed");
        const reply = data.reply;
        addMessage("assistant", reply, "video");
        const em = (data.emotion as AvatarEmotion) || "happy";
        setLocalEmotion(em);
        setEmotion(em);
        setSpeaking(true);
        setStatus("Speaking...");
        await speakWithGrok(reply, avatar.voiceId);
        setSpeaking(false);
        setLipLevel(0);
        setStatus("Tap Talk to continue");
        setLocalEmotion("happy");
        setEmotion("happy");
      } catch {
        setStatus("Error — try again");
      }
    },
    [avatar, agentName, messages, goals, proactivity, autonomy, addMessage, setEmotion],
  );

  const startListening = useCallback(() => {
    if (speaking || muted) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Use Chrome for voice.");
      return;
    }
    stopSpeaking();
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
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
      setStatus("Try again");
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [speaking, muted, handleAgentReply]);

  const toggleScreenShare = async () => {
    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      setScreenSharing(false);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = s;
      if (screenRef.current) screenRef.current.srcObject = s;
      setScreenSharing(true);
      s.getVideoTracks()[0].onended = () => setScreenSharing(false);
    } catch {
      /* cancelled */
    }
  };

  if (!avatar) return null;

  return (
    <div className="relative flex h-screen flex-col bg-zinc-950">
      <div className="flex flex-1 items-center justify-center p-4 pb-24">
        <div className="relative w-full max-w-3xl">
          {screenSharing && (
            <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl">
              <video ref={screenRef} autoPlay playsInline muted className="h-full w-full object-contain bg-black" />
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
        <p className="text-xs text-zinc-400">{status}</p>
      </div>

      <button
        type="button"
        onClick={startListening}
        disabled={speaking || muted}
        className="absolute left-1/2 top-16 z-10 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur-md hover:bg-white/25 disabled:opacity-50"
      >
        {listening ? "Listening..." : speaking ? "..." : "Talk"}
      </button>

      <div className="absolute bottom-24 right-4 z-10 h-28 w-20 overflow-hidden rounded-xl border border-white/20 bg-zinc-900 sm:h-32 sm:w-24">
        {videoOn && !cameraError ? (
          <video ref={userVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-500">Camera off</div>
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
          stopSpeaking();
        }}
      />
    </div>
  );
}
