import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/connectors/config";
import {
  setConnectorTokens,
  verifyOAuthState,
} from "@/lib/connectors/tokens";
import type { ConnectorId } from "@/types";

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
  if (!connectorId) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connectors?error=invalid_state`,
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${getAppUrl()}/api/connect/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connectors?error=token_exchange_failed`,
    );
  }

  const tokens = await tokenRes.json();

  let email: string | undefined;
  try {
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (userRes.ok) {
      const user = await userRes.json();
      email = user.email;
    }
  } catch {
    /* optional */
  }

  await setConnectorTokens(connectorId as ConnectorId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    email,
  });

  return NextResponse.redirect(
    `${getAppUrl()}/dashboard/connectors?connected=${connectorId}`,
  );
}
