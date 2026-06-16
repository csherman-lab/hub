"use client";

import { useEffect, useId, useRef } from "react";
import { loadVoiceMateOrbApi } from "@/lib/voicemate-orb/load";
import type { AvatarEmotion, OrbVariant } from "@/types";
import { cn } from "@/lib/utils";
import "@/styles/voicemate-orb.css";

interface VoiceMateOrbAvatarProps {
  size?: "picker" | "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  variant?: OrbVariant;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  followCursor?: boolean;
  typingTarget?: string | null;
  live?: boolean;
  interactive?: boolean;
  className?: string;
  ariaLabel?: string;
}

const SIZE_CLASS = {
  picker: "orb--picker",
  xs: "orb--xs",
  sm: "orb--xs",
  md: "orb--md",
  lg: "orb--hero",
  xl: "orb--focus",
  hero: "orb--lg",
} as const;

export function VoiceMateOrbAvatar({
  size = "md",
  variant = "violet",
  emotion = "neutral",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  followCursor = true,
  typingTarget = null,
  live = false,
  interactive = true,
  className,
  ariaLabel = "VoiceMate",
}: VoiceMateOrbAvatarProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const orbId = `voicemate-orb-${reactId}`;
  const shouldAnimate = !["picker", "xs", "sm"].includes(size);

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
          followCursor: interactive && followCursor,
          ariaLabel,
        });
        api.setLive(live);
        if (!interactive) {
          orb.setAttribute("role", "presentation");
          orb.removeAttribute("tabindex");
          orb.setAttribute("aria-hidden", "true");
        }
      })
      .catch((error) => {
        console.warn("[VoiceMateOrbAvatar]", error);
      });

    return () => {
      cancelled = true;
      api?.destroy();
    };
  }, [ariaLabel, followCursor, interactive, live, shouldAnimate, typingTarget]);

  useEffect(() => {
    if (!shouldAnimate) return;

    let cancelled = false;

    loadVoiceMateOrbApi()
      .then((api) => {
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
      })
      .catch(() => {
        /* orb script optional */
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
        size === "picker" ? "h-[72px] w-[72px]" : size === "xs" || size === "sm" ? "h-16 w-16" : "w-full",
        className,
      )}
    >
      <div
        ref={orbRef}
        id={orbId}
        className={cn("orb", SIZE_CLASS[size], `orb--${variant}`)}
        role="img"
        aria-label={ariaLabel}
      >
        <span className="orb-eyes">
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
