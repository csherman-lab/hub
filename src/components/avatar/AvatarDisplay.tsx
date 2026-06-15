"use client";

import Image from "next/image";
import type { Avatar, AvatarEmotion } from "@/types";
import { cn } from "@/lib/utils";

interface AvatarDisplayProps {
  avatar: Avatar;
  emotion?: AvatarEmotion;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  speaking?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: "h-20 w-20",
  md: "h-36 w-36",
  lg: "h-56 w-56",
  xl: "h-[min(65vh,480px)] w-[min(65vh,480px)]",
  hero: "h-[min(72vh,560px)] w-[min(72vh,560px)]",
};

export function AvatarDisplay({
  avatar,
  emotion = "neutral",
  size = "md",
  speaking = false,
  className,
}: AvatarDisplayProps) {
  if (avatar.image) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center",
          SIZE_MAP[size],
          className,
        )}
      >
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]",
            speaking && "ring-4 ring-blue-400/40 ring-offset-2",
          )}
        >
          <Image
            src={avatar.image}
            alt={avatar.name}
            fill
            className={cn(
              "object-cover object-top transition-transform duration-300",
              speaking && "scale-[1.02]",
              emotion === "happy" && "brightness-105",
            )}
            sizes="(max-width: 768px) 100vw, 480px"
            priority={size === "xl" || size === "hero"}
          />
          {speaking && (
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-white"
                  style={{
                    animation: `soundwave 0.${5 + i}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-zinc-100 to-zinc-200",
        SIZE_MAP[size],
        className,
      )}
    >
      <span className="text-4xl font-semibold text-zinc-400">
        {avatar.name[0]}
      </span>
    </div>
  );
}
