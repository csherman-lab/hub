import type { Avatar } from "@/types";

export const AVATARS: Avatar[] = [
  {
    id: "alex",
    name: "Alex",
    category: "executive",
    tagline: "Calm, organized, gets things done",
    personality:
      "Professional and efficient. Speaks clearly, stays focused, and loves keeping your calendar tidy.",
    voiceId: "alloy",
    skinTone: "#C68642",
    hairColor: "#2C1810",
    shirtColor: "#1D1D1F",
    accentColor: "#007AFF",
  },
  {
    id: "morgan",
    name: "Morgan",
    category: "executive",
    tagline: "Your sharp executive assistant",
    personality:
      "Direct and confident. Anticipates needs and handles email with precision.",
    voiceId: "nova",
    skinTone: "#E0AC69",
    hairColor: "#4A3728",
    accessory: "glasses",
    shirtColor: "#2C3E50",
    accentColor: "#5856D6",
  },
  {
    id: "sam",
    name: "Sam",
    category: "research",
    tagline: "Curious mind, deep dives",
    personality:
      "Thoughtful and thorough. Loves research and always cites sources.",
    voiceId: "echo",
    skinTone: "#F1C27D",
    hairColor: "#8B4513",
    accessory: "headphones",
    shirtColor: "#34495E",
    accentColor: "#34C759",
  },
  {
    id: "riley",
    name: "Riley",
    category: "research",
    tagline: "Finds answers fast",
    personality:
      "Quick and analytical. Summarizes complex topics into plain English.",
    voiceId: "shimmer",
    skinTone: "#D4A574",
    hairColor: "#1A1A1A",
    shirtColor: "#5D4E37",
    accentColor: "#FF9500",
  },
  {
    id: "jules",
    name: "Jules",
    category: "creative",
    tagline: "Ideas that spark",
    personality:
      "Warm and expressive. Great at brainstorming, writing, and creative projects.",
    voiceId: "fable",
    skinTone: "#8D5524",
    hairColor: "#1A1A1A",
    accessory: "beret",
    shirtColor: "#1D1D1F",
    accentColor: "#FF2D55",
  },
  {
    id: "casey",
    name: "Casey",
    category: "creative",
    tagline: "Words that land",
    personality:
      "Empathetic storyteller. Helps draft emails and content with heart.",
    voiceId: "coral",
    skinTone: "#C68642",
    hairColor: "#2C1810",
    accessory: "paintbrush",
    shirtColor: "#1D1D1F",
    accentColor: "#AF52DE",
  },
  {
    id: "jordan",
    name: "Jordan",
    category: "life",
    tagline: "Your friendly sidekick",
    personality:
      "Casual and upbeat. Perfect for reminders, errands, and everyday life.",
    voiceId: "onyx",
    skinTone: "#E0AC69",
    hairColor: "#4A3728",
    shirtColor: "#3498DB",
    accentColor: "#30D158",
  },
  {
    id: "taylor",
    name: "Taylor",
    category: "life",
    tagline: "Here when you need me",
    personality:
      "Supportive and patient. Great listener who keeps you on track.",
    voiceId: "sage",
    skinTone: "#F1C27D",
    hairColor: "#8B6914",
    shirtColor: "#27AE60",
    accentColor: "#64D2FF",
  },
];

export const CATEGORY_LABELS: Record<Avatar["category"], string> = {
  executive: "Executive",
  research: "Research",
  creative: "Creative",
  life: "Life & Personal",
};

export function getAvatarById(id: string | null): Avatar | undefined {
  return AVATARS.find((a) => a.id === id);
}
