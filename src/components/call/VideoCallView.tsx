"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { CallControls } from "@/components/call/CallControls";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { speakWithOpenAI, stopSpeaking } from "@/lib/voice";
import type { AvatarEmotion } from "@/types";

export function VideoCallView() {
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
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [emotion, setLocalEmotion] = useState<AvatarEmotion>("happy");
  const [status, setStatus] = useState("Connecting camera...");
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
        audio: !muted,
      });
      streamRef.current = stream;
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      setCameraError(false);
      setStatus("Connected — tap Talk to speak with your agent");
      setEmotion("happy");
      setLocalEmotion("happy");
    } catch {
      setCameraError(true);
      setStatus("Camera unavailable — avatar-only mode");
      setEmotion("empathetic");
      setLocalEmotion("empathetic");
    }
  }, [setEmotion, muted]);

  useEffect(() => {
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
        const em = (data.emotion as AvatarEmotion) || "happy";
        setLocalEmotion(em);
        setEmotion(em);
        setSpeaking(true);
        setStatus("Speaking...");
        await speakWithOpenAI(reply, avatar.voiceId, apiKeys.openai);
        setSpeaking(false);
        setStatus("Tap Talk to continue");
        setLocalEmotion("happy");
        setEmotion("happy");
      } catch {
        setStatus("Something went wrong. Try again.");
        setLocalEmotion("empathetic");
      }
    },
    [avatar, agentName, apiKeys.openai, messages, addMessage, setEmotion],
  );

  const startListening = useCallback(() => {
    if (speaking || muted) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Speech recognition needs Chrome or Safari.");
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
      setLocalEmotion("neutral");
    };

    recognition.onresult = (event) => {
      setListening(false);
      handleAgentReply(event.results[0][0].transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      setStatus("Didn't catch that. Try again.");
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  }, [speaking, muted, handleAgentReply]);

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
      if (screenRef.current) screenRef.current.srcObject = screenStream;
      setScreenSharing(true);
      screenStream.getVideoTracks()[0].onended = () => setScreenSharing(false);
    } catch {
      /* cancelled */
    }
  };

  if (!avatar) return null;

  return (
    <div className="relative flex h-screen flex-col bg-zinc-950">
      <div className="flex flex-1 items-center justify-center p-6 pb-28">
        <div className="relative w-full max-w-4xl">
          {screenSharing && (
            <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl">
              <video
                ref={screenRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full bg-black object-contain"
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
              size="hero"
              emotion={emotion}
              speaking={speaking}
            />
          </div>
        </div>
      </div>

      <div className="absolute left-6 top-6 z-10">
        <p className="text-lg font-medium text-white">
          {agentName || avatar.name}
        </p>
        <p className="text-sm text-zinc-400">{status}</p>
      </div>

      <button
        type="button"
        onClick={startListening}
        disabled={speaking || muted}
        className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-50"
      >
        {listening ? "Listening..." : speaking ? "Speaking..." : "Talk"}
      </button>

      <div className="absolute bottom-28 right-6 z-10 h-36 w-28 overflow-hidden rounded-2xl border-2 border-white/20 bg-zinc-800 shadow-2xl sm:h-44 sm:w-36">
        {videoOn && !cameraError && streamRef.current ? (
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            {cameraError ? "No camera" : "Camera off"}
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
          stopSpeaking();
        }}
      />
    </div>
  );
}
