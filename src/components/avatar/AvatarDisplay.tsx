"use client";

import Image from "next/image";
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

export function AvatarDisplay({
  avatar,
  emotion = "neutral",
  size = "md",
  speaking = false,
  lipSyncLevel = 0,
  animate = false,
  className,
}: AvatarDisplayProps) {
  const mouthH = 4 + lipSyncLevel * 14;
  const mouthW = 10 + lipSyncLevel * 6;

  const inner = avatar.image ? (
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
          src={avatar.image}
          alt={avatar.name}
          fill
          className={cn(
            "object-cover object-top transition-all duration-200",
            emotion === "happy" && "brightness-[1.03]",
          )}
          sizes="160px"
        />
        {/* Lip-sync mouth overlay */}
        {(speaking || lipSyncLevel > 0.05) && (
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-black/20 blur-[1px]"
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
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-100">
      <span className="text-lg font-semibold text-zinc-400">{avatar.name[0]}</span>
    </div>
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
