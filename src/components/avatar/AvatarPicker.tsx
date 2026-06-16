"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import {
  AVATARS,
  CATEGORY_LABELS,
  getAvatarsByCategory,
} from "@/lib/avatars";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { previewAvatarVoice, stopSpeaking } from "@/lib/voice";
import { cn } from "@/lib/utils";
import type { Avatar, AvatarCategory } from "@/types";

const CATEGORIES: AvatarCategory[] = ["cinematic", "creative", "professional"];

interface AvatarPickerProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
  /** Onboarding: show every avatar without category tabs */
  showAll?: boolean;
}

export function AvatarPicker({
  selectedId,
  onSelect,
  compact = false,
  showAll = false,
}: AvatarPickerProps) {
  const [activeCategory, setActiveCategory] =
    useState<AvatarCategory>("cinematic");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [lipLevel, setLipLevel] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryAvatars = showAll
    ? AVATARS
    : getAvatarsByCategory(activeCategory);

  const focusedId = hoveredId || selectedId;
  const focused = categoryAvatars.find((a) => a.id === focusedId);

  const speakAvatar = useCallback(async (avatar: Avatar) => {
    stopSpeaking();
    setPreviewingId(avatar.id);
    const { onLipSync } = await import("@/lib/voice");
    onLipSync(setLipLevel);
    await previewAvatarVoice(avatar);
    setPreviewingId(null);
    setLipLevel(0);
  }, []);

  const handleHover = (avatar: Avatar) => {
    setHoveredId(avatar.id);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => speakAvatar(avatar), 400);
  };

  const handleLeave = () => {
    setHoveredId(null);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const handleSelect = (avatar: Avatar) => {
    stopSpeaking();
    onSelect(avatar.id);
    speakAvatar(avatar);
  };

  useEffect(() => () => {
    stopSpeaking();
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 120, behavior: "smooth" });
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {/* Category pills */}
      {!showAll && (
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                stopSpeaking();
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400",
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Live preview strip */}
      <AnimatePresence mode="wait">
        {focused && (
          <motion.div
            key={focused.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <AvatarDisplay
              avatar={focused}
              size="md"
              speaking={previewingId === focused.id}
              lipSyncLevel={previewingId === focused.id ? lipLevel : 0}
              animate={previewingId !== focused.id}
              emotion="happy"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{focused.name}</p>
              <p className="text-xs text-zinc-500">{focused.tagline}</p>
              <p className="mt-1 line-clamp-2 text-xs italic text-zinc-400">
                &ldquo;{focused.previewLine}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => speakAvatar(focused)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
              aria-label="Hear voice"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Horizontal avatar carousel */}
      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute -left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto px-8 py-1 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {categoryAvatars.map((avatar) => {
            const isSelected = selectedId === avatar.id;
            const isActive = hoveredId === avatar.id || isSelected;

            return (
              <motion.button
                key={avatar.id}
                type="button"
                onClick={() => handleSelect(avatar)}
                onMouseEnter={() => handleHover(avatar)}
                onMouseLeave={handleLeave}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 transition-colors",
                  isSelected
                    ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-950/30"
                    : isActive
                      ? "bg-zinc-50 dark:bg-zinc-800/50"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30",
                )}
              >
                <AvatarDisplay
                  avatar={avatar}
                  size="sm"
                  emotion="happy"
                  speaking={previewingId === avatar.id}
                  lipSyncLevel={previewingId === avatar.id ? lipLevel : 0}
                  animate={isActive && previewingId !== avatar.id}
                />
                <span className="max-w-[72px] truncate text-[11px] font-medium">
                  {avatar.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute -right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
