"use client";

import type { AvatarEmotion, GlyphVariant } from "@/types";
import { useLivingBlink } from "@/hooks/use-living-blink";
import { cn } from "@/lib/utils";
import "@/styles/glyph-avatar.css";

export type GlyphAvatarSize = "picker" | "xs" | "md" | "lg" | "hero";

interface GlyphAvatarProps {
  variant?: GlyphVariant;
  size?: GlyphAvatarSize;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  className?: string;
  ariaLabel?: string;
}

const SIZE_CLASS: Record<GlyphAvatarSize, string> = {
  picker: "glyph--picker",
  xs: "glyph--xs",
  md: "glyph--md",
  lg: "glyph--lg",
  hero: "glyph--hero",
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

export function GlyphAvatar({
  variant = "sapphire",
  size = "md",
  emotion = "neutral",
  speaking = false,
  listening = false,
  className,
  ariaLabel = "Glyph avatar",
}: GlyphAvatarProps) {
  const blinking = useLivingBlink();

  return (
    <div
      className={cn(
        "glyph",
        SIZE_CLASS[size],
        `glyph--${variant}`,
        moodClass(speaking, listening, emotion),
        className,
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="glyph-core">
        <div className="glyph-face">
          <span className={cn("glyph-eyes", blinking && "blinking")}>
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}
