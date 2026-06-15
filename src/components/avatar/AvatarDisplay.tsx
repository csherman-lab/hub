"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Avatar, AvatarEmotion } from "@/types";
import { cn } from "@/lib/utils";

interface AvatarDisplayProps {
  avatar: Avatar;
  emotion?: AvatarEmotion;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  speaking?: boolean;
  lipSyncLevel?: number;
  animate?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: "h-12 w-12",
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-36 w-36",
  xl: "h-48 w-48",
  hero: "h-[min(45vh,380px)] w-[min(45vh,380px)]",
};

function AvatarFallback({ avatar, size }: { avatar: Avatar; size: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center rounded-2xl text-white shadow-md",
        size,
      )}
      style={{
        background: `linear-gradient(145deg, ${avatar.accentColor}, ${avatar.accentColor}99)`,
      }}
    >
      <span className="text-3xl font-bold opacity-90">{avatar.name[0]}</span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wide opacity-80">
        {avatar.name}
      </span>
    </div>
  );
}

export function AvatarDisplay({
  avatar,
  emotion = "neutral",
  size = "md",
  speaking = false,
  lipSyncLevel = 0,
  animate = false,
  className,
}: AvatarDisplayProps) {
  const [imgError, setImgError] = useState(false);
  const mouthH = 4 + lipSyncLevel * 14;
  const mouthW = 10 + lipSyncLevel * 6;
  const showImage = avatar.image && !imgError;

  const inner = showImage ? (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-md",
        speaking && "shadow-lg ring-2 ring-blue-400/30",
      )}
    >
      <motion.div
        className="relative h-full w-full"
        animate={
          animate
            ? { scale: [1, 1.02, 1], y: [0, -2, 0] }
            : speaking
              ? { scale: 1.01 }
              : {}
        }
        transition={
          animate
            ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
      >
        <Image
          src={avatar.image!}
          alt={avatar.name}
          fill
          className={cn(
            "object-cover object-top transition-all duration-200",
            emotion === "happy" && "brightness-[1.03]",
            emotion === "thinking" && "brightness-[0.97]",
          )}
          sizes="160px"
          onError={() => setImgError(true)}
        />
        {(speaking || lipSyncLevel > 0.05) && (
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-black/25 blur-[1px]"
            style={{
              bottom: size === "hero" || size === "xl" ? "28%" : "30%",
              width: mouthW,
              height: mouthH,
              transition: "width 75ms, height 75ms",
            }}
          />
        )}
      </motion.div>
    </div>
  ) : (
    <AvatarFallback avatar={avatar} size="h-full w-full" />
  );

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        SIZE_MAP[size],
        className,
      )}
    >
      {inner}
    </div>
  );
}
