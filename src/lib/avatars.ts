import type { Avatar } from "@/types";

/** xAI Grok voice IDs — see GET https://api.x.ai/v1/tts/voices */
export const AVATARS: Avatar[] = [
  {
    id: "voicemate",
    name: "VoiceMate",
    gender: "male",
    category: "orbs",
    tagline: "Your signature companion",
    personality:
      "Upbeat, personable, and conversational. Talks like a close friend — casual, encouraging, always engaged.",
    voiceId: "leo",
    previewLine:
      "Hey! I'm VoiceMate — your living voice companion. Let's figure things out together.",
    renderer: "orb",
    orbVariant: "violet",
    accentColor: "#AF52DE",
  },
  {
    id: "pulse",
    name: "Pulse",
    gender: "female",
    category: "orbs",
    tagline: "Cool & electric",
    personality:
      "Quick-witted and energetic. Speaks with spark and momentum — always ready to brainstorm or cheer you on.",
    voiceId: "eve",
    previewLine:
      "Hi! I'm Pulse — sharp, bright, and always tuned in. What's on your mind?",
    renderer: "orb",
    orbVariant: "aurora",
    accentColor: "#5AC8FA",
  },
  {
    id: "ember",
    name: "Ember",
    gender: "male",
    category: "orbs",
    tagline: "Warm & bold",
    personality:
      "Confident and direct with a warm edge. Gets to the point but never feels cold.",
    voiceId: "rex",
    previewLine:
      "Ember here. Tell me what you need — I'll help you move on it.",
    renderer: "orb",
    orbVariant: "ember",
    accentColor: "#FF6B35",
  },
  {
    id: "aria",
    name: "Aria",
    gender: "female",
    category: "spark",
    tagline: "Calm & capable",
    personality:
      "Calm, confident, and polished. Speaks clearly and efficiently — professional but never cold.",
    voiceId: "ara",
    previewLine:
      "Hi there. I'm Aria. I handle email, calendars, and keeping your day on track.",
    renderer: "orb",
    orbVariant: "ocean",
    accentColor: "#007AFF",
  },
  {
    id: "jules",
    name: "Jules",
    gender: "female",
    category: "spark",
    tagline: "Creative & warm",
    personality:
      "Warm, witty, and imaginative. Speaks like a creative friend — enthusiastic, vivid language.",
    voiceId: "eve",
    previewLine:
      "Hey! I'm Jules — all about creative ideas, writing, and making things feel alive.",
    renderer: "orb",
    orbVariant: "forest",
    accentColor: "#34C759",
  },
  {
    id: "marco",
    name: "Marco",
    gender: "male",
    category: "spark",
    tagline: "Thoughtful researcher",
    personality:
      "Thoughtful and curious. Speaks slowly and precisely, loves explaining things with context.",
    voiceId: "sal",
    previewLine:
      "Hello. I'm Marco. Give me any topic and I'll dig deep and break it down for you.",
    renderer: "orb",
    orbVariant: "rose",
    accentColor: "#FF2D55",
  },
];

export const CATEGORY_LABELS: Record<Avatar["category"], string> = {
  orbs: "Orbs",
  spark: "Spark",
};

export const CATEGORY_DESCRIPTIONS: Record<Avatar["category"], string> = {
  orbs: "Living 3D companions — VoiceMate and variations",
  spark: "Expressive orbs with unique personalities",
};

const LEGACY_AVATAR_IDS: Record<string, string> = {
  "voice-mate": "voicemate",
  luna: "pulse",
  alex: "ember",
};

export function getAvatarById(id: string | null): Avatar | undefined {
  if (!id) return undefined;
  const resolved = LEGACY_AVATAR_IDS[id] || id;
  return AVATARS.find((a) => a.id === resolved);
}

export function getAvatarsByCategory(category: Avatar["category"]) {
  return AVATARS.filter((a) => a.category === category);
}
