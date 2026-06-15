export type AvatarCategory = "executive" | "research" | "creative" | "life";

export type AvatarEmotion =
  | "neutral"
  | "happy"
  | "thinking"
  | "surprised"
  | "empathetic";

export type AutonomyLevel = "suggest" | "balanced" | "autopilot";

export type ProactivityMode = "proactive" | "balanced" | "reactive";

export type ConnectorId =
  | "openai"
  | "anthropic"
  | "gmail"
  | "google_calendar"
  | "web_search"
  | "telegram"
  | "slack";

export type ConnectorStatus = "connected" | "disconnected" | "error";

export interface Avatar {
  id: string;
  name: string;
  category: AvatarCategory;
  tagline: string;
  personality: string;
  voiceId: string;
  skinTone: string;
  hairColor: string;
  accessory?: string;
  shirtColor: string;
  accentColor: string;
}

export interface Connector {
  id: ConnectorId;
  name: string;
  description: string;
  status: ConnectorStatus;
  required: boolean;
}

export interface ActivityItem {
  id: string;
  type: "draft" | "research" | "meeting" | "skill" | "message";
  title: string;
  detail: string;
  timestamp: string;
  needsApproval?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface TaughtSkill {
  id: string;
  trigger: string;
  action: string;
  createdAt: string;
}

export interface HubState {
  onboardingComplete: boolean;
  onboardingStep: number;
  goals: string[];
  selectedAvatarId: string | null;
  agentName: string;
  proactivity: ProactivityMode;
  autonomy: AutonomyLevel;
  apiKeys: Partial<Record<ConnectorId, string>>;
  connectors: Connector[];
  messages: ChatMessage[];
  activities: ActivityItem[];
  skills: TaughtSkill[];
  currentEmotion: AvatarEmotion;
}
