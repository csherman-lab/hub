import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { GOOGLE_SCOPES, getAppUrl } from "@/lib/connectors/config";
import { setOAuthState } from "@/lib/connectors/tokens";
import type { ConnectorId } from "@/types";

export async function GET(req: NextRequest) {
  const connector = req.nextUrl.searchParams.get("connector") as
    | "gmail"
    | "google_calendar"
    | null;

  if (!connector || !GOOGLE_SCOPES[connector]) {
    return NextResponse.json({ error: "Invalid connector" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connectors?error=google_not_configured`,
    );
  }

  const state = randomBytes(16).toString("hex");
  await setOAuthState(state, connector as ConnectorId);

  const redirectUri = `${getAppUrl()}/api/connect/google/callback`;
  const scopes = GOOGLE_SCOPES[connector].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  );
}
