"use client";

import { motion } from "framer-motion";
import type { Avatar, AvatarEmotion } from "@/types";
import { cn } from "@/lib/utils";

interface PortraitAvatarProps {
  avatar: Avatar;
  emotion?: AvatarEmotion;
  speaking?: boolean;
  listening?: boolean;
  lipSyncLevel?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
}

const SIZE = {
  xs: "h-12 w-12",
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-64 w-56",
  xl: "h-80 w-72",
  hero: "h-[min(52vh,420px)] w-[min(46vh,380px)]",
};

const EMOTION_EYES: Record<AvatarEmotion, number> = {
  neutral: 0,
  happy: -2,
  thinking: 2,
  surprised: -6,
  empathetic: 1,
};

/** Animated shoulders-up portrait — interim until full 3D RPM pipeline */
export function PortraitAvatar({
  avatar,
  emotion = "neutral",
  speaking = false,
  listening = false,
  lipSyncLevel = 0,
  size = "hero",
  className,
}: PortraitAvatarProps) {
  const mouthOpen = speaking ? 4 + lipSyncLevel * 18 : 2;
  const eyeOffset = EMOTION_EYES[emotion];
  const isFemale = avatar.gender === "female";
  const compact = size === "xs" || size === "sm" || size === "md";

  return (
    <motion.div
      className={cn("relative mx-auto", SIZE[size], className)}
      animate={
        compact
          ? {}
          : speaking
            ? { y: [0, -4, 0], rotate: [0, 0.5, 0] }
            : { y: [0, -5, 0], scale: [1, 1.008, 1] }
      }
      transition={{
        duration: speaking ? 0.5 : 3.8,
        repeat: compact ? 0 : Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 200 240"
        className={cn(
          "h-full w-full",
          compact ? "drop-shadow-md" : "drop-shadow-2xl",
        )}
        aria-label={`${avatar.name} avatar`}
      >
        <ellipse cx="100" cy="230" rx="88" ry="42" fill={avatar.accentColor} opacity="0.35" />
        <path
          d="M 35 200 Q 100 175 165 200 L 165 240 L 35 240 Z"
          fill={avatar.accentColor}
          opacity="0.55"
        />
        <rect x="82" y="155" width="36" height="30" rx="8" fill="#f5d0b5" />
        <ellipse cx="100" cy="105" rx="52" ry="58" fill="#f5d0b5" />
        <ellipse
          cx="100"
          cy={isFemale ? 72 : 78}
          rx={isFemale ? 56 : 54}
          ry={isFemale ? 38 : 32}
          fill={isFemale ? "#3d2314" : "#2c1810"}
        />
        {isFemale && (
          <path
            d="M 48 90 Q 30 130 45 165 Q 55 140 52 100 Z M 152 90 Q 170 130 155 165 Q 145 140 148 100 Z"
            fill="#3d2314"
          />
        )}
        <g style={{ transform: `translateY(${eyeOffset}px)` }}>
          <ellipse cx="78" cy="108" rx="7" ry={emotion === "surprised" ? 9 : 6} fill="#2c1810" />
          <ellipse cx="122" cy="108" rx="7" ry={emotion === "surprised" ? 9 : 6} fill="#2c1810" />
          <circle cx="80" cy="106" r="2" fill="white" opacity="0.7" />
          <circle cx="124" cy="106" r="2" fill="white" opacity="0.7" />
        </g>
        <path
          d={`M 66 ${100 + eyeOffset} Q 78 ${94 + eyeOffset} 90 ${100 + eyeOffset}`}
          stroke="#3d2314"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 110 ${100 + eyeOffset} Q 122 ${94 + eyeOffset} 134 ${100 + eyeOffset}`}
          stroke="#3d2314"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M 100 115 Q 95 125 100 128 Q 105 125 100 115" fill="#e8b896" />
        <ellipse
          cx="100"
          cy="142"
          rx={speaking ? 10 + lipSyncLevel * 6 : emotion === "happy" ? 12 : 8}
          ry={mouthOpen}
          fill="#c97b6b"
        />
        {emotion === "happy" && (
          <path
            d="M 86 136 Q 100 148 114 136"
            stroke="#b85a4a"
            strokeWidth="1.5"
            fill="none"
          />
        )}
      </svg>
      {!compact && (speaking || listening) && (
        <motion.div
          className="absolute -bottom-1 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-blue-400/40 blur-sm"
          animate={{ opacity: [0.3, 0.8, 0.3], scaleX: [0.7, 1.2, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
