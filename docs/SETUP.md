# Hub — Setup Guide

Follow this to run Hub locally with Grok chat and voice.

---

## Part 1: Open the app

```bash
npm install
npm run setup:env   # creates .env.local and opens it
npm run dev
```

Open **http://localhost:3000/onboarding** in Chrome or Safari.

Or manually:

```bash
cp .env.example .env.local
```

Without an API key you still get onboarding, the dashboard, and mock chat. Add your xAI key for live Grok chat and voice.

---

## Part 2: xAI / Grok (required for live AI)

Hub uses **xAI Grok** for chat, knowledge, and voice. Add your key once in `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` (or run `npm run setup:env` to create and open it):

```env
XAI_API_KEY=xai-your-key-here
```

Get a key at [console.x.ai](https://console.x.ai).

**Restart the dev server** after saving:

```bash
# Ctrl+C to stop, then:
npm run dev
```

On the **Connectors** page, xAI / Grok should show as **Configured** when the key is loaded.

### What Grok powers

| Feature | API |
|---------|-----|
| Text chat | Grok Chat Completions (`grok-3-mini`) |
| Avatar voice preview | Grok TTS (`/v1/tts`) |
| Voice & video calls | Grok chat + TTS with lip-sync |

---

## Part 3: Optional connectors

### In `.env.local` (developer setup)

| Variable | Required for | Where to get it |
|----------|--------------|-----------------|
| `NEXT_PUBLIC_APP_URL` | OAuth redirects | `http://localhost:3000` locally |
| `GOOGLE_CLIENT_ID` | Connect Gmail / Calendar | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Connect Gmail / Calendar | Same place |
| `SLACK_CLIENT_ID` | Connect Slack | [Slack API Apps](https://api.slack.com/apps) |
| `SLACK_CLIENT_SECRET` | Connect Slack | Same place |
| `OPENAI_API_KEY` | Optional fallback LLM | [platform.openai.com](https://platform.openai.com/api-keys) |

### In the Connectors UI (per user)

| Connector | How to connect |
|-----------|----------------|
| **Gmail** | Connectors → Connect Gmail → Google sign-in |
| **Google Calendar** | Connectors → Connect Google Calendar |
| **Web Search** | Paste Tavily API key |
| **Slack** | Connectors → Connect Slack |
| **Telegram** | Paste bot token from [@BotFather](https://t.me/BotFather) |
| **OpenAI** | Optional — paste key for future Realtime voice |

---

## Part 4: Google OAuth (Gmail & Calendar)

### Step 1 — Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project (e.g. "Hub")

### Step 2 — Enable APIs

In **APIs & Services → Library**, enable:
- **Gmail API**
- **Google Calendar API**

### Step 3 — OAuth consent screen

1. **APIs & Services → OAuth consent screen**
2. Choose **External** (for testing)
3. Add your email as a test user

### Step 4 — Create OAuth credentials

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. Authorized redirect URIs — add exactly:
   ```
   http://localhost:3000/api/connect/google/callback
   ```
4. Copy **Client ID** and **Client secret** into `.env.local`

### Step 5 — Restart and test

```bash
npm run dev
```

Go to **Connectors → Connect Gmail**.

---

## Part 5: Slack OAuth

1. [api.slack.com/apps](https://api.slack.com/apps) → **Create New App**
2. **OAuth & Permissions → Redirect URLs**:
   ```
   http://localhost:3000/api/connect/slack/callback
   ```
3. Add Bot Token Scopes: `channels:history`, `chat:write`, `im:history`, `im:read`, `im:write`, `users:read`
4. Copy `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` to `.env.local`
5. Restart and use **Connectors → Connect Slack**

---

## Part 6: Minimum to try today

**Fastest path — live Grok chat & voice:**

1. `npm install && npm run setup:env`
2. Add `XAI_API_KEY=xai-...` in the file that opens, save, close
3. `npm run dev`
4. Complete onboarding — hover avatars to hear their voice
5. Try **Chat**, **Voice call**, or **Video call**

**Never commit `.env.local` or paste your API key in chat.**

---

## Troubleshooting

### `/api/livereload 404` spam in terminal

That's a browser extension or old service worker — not Hub. Use an **Incognito window** → http://localhost:3000/onboarding

### Voice falls back to browser TTS

Check that `XAI_API_KEY` is set and the server was restarted. Grok TTS returns audio; without a key, Hub uses the browser's built-in speech.

### Server shows `✓ Ready` but browser is blank

Go directly to: **http://localhost:3000/onboarding**

### Full reset

```bash
npm run fresh
npm run dev
```

---

## Production (later)

When you deploy (e.g. Vercel):

- Set `XAI_API_KEY` in the hosting provider's environment variables
- `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- Google redirect: `https://your-domain.com/api/connect/google/callback`
- Slack redirect: `https://your-domain.com/api/connect/slack/callback`
