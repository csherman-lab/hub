"use client";

import { useEffect } from "react";
import { useHubStore } from "@/lib/store";

export function GrokBootstrap() {
  const connectConnector = useHubStore((s) => s.connectConnector);
  const disconnectConnector = useHubStore((s) => s.disconnectConnector);
  const setGrokStatus = useHubStore((s) => s.setGrokStatus);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 8000);
        const res = await fetch("/api/ai/status", { signal: controller.signal });
        window.clearTimeout(timeout);
        const data = await res.json();
        if (cancelled) return;

        setGrokStatus({
          configured: !!data.configured,
          chat: !!data.chat,
          voice: !!data.voice,
        });

        if (data.configured && data.chat) {
          connectConnector("xai");
        } else {
          disconnectConnector("xai");
        }
      } catch {
        if (cancelled) return;
        const xaiConnected =
          useHubStore.getState().connectors.find((c) => c.id === "xai")
            ?.status === "connected";
        if (!xaiConnected) {
          setGrokStatus({ configured: false, chat: false, voice: false });
        }
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [connectConnector, disconnectConnector, setGrokStatus]);

  return null;
}
