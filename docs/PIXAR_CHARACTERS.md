# Character assets (Marcus, Priya, Elias)

Hub characters are meant to look like **high-end 3D animation** (Pixar / Disney quality), not flat SVGs that blink.

Code cannot generate that level of art. You need to **provide the assets** and drop them into this repo.

## What to give us

### For the picker, dashboard, and chat (2D)

Place **1024×1024 or larger** portraits here:

```
public/avatars/characters/marcus.webp
public/avatars/characters/priya.webp
public/avatars/characters/elias.webp
```

| Requirement | Detail |
|-------------|--------|
| Format | `.webp` (preferred) or `.png` |
| Style | 3D-rendered bust or headshot, consistent lighting across all three |
| Background | Soft gradient or transparent (we crop to a circle) |
| Expression | Warm, approachable — match the personality in the picker |

Until these files exist, Hub falls back to simple SVG placeholders.

### For voice and video calls (3D)

Place **rigged GLB models** here:

```
public/models/marcus.glb
public/models/priya.glb
public/models/elias.glb
```

| Requirement | Detail |
|-------------|--------|
| Format | Single `.glb` file per character |
| Rigging | Humanoid rig with head/neck for future lip sync |
| Poly count | Under ~50k triangles for smooth web performance |
| Source | Ready Player Me, Blender, Character Creator, etc. |

Until GLB files exist, calls show a styled 3D placeholder bust in the character's accent color.

## How to add files (pick one)

### Drag into Cursor

1. Open `hub/public/avatars/characters/` and `hub/public/models/` in the file tree
2. Drag your `.webp` and `.glb` files in
3. Commit and push

### Terminal

```bash
cp ~/Downloads/marcus.webp ~/hub/public/avatars/characters/marcus.webp
cp ~/Downloads/marcus.glb ~/hub/public/models/marcus.glb
cd ~/hub && git add public/avatars public/models && git commit -m "Add Marcus character assets" && git push
```

## Where to get Pixar-quality characters

| Source | Best for |
|--------|----------|
| [Ready Player Me](https://readyplayer.me/) | Fast humanoid GLB export |
| Blender + marketplace rigs | Full control, cinematic look |
| AI image tools (Midjourney, etc.) | High-res 2D portraits — export as WebP |
| Licensed asset packs | Consistent trio with same art direction |

**Important:** AI-generated **images** work great for 2D. AI-generated **3D GLB** quality varies — test in a GLB viewer before committing.

## Matching the reference style

Your reference (expressive boy with pet, cinematic lighting) implies:

- Large expressive eyes with clear catchlights
- Subsurface-scattering skin (soft, alive)
- Individual hair detail, not flat blocks
- Warm key light + soft fill (not flat front lighting)

For **web performance**, the practical approach is:

1. **2D WebP portraits** for UI (picker, briefing, chat) — highest visual quality per pixel
2. **3D GLB** for voice/video calls — optional lip-sync later
3. **Short video loops** (future) — if you want “living” characters everywhere without real-time 3D

## After you add files

Tell us (or just push):

- Which character(s) you added
- Filenames used

Hub already maps:

| Avatar | Portrait | 3D model |
|--------|----------|----------|
| Marcus | `/avatars/characters/marcus.webp` | `/models/marcus.glb` |
| Priya | `/avatars/characters/priya.webp` | `/models/priya.glb` |
| Elias | `/avatars/characters/elias.webp` | `/models/elias.glb` |

Custom paths can be set in `src/lib/avatars.ts` via `portraitUrl` and `modelUrl`.

## I can't read a folder on your Mac

Cursor Cloud cannot access `~/Documents/...` on your computer. Files must be **in the git repo** (drag, copy, or GitHub upload).

See also [CHARACTER_ASSETS.md](./CHARACTER_ASSETS.md) for general GLB workflow.
