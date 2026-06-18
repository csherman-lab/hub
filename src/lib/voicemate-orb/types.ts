export interface VoiceMateOrbStatus {
  label?: string;
  listening?: boolean;
  speaking?: boolean;
  online?: boolean;
}

export interface VoiceMateOrbInitOptions {
  selector: string | Element | Element[];
  typingTarget?: string | Element | null;
  followCursor?: boolean;
  ariaLabel?: string;
}

export interface VoiceMateOrbApi {
  init: (options?: VoiceMateOrbInitOptions) => VoiceMateOrbApi;
  destroy: () => VoiceMateOrbApi;
  setStatus: (status?: VoiceMateOrbStatus) => VoiceMateOrbApi;
  setMood: (mood: string) => VoiceMateOrbApi;
  setEyeMode: (mode: string) => VoiceMateOrbApi;
  setExpression: (type: string, durationMs?: number) => VoiceMateOrbApi;
  detectExpression: (text: string) => string | null;
  squint: (orb?: Element) => VoiceMateOrbApi;
  setLive: (active: boolean) => VoiceMateOrbApi;
  setStreaming: (active: boolean) => VoiceMateOrbApi;
  startAudioReaction: (
    analyser: AnalyserNode,
    options?: { gain?: number },
  ) => VoiceMateOrbApi;
  stopAudioReaction: () => VoiceMateOrbApi;
  createOrbMarkup: (options?: {
    size?: string;
    id?: string;
    className?: string;
  }) => string;
  MOODS: string[];
}

declare global {
  interface Window {
    VoiceMateOrb?: VoiceMateOrbApi;
  }
}
