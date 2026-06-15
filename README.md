# Hub — Your Personal AI Agent

A web-first platform for creating personalized AI agents with expressive cartoon avatars. Text, voice call, or video chat with your agent — then connect Gmail, Calendar, Slack, and more to automate work.

**This is a draft / prototype.** Core UI and flows are built; live voice, 3D avatars, and OAuth connectors are stubbed with clear integration points.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — needed for Gmail/Calendar/Slack OAuth
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and complete onboarding.

**Full setup instructions:** [docs/SETUP.md](docs/SETUP.md)

## What's included

| Feature | Status |
|---------|--------|
| Onboarding wizard (goals, avatar, behavior, API key) | ✅ Working |
| Dashboard with activity feed | ✅ Working |
| Text chat (OpenAI when key provided, mock otherwise) | ✅ Working |
| Video call UI (avatar + user PiP + controls + screen share) | ✅ UI ready |
| Voice call UI | ✅ UI ready |
| 8 cartoon avatars across 4 categories | ✅ SVG placeholders |
| BYOK connections page | ✅ Working |
| Connectors (tap Connect Gmail, etc.) | ✅ OAuth for Gmail, Calendar, Slack |
| Plain-English skills | ✅ Working |
| Gmail / Calendar OAuth | ✅ Tap Connect in Connectors |
| Live voice (OpenAI Realtime) | 🔜 Needs API |
| 3D avatars with full animation | 🔜 Needs pipeline |
| Photo-to-avatar | 🔜 Coming soon |

## Project structure

```
src/
  app/                    # Next.js routes
  components/
    avatar/               # Avatar display & picker
    call/                 # Video & voice call views
    chat/                 # Text chat
    dashboard/            # Home view
    onboarding/           # Setup wizard
    settings/             # Connections, skills, settings
  lib/
    avatars.ts            # Avatar catalog
    store.ts              # Zustand state (persisted)
  types/                  # TypeScript types
docs/
  API_REQUIREMENTS.md     # What APIs you need and why
```

## API keys you need

See **[docs/API_REQUIREMENTS.md](docs/API_REQUIREMENTS.md)** for the full breakdown.

**Minimum to get chat working:**
- OpenAI API key → [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**Recommended next:**
- Google Cloud OAuth (Gmail + Calendar)
- Tavily API key (web search)

## Tech stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS 4**
- **Zustand** (client state)
- **Framer Motion** (onboarding animations)

## Roadmap

1. OpenAI Realtime API for live voice + video conversations
2. Google OAuth for Gmail and Calendar
3. Production 3D avatar pipeline (Ready Player Me or custom GLB models)
4. Photo-to-cartoon-avatar generation
5. Telegram + Slack channel integrations
6. Server-side encrypted key storage
