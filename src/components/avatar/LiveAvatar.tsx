"use client";

import { motion } from "framer-motion";
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
}

const EMOTION_TILT: Record<AvatarEmotion, number> = {
  neutral: 0,
  happy: 2,
  thinking: -3,
  surprised: 4,
  empathetic: -1,
};

/** Call-mode avatar with idle life + speaking motion. Interim until 3D pipeline. */
export function LiveAvatar({
  avatar,
  emotion = "neutral",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  size = "hero",
  className,
}: LiveAvatarProps) {
  const tilt = EMOTION_TILT[emotion];

  return (
    <motion.div
      className={cn("relative", className)}
      animate={
        speaking
          ? { y: [0, -3, 0], rotate: [tilt, tilt + 1, tilt] }
          : listening
            ? { scale: [1, 1.02, 1] }
            : { y: [0, -4, 0], scale: [1, 1.01, 1] }
      }
      transition={{
        duration: speaking ? 0.45 : listening ? 1.2 : 3.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <AvatarDisplay
        avatar={avatar}
        size={size}
        emotion={emotion}
        speaking={speaking}
        lipSyncLevel={lipSyncLevel}
        animate={!speaking && !listening}
        className="drop-shadow-xl"
      />
      {(speaking || listening) && (
        <motion.div
          className="pointer-events-none absolute -bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-blue-400/30 blur-sm"
          animate={{ opacity: [0.3, 0.7, 0.3], scaleX: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
