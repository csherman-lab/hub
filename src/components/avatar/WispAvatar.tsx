"use client";

import type { AvatarEmotion, WispVariant } from "@/types";
import { useLivingBlink } from "@/hooks/use-living-blink";
import { cn } from "@/lib/utils";
import "@/styles/wisp-avatar.css";

export type WispAvatarSize = "picker" | "xs" | "md" | "lg" | "hero";

interface WispAvatarProps {
  variant?: WispVariant;
  size?: WispAvatarSize;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  className?: string;
  ariaLabel?: string;
}

const SIZE_CLASS: Record<WispAvatarSize, string> = {
  picker: "wisp--picker",
  xs: "wisp--xs",
  md: "wisp--md",
  lg: "wisp--lg",
  hero: "wisp--hero",
};

function moodClass(
  speaking: boolean,
  listening: boolean,
  emotion: AvatarEmotion,
): string {
  if (speaking) return "speaking";
  if (listening) return "listening";
  if (emotion === "thinking") return "thinking";
  return "";
}

export function WispAvatar({
  variant = "mist",
  size = "md",
  emotion = "neutral",
  speaking = false,
  listening = false,
  className,
  ariaLabel = "Wisp avatar",
}: WispAvatarProps) {
  const blinking = useLivingBlink();

  return (
    <div
      className={cn(
        "wisp",
        SIZE_CLASS[size],
        `wisp--${variant}`,
        moodClass(speaking, listening, emotion),
        className,
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="wisp-glow" aria-hidden />
      <div className="wisp-body">
        <span className={cn("wisp-eyes", blinking && "blinking")}>
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
