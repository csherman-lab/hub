"use client";

import { useEffect, useState } from "react";
import { resetHubStorage, useHubStore } from "@/lib/store";

/** Wait for zustand persist to load from localStorage before routing decisions. */
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setHydrated(true);
    };

    const recover = (reason: string) => {
      console.warn(`[Hub] ${reason} — resetting saved state`);
      resetHubStorage();
      finish();
    };

    const unsub = useHubStore.persist.onFinishHydration(finish);

    if (useHubStore.persist.hasHydrated()) {
      finish();
      return () => {
        cancelled = true;
        unsub();
      };
    }

    const rehydrateResult = useHubStore.persist.rehydrate();
    if (
      rehydrateResult &&
      typeof (rehydrateResult as Promise<unknown>).catch === "function"
    ) {
      (rehydrateResult as Promise<void>).catch(() => {
        if (!cancelled) recover("Storage hydration failed");
      });
    }

    const timeout = window.setTimeout(() => {
      if (!cancelled && !useHubStore.persist.hasHydrated()) {
        recover("Storage hydration timed out");
      }
    }, 2500);

    return () => {
      cancelled = true;
      unsub();
      window.clearTimeout(timeout);
    };
  }, []);

  return hydrated;
}
