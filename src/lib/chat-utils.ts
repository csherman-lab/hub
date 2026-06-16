/** Grok built-in voices — female: eve, ara | male: leo, sal, rex */
export const GROK_VOICES = {
  female: ["eve", "ara"] as const,
  male: ["leo", "sal", "rex"] as const,
};

export function parseGrokJson<T>(content: string): T {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1].trim() : trimmed;
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  return JSON.parse(objectMatch ? objectMatch[0] : jsonStr) as T;
}

export function sanitizeReply(text: string): string {
  let reply = text.trim();

  // Strip accidental JSON wrapper if parse failed upstream
  if (reply.startsWith("{") && reply.includes('"reply"')) {
    try {
      const parsed = JSON.parse(reply) as { reply?: string };
      if (parsed.reply) reply = parsed.reply;
    } catch {
      /* keep original */
    }
  }

  // Collapse repeated lines (common Grok glitch)
  const lines = reply.split("\n").map((l) => l.trim()).filter(Boolean);
  const unique: string[] = [];
  for (const line of lines) {
    if (unique[unique.length - 1] !== line) unique.push(line);
  }

  let result = unique.join(" ").replace(/\s{2,}/g, " ").trim();
  result = result
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 $2")
    .replace(/\s+-\s+/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",");

  return result.trim();
}
