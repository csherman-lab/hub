"use client";

import { useEffect } from "react";
import { useHubStore } from "@/lib/store";

/** Start loading persisted Hub state as soon as the app mounts. */
export function HubStorageBootstrap() {
  useEffect(() => {
    if (!useHubStore.persist.hasHydrated()) {
      void useHubStore.persist.rehydrate();
    }
  }, []);

  return null;
}
