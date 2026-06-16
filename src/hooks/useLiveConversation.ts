"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applyChatResult } from "@/lib/chat-side-effects";
import { getCallGreeting } from "@/lib/call-greeting";
import { useHubStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { onLipSync, speakWithGrok, stopSpeaking } from "@/lib/voice";
import type { Avatar } from "@/types";

export type CallPhase =
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "muted"
  | "error";

const CONNECT_DELAY_MS = 500;
const RESTART_DELAY_MS = 300;
const UTTERANCE_END_MS = 850;

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useLiveConversation({
  avatar,
  channel,
  enabled,
  muted,
  getUserImage,
}: {
  avatar: Avatar | undefined;
  channel: "voice" | "video";
  enabled: boolean;
  muted: boolean;
  getUserImage?: () => string | undefined;
}) {
  const {
    agentName,
    setEmotion,
    addMessage,
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

  const [phase, setPhase] = useState<CallPhase>("connecting");
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [lipLevel, setLipLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const busyRef = useRef(false);
  const mutedRef = useRef(muted);
  const startedRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utteranceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTranscriptRef = useRef("");

  mutedRef.current = muted;

  const setSpeakingState = useCallback((active: boolean) => {
    setSpeaking(active);
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const clearUtteranceTimer = useCallback(() => {
    if (utteranceTimerRef.current) {
      clearTimeout(utteranceTimerRef.current);
      utteranceTimerRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    clearRestartTimer();
    clearUtteranceTimer();
    pendingTranscriptRef.current = "";
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
    setInterimTranscript("");
  }, [clearRestartTimer, clearUtteranceTimer]);

  const handleAgentReply = useCallback(
    async (userText: string) => {
      if (!avatar || busyRef.current || !userText.trim()) return;
      busyRef.current = true;
      shouldListenRef.current = false;
      stopRecognition();
      setPhase("thinking");
      setEmotion("thinking");
      addMessage("user", userText.trim(), channel);

      const history = useHubStore
        .getState()
        .messages.filter((m) => m.channel === channel || m.channel === "chat")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const userImage = getUserImage?.();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText.trim(),
            personality: avatar.personality,
            agentName: agentName || avatar.name,
            history,
            goals,
            skills,
            memories,
            proactivity,
            autonomy,
            tavilyKey: apiKeys.web_search,
            userImage,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.reply) throw new Error("chat failed");

        const reply = data.reply as string;
        addMessage("assistant", reply, channel);
        setEmotion(data.emotion || "happy");
        applyChatResult(data, {
          addActivity,
          addMemory,
          addPendingApproval,
          onExecuted: (msg) => pushToast(msg, "success"),
        });

        setPhase("speaking");
        setSpeakingState(true);
        await speakWithGrok(reply, avatar.voiceId);
        setSpeakingState(false);
        setLipLevel(0);
        setEmotion("happy");
      } catch {
        setEmotion("empathetic");
        setPhase(mutedRef.current ? "muted" : "error");
        pushToast("Could not reach your agent. Try again.", "error");
      } finally {
        busyRef.current = false;
        if (!mutedRef.current) {
          resumeListeningRef.current?.();
        } else {
          setPhase("muted");
        }
      }
    },
    [
      avatar,
      channel,
      agentName,
      goals,
      skills,
      memories,
      proactivity,
      autonomy,
      apiKeys,
      addMessage,
      setEmotion,
      addActivity,
      addMemory,
      addPendingApproval,
      pushToast,
      getUserImage,
      stopRecognition,
      setSpeakingState,
    ],
  );

  const handleAgentReplyRef = useRef(handleAgentReply);
  handleAgentReplyRef.current = handleAgentReply;

  const resumeListeningRef = useRef<(() => void) | null>(null);

  const resumeListening = useCallback(() => {
    if (mutedRef.current || busyRef.current) return;
    shouldListenRef.current = true;
    setPhase("listening");
    clearRestartTimer();
    restartTimerRef.current = setTimeout(() => {
      restartTimerRef.current = null;
      startRecognitionRef.current?.();
    }, RESTART_DELAY_MS);
  }, [clearRestartTimer]);

  resumeListeningRef.current = resumeListening;

  const startRecognitionRef = useRef<(() => void) | null>(null);

  const startRecognition = useCallback(() => {
    if (!shouldListenRef.current || mutedRef.current || busyRef.current) {
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setPhase("error");
      pushToast("Voice input needs Chrome or Edge.", "error");
      return;
    }

    stopRecognition();

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    pendingTranscriptRef.current = "";

    const flushUtterance = () => {
      clearUtteranceTimer();
      const text = pendingTranscriptRef.current.trim();
      pendingTranscriptRef.current = "";
      setInterimTranscript("");
      if (!text || busyRef.current) return;
      shouldListenRef.current = false;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      void handleAgentReplyRef.current(text);
    };

    const scheduleUtteranceEnd = () => {
      clearUtteranceTimer();
      utteranceTimerRef.current = setTimeout(flushUtterance, UTTERANCE_END_MS);
    };

    recognition.onstart = () => {
      setListening(true);
      setPhase("listening");
    };

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          pendingTranscriptRef.current += `${transcript} `;
        } else {
          interim += transcript;
        }
      }

      const preview = `${pendingTranscriptRef.current}${interim}`.trim();
      setInterimTranscript(preview);

      if (pendingTranscriptRef.current.trim()) {
        scheduleUtteranceEnd();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      if (event.error === "not-allowed") {
        setPhase("error");
        shouldListenRef.current = false;
        pushToast("Allow microphone access to use voice.", "error");
        return;
      }
      if (
        shouldListenRef.current &&
        !busyRef.current &&
        !mutedRef.current &&
        event.error !== "no-speech"
      ) {
        resumeListeningRef.current?.();
      }
    };

    recognition.onend = () => {
      setListening(false);
      clearUtteranceTimer();
      if (shouldListenRef.current && !busyRef.current && !mutedRef.current) {
        resumeListeningRef.current?.();
      }
    };

    try {
      recognition.start();
    } catch {
      resumeListeningRef.current?.();
    }
  }, [stopRecognition, pushToast, clearUtteranceTimer]);

  startRecognitionRef.current = startRecognition;

  const speakGreeting = useCallback(async () => {
    if (!avatar) return;
    const greeting = getCallGreeting(agentName || avatar.name);
    setPhase("speaking");
    setSpeakingState(true);
    setEmotion("happy");
    await speakWithGrok(greeting, avatar.voiceId);
    setSpeakingState(false);
    setLipLevel(0);
  }, [avatar, agentName, setEmotion, setSpeakingState]);

  const endConversation = useCallback(() => {
    shouldListenRef.current = false;
    busyRef.current = false;
    clearRestartTimer();
    clearUtteranceTimer();
    stopRecognition();
    stopSpeaking();
  }, [clearRestartTimer, clearUtteranceTimer, stopRecognition]);

  useEffect(() => {
    onLipSync(setLipLevel);
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => {
      clearInterval(interval);
      endConversation();
    };
  }, [endConversation]);

  useEffect(() => {
    if (!enabled || !avatar || startedRef.current) return;
    startedRef.current = true;

    void (async () => {
      setPhase("connecting");
      setEmotion("happy");
      await delay(CONNECT_DELAY_MS);

      if (mutedRef.current) {
        setPhase("muted");
        return;
      }

      await speakGreeting();
      resumeListeningRef.current?.();
    })();
  }, [enabled, avatar, speakGreeting, setEmotion]);

  useEffect(() => {
    if (!startedRef.current) return;

    if (muted) {
      shouldListenRef.current = false;
      stopRecognition();
      stopSpeaking();
      if (!busyRef.current) {
        setPhase("muted");
      }
      return;
    }

    if (phase === "muted" && !busyRef.current && !speaking) {
      resumeListeningRef.current?.();
    }
  }, [muted, phase, speaking, stopRecognition]);

  return {
    phase,
    speaking,
    listening,
    lipLevel,
    duration,
    interimTranscript,
    endConversation,
  };
}
