"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { AvatarEmotion, CharacterVariant } from "@/types";
import { CharacterPortrait } from "@/components/avatar/CharacterPortrait";
import { useLivingBlink } from "@/hooks/use-living-blink";
import { cn } from "@/lib/utils";
import "@/styles/human-avatar.css";

export type HumanAvatarSize = "picker" | "xs" | "sm" | "md" | "lg" | "hero";

interface HumanAvatarProps {
  variant?: CharacterVariant;
  portraitUrl?: string;
  size?: HumanAvatarSize;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  className?: string;
  ariaLabel?: string;
}

const SIZE_CLASS: Record<HumanAvatarSize, string> = {
  picker: "human--picker",
  xs: "human--xs",
  sm: "human--sm",
  md: "human--md",
  lg: "human--lg",
  hero: "human--hero",
};

function moodClass(
  speaking: boolean,
  listening: boolean,
  emotion: AvatarEmotion,
): string {
  if (speaking) return "speaking";
  if (listening) return "listening";
  if (emotion === "thinking") return "thinking";
  if (emotion === "happy") return "happy";
  return "";
}

export function HumanAvatar({
  variant = "marcus",
  portraitUrl,
  size = "md",
  emotion = "neutral",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  className,
  ariaLabel = "Character avatar",
}: HumanAvatarProps) {
  const blinking = useLivingBlink();
  const [portraitFailed, setPortraitFailed] = useState(false);
  const usePortrait = Boolean(portraitUrl) && !portraitFailed;

  return (
    <div
      className={cn(
        "human",
        SIZE_CLASS[size],
        `human--${variant}`,
        usePortrait ? "human--photo" : moodClass(speaking, listening, emotion),
        !usePortrait && blinking && "blinking",
        className,
      )}
      role="img"
      aria-label={ariaLabel}
      style={
        lipSyncLevel > 0.05
          ? ({ "--lip": lipSyncLevel } as CSSProperties)
          : undefined
      }
    >
      <div className="human-frame">
        {usePortrait ? (
          <img
            src={portraitUrl}
            alt=""
            className="human-photo"
            draggable={false}
            onError={() => setPortraitFailed(true)}
          />
        ) : (
          <CharacterPortrait variant={variant} />
        )}
      </div>
    </div>
  );
}
