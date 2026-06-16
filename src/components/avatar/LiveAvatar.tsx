"use client";

import { LivingAvatar } from "@/components/avatar/LivingAvatar";
import type { Avatar, AvatarEmotion } from "@/types";

interface LiveAvatarProps {
  avatar: Avatar;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  size?: "lg" | "xl" | "hero";
  className?: string;
}

/** Hero-sized living avatar for voice and video calls */
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
    <LivingAvatar
      avatar={avatar}
      size={size}
      emotion={emotion}
      speaking={speaking}
      listening={listening}
      lipSyncLevel={lipSyncLevel}
      followCursor={false}
      interactive
      live
      className={className}
    />
  );
}
