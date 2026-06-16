"use client";

import { GlyphAvatar } from "@/components/avatar/GlyphAvatar";
import { VoiceMateOrbAvatar } from "@/components/avatar/VoiceMateOrbAvatar";
import { WispAvatar } from "@/components/avatar/WispAvatar";
import type { Avatar, AvatarEmotion, GlyphVariant, OrbVariant, WispVariant } from "@/types";
import { cn } from "@/lib/utils";

export type LivingAvatarSize =
  | "picker"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "hero";

interface LivingAvatarProps {
  avatar: Avatar;
  size?: LivingAvatarSize;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  followCursor?: boolean;
  interactive?: boolean;
  live?: boolean;
  className?: string;
}

const HERO_WRAP: Record<"lg" | "xl" | "hero", string> = {
  lg: "h-64 w-full max-w-sm",
  xl: "h-80 w-full max-w-md",
  hero: "h-[min(52vh,420px)] w-full max-w-lg",
};

export function LivingAvatar({
  avatar,
  size = "md",
  emotion = "neutral",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  followCursor,
  interactive = true,
  live = false,
  className,
}: LivingAvatarProps) {
  const common = {
    emotion,
    speaking,
    listening,
    ariaLabel: avatar.name,
    className: cn(size === "picker" ? "mx-auto" : "h-full w-full", className),
  };

  const character = (() => {
    switch (avatar.renderer) {
      case "glyph":
        return (
          <GlyphAvatar
            {...common}
            variant={avatar.variant as GlyphVariant}
            size={
              size === "picker" || size === "xs"
                ? size === "picker"
                  ? "picker"
                  : "xs"
                : size === "hero" || size === "lg" || size === "xl"
                  ? "hero"
                  : "md"
            }
          />
        );
      case "wisp":
        return (
          <WispAvatar
            {...common}
            variant={avatar.variant as WispVariant}
            size={
              size === "picker" || size === "xs"
                ? size === "picker"
                  ? "picker"
                  : "xs"
                : size === "hero" || size === "lg" || size === "xl"
                  ? "hero"
                  : "md"
            }
          />
        );
      default:
        return (
          <VoiceMateOrbAvatar
            {...common}
            variant={avatar.variant as OrbVariant}
            size={
              size === "picker"
                ? "picker"
                : size === "hero"
                  ? "hero"
                  : size === "lg" || size === "xl"
                    ? "lg"
                    : size
            }
            lipSyncLevel={lipSyncLevel}
            followCursor={
              followCursor ?? (size !== "picker" && size !== "xs" && size !== "sm")
            }
            interactive={interactive}
            live={live}
          />
        );
    }
  })();

  if (size === "picker") {
    return (
      <div className="flex h-[72px] w-full items-center justify-center overflow-hidden">
        {character}
      </div>
    );
  }

  if (size === "hero" || size === "lg" || size === "xl") {
    return <div className={cn("mx-auto", HERO_WRAP[size === "xl" ? "xl" : size === "lg" ? "lg" : "hero"])}>{character}</div>;
  }

  return character;
}
