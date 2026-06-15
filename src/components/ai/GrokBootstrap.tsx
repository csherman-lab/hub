"use client";

import { useEffect } from "react";
import { useHubStore } from "@/lib/store";

export function GrokBootstrap() {
  const connectConnector = useHubStore((s) => s.connectConnector);
  const disconnectConnector = useHubStore((s) => s.disconnectConnector);
  const setGrokStatus = useHubStore((s) => s.setGrokStatus);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/status");
        const data = await res.json();
        if (cancelled) return;
        setGrokStatus({
          configured: !!data.configured,
          chat: !!data.chat,
          voice: !!data.voice,
        });
        if (data.configured && data.chat) connectConnector("xai");
        else disconnectConnector("xai");
      } catch {
        if (!cancelled) {
          setGrokStatus({ configured: false, chat: false, voice: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connectConnector, disconnectConnector, setGrokStatus]);

  return null;
}
