"use client";

import { LivingAvatar } from "@/components/avatar/LivingAvatar";
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
    <LivingAvatar
      avatar={avatar}
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
