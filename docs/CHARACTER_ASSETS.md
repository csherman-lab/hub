# Adding your custom 3D character

Hub uses **3D GLB models** for voice and video calls. You can drop in a character you made (Ready Player Me, Blender, etc.) without giving API keys or editing code.

## I can't read a folder on your Mac

Cursor Cloud and this repo **cannot access** paths like `~/Documents/my-character` on your computer. Telling me the folder name isn't enough — the files need to get **into the git repo**.

## How to add your character (pick one)

### Option A — Drag into Cursor (easiest)

1. Unzip your file on your Mac
2. Find the `.glb` file (or export one from your tool)
3. In Cursor's file tree, open `hub/public/models/`
4. Drag the `.glb` file in
5. Rename it to match an avatar id, e.g. `jules.glb` or `custom.glb`
6. Commit and push:

```bash
git add public/models/
git commit -m "Add custom 3D character"
git push
```

### Option B — Terminal copy

```bash
# After unzipping locally:
cp ~/Downloads/your-character/model.glb ~/hub/public/models/jules.glb
cd ~/hub && git add public/models/jules.glb && git commit -m "Add character" && git push
```

### Option C — GitHub web upload

1. Push your branch
2. On GitHub → `public/models/` → **Add file** → Upload your `.glb`

## File format

| Format | Works? |
|--------|--------|
| `.glb` | ✅ Best — use this |
| `.gltf` + `.bin` | ⚠️ Convert to single `.glb` if possible |
| `.fbx`, `.obj`, `.zip` | ❌ Export to `.glb` first (Blender, RPM, etc.) |
| `.png` only | Used for 2D thumbnails; 3D calls need `.glb` |

## Naming

Place files in `public/models/`:

```
public/models/jules.glb      → Jules avatar
public/models/aria.glb       → Aria avatar
public/models/custom.glb     → set modelUrl in avatars.ts
```

Or set per-avatar in `src/lib/avatars.ts`:

```typescript
modelUrl: "/models/my-character.glb",
```

## Ready Player Me

If your zip is from [Ready Player Me](https://readyplayer.me/):

1. Export as **GLB**
2. Drop into `public/models/`
3. Hub will load it automatically on voice/video calls

## Until your model is added

Hub shows a **placeholder 3D bust** (colored shoulders + head) so calls still work. Your PNG art is still used on the dashboard and chat.

## Questions?

Tell me:
- The **avatar name** it should replace (Jules, custom, etc.)
- The **filename** after you add it to `public/models/`

I can wire it up in code once the file is in the repo.
