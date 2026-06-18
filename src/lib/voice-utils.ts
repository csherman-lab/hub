/** Trim and shorten text for natural voice playback. */
export function prepareSpeechText(text: string, fast = false): string {
  const cleaned = text
    .replace(/[*_#`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const sentences = cleaned.match(/[^.!?]+[.!?]?/g) || [cleaned];
  const limit = fast ? 2 : 4;
  const joined = sentences.slice(0, limit).join(" ").trim();

  if (joined.length <= 280) return joined;
  return `${joined.slice(0, 277).trim()}...`;
}
