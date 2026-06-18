import { cookies } from "next/headers";
import type { ConnectorId } from "@/types";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  email?: string;
  teamName?: string;
}

export async function setConnectorTokens(
  connectorId: ConnectorId,
  tokens: StoredTokens,
) {
  const store = await cookies();
  store.set(`hub_token_${connectorId}`, JSON.stringify(tokens), cookieOptions);
}

export async function getConnectorTokens(
  connectorId: ConnectorId,
): Promise<StoredTokens | null> {
  const store = await cookies();
  const raw = store.get(`hub_token_${connectorId}`);
  if (!raw?.value) return null;
  try {
    return JSON.parse(raw.value) as StoredTokens;
  } catch {
    return null;
  }
}

export async function deleteConnectorTokens(connectorId: ConnectorId) {
  const store = await cookies();
  store.delete(`hub_token_${connectorId}`);
}

export async function setConnectorApiKey(connectorId: ConnectorId, apiKey: string) {
  const store = await cookies();
  store.set(`hub_apikey_${connectorId}`, apiKey.trim(), cookieOptions);
}

export async function getConnectorApiKey(
  connectorId: ConnectorId,
): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(`hub_apikey_${connectorId}`);
  return raw?.value?.trim() || null;
}

export async function deleteConnectorApiKey(connectorId: ConnectorId) {
  const store = await cookies();
  store.delete(`hub_apikey_${connectorId}`);
}

export async function setOAuthState(state: string, connectorId: ConnectorId) {
  const store = await cookies();
  store.set(`hub_oauth_state`, `${connectorId}:${state}`, {
    ...cookieOptions,
    maxAge: 600,
  });
}

export async function verifyOAuthState(
  state: string,
): Promise<ConnectorId | null> {
  const store = await cookies();
  const raw = store.get("hub_oauth_state");
  store.delete("hub_oauth_state");
  if (!raw?.value) return null;
  const [connectorId, savedState] = raw.value.split(":");
  if (savedState !== state) return null;
  return connectorId as ConnectorId;
}

export async function getConnectionStatus(): Promise<
  Record<ConnectorId, { connected: boolean; email?: string; teamName?: string }>
> {
  const ids: ConnectorId[] = [
    "openai",
    "anthropic",
    "xai",
    "gmail",
    "google_calendar",
    "web_search",
    "telegram",
    "slack",
  ];

  const status = {} as Record<
    ConnectorId,
    { connected: boolean; email?: string; teamName?: string }
  >;

  for (const id of ids) {
    const tokens = await getConnectorTokens(id);
    status[id] = {
      connected: !!tokens?.accessToken,
      email: tokens?.email,
      teamName: tokens?.teamName,
    };
  }

  return status;
}
