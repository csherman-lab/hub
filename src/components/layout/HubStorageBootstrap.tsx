"use client";

import { useEffect } from "react";
import { useHubStore } from "@/lib/store";

/** Start loading persisted Hub state once on app mount. */
export function HubStorageBootstrap() {
  useEffect(() => {
    void useHubStore.persist.rehydrate();
  }, []);

  return null;
}
