import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAppUrl } from "@/lib/connectors/config";
import { setOAuthState } from "@/lib/connectors/tokens";

const SLACK_SCOPES = [
  "channels:history",
  "chat:write",
  "im:history",
  "im:read",
  "im:write",
  "users:read",
].join(",");

export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connectors?error=slack_not_configured`,
    );
  }

  const state = randomBytes(16).toString("hex");
  await setOAuthState(state, "slack");

  const redirectUri = `${getAppUrl()}/api/connect/slack/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    scope: SLACK_SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  return NextResponse.redirect(
    `https://slack.com/oauth/v2/authorize?${params}`,
  );
}
