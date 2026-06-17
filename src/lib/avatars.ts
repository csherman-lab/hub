import type { Avatar } from "@/types";

/** xAI Grok voice IDs. See GET https://api.x.ai/v1/tts/voices */
export const AVATARS: Avatar[] = [
  {
    id: "voicemate",
    name: "VoiceMate",
    gender: "male",
    category: "design",
    tagline: "Your signature companion",
    personality:
      "Upbeat, personable, and conversational. Talks like a close friend, casual, encouraging, always engaged.",
    voiceId: "leo",
    previewLine:
      "Hey! I'm VoiceMate, your living voice companion. Let's figure things out together.",
    renderer: "orb",
    variant: "violet",
    accentColor: "#AF52DE",
  },
  {
    id: "pulse",
    name: "Pulse",
    gender: "female",
    category: "design",
    tagline: "Cool & electric",
    personality:
      "Quick, witty, and energetic. Speaks with spark and momentum, always ready to brainstorm or cheer you on.",
    voiceId: "eve",
    previewLine:
      "Hi! I'm Pulse, sharp, bright, and always tuned in. What's on your mind?",
    renderer: "orb",
    variant: "aurora",
    accentColor: "#5AC8FA",
  },
  {
    id: "ember",
    name: "Ember",
    gender: "male",
    category: "design",
    tagline: "Warm & bold",
    personality:
      "Confident and direct with a warm edge. Gets to the point but never feels cold.",
    voiceId: "rex",
    previewLine:
      "Ember here. Tell me what you need, I'll help you move on it.",
    renderer: "orb",
    variant: "ember",
    accentColor: "#FF6B35",
  },
  {
    id: "marcus",
    name: "Marcus",
    gender: "male",
    category: "characters",
    tagline: "Friendly & upbeat",
    personality:
      "Warm, optimistic, and easy to talk to. Speaks like a supportive friend with great energy and a big smile in his voice.",
    voiceId: "leo",
    previewLine:
      "Hey! Marcus here. Whatever you're working on, let's tackle it together.",
    renderer: "character",
    variant: "marcus",
    accentColor: "#FF8C42",
  },
  {
    id: "priya",
    name: "Priya",
    gender: "female",
    category: "characters",
    tagline: "Bright & capable",
    personality:
      "Polished, articulate, and encouraging. Speaks clearly with warmth and confidence, great for planning and creative work.",
    voiceId: "ara",
    previewLine:
      "Hi, I'm Priya. Tell me what's on your plate and we'll make sense of it.",
    renderer: "character",
    variant: "priya",
    accentColor: "#FF6B9D",
  },
  {
    id: "elias",
    name: "Elias",
    gender: "male",
    category: "characters",
    tagline: "Wise & calm",
    personality:
      "Thoughtful and reassuring with a gentle authority. Speaks patiently, explains clearly, and helps you see the bigger picture.",
    voiceId: "sal",
    previewLine:
      "Hello, I'm Elias. Take your time, I'm here to help you think it through.",
    renderer: "character",
    variant: "elias",
    accentColor: "#6B8F71",
  },
];

export const CATEGORY_LABELS: Record<Avatar["category"], string> = {
  design: "Design",
  characters: "Characters",
};

export const CATEGORY_DESCRIPTIONS: Record<Avatar["category"], string> = {
  design: "Living orbs that glow, blink, and react to you",
  characters: "Expressive companions with warmth and personality",
};

const LEGACY_AVATAR_IDS: Record<string, string> = {
  "voice-mate": "voicemate",
  luna: "pulse",
  alex: "ember",
  aria: "priya",
  jules: "priya",
  marco: "elias",
  prism: "priya",
  flux: "marcus",
  sage: "elias",
  muse: "priya",
  haven: "elias",
  drift: "marcus",
};

export function getAvatarById(id: string | null): Avatar | undefined {
  if (!id) return undefined;
  const resolved = LEGACY_AVATAR_IDS[id] || id;
  return AVATARS.find((a) => a.id === resolved);
}

export function getAvatarsByCategory(category: Avatar["category"]) {
  return AVATARS.filter((a) => a.category === category);
}
