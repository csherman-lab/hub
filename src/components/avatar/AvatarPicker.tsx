"use client";

import { useState } from "react";
import { Volume2, Check } from "lucide-react";
import {
  AVATARS,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  getAvatarsByCategory,
} from "@/lib/avatars";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { previewAvatarVoice, stopSpeaking } from "@/lib/voice";
import { useHubStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Avatar, AvatarCategory } from "@/types";

const CATEGORIES: AvatarCategory[] = ["cinematic", "creative", "professional"];

interface AvatarPickerProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps) {
  const apiKeys = useHubStore((s) => s.apiKeys);
  const [activeCategory, setActiveCategory] =
    useState<AvatarCategory>("cinematic");
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const selected = AVATARS.find((a) => a.id === selectedId);
  const categoryAvatars = getAvatarsByCategory(activeCategory);

  const handlePreview = async (avatar: Avatar, e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeaking();
    setPreviewingId(avatar.id);
    await previewAvatarVoice(avatar, apiKeys.openai);
    setPreviewingId(null);
  };

  const handleSelect = (id: string) => {
    stopSpeaking();
    onSelect(id);
    const avatar = AVATARS.find((a) => a.id === id);
    if (avatar) previewAvatarVoice(avatar, apiKeys.openai);
  };

  return (
    <div className="space-y-6">
      {/* Category tabs — Apple segmented control style */}
      <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
              activeCategory === cat
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-zinc-500">
        {CATEGORY_DESCRIPTIONS[activeCategory]}
      </p>

      {/* Large preview of selected */}
      {selected && selected.category === activeCategory && (
        <div className="flex flex-col items-center rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <AvatarDisplay
            avatar={selected}
            size="lg"
            emotion="happy"
            speaking={previewingId === selected.id}
          />
          <h3 className="mt-4 text-xl font-semibold">{selected.name}</h3>
          <p className="mt-1 text-sm text-zinc-500">{selected.tagline}</p>
          <button
            type="button"
            onClick={(e) => handlePreview(selected, e)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <Volume2 className="h-4 w-4" />
            {previewingId === selected.id ? "Speaking..." : "Hear my voice"}
          </button>
        </div>
      )}

      {/* Avatar grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categoryAvatars.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          const isPreviewing = previewingId === avatar.id;

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => handleSelect(avatar.id)}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all",
                isSelected
                  ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/20"
                  : "border-transparent bg-white hover:border-zinc-200 dark:bg-zinc-900 dark:hover:border-zinc-700",
              )}
            >
              {isSelected && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
              <AvatarDisplay
                avatar={avatar}
                size="sm"
                emotion="happy"
                speaking={isPreviewing}
              />
              <div className="text-center">
                <p className="text-sm font-semibold">{avatar.name}</p>
                <p className="text-xs text-zinc-500 line-clamp-1">
                  {avatar.tagline}
                </p>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handlePreview(avatar, e)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handlePreview(avatar, e as unknown as React.MouseEvent)
                }
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-800 dark:text-zinc-400"
              >
                <Volume2 className="h-3 w-3" />
                Preview
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
