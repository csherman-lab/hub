let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let lipSyncCallback: ((level: number) => void) | null = null;
let lipSyncFrame: number | null = null;

export function onLipSync(callback: (level: number) => void) {
  lipSyncCallback = callback;
}

export function stopLipSyncTracking() {
  if (lipSyncFrame) cancelAnimationFrame(lipSyncFrame);
  lipSyncFrame = null;
  lipSyncCallback?.(0);
}

function trackLipSync() {
  if (!analyser || !lipSyncCallback) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  const tick = () => {
    if (!analyser) return;
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    lipSyncCallback!(Math.min(1, avg / 80));
    lipSyncFrame = requestAnimationFrame(tick);
  };
  tick();
}

export function stopSpeaking() {
  stopLipSyncTracking();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export async function speakWithGrok(
  text: string,
  voiceId: string,
): Promise<boolean> {
  stopSpeaking();

  try {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!res.ok) return speakWithBrowser(text);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);

    try {
      audioContext = audioContext || new AudioContext();
      const source = audioContext.createMediaElementSource(currentAudio);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      trackLipSync();
    } catch {
      /* CORS/audio graph may fail — lip sync falls back to animation */
    }

    await currentAudio.play();
    return new Promise((resolve) => {
      currentAudio!.onended = () => {
        stopLipSyncTracking();
        URL.revokeObjectURL(url);
        resolve(true);
      };
    });
  } catch {
    return speakWithBrowser(text);
  }
}

export function speakWithBrowser(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve(false);
      return;
    }
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.onstart = () => {
      let t = 0;
      const pulse = () => {
        if (!window.speechSynthesis.speaking) return;
        lipSyncCallback?.(0.3 + Math.sin(t++ * 0.3) * 0.25);
        lipSyncFrame = requestAnimationFrame(pulse);
      };
      pulse();
    };
    utterance.onend = () => {
      stopLipSyncTracking();
      resolve(true);
    };
    utterance.onerror = () => {
      stopLipSyncTracking();
      resolve(false);
    };
    window.speechSynthesis.speak(utterance);
  });
}

export async function previewAvatarVoice(avatar: {
  previewLine: string;
  voiceId: string;
}) {
  return speakWithGrok(avatar.previewLine, avatar.voiceId);
}
