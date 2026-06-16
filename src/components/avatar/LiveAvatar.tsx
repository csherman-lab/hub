"use client";

import { VoiceMateOrbAvatar } from "@/components/avatar/VoiceMateOrbAvatar";
import type { Avatar, AvatarEmotion } from "@/types";
import { cn } from "@/lib/utils";

interface LiveAvatarProps {
  avatar: Avatar;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  size?: "lg" | "xl" | "hero";
  className?: string;
}

const SIZE_CLASS = {
  lg: "h-64 w-full max-w-sm",
  xl: "h-80 w-full max-w-md",
  hero: "h-[min(52vh,420px)] w-full max-w-lg",
};

export function LiveAvatar({
  avatar,
  emotion = "neutral",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  size = "hero",
  className,
}: LiveAvatarProps) {
  return (
    <div className={cn("mx-auto", SIZE_CLASS[size], className)}>
      <VoiceMateOrbAvatar
        variant={avatar.orbVariant}
        size={size}
        emotion={emotion}
        speaking={speaking}
        listening={listening}
        lipSyncLevel={lipSyncLevel}
        live
        followCursor={false}
        className="h-full w-full"
      />
    </div>
  );
}
