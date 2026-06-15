# Hub — Your Personal AI Agent

A web-first platform for creating personalized AI agents with expressive cartoon avatars. Text, voice call, or video chat with your agent — then connect Gmail, Calendar, Slack, and more to automate work.

## Quick start

```bash
npm install
npm run setup:env   # creates .env.local and opens it — add XAI_API_KEY=xai-...
npm run dev
```

Open [http://localhost:3000/onboarding](http://localhost:3000/onboarding) and complete onboarding.

**Full setup:** [docs/SETUP.md](docs/SETUP.md)

## What's included

| Feature | Status |
|---------|--------|
| Onboarding wizard (goals, avatar, behavior, connect) | ✅ Working |
| Animated avatar picker with Grok voice preview | ✅ Working |
| Dashboard with activity feed | ✅ Working |
| Text chat (Grok when key in `.env.local`, mock otherwise) | ✅ Working |
| Voice call with Grok TTS + lip-sync | ✅ Working |
| Video call with avatar lip-sync + camera PiP | ✅ Working |
| 6 avatars across 3 categories | ✅ Working |
| Connectors (Gmail, Calendar, Slack OAuth) | ✅ OAuth ready |
| Plain-English skills | ✅ Working |
| OpenAI Realtime (sub-second voice) | 🔜 Future |
| 3D avatars with blendshapes | 🔜 Future |
| Photo-to-avatar | 🔜 Future |

## API keys

**Required for live AI:**

```env
XAI_API_KEY=xai-...
```

Get your key at [console.x.ai](https://console.x.ai). Add it to `.env.local` — never commit it.

See **[docs/API_REQUIREMENTS.md](docs/API_REQUIREMENTS.md)** for optional connectors (Google, Slack, Tavily, etc.).

## Tech stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS 4**
- **Zustand** (client state)
- **Framer Motion** (animations)
- **xAI Grok** (chat + TTS)

## Project structure

```
src/
  app/api/          # Chat, voice, OAuth routes
  components/
    avatar/         # Display, picker, lip-sync
    call/           # Voice & video call views
    chat/           # Text chat
    connectors/     # Tap-to-connect UI
  lib/
    xai.ts          # Grok chat + TTS client
    avatars.ts      # Avatar catalog + voice IDs
    voice.ts        # Browser audio + lip-sync
docs/
  SETUP.md
  API_REQUIREMENTS.md
```
