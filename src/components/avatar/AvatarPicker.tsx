"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Volume2 } from "lucide-react";
import {
  AVATARS,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  getAvatarsByCategory,
} from "@/lib/avatars";
import { VoiceMateOrbAvatar } from "@/components/avatar/VoiceMateOrbAvatar";
import { previewAvatarVoice, stopSpeaking } from "@/lib/voice";
import { cn } from "@/lib/utils";
import type { Avatar, AvatarCategory } from "@/types";

const CATEGORIES: AvatarCategory[] = ["orbs", "spark"];

interface AvatarPickerProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  showAll?: boolean;
}

export function AvatarPicker({
  selectedId,
  onSelect,
  showAll = false,
}: AvatarPickerProps) {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>("orbs");
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const list = showAll ? AVATARS : getAvatarsByCategory(activeCategory);
  const selected = AVATARS.find((a) => a.id === selectedId);

  const speakAvatar = useCallback(async (avatar: Avatar) => {
    stopSpeaking();
    setPreviewingId(avatar.id);
    await previewAvatarVoice(avatar);
    setPreviewingId(null);
  }, []);

  const handleSelect = (avatar: Avatar) => {
    stopSpeaking();
    onSelect(avatar.id);
  };

  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="space-y-5">
      {!showAll && (
        <div className="space-y-2">
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
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            {CATEGORY_DESCRIPTIONS[activeCategory]}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => handleSelect(avatar)}
              className={cn(
                "relative flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-all",
                isSelected
                  ? "border-blue-500 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20 dark:bg-blue-950/30"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
              )}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="h-24 w-24">
                <VoiceMateOrbAvatar
                  variant={avatar.orbVariant}
                  size="md"
                  speaking={previewingId === avatar.id}
                  followCursor={false}
                  interactive={false}
                  ariaLabel={avatar.name}
                  className="h-full w-full"
                />
              </div>
              <p className="mt-2 font-semibold">{avatar.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{avatar.tagline}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {selected.name} selected
            </p>
            <p className="mt-0.5 truncate text-xs italic text-zinc-500">
              &ldquo;{selected.previewLine}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={() => speakAvatar(selected)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
            aria-label={`Hear ${selected.name}`}
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
