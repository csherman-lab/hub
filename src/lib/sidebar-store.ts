"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSidebarStore = create(
  persist<{
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    toggle: () => void;
  }>(
    (set) => ({
      collapsed: false,
      setCollapsed: (collapsed) => set({ collapsed }),
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: "hub-sidebar" },
  ),
);
