"use client";

import { useEffect, useState } from "react";

/** Random blink cycle for living avatar characters */
export function useLivingBlink(minMs = 2400, maxMs = 5200) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | undefined;
    let openTimeout: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      blinkTimeout = setTimeout(() => {
        setBlinking(true);
        openTimeout = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 130);
      }, delay);
    };

    schedule();

    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
      if (openTimeout) clearTimeout(openTimeout);
    };
  }, [maxMs, minMs]);

  return blinking;
}
