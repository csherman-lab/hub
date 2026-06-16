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
  PendingApproval,
  GrokStatus,
} from "@/types";
import { generateId } from "@/lib/utils";

const DEFAULT_CONNECTORS: Connector[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Optional — alternative LLM",
    status: "disconnected",
    required: false,
  },
  {
    id: "xai",
    name: "xAI / Grok",
    description: "Powers chat and voice — connect in Connectors",
    status: "disconnected",
    required: true,
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
  addMessage: (
    role: "user" | "assistant",
    content: string,
    channel?: "chat" | "voice" | "video",
  ) => void;
  setEmotion: (emotion: AvatarEmotion) => void;
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void;
  addSkill: (trigger: string, action: string) => void;
  removeSkill: (id: string) => void;
  addMemory: (text: string) => void;
  removeMemory: (index: number) => void;
  addPendingApproval: (item: Omit<PendingApproval, "id" | "createdAt">) => void;
  approveItem: (id: string) => void;
  dismissApproval: (id: string) => void;
  clearChatMessages: () => void;
  removeLastAssistantMessage: () => string | null;
  setGrokStatus: (status: GrokStatus) => void;
  setHasSeenTips: (seen: boolean) => void;
  setAgentActivity: (activity: string | null) => void;
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
  memories: [],
  pendingApprovals: [],
  currentEmotion: "neutral",
  grokStatus: null,
  hasSeenTips: false,
  agentActivity: null,
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

      addMessage: (role, content, channel = "chat") =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: generateId(),
              role,
              content,
              channel,
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

      removeSkill: (id) =>
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
        })),

      addMemory: (text) =>
        set((state) => ({
          memories: [...state.memories, text.trim()].slice(-20),
        })),

      removeMemory: (index) =>
        set((state) => ({
          memories: state.memories.filter((_, i) => i !== index),
        })),

      addPendingApproval: (item) =>
        set((state) => ({
          pendingApprovals: [
            {
              ...item,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
            ...state.pendingApprovals,
          ],
        })),

      approveItem: (id) =>
        set((state) => ({
          pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
        })),

      dismissApproval: (id) =>
        set((state) => ({
          pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
        })),

      clearChatMessages: () =>
        set((state) => ({
          messages: state.messages.filter((m) => m.channel && m.channel !== "chat"),
        })),

      removeLastAssistantMessage: () => {
        const msgs = get().messages;
        const lastAssistantIdx = [...msgs].reverse().findIndex(
          (m) => m.role === "assistant" && (!m.channel || m.channel === "chat"),
        );
        if (lastAssistantIdx === -1) return null;
        const idx = msgs.length - 1 - lastAssistantIdx;
        const lastUser = [...msgs.slice(0, idx)].reverse().find(
          (m) => m.role === "user" && (!m.channel || m.channel === "chat"),
        );
        set((state) => ({
          messages: state.messages.filter((_, i) => i !== idx),
        }));
        return lastUser?.content ?? null;
      },

      setGrokStatus: (status) => set({ grokStatus: status }),
      setHasSeenTips: (seen) => set({ hasSeenTips: seen }),
      setAgentActivity: (activity) => set({ agentActivity: activity }),

      resetHub: () => set(initialState),
    }),
    {
      name: "hub-storage",
      version: 5,
      migrate: (persisted) => {
        const state = persisted as HubState;
        const migrated = {
          ...state,
          memories: state.memories ?? [],
          pendingApprovals: state.pendingApprovals ?? [],
          grokStatus: state.grokStatus ?? null,
          hasSeenTips: state.hasSeenTips ?? false,
          agentActivity: state.agentActivity ?? null,
        };
        // Repair inconsistent state that caused dashboard ↔ onboarding redirect loops
        if (migrated.onboardingComplete && !migrated.selectedAvatarId) {
          migrated.onboardingComplete = false;
          migrated.onboardingStep = 1;
        }
        return migrated;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Hub storage reset:", error);
          localStorage.removeItem("hub-storage");
        }
      },
    },
  ),
);
