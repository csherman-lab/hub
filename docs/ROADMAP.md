# Hub — Product Roadmap

Prioritized recommendations from a full site audit (June 2025).

---

## P0 — Fix what feels broken today

| Item | Status | Notes |
|------|--------|-------|
| Accurate connector logos | ✅ In progress | Gmail, Slack, xAI, Anthropic, Telegram SVGs |
| Chat repetition / JSON leaks | ✅ Fixed | `sanitizeReply`, stricter prompt, shorter `max_tokens` |
| Separate chat vs call transcripts | ✅ Fixed | `channel` on messages |
| Voice in navbar | ✅ Fixed | Grouped under "Talk to agent" |
| Male/female voice matching | ✅ Fixed | `gender` + Grok voice IDs per character |
| Avatar image fallbacks | ✅ Fixed | Gradient placeholder when PNG missing |
| Dashboard loading spinner | ✅ Fixed | Hydration guard |

**Still needed:** Add real avatar PNGs to `public/avatars/` (Jules, Aria, Marco, Luna, Alex, Voice Mate).

---

## P1 — Make video feel alive (your #1 visual ask)

Today: still image + lip-sync overlay + idle motion (`LiveAvatar`).

### Recommended path to 3D talking head

**Phase 1 — Live2D or video loops (2–3 weeks)**
- Pre-render idle / talking / thinking loops per avatar
- Swap clips based on state; sync mouth to TTS amplitude
- Shoulders-up framing, cinematic feel without full 3D pipeline

**Phase 2 — Ready Player Me + React Three Fiber (4–6 weeks)**
- RPM GLB avatars with ARKit blendshapes
- Drive `jawOpen`, `mouthSmile` from TTS audio or viseme map
- Emotion tags from Grok → blendshape presets
- Libraries: `@react-three/fiber`, `@react-three/drei`, `three`

**Phase 3 — Real-time quality**
- xAI Realtime API or custom viseme stream from TTS timestamps
- Sub-300ms voice latency (today: STT → HTTP → TTS ≈ 2–4s)

---

## P1 — Voice call quality

| Today | Target |
|-------|--------|
| Push-to-talk only | Continuous listening with VAD |
| Chrome-only STT | Fallback upload-audio → Whisper |
| Round-trip latency | xAI Realtime WebSocket |
| Mute doesn't stop agent | Mute should pause TTS |

---

## P2 — Make connectors actually work

OAuth **connects** but nothing **executes**:

1. `POST /api/gmail/draft` — read inbox, draft replies
2. `POST /api/calendar/events` — list/create events
3. `POST /api/search` — Tavily research
4. Slack events webhook

Wire approved actions to the activity feed on Home.

---

## P2 — Skills & behavior

- Skills are saved but never injected into chat → add to system prompt
- Proactivity / autonomy from Settings → now sent to Grok ✅
- Goals from onboarding → now sent to Grok ✅

---

## P3 — What makes Hub stand out

1. **One agent, every channel** — same personality on web, SMS, Slack, email
2. **Approval inbox** — agent drafts; you tap Approve (ties to autonomy setting)
3. **Morning briefing** — proactive digest from calendar + email + habits
4. **Photo-to-avatar** — upload selfie → cartoon agent (onboarding placeholder exists)
5. **Apple Health** — steps habit sync (HealthKit bridge via iOS companion app later)
6. **Memory** — long-term user context beyond last 10 messages (vector store)

---

## P3 — Polish

- Markdown in chat (bold, links)
- Copy message / clear history
- Streaming Grok responses (typewriter effect)
- Real connector status on Home (sync with `/api/connect/status`)
- Skills delete button
- Remove fake meeting controls (reactions, raise hand) or implement them

---

## Voice map (current)

| Avatar | Gender | Grok voice |
|--------|--------|------------|
| Jules | Female | `eve` |
| Aria | Female | `ara` |
| Marco | Male | `sal` |
| Voice Mate | Male | `leo` |
| Luna | Female | `eve` |
| Alex | Male | `rex` |

Female: `eve`, `ara` · Male: `leo`, `sal`, `rex`
