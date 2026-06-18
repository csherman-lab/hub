"use client";

import dynamic from "next/dynamic";
import { HumanAvatar } from "@/components/avatar/HumanAvatar";
import { VoiceMateOrbAvatar } from "@/components/avatar/VoiceMateOrbAvatar";
import type { Avatar, AvatarEmotion, CharacterVariant, OrbVariant } from "@/types";
import { cn } from "@/lib/utils";

const CharacterModel3D = dynamic(
  () =>
    import("@/components/avatar/CharacterModel3D").then((mod) => mod.CharacterModel3D),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[min(52vh,420px)] w-full max-w-lg animate-pulse rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
        aria-hidden
      />
    ),
  },
);

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

  const characterSize = ():
    | "picker"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "hero" => {
    if (size === "picker") return "picker";
    if (size === "xs" || size === "sm") return size;
    if (size === "hero" || size === "lg" || size === "xl") return "hero";
    return "md";
  };

  if (avatar.renderer === "character" && live && size !== "picker") {
    return (
      <CharacterModel3D
        avatar={avatar}
        speaking={speaking}
        listening={listening}
        className={cn("mx-auto", className)}
      />
    );
  }

  const character =
    avatar.renderer === "character" ? (
      <HumanAvatar
        {...common}
        variant={avatar.variant as CharacterVariant}
        portraitUrl={avatar.portraitUrl}
        size={characterSize()}
        lipSyncLevel={lipSyncLevel}
      />
    ) : (
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
        followCursor={followCursor ?? false}
        interactive={interactive}
        live={live}
      />
    );

  if (size === "picker") {
    return (
      <div className="flex h-[72px] w-full items-center justify-center overflow-hidden">
        {character}
      </div>
    );
  }

  if (size === "hero" || size === "lg" || size === "xl") {
    return (
      <div
        className={cn(
          "mx-auto",
          HERO_WRAP[size === "xl" ? "xl" : size === "lg" ? "lg" : "hero"],
        )}
      >
        {character}
      </div>
    );
  }

  return character;
}
