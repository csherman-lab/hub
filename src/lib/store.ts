"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActivityItem,
  AutonomyLevel,
  AvatarEmotion,
  ChatMessage,
  Connector,
  ConnectorId,
  HubState,
  ProactivityMode,
  ThemeMode,
  TaughtSkill,
} from "@/types";
import { generateId } from "@/lib/utils";

const DEFAULT_CONNECTORS: Connector[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Powers chat, voice, and vision",
    status: "disconnected",
    required: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Alternative LLM (Claude)",
    status: "disconnected",
    required: false,
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok for chat and voice (coming soon)",
    status: "disconnected",
    required: false,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Read, draft, and send email",
    status: "disconnected",
    required: false,
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Schedule and manage meetings",
    status: "disconnected",
    required: false,
  },
  {
    id: "web_search",
    name: "Web Search",
    description: "Tavily or Brave Search for research",
    status: "disconnected",
    required: false,
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Text your agent on Telegram",
    status: "disconnected",
    required: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect to your workspace",
    status: "disconnected",
    required: false,
  },
];

const SEED_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "message",
    title: "Welcome to Hub",
    detail: "Complete onboarding to start chatting with your agent.",
    timestamp: new Date().toISOString(),
  },
];

interface HubActions {
  setTheme: (theme: ThemeMode) => void;
  setOnboardingStep: (step: number) => void;
  setGoals: (goals: string[]) => void;
  setSelectedAvatar: (id: string) => void;
  setAgentName: (name: string) => void;
  setProactivity: (mode: ProactivityMode) => void;
  setAutonomy: (level: AutonomyLevel) => void;
  setApiKey: (connectorId: ConnectorId, key: string) => void;
  connectConnector: (connectorId: ConnectorId) => void;
  disconnectConnector: (connectorId: ConnectorId) => void;
  completeOnboarding: () => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  setEmotion: (emotion: AvatarEmotion) => void;
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void;
  addSkill: (trigger: string, action: string) => void;
  resetHub: () => void;
}

const initialState: HubState = {
  onboardingComplete: false,
  onboardingStep: 0,
  goals: [],
  selectedAvatarId: null,
  agentName: "",
  proactivity: "balanced",
  autonomy: "balanced",
  theme: "light",
  apiKeys: {},
  connectors: DEFAULT_CONNECTORS,
  messages: [],
  activities: SEED_ACTIVITIES,
  skills: [],
  currentEmotion: "neutral",
};

export const useHubStore = create<HubState & HubActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      setTheme: (theme) => set({ theme }),

      setGoals: (goals) => set({ goals }),

      setSelectedAvatar: (id) => set({ selectedAvatarId: id }),

      setAgentName: (name) => set({ agentName: name }),

      setProactivity: (mode) => set({ proactivity: mode }),

      setAutonomy: (level) => set({ autonomy: level }),

      setApiKey: (connectorId, key) => {
        const trimmed = key.trim();
        set((state) => ({
          apiKeys: { ...state.apiKeys, [connectorId]: trimmed },
          connectors: state.connectors.map((c) =>
            c.id === connectorId
              ? { ...c, status: trimmed ? "connected" : "disconnected" }
              : c,
          ),
        }));
      },

      connectConnector: (connectorId) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === connectorId ? { ...c, status: "connected" } : c,
          ),
        })),

      disconnectConnector: (connectorId) =>
        set((state) => ({
          apiKeys: Object.fromEntries(
            Object.entries(state.apiKeys).filter(([k]) => k !== connectorId),
          ) as Partial<Record<ConnectorId, string>>,
          connectors: state.connectors.map((c) =>
            c.id === connectorId ? { ...c, status: "disconnected" } : c,
          ),
        })),

      completeOnboarding: () => {
        const { selectedAvatarId, agentName } = get();
        const avatar = selectedAvatarId;
        set({
          onboardingComplete: true,
          activities: [
            {
              id: generateId(),
              type: "message",
              title: `${agentName || "Your agent"} is ready`,
              detail: "Start a conversation via text, voice, or video.",
              timestamp: new Date().toISOString(),
            },
          ],
        });
        if (avatar) {
          set({ currentEmotion: "happy" });
        }
      },

      addMessage: (role, content) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: generateId(),
              role,
              content,
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      setEmotion: (emotion) => set({ currentEmotion: emotion }),

      addActivity: (activity) =>
        set((state) => ({
          activities: [
            {
              ...activity,
              id: generateId(),
              timestamp: new Date().toISOString(),
            },
            ...state.activities,
          ],
        })),

      addSkill: (trigger, action) =>
        set((state) => ({
          skills: [
            ...state.skills,
            {
              id: generateId(),
              trigger,
              action,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      resetHub: () => set(initialState),
    }),
    { name: "hub-storage" },
  ),
);
