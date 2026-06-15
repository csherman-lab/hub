import { getGoogleAccessToken } from "@/lib/tools/integrations";

function encodeMime(raw: string): string {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function parseEmailDraft(draft: string): {
  to: string;
  subject: string;
  body: string;
} {
  const toMatch = draft.match(/^To:\s*(.+)$/im);
  const subjectMatch = draft.match(/^Subject:\s*(.+)$/im);
  const to = toMatch?.[1]?.trim() || "";
  const subject = subjectMatch?.[1]?.trim() || "Message from your Hub agent";
  const body = draft
    .replace(/^To:.*$/im, "")
    .replace(/^Subject:.*$/im, "")
    .replace(/^From:.*$/im, "")
    .trim();
  return { to, subject, body: body || draft };
}

export async function sendGmailDraft(draft: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const token = await getGoogleAccessToken("gmail");
  if (!token) {
    return { ok: false, message: "Gmail not connected" };
  }

  const userRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const user = userRes.ok ? await userRes.json() : null;
  const defaultTo = user?.email || "";

  const { to, subject, body } = parseEmailDraft(draft);
  const recipient = to || defaultTo;
  if (!recipient) {
    return { ok: false, message: "No recipient found in draft" };
  }

  const mime = [
    `To: ${recipient}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodeMime(mime) }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, message: `Gmail send failed: ${err.slice(0, 120)}` };
  }

  return { ok: true, message: `Email sent to ${recipient}` };
}

export async function createCalendarEventFromDraft(draft: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const token = await getGoogleAccessToken("google_calendar");
  if (!token) {
    return { ok: false, message: "Google Calendar not connected" };
  }

  const titleMatch = draft.match(/(?:title|event|meeting):\s*(.+)/i);
  const title = titleMatch?.[1]?.trim() || "Hub meeting";

  const start = new Date();
  start.setHours(start.getHours() + 24, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: title,
        description: draft,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      }),
    },
  );

  if (!res.ok) {
    return { ok: false, message: "Could not create calendar event" };
  }

  return { ok: true, message: `Event created: ${title}` };
}
