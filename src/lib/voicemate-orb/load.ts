import type { VoiceMateOrbApi } from "@/lib/voicemate-orb/types";

let loadPromise: Promise<VoiceMateOrbApi> | null = null;

export function getVoiceMateOrbApi(): VoiceMateOrbApi | null {
  if (typeof window === "undefined") return null;
  return window.VoiceMateOrb ?? null;
}

export function loadVoiceMateOrbApi(): Promise<VoiceMateOrbApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("VoiceMateOrb is only available in the browser"));
  }

  if (window.VoiceMateOrb) {
    return Promise.resolve(window.VoiceMateOrb);
  }

  loadPromise ??= new Promise<VoiceMateOrbApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-voicemate-orb="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.VoiceMateOrb) resolve(window.VoiceMateOrb);
        else reject(new Error("VoiceMateOrb failed to initialize"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("VoiceMateOrb script failed to load")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "/voicemate-orb/voicemate-orb.js";
    script.async = true;
    script.dataset.voicemateOrb = "true";
    script.onload = () => {
      if (window.VoiceMateOrb) resolve(window.VoiceMateOrb);
      else reject(new Error("VoiceMateOrb failed to initialize"));
    };
    script.onerror = () => reject(new Error("VoiceMateOrb script failed to load"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
