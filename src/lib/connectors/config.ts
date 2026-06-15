import type { ConnectorId } from "@/types";

export type OAuthConnectorId = "gmail" | "google_calendar" | "slack";

export interface ConnectorMeta {
  id: ConnectorId;
  name: string;
  description: string;
  required: boolean;
  connectType: "oauth" | "api_key";
  brandColor: string;
  icon: string;
  setupUrl: string;
  keyLabel?: string;
}

export const CONNECTOR_META: ConnectorMeta[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Powers chat, voice, and vision",
    required: true,
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
    icon: "search",
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
  {
    id: "xai",
    name: "xAI",
    description: "Grok voice and chat (coming soon)",
    required: false,
    connectType: "api_key",
    brandColor: "#1DA1F2",
    icon: "openai",
    setupUrl: "https://console.x.ai",
    keyLabel: "API Key",
  },
];

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
