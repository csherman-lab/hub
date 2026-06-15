"use client";

import { useEffect, useState } from "react";
import { useHubStore } from "@/lib/store";

/** Wait for zustand persist to load from localStorage before routing decisions. */
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);

    const unsub = useHubStore.persist.onFinishHydration(finish);

    if (useHubStore.persist.hasHydrated()) {
      finish();
    } else {
      void useHubStore.persist.rehydrate();
    }

    // Never block the UI forever if hydration stalls (private mode, corrupt storage, etc.)
    const timeout = window.setTimeout(finish, 2000);

    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, []);

  return hydrated;
}
