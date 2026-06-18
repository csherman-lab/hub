"use client";

import { useEffect } from "react";
import { useHubStore } from "@/lib/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useHubStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark =
      theme === "dark" || (theme === "system" && prefersDark);

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [theme]);

  return <>{children}</>;
}
