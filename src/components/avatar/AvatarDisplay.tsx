"use client";

import { VoiceMateOrbAvatar } from "@/components/avatar/VoiceMateOrbAvatar";
import type { Avatar, AvatarEmotion } from "@/types";
import { cn } from "@/lib/utils";

interface AvatarDisplayProps {
  avatar: Avatar;
  emotion?: AvatarEmotion;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  className?: string;
}

export function AvatarDisplay({
  avatar,
  emotion = "neutral",
  size = "md",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  className,
}: AvatarDisplayProps) {
  return (
    <VoiceMateOrbAvatar
      variant={avatar.orbVariant}
      size={size}
      emotion={emotion}
      speaking={speaking}
      listening={listening}
      lipSyncLevel={lipSyncLevel}
      followCursor={size !== "xs" && size !== "sm"}
      className={cn(className)}
    />
  );
}
