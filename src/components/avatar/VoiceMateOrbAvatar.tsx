"use client";

import { useEffect, useId, useRef } from "react";
import { loadVoiceMateOrbApi } from "@/lib/voicemate-orb/load";
import type { AvatarEmotion } from "@/types";
import { cn } from "@/lib/utils";
import "@/styles/voicemate-orb.css";

interface VoiceMateOrbAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  followCursor?: boolean;
  typingTarget?: string | null;
  live?: boolean;
  className?: string;
}

const SIZE_CLASS = {
  xs: "orb--xs",
  sm: "orb--xs",
  md: "orb--md",
  lg: "orb--hero",
  xl: "orb--focus",
  hero: "orb--lg",
} as const;

export function VoiceMateOrbAvatar({
  size = "md",
  emotion = "neutral",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  followCursor = true,
  typingTarget = null,
  live = false,
  className,
}: VoiceMateOrbAvatarProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const orbId = `voicemate-orb-${reactId}`;
  const shouldAnimate = size !== "xs" && size !== "sm";

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb || !shouldAnimate) return;

    let cancelled = false;
    let api: Awaited<ReturnType<typeof loadVoiceMateOrbApi>> | null = null;

    loadVoiceMateOrbApi()
      .then((loaded) => {
        if (cancelled) return;
        api = loaded;
        api.init({
          selector: orb,
          typingTarget,
          followCursor,
          ariaLabel: "VoiceMate",
        });
        api.setLive(live);
      })
      .catch((error) => {
        console.warn("[VoiceMateOrbAvatar]", error);
      });

    return () => {
      cancelled = true;
      api?.destroy();
    };
  }, [followCursor, live, shouldAnimate, typingTarget]);

  useEffect(() => {
    if (!shouldAnimate) return;

    let cancelled = false;

    loadVoiceMateOrbApi().then((api) => {
      if (cancelled) return;

      if (speaking || lipSyncLevel > 0.05) {
        api.setStatus({ label: "Speaking", speaking: true });
      } else if (listening) {
        api.setStatus({ label: "Listening", listening: true });
      } else if (emotion === "thinking") {
        api.setStatus({ label: "Thinking" });
      } else {
        api.setStatus({ label: "Ready" });
      }

      if (emotion === "surprised") {
        api.setExpression("curious", 2600);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [emotion, listening, shouldAnimate, speaking, lipSyncLevel]);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb || !shouldAnimate) return;

    if (lipSyncLevel > 0.05) {
      orb.classList.add("reacting");
      orb.style.setProperty("--level", lipSyncLevel.toFixed(3));
    } else {
      orb.classList.remove("reacting");
      orb.style.removeProperty("--level");
    }
  }, [lipSyncLevel, shouldAnimate]);

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        size === "xs" || size === "sm" ? "h-16 w-16" : "w-full",
        className,
      )}
    >
      <div
        ref={orbRef}
        id={orbId}
        className={cn("orb", SIZE_CLASS[size])}
        role="img"
        aria-label="VoiceMate"
      >
        <span className="orb-eyes">
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
