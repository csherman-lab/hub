# Hub — API Requirements

This document lists every API and service you need to provide for Hub to work end-to-end. The draft app runs in **mock mode** without keys; add keys in **Connections** or during onboarding to unlock live features.

---

## Summary: what to set up first

| Priority | Service | What it powers | Get it here |
|----------|---------|----------------|-------------|
| **1 (required)** | OpenAI | Chat, voice, vision, emotions | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **2** | Google Cloud OAuth | Gmail + Calendar | [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) |
| **3** | Tavily (or Brave Search) | Web research | [tavily.com](https://tavily.com) |
| **4** | Slack App | Work messaging channel | [api.slack.com/apps](https://api.slack.com/apps) |
| **5** | Telegram Bot | Personal messaging channel | [@BotFather](https://t.me/BotFather) |
| **6** | ElevenLabs (optional) | Premium avatar voices | [elevenlabs.io](https://elevenlabs.io) |
| **7** | Ready Player Me (optional) | 3D avatar models | [readyplayer.me](https://readyplayer.me) |

---

## 1. LLM — OpenAI (required for live AI)

**Used for:** Text chat, voice conversation, vision (seeing user camera / screen share), emotion detection.

### What you need
- **API Key** from OpenAI Platform
- Billing enabled on your OpenAI account

### APIs used

| Feature | OpenAI API | Model |
|---------|-----------|-------|
| Text chat | Chat Completions | `gpt-4o-mini` (draft) → `gpt-4o` for production |
| Voice call | **Realtime API** | `gpt-4o-realtime-preview` |
| Video (agent sees you) | Realtime API + vision | Same realtime model with video input |
| Screen share understanding | Realtime API + vision | User shares screen as video track |
| Emotion → avatar | Chat or Realtime | LLM returns emotion tag; maps to avatar expression |

### Keys / env vars
```env
OPENAI_API_KEY=sk-...
```

### Cost estimate (rough)
- Chat: ~$0.01–0.05 per conversation
- Realtime voice: ~$0.06/min input + $0.24/min output audio (check current pricing)

### Alternative
- **Anthropic Claude** — add `ANTHROPIC_API_KEY` for text chat alternative. Voice/video still needs OpenAI Realtime or a separate voice stack.

---

## 2. Voice — OpenAI Realtime API (recommended)

**Used for:** In-app phone-style calls where user talks to avatar in real time.

### What you need
- OpenAI API key with Realtime API access
- WebRTC connection from browser to OpenAI

### How it works
```
User mic → WebRTC → OpenAI Realtime → Audio response → Avatar lip-sync
```

### What you give us
```env
OPENAI_API_KEY=sk-...
```

### Optional: ElevenLabs (premium voices)
If you want distinct, high-quality voices per avatar instead of OpenAI's built-in voices:

| Item | Value |
|------|-------|
| API Key | [elevenlabs.io](https://elevenlabs.io) |
| Voice IDs | One per avatar (e.g. Jules → voice `abc123`) |

```env
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_JULES=...
ELEVENLABS_VOICE_ALEX=...
```

**Tradeoff:** ElevenLabs = better voice quality, but more latency and complexity. OpenAI Realtime = simpler, one API for brain + voice.

---

## 3. Video — WebRTC + Vision (no separate "video API")

**Used for:** In-app "FaceTime" with avatar front-and-center, user in PiP, screen share.

### What you need
- **No extra video API** for the UI — browser `getUserMedia` + `getDisplayMedia` handles camera and screen share
- **OpenAI Realtime API with vision** so the agent can see the user and shared screen

### Architecture
```
User webcam  ──┐
Screen share ──┼──▶ WebRTC tracks ──▶ OpenAI Realtime (vision) ──▶ Agent response
3D Avatar    ◀── Avatar renderer ◀── Emotion + speech output
```

### Avatar rendering options (pick one for production)

| Option | What you provide | Quality | Effort |
|--------|------------------|---------|--------|
| **A. SVG/CSS (current draft)** | Nothing — built in | Good for draft | ✅ Done |
| **B. Ready Player Me** | API subdomain + avatar GLB URLs | High 3D | Medium |
| **C. Custom 3D models** | GLB/FBX files per avatar + animation rig | Highest | High |
| **D. LivePortrait / audio2face** | GPU server for lip-sync | Photoreal | High |

### Recommended path
1. **Now:** SVG avatars with emotion states (draft — done)
2. **v1.5:** Ready Player Me avatars with expression blendshapes
3. **v2:** Custom Disney-style cartoon models with full gesture library

### Ready Player Me (if chosen)
```env
READY_PLAYER_ME_SUBDOMAIN=your-subdomain
# Per-avatar GLB URLs stored in avatar config
```

---

## 4. Avatars — 3D models & photo-to-avatar

### Pre-made avatars (current draft)
- 8 SVG cartoon characters built into the app
- No external API needed

### Production 3D avatars
**Option A — Ready Player Me**
- Create avatars in their studio
- Export GLB URLs
- Render with Three.js / React Three Fiber

**Option B — Custom art pipeline**
- 3D artist creates models in Blender
- Export GLB with blendshapes: `happy`, `sad`, `surprised`, `thinking`, `talking`
- Host on CDN (Cloudflare R2, S3)

### Photo / face-scan → cartoon avatar
**Option A — Ready Player Me selfie flow**
- User uploads photo → RPM generates stylized 3D avatar
- API: `https://docs.readyplayer.me/ready-player-me/api-reference/rest-api`

**Option B — AI generation services**
| Service | Use case |
|---------|----------|
| [Lensa AI API](https://lensa.ai) (or similar) | Photo → stylized portrait |
| Custom Stable Diffusion | Photo → cartoon illustration → map to 3D |

```env
READY_PLAYER_ME_API_KEY=...   # if using their API
```

---

## 5. Email — Gmail (Google OAuth)

**Used for:** Read inbox, draft emails, send emails (with approval flow).

### What you need
1. Google Cloud project
2. Enable **Gmail API**
3. OAuth 2.0 credentials (Web application)
4. Authorized redirect URI: `https://your-domain.com/api/auth/google/callback`

### Scopes
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.compose
```

### Env vars
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 6. Calendar — Google Calendar (same Google OAuth)

**Used for:** View schedule, find free slots, create meetings.

### Scopes
```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
```

Same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as Gmail.

---

## 7. Web search — Tavily (recommended)

**Used for:** Research topics, summarize findings with citations.

### What you need
- API key from [tavily.com](https://tavily.com)

```env
TAVILY_API_KEY=tvly-...
```

### Alternative: Brave Search API
```env
BRAVE_SEARCH_API_KEY=...
```

---

## 8. Slack (optional channel)

**Used for:** Text your agent from Slack workspace.

### What you need
1. Create Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Bot Token Scopes: `chat:write`, `im:history`, `im:read`
3. OAuth for workspace install

```env
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...
```

---

## 9. Telegram (optional channel)

**Used for:** Text your agent on Telegram.

### What you need
1. Message [@BotFather](https://t.me/BotFather)
2. Create bot → get token

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
```

---

## 10. Hosting & infrastructure (for production)

Not APIs you "give" us, but needed to run Hub:

| Service | Purpose |
|---------|---------|
| **Vercel** or **Railway** | Host Next.js app |
| **PostgreSQL** (Supabase, Neon) | User accounts, encrypted keys, activity log |
| **Redis** (Upstash) | Realtime sessions, voice call state |
| **S3 / R2** | Avatar assets, user uploads |

---

## Minimum viable setup (you, today)

To test the **draft app** right now:

```bash
# 1. Clone and run
npm install && npm run dev

# 2. Add ONE key during onboarding:
OPENAI_API_KEY=sk-...   # Enables live text chat
```

To test **voice + video** (next build step):

```bash
OPENAI_API_KEY=sk-...   # Must have Realtime API access
```

To test **email + calendar** (next build step):

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Security notes

- **Draft:** API keys stored in browser localStorage (not production-safe)
- **Production:** Encrypt keys server-side (AES-256), never log them, use per-user vault
- **OAuth:** Store refresh tokens encrypted; rotate on disconnect
- **Video:** Request camera permission explicitly; show recording indicator if storing

---

## What to send us when ready

Copy this checklist and fill in what you have:

```
[ ] OPENAI_API_KEY
[ ] ANTHROPIC_API_KEY (optional)
[ ] GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
[ ] TAVILY_API_KEY
[ ] SLACK_CLIENT_ID + SLACK_CLIENT_SECRET
[ ] TELEGRAM_BOT_TOKEN
[ ] ELEVENLABS_API_KEY (optional)
[ ] READY_PLAYER_ME_SUBDOMAIN (optional)
[ ] Production domain URL for OAuth redirects
```

We’ll wire each into the connector layer as we move from draft → production.
