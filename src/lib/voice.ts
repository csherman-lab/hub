let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export async function speakWithOpenAI(
  text: string,
  voiceId: string,
  apiKey?: string,
): Promise<boolean> {
  stopSpeaking();

  if (apiKey) {
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId, apiKey }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);
        await currentAudio.play();
        return new Promise((resolve) => {
          currentAudio!.onended = () => {
            URL.revokeObjectURL(url);
            resolve(true);
          };
        });
      }
    } catch {
      /* fall through to browser TTS */
    }
  }

  return speakWithBrowser(text);
}

export function speakWithBrowser(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve(false);
      return;
    }
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
}

export async function previewAvatarVoice(
  avatar: { previewLine: string; voiceId: string },
  apiKey?: string,
) {
  return speakWithOpenAI(avatar.previewLine, avatar.voiceId, apiKey);
}
