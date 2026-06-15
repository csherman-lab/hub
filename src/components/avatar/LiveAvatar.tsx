"use client";

import { PortraitAvatar } from "@/components/avatar/PortraitAvatar";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
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
  /** Use animated SVG portrait (calls/video). Static image elsewhere. */
  portrait?: boolean;
}

export function LiveAvatar({
  avatar,
  emotion = "neutral",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  size = "hero",
  className,
  portrait = true,
}: LiveAvatarProps) {
  if (portrait) {
    return (
      <PortraitAvatar
        avatar={avatar}
        emotion={emotion}
        speaking={speaking}
        listening={listening}
        lipSyncLevel={lipSyncLevel}
        size={size}
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      <AvatarDisplay
        avatar={avatar}
        size={size}
        emotion={emotion}
        speaking={speaking}
        lipSyncLevel={lipSyncLevel}
        animate={!speaking}
      />
    </div>
  );
}
