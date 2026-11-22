# finance/render-pc: the PC's Remotion project (source only)
This is a copy of `C:\Users\jiewe\blocky-render\` on the PC, without `node_modules/`, `build/`, `out/` or the voice files.
- **Engine:** `src/fin/core.tsx`.
  - Shots: `FinShot` = a lens per shot. `buildShots(plan, lens)`.
  - `FinFilm` is the composition body. `Act` is an actor.
  - Moods: store / whisper / ending / earth / home.
- **Props:** `src/fin/props.tsx`: coins, stacks, piles, plain bills, BigBlock, CashCase, FlipCalendar, Receipt, Stamp, TollBooth, ChartBoard, BigClock, Pedestal, Label, AO, Hall (interior), Ground (outdoor + long road).
- **HUD:** `src/fin/hud.tsx`: the holo Counter, CornerTag, and captions in script.txt casing (`casedChunks`).
- **Shorts:** `src/fin/penny.tsx` and `src/fin/rule72.tsx`. The helper's Shorts live in its own copy and get pushed separately.
- **Registering a Short:** add it in `src/Root.tsx` FIN as `[CompId, SPEC]`. Props go by id because Remotion serialises props to JSON.
- **Plans:** `src/shorts/<slug>.plan.gen.ts` (copied from finance/shorts/<slug>/src/plan.gen.ts). Scripts: `src/fin/scripts/*.ts`.

**Render:**
1. `npm ci`
2. `COMP=<Id> bash tools/stills.sh <tag> <frames…>` for stills.
3. `NAME=<x>_v bash render.sh <N> <Id>` for the full render: the plain 30 fps composition (see "No motion blur" below).
4. `bash tools/mux_voice.sh <muted.mp4> <voice.wav> <out.mp4>`: -14 LUFS, true peak -1.5.
5. Copy the Short's plan to `src/plan.gen.ts`, then run `python tools/critic.py <muted> <voiced>`.

## Toolkit (branch finance/toolkit): recipes and CC0 props
- **Shot recipes:** a Short written as `finance/shorts/<slug>/recipe.json`: word-anchored shots with preset poses, cameras, prop motions, fx and sets.
  - Build: `node tools/recipe_build.mjs <slug>` writes the composition into `src/index.toolkit.ts` and runs the clip QA and the frame-0 gate.
  - Full guide: `RECIPE_GUIDE.md`. The engine is in `src/fin/recipe/`.
- **CC0 props:** 155 Kenney/Quaternius GLB props in `public/assets/cc0/`, loaded with `<Asset id="tv" />` (`src/fin/lib/assets.tsx`). Licences are in `public/assets/cc0/LICENSES.md`.
  - **Owner's PC:** kenney.nl and Quaternius's Google Drive refused downloads from the cloud build machine, so the packs came from the authors' own OpenGameArt uploads. To rebuild the library from scratch, run `bash tools/fetch_cc0.sh` (it pins sha256), then `bash tools/asset_sheet.sh` to look at every prop.
- **Toolkit entry:** `src/index.toolkit.ts` registers the recipe compositions, `AssetGallery`, `PresetGallery` and the `MinimumPaymentTrapV1` reference. `src/Root.tsx` and `src/index.ts` are unchanged.
- **Long-form (landscape 1920x1080, 8-12 min):** `"format": "landscape"` in a recipe, chapters, lower-third captions, `tools/clip_short.mjs` for vertical Shorts cut from a long video. Guide and commands: `LONGFORM.md`. Shorts are unchanged.

## Five channels, one engine (branch engine/all)
- Block Money (no `"kit"`), tech3d, law3d, biz3d and cyber3d recipes all build with `node tools/recipe_build.mjs <slug>`;
  it dispatches by the recipe's `"kit"`. Each kit keeps its own compiler, registry and Remotion entry.
- Every kit renders portrait Shorts and `"format": "landscape"` long-form (chapters, lower-third captions, chapters.txt,
  `--qa-sample N`), and `tools/clip_short.mjs` cuts portrait Shorts from any of them. One page: `ENGINE.md`.

## No motion blur (owner decision)
Every render, Shorts and long-form, in every kit, is the **plain 30 fps composition** (`<Pascal>Recipe`). Nothing is
rendered through a `...Sub` sub-frame composition and averaged any more:
- the cost: a Sub render is 4x the frames, and a 10-minute video is already 18,000 frames;
- landscape recipes do not even register a Sub composition, and the kits never had one;
- the Block Money portrait `<Pascal>RecipeSub` compositions are still registered (so old commands and generated files
  stay byte-identical), but are not used; `render.sh` renders a plain composition as it is (SUB=1, no tmix) and only
  takes the old motion-blur path when it is given a name ending in `Sub`;
- the clip QA still checks Shorts at 4 sub-frames per frame (a stricter check; it costs under a second), long-form at
  every Nth output frame (`--qa-sample N`).

```bash
npx remotion render src/index.toolkit.ts <Pascal>Recipe out/<slug>.mp4 --gl=angle --codec=h264 --crf=18 --pixel-format=yuv420p
ENTRY=src/index.law.ts NAME=law_v bash render.sh 1 <Pascal>Recipe      # the same through render.sh (QA + contact sheet)
```
