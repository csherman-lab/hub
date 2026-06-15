import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/connectors/config";
import {
  setConnectorTokens,
  verifyOAuthState,
} from "@/lib/connectors/tokens";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connectors?error=${error}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connectors?error=missing_code`,
    );
  }

  const connectorId = await verifyOAuthState(state);
  if (connectorId !== "slack") {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connectors?error=invalid_state`,
    );
  }

  const clientId = process.env.SLACK_CLIENT_ID!;
  const clientSecret = process.env.SLACK_CLIENT_SECRET!;
  const redirectUri = `${getAppUrl()}/api/connect/slack/callback`;

  const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  const data = await tokenRes.json();

  if (!data.ok) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connectors?error=slack_token_failed`,
    );
  }

  await setConnectorTokens("slack", {
    accessToken: data.access_token,
    teamName: data.team?.name,
  });

  return NextResponse.redirect(
    `${getAppUrl()}/dashboard/connectors?connected=slack`,
  );
}
