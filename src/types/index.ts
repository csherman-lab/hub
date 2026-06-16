export type AvatarCategory = "cinematic" | "creative" | "professional";

export type AvatarEmotion =
  | "neutral"
  | "happy"
  | "thinking"
  | "surprised"
  | "empathetic";

export type ThemeMode = "light" | "dark" | "system";

export type AutonomyLevel = "suggest" | "balanced" | "autopilot";

export type ProactivityMode = "proactive" | "balanced" | "reactive";

export type ConnectorId =
  | "openai"
  | "anthropic"
  | "xai"
  | "gmail"
  | "google_calendar"
  | "web_search"
  | "telegram"
  | "slack";

export type ConnectorStatus = "connected" | "disconnected" | "error";

export type AvatarGender = "female" | "male";

export type AvatarRenderer = "portrait" | "orb" | "3d";

export interface Avatar {
  id: string;
  name: string;
  gender: AvatarGender;
  category: AvatarCategory;
  tagline: string;
  personality: string;
  voiceId: string;
  previewLine: string;
  image?: string;
  modelUrl?: string;
  renderer?: AvatarRenderer;
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
  channel?: "chat" | "voice" | "video";
}

export interface TaughtSkill {
  id: string;
  trigger: string;
  action: string;
  createdAt: string;
}

export interface PendingApproval {
  id: string;
  type: "email" | "calendar" | "other";
  title: string;
  detail: string;
  draft: string;
  createdAt: string;
}

export interface GrokStatus {
  configured: boolean;
  chat: boolean;
  voice: boolean;
}

export interface HubState {
  onboardingComplete: boolean;
  onboardingStep: number;
  goals: string[];
  selectedAvatarId: string | null;
  agentName: string;
  proactivity: ProactivityMode;
  autonomy: AutonomyLevel;
  theme: ThemeMode;
  apiKeys: Partial<Record<ConnectorId, string>>;
  connectors: Connector[];
  messages: ChatMessage[];
  activities: ActivityItem[];
  skills: TaughtSkill[];
  memories: string[];
  pendingApprovals: PendingApproval[];
  currentEmotion: AvatarEmotion;
  grokStatus: GrokStatus | null;
  hasSeenTips: boolean;
  agentActivity: string | null;
}
