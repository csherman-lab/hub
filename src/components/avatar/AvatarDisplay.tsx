"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { PortraitAvatar } from "@/components/avatar/PortraitAvatar";
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

const PORTRAIT_SIZES = new Set(["xs", "sm", "md", "lg", "xl", "hero"]);

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

  if (!showImage) {
    return (
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5",
          SIZE_MAP[size],
          className,
        )}
      >
        <PortraitAvatar
          avatar={avatar}
          size={PORTRAIT_SIZES.has(size) ? size : "md"}
          emotion={emotion}
          speaking={speaking}
          lipSyncLevel={lipSyncLevel}
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        SIZE_MAP[size],
        className,
      )}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5",
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
    </div>
  );
}
