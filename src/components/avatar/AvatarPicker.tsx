"use client";

import { AVATARS, CATEGORY_LABELS } from "@/lib/avatars";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { cn } from "@/lib/utils";
import type { AvatarCategory } from "@/types";

interface AvatarPickerProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  filterCategory?: AvatarCategory | "all";
}

export function AvatarPicker({
  selectedId,
  onSelect,
  filterCategory = "all",
}: AvatarPickerProps) {
  const filtered =
    filterCategory === "all"
      ? AVATARS
      : AVATARS.filter((a) => a.category === filterCategory);

  const categories = [...new Set(AVATARS.map((a) => a.category))];

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const inCat = filtered.filter((a) => a.category === cat);
        if (inCat.length === 0) return null;

        return (
          <div key={cat}>
            <h3 className="mb-3 text-sm font-medium text-zinc-500">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {inCat.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onSelect(avatar.id)}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all",
                    selectedId === avatar.id
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                      : "border-transparent bg-zinc-50 hover:border-zinc-200 dark:bg-zinc-900 dark:hover:border-zinc-700",
                  )}
                >
                  <AvatarDisplay avatar={avatar} size="sm" emotion="happy" />
                  <div className="text-center">
                    <p className="text-sm font-semibold">{avatar.name}</p>
                    <p className="text-xs text-zinc-500">{avatar.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
