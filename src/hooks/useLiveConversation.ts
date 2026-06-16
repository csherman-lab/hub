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

const CONNECT_DELAY_MS = 700;
const RESTART_DELAY_MS = 250;

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
  const speakingRef = useRef(false);
  const startedRef = useRef(false);
  const mutedRef = useRef(muted);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  mutedRef.current = muted;
  speakingRef.current = speaking;

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    clearRestartTimer();
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
    setInterimTranscript("");
  }, [clearRestartTimer]);

  const handleAgentReply = useCallback(
    async (userText: string) => {
      if (!avatar || busyRef.current) return;
      busyRef.current = true;
      shouldListenRef.current = false;
      stopRecognition();
      setPhase("thinking");
      setEmotion("thinking");
      addMessage("user", userText, channel);

      const history = useHubStore
        .getState()
        .messages.filter((m) => m.channel === channel || m.channel === "chat")
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const userImage = getUserImage?.();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText,
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
        setSpeaking(true);
        await speakWithGrok(reply, avatar.voiceId);
        setSpeaking(false);
        setLipLevel(0);
        setEmotion("happy");

        if (!mutedRef.current) {
          setPhase("listening");
          shouldListenRef.current = true;
          restartTimerRef.current = setTimeout(() => {
            restartTimerRef.current = null;
            startRecognitionRef.current?.();
          }, RESTART_DELAY_MS);
        } else {
          setPhase("muted");
        }
      } catch {
        setEmotion("empathetic");
        setPhase(mutedRef.current ? "muted" : "error");
        pushToast("Could not reach your agent. Try again.", "error");
        if (!mutedRef.current) {
          shouldListenRef.current = true;
          restartTimerRef.current = setTimeout(() => {
            restartTimerRef.current = null;
            startRecognitionRef.current?.();
          }, RESTART_DELAY_MS);
        }
      } finally {
        busyRef.current = false;
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
    ],
  );

  const startRecognitionRef = useRef<(() => void) | null>(null);

  const startRecognition = useCallback(() => {
    if (
      !shouldListenRef.current ||
      mutedRef.current ||
      busyRef.current ||
      speakingRef.current
    ) {
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setPhase("error");
      return;
    }

    stopRecognition();

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      setPhase("listening");
      setInterimTranscript("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += transcript;
        else interim += transcript;
      }

      if (interim) setInterimTranscript(interim);

      const text = finalText.trim();
      if (text.length >= 1) {
        shouldListenRef.current = false;
        setInterimTranscript("");
        void handleAgentReply(text);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        if (shouldListenRef.current && !busyRef.current && !mutedRef.current) {
          restartTimerRef.current = setTimeout(() => {
            restartTimerRef.current = null;
            startRecognitionRef.current?.();
          }, RESTART_DELAY_MS);
        }
        return;
      }
      if (event.error === "not-allowed") {
        setPhase("error");
        shouldListenRef.current = false;
        return;
      }
      if (shouldListenRef.current && !busyRef.current && !mutedRef.current) {
        restartTimerRef.current = setTimeout(() => {
          restartTimerRef.current = null;
          startRecognitionRef.current?.();
        }, RESTART_DELAY_MS);
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
      if (shouldListenRef.current && !busyRef.current && !mutedRef.current) {
        restartTimerRef.current = setTimeout(() => {
          restartTimerRef.current = null;
          startRecognitionRef.current?.();
        }, RESTART_DELAY_MS);
      }
    };

    try {
      recognition.start();
    } catch {
      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null;
        startRecognitionRef.current?.();
      }, RESTART_DELAY_MS);
    }
  }, [handleAgentReply, stopRecognition]);

  startRecognitionRef.current = startRecognition;

  const speakGreeting = useCallback(async () => {
    if (!avatar) return;
    const greeting = getCallGreeting(agentName || avatar.name);
    setPhase("speaking");
    setSpeaking(true);
    setEmotion("happy");
    addMessage("assistant", greeting, channel);
    await speakWithGrok(greeting, avatar.voiceId);
    setSpeaking(false);
    setLipLevel(0);
  }, [avatar, agentName, channel, addMessage, setEmotion]);

  const endConversation = useCallback(() => {
    shouldListenRef.current = false;
    busyRef.current = false;
    clearRestartTimer();
    stopRecognition();
    stopSpeaking();
  }, [clearRestartTimer, stopRecognition]);

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

      if (mutedRef.current) {
        setPhase("muted");
        return;
      }

      shouldListenRef.current = true;
      startRecognitionRef.current?.();
    })();
  }, [enabled, avatar, speakGreeting, setEmotion]);

  useEffect(() => {
    if (!startedRef.current) return;

    if (muted) {
      shouldListenRef.current = false;
      stopRecognition();
      if (!busyRef.current && !speakingRef.current) {
        setPhase("muted");
      }
      stopSpeaking();
      return;
    }

    if (
      phase === "muted" &&
      !busyRef.current &&
      !speakingRef.current
    ) {
      shouldListenRef.current = true;
      setPhase("listening");
      startRecognitionRef.current?.();
    }
  }, [muted, phase, stopRecognition]);

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
