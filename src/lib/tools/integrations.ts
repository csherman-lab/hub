import { getConnectorTokens } from "@/lib/connectors/tokens";

async function refreshGoogleToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Google token refresh failed");
  const data = await res.json();
  return data.access_token as string;
}

export async function getGoogleAccessToken(
  connectorId: "gmail" | "google_calendar",
): Promise<string | null> {
  const tokens = await getConnectorTokens(connectorId);
  if (!tokens?.accessToken) return null;

  if (tokens.expiresAt && tokens.expiresAt < Date.now() + 60_000) {
    if (!tokens.refreshToken) return null;
    return refreshGoogleToken(tokens.refreshToken);
  }

  return tokens.accessToken;
}

export async function fetchGmailSummary(): Promise<string | null> {
  const token = await getGoogleAccessToken("gmail");
  if (!token) return null;

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=is:inbox",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return null;

  const data = await res.json();
  const ids: string[] = (data.messages || []).map(
    (m: { id: string }) => m.id,
  );

  const snippets: string[] = [];
  for (const id of ids.slice(0, 5)) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!msgRes.ok) continue;
    const msg = await msgRes.json();
    const headers = msg.payload?.headers || [];
    const subject =
      headers.find((h: { name: string }) => h.name === "Subject")?.value ||
      "(no subject)";
    const from =
      headers.find((h: { name: string }) => h.name === "From")?.value || "";
    snippets.push(`- From: ${from} | Subject: ${subject}`);
  }

  return snippets.length
    ? `Recent inbox (Gmail):\n${snippets.join("\n")}`
    : "Gmail inbox is empty or could not be read.";
}

export async function fetchCalendarSummary(): Promise<string | null> {
  const token = await getGoogleAccessToken("google_calendar");
  if (!token) return null;

  const now = new Date();
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: now.toISOString(),
        timeMax: week.toISOString(),
        maxResults: "8",
        singleEvents: "true",
        orderBy: "startTime",
      }),
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return null;

  const data = await res.json();
  const events = data.items || [];
  if (!events.length) return "No upcoming calendar events this week.";

  const lines = events.map((e: { summary?: string; start?: { dateTime?: string; date?: string } }) => {
    const when = e.start?.dateTime || e.start?.date || "";
    return `- ${when}: ${e.summary || "Event"}`;
  });

  return `Upcoming calendar (7 days):\n${lines.join("\n")}`;
}

export async function searchWeb(
  query: string,
  apiKey?: string,
): Promise<string | null> {
  const key = process.env.TAVILY_API_KEY || apiKey;
  if (!key) return null;

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      max_results: 4,
      include_answer: true,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const answer = data.answer ? `Summary: ${data.answer}\n` : "";
  const results = (data.results || [])
    .map((r: { title: string; content: string }) => `- ${r.title}: ${r.content?.slice(0, 120)}`)
    .join("\n");

  return `${answer}${results}`.trim() || null;
}

export async function gatherToolContext(
  message: string,
  tavilyKey?: string,
): Promise<{ context: string; activity?: { type: "draft" | "research" | "meeting"; title: string; detail: string } }> {
  const lower = message.toLowerCase();
  const parts: string[] = [];

  let activity:
    | { type: "draft" | "research" | "meeting"; title: string; detail: string }
    | undefined;

  if (/email|inbox|gmail|draft|send/.test(lower)) {
    const gmail = await fetchGmailSummary();
    if (gmail) {
      parts.push(gmail);
      activity = {
        type: "draft",
        title: "Checked Gmail inbox",
        detail: "Pulled recent messages for context",
      };
    }
  }

  if (/calendar|meeting|schedule|event/.test(lower)) {
    const cal = await fetchCalendarSummary();
    if (cal) {
      parts.push(cal);
      activity = {
        type: "meeting",
        title: "Checked Google Calendar",
        detail: "Pulled upcoming events for context",
      };
    }
  }

  if (/research|search|find|look up|what is/.test(lower)) {
    const search = await searchWeb(message, tavilyKey);
    if (search) {
      parts.push(`Web research:\n${search}`);
      activity = {
        type: "research",
        title: "Web research",
        detail: message.slice(0, 80),
      };
    }
  }

  return {
    context: parts.join("\n\n"),
    activity,
  };
}
