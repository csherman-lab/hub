# Hub — Setup Guide

Follow this to run the draft locally and enable tap-to-connect OAuth.

---

## Part 1: Open the draft (no API keys needed)

### If you have the code on your machine

```bash
cd hub          # folder where the project lives
npm install
npm run dev
```

Open **http://localhost:3000** in Chrome or Safari.

You'll get:
- Onboarding flow
- Dashboard with your avatar
- Text chat (mock responses without a key)
- Video / voice UI
- **Connectors** page (sidebar → Connectors)

### If you're using the GitHub repo

```bash
git clone https://github.com/csherman-lab/hub.git
cd hub
git checkout cursor/hub-platform-draft-fb1d   # or main after merge
npm install
npm run dev
```

Open **http://localhost:3000**.

---

## Part 2: What to give Hub (exact checklist)

### A. For you as the developer (goes in `.env.local`)

Create a file named `.env.local` in the project root:

```bash
cp .env.example .env.local
```

| Variable | Required for | Where to get it |
|----------|--------------|-----------------|
| `NEXT_PUBLIC_APP_URL` | OAuth redirects | `http://localhost:3000` locally |
| `GOOGLE_CLIENT_ID` | Connect Gmail / Calendar | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Connect Gmail / Calendar | Same place |
| `SLACK_CLIENT_ID` | Connect Slack | [Slack API Apps](https://api.slack.com/apps) |
| `SLACK_CLIENT_SECRET` | Connect Slack | Same place |

**You do NOT put user API keys in `.env.local`** — users add OpenAI etc. in the app under Connectors.

### B. For you as a user testing the app (in the Connectors UI)

| Connector | How to connect | What you need |
|-----------|----------------|---------------|
| **OpenAI** | Connectors → Connect OpenAI → paste key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Gmail** | Connectors → **Connect Gmail** → Google sign-in | Google account (after you set up OAuth below) |
| **Google Calendar** | Connectors → **Connect Google Calendar** → sign-in | Same Google Cloud project |
| **Web Search** | Connectors → Connect Web Search → paste key | [tavily.com](https://tavily.com) |
| **Slack** | Connectors → **Connect Slack** → authorize | Slack workspace (after you set up Slack app) |
| **Telegram** | Connectors → Connect Telegram → paste bot token | [@BotFather](https://t.me/BotFather) |

---

## Part 3: Google OAuth (for Connect Gmail / Connect Calendar)

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
4. Copy **Client ID** and **Client secret** into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   ```

### Step 5 — Restart and test

```bash
# Stop the dev server (Ctrl+C), then:
npm run dev
```

Go to **Connectors → Connect Gmail**. You should see Google's sign-in screen.

---

## Part 4: Slack OAuth (for Connect Slack)

### Step 1 — Create a Slack app

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App**
2. Choose **From scratch**, name it "Hub"

### Step 2 — Redirect URL

**OAuth & Permissions → Redirect URLs**, add:
```
http://localhost:3000/api/connect/slack/callback
```

### Step 3 — Scopes

Under **Bot Token Scopes**, add:
- `channels:history`
- `chat:write`
- `im:history`
- `im:read`
- `im:write`
- `users:read`

### Step 4 — Copy credentials

**Basic Information → App Credentials**:
```
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
```

Restart `npm run dev`, then **Connectors → Connect Slack**.

---

## Part 5: Minimum to try today

**Fastest path — chat only:**

1. `npm install && npm run dev`
2. Open http://localhost:3000
3. Complete onboarding
4. Connectors → **Connect OpenAI** → paste your `sk-...` key
5. Go to **Chat** and talk to your agent

**Full connectors path:**

1. Everything above, plus
2. Set up Google OAuth in `.env.local`
3. Connectors → **Connect Gmail** and **Connect Google Calendar**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Google OAuth is not set up" | Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local` and restart |
| Redirect URI mismatch | Redirect URI in Google Console must exactly match `http://localhost:3000/api/connect/google/callback` |
| Chat returns mock responses | Add OpenAI key under Connectors → Connect OpenAI |
| Page won't load | Run `npm install` first, then `npm run dev` |

---

## Production (later)

When you deploy (e.g. Vercel), update:
- `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- Google redirect URI: `https://your-domain.com/api/connect/google/callback`
- Slack redirect URI: `https://your-domain.com/api/connect/slack/callback`
