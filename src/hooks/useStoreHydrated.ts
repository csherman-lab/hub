"use client";

import { useEffect, useState } from "react";
import { useHubStore } from "@/lib/store";

/** Wait for zustand persist to load from localStorage before routing decisions. */
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setHydrated(true);
    };

    const unsub = useHubStore.persist.onFinishHydration(finish);

    if (useHubStore.persist.hasHydrated()) {
      finish();
    }

    // Never wipe storage on timeout — just unblock the UI with current state.
    const timeout = window.setTimeout(finish, 3000);

    return () => {
      cancelled = true;
      unsub();
      window.clearTimeout(timeout);
    };
  }, []);

  return hydrated;
}
