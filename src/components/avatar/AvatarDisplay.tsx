"use client";

import type { Avatar, AvatarEmotion } from "@/types";
import { cn } from "@/lib/utils";

interface AvatarDisplayProps {
  avatar: Avatar;
  emotion?: AvatarEmotion;
  size?: "sm" | "md" | "lg" | "xl";
  speaking?: boolean;
  className?: string;
}

const EMOTION_MAP: Record<
  AvatarEmotion,
  { mouth: string; eyebrowL: string; eyebrowR: string; eyeScale: number }
> = {
  neutral: {
    mouth: "M 35 58 Q 50 62 65 58",
    eyebrowL: "M 28 32 Q 36 28 44 32",
    eyebrowR: "M 56 32 Q 64 28 72 32",
    eyeScale: 1,
  },
  happy: {
    mouth: "M 32 54 Q 50 68 68 54",
    eyebrowL: "M 28 30 Q 36 24 44 30",
    eyebrowR: "M 56 30 Q 64 24 72 30",
    eyeScale: 0.85,
  },
  thinking: {
    mouth: "M 38 60 Q 50 58 62 60",
    eyebrowL: "M 28 34 Q 38 30 44 34",
    eyebrowR: "M 56 28 Q 66 24 72 28",
    eyeScale: 1,
  },
  surprised: {
    mouth: "M 42 58 A 8 10 0 1 1 58 58 A 8 10 0 1 1 42 58",
    eyebrowL: "M 26 26 Q 36 20 44 26",
    eyebrowR: "M 56 26 Q 66 20 72 26",
    eyeScale: 1.15,
  },
  empathetic: {
    mouth: "M 34 56 Q 50 64 66 56",
    eyebrowL: "M 28 32 Q 36 30 42 34",
    eyebrowR: "M 58 34 Q 64 30 72 32",
    eyeScale: 0.95,
  },
};

const SIZE_MAP = {
  sm: "h-24 w-24",
  md: "h-40 w-40",
  lg: "h-64 w-64",
  xl: "h-[min(70vh,520px)] w-[min(70vh,520px)]",
};

export function AvatarDisplay({
  avatar,
  emotion = "neutral",
  size = "md",
  speaking = false,
  className,
}: AvatarDisplayProps) {
  const e = EMOTION_MAP[emotion];

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
          "relative h-full w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl",
          speaking && "animate-pulse-subtle",
        )}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {/* Neck */}
          <ellipse cx="50" cy="88" rx="14" ry="8" fill={avatar.skinTone} />

          {/* Shirt */}
          <path
            d="M 25 75 Q 50 82 75 75 L 80 100 L 20 100 Z"
            fill={avatar.shirtColor}
          />

          {/* Face */}
          <ellipse cx="50" cy="48" rx="32" ry="34" fill={avatar.skinTone} />

          {/* Hair */}
          <path
            d="M 20 42 Q 18 18 50 16 Q 82 18 80 42 Q 75 28 50 26 Q 25 28 20 42"
            fill={avatar.hairColor}
          />

          {/* Beard for some avatars */}
          {(avatar.accessory === "beret" || avatar.accessory === "paintbrush") && (
            <path
              d="M 30 52 Q 32 68 50 72 Q 68 68 70 52 Q 65 62 50 64 Q 35 62 30 52"
              fill={avatar.hairColor}
              opacity="0.85"
            />
          )}

          {/* Beret */}
          {avatar.accessory === "beret" && (
            <>
              <ellipse cx="50" cy="22" rx="28" ry="10" fill="#1D1D1F" />
              <ellipse cx="50" cy="18" rx="18" ry="8" fill="#2C2C2E" />
            </>
          )}

          {/* Glasses */}
          {avatar.accessory === "glasses" && (
            <>
              <circle
                cx="36"
                cy="44"
                r="10"
                fill="none"
                stroke="#1D1D1F"
                strokeWidth="2"
              />
              <circle
                cx="64"
                cy="44"
                r="10"
                fill="none"
                stroke="#1D1D1F"
                strokeWidth="2"
              />
              <line
                x1="46"
                y1="44"
                x2="54"
                y2="44"
                stroke="#1D1D1F"
                strokeWidth="2"
              />
            </>
          )}

          {/* Headphones */}
          {avatar.accessory === "headphones" && (
            <>
              <path
                d="M 22 44 Q 20 30 50 28 Q 80 30 78 44"
                fill="none"
                stroke="#1D1D1F"
                strokeWidth="4"
              />
              <rect x="16" y="40" width="10" height="16" rx="4" fill="#1D1D1F" />
              <rect x="74" y="40" width="10" height="16" rx="4" fill="#1D1D1F" />
            </>
          )}

          {/* Paintbrush behind ear */}
          {avatar.accessory === "paintbrush" && (
            <>
              <rect
                x="72"
                y="30"
                width="4"
                height="20"
                rx="1"
                fill="#8B4513"
                transform="rotate(15 74 40)"
              />
              <ellipse
                cx="78"
                cy="28"
                rx="3"
                ry="5"
                fill={avatar.accentColor}
                transform="rotate(15 78 28)"
              />
            </>
          )}

          {/* Eyebrows */}
          <path
            d={e.eyebrowL}
            fill="none"
            stroke={avatar.hairColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={e.eyebrowR}
            fill="none"
            stroke={avatar.hairColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Eyes */}
          <ellipse
            cx="36"
            cy="44"
            rx={5 * e.eyeScale}
            ry={6 * e.eyeScale}
            fill="#1D1D1F"
          />
          <ellipse
            cx="64"
            cy="44"
            rx={5 * e.eyeScale}
            ry={6 * e.eyeScale}
            fill="#1D1D1F"
          />
          <circle cx="38" cy="42" r="1.5" fill="white" />
          <circle cx="66" cy="42" r="1.5" fill="white" />

          {/* Mouth */}
          <path
            d={e.mouth}
            fill="none"
            stroke="#8B4513"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Cheek blush for happy/empathetic */}
          {(emotion === "happy" || emotion === "empathetic") && (
            <>
              <ellipse cx="26" cy="52" rx="5" ry="3" fill="#FF6B6B" opacity="0.25" />
              <ellipse cx="74" cy="52" rx="5" ry="3" fill="#FF6B6B" opacity="0.25" />
            </>
          )}
        </svg>

        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-blue-500"
                style={{
                  height: `${8 + Math.sin(i) * 4}px`,
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
