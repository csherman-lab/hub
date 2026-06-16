"use client";

import dynamic from "next/dynamic";
import { PortraitAvatar } from "@/components/avatar/PortraitAvatar";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import type { Avatar, AvatarEmotion } from "@/types";
import { cn } from "@/lib/utils";

const Avatar3D = dynamic(
  () => import("@/components/avatar/Avatar3D").then((m) => m.Avatar3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    ),
  },
);

interface LiveAvatarProps {
  avatar: Avatar;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  size?: "lg" | "xl" | "hero";
  className?: string;
  /** 3D GLB for calls/video; false = flat portrait */
  use3D?: boolean;
  portrait?: boolean;
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
  use3D = true,
  portrait = true,
}: LiveAvatarProps) {
  if (use3D && portrait) {
    return (
      <div className={cn("mx-auto", SIZE_CLASS[size], className)}>
        <Avatar3D avatar={avatar} speaking={speaking || listening} />
      </div>
    );
  }

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
