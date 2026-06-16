import type { ConnectorId } from "@/types";

export type OAuthConnectorId = "gmail" | "google_calendar" | "slack";

export interface ConnectorMeta {
  id: ConnectorId;
  name: string;
  description: string;
  required: boolean;
  connectType: "oauth" | "api_key" | "env";
  brandColor: string;
  icon: string;
  setupUrl: string;
  keyLabel?: string;
}

export const CONNECTOR_META: ConnectorMeta[] = [
  {
    id: "xai",
    name: "Grok AI",
    description: "Powers chat, voice, and your agent's brain",
    required: true,
    connectType: "api_key",
    brandColor: "#1DA1F2",
    icon: "xai",
    setupUrl: "https://console.x.ai",
    keyLabel: "xAI API Key",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Optional alternative LLM and Realtime voice",
    required: false,
    connectType: "api_key",
    brandColor: "#10A37F",
    icon: "openai",
    setupUrl: "https://platform.openai.com/api-keys",
    keyLabel: "API Key",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Read, draft, and send email",
    required: false,
    connectType: "oauth",
    brandColor: "#EA4335",
    icon: "gmail",
    setupUrl: "https://console.cloud.google.com/apis/credentials",
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Schedule and manage meetings",
    required: false,
    connectType: "oauth",
    brandColor: "#4285F4",
    icon: "calendar",
    setupUrl: "https://console.cloud.google.com/apis/credentials",
  },
  {
    id: "web_search",
    name: "Web Search",
    description: "Research topics with Tavily",
    required: false,
    connectType: "api_key",
    brandColor: "#6366F1",
    icon: "tavily",
    setupUrl: "https://tavily.com",
    keyLabel: "API Key",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Message your agent from Slack",
    required: false,
    connectType: "oauth",
    brandColor: "#4A154B",
    icon: "slack",
    setupUrl: "https://api.slack.com/apps",
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Text your agent on Telegram",
    required: false,
    connectType: "api_key",
    brandColor: "#26A5E4",
    icon: "telegram",
    setupUrl: "https://t.me/BotFather",
    keyLabel: "Bot Token",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Alternative LLM (Claude)",
    required: false,
    connectType: "api_key",
    brandColor: "#D97757",
    icon: "anthropic",
    setupUrl: "https://console.anthropic.com/settings/keys",
    keyLabel: "API Key",
  },
];

/** Connectors on the roadmap — shown as "coming soon" in the UI */
export const PLANNED_CONNECTORS = [
  { name: "Microsoft Outlook", description: "Email & calendar for work accounts" },
  { name: "Notion", description: "Notes, docs, and knowledge base" },
  { name: "Linear", description: "Issues and project tracking" },
  { name: "GitHub", description: "PRs, issues, and code context" },
  { name: "Zoom", description: "Meeting links and recordings" },
  { name: "Apple Calendar", description: "Personal calendar sync" },
  { name: "Discord", description: "Community and team chat" },
  { name: "Spotify", description: "Music and focus playlists" },
] as const;

export const GOOGLE_SCOPES: Record<"gmail" | "google_calendar", string[]> = {
  gmail: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
  google_calendar: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
};

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getConnectorMeta(id: ConnectorId) {
  return CONNECTOR_META.find((c) => c.id === id);
}
