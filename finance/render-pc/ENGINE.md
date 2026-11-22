# ENGINE.md: one engine, five channels (branch engine/all)

One command builds every recipe: `node tools/recipe_build.mjs <slug>`. It reads `"kit"` in recipe.json and hands
the recipe to that kit's own compiler. Each kit has its own registry and Remotion entry, so a change in one kit cannot
break another kit's bundle. Every kit renders **portrait Shorts** (1080x1920) and **landscape long-form**
(`"format": "landscape"`, 1920x1080). There is **no motion blur**: always render the plain 30 fps composition
(README "No motion blur").

## Which code handles which recipe

| recipe `"kit"` | channel | compiler (node) | registry (generated) | Remotion entry | guide |
|---|---|---|---|---|---|
| none | Block Money (finance) | `tools/recipe_build.mjs` → `src/fin/recipe/compile.tsx` | `src/fin/recipe/registry.gen.ts` (`src/shorts/*.recipe.gen.ts`) | `src/index.toolkit.ts` | RECIPE_GUIDE.md, LONGFORM.md |
| `tech3d` | tech explainers | `tools/tech_build.mjs` → `src/tech/compile.ts` | `src/tech/registry.gen.ts` (`src/tech/gen/`) | `src/index.tech.ts` | KIT_TECH3D.md |
| `law3d` | weird court cases | `tools/law_build.mjs` → `src/law/compile.ts` | `src/law/registry.gen.ts` (`src/law/gen/`) | `src/index.law.ts` | KIT_LAW3D.md |
| `biz3d` | business collapses | `tools/biz_build.mjs` → `src/biz/compile.ts` | `src/biz/registry.gen.ts` (`src/biz/gen/`) | `src/index.biz.ts` | KIT_BIZ3D.md |
| `cyber3d` | scams & hacks | `tools/cyber_build.mjs` → `src/cyber/compile.ts` | `src/cyber/registry.gen.ts` (`src/cyber/gen/`) | `src/index.cyber.ts` | KIT_CYBER3D.md |

The dispatch is the `KITS` table near the top of `tools/recipe_build.mjs`. An unknown `"kit"` is an error.

Shared by all of them:
- `src/fin/recipe/timing.ts`: the `At` syntax, a word of the voice-over or seconds.
- `src/engine/core/View.tsx`: the three.js view and post chain.
- `src/blocky/mat.ts`: material, geometry and texture caches, bounded LRUs that dispose what they evict.
- `src/longform/kit.tsx`: the long-form look and rules (chapter card, lower-third captions, 16:9 lens table, caption band).
- `tools/kit_long.mjs`: kit command line, `--qa-sample`, long-form gate, report.
- `tools/longform_gate.mjs`: the Block Money long-form gate and `chapters.txt`.
- `tools/clip_short.mjs` and `tools/clip_short_kit.mjs`.

## Shorts (portrait)

```bash
cd finance/render-pc
node tools/recipe_build.mjs <slug> --check      # compile + clip QA + the kit's frame-0 gate; writes nothing
node tools/recipe_build.mjs <slug>              # + gen file, registry, RECIPE_QA.md, out/tmp/<slug>.cues.json
npx remotion still  <entry> <Pascal>Recipe out.jpg --frame=30 --scale=0.5 --gl=swangle        # cloud CPU
npx remotion render <entry> <Pascal>Recipe out/<slug>.mp4 --gl=angle --codec=h264 --crf=18 --pixel-format=yuv420p
STORY_CUES=out/tmp/<slug>.cues.json python tools/story_mix.py <Pascal>Recipe voice.wav <audio_dir> premix.wav
bash tools/mux_voice.sh out/<slug>.mp4 premix.wav out/<slug>_final.mp4
```

`<entry>` comes from the table: `src/index.toolkit.ts` for Block Money, `src/index.<tech|law|biz|cyber>.ts` for a kit.
`<Pascal>` is the slug in PascalCase, e.g. `law-demo-54-million-pants` gives `LawDemo54MillionPantsRecipe`.
Shorts always get the full clip QA: every frame × 4 sub-frames. `--qa-sample` is ignored for them, with a note.

## Long-form (landscape, 8-12 min)

Put `"format": "landscape"` and `"chapters": [{ "title", "word" }]` in recipe.json. The folder is
`finance/longform/<slug>/`, and the builder looks there when `finance/shorts/<slug>` does not exist. Every kit follows
the LONGFORM.md rules:
- **Lens:** three.js keeps the vertical fov, and wider presets narrow it (`LANDSCAPE_LENS`).
- **Captions:** lower-third phrases of up to 7 words, 2 lines max, centred at y 905 of 1080.
- **Caption-safe lift:** a shot whose face lands in the caption band is lifted, unless `cam.face` is set.
- **Hook:** top centre.
- **Chapter cards:** 2.6 s, with a whoosh and an impact cue.
- **`chapters.txt`:** YouTube timestamps, written next to the recipe.
- **Long-form gate:**
  - hard: ≥ 3 chapters, the first at 00:00, each ≥ 10 s; a visual change every ≤ 6 s; a beat every ≤ 40 s; captions in the lower third;
  - warn: shot length, open loops, text ≥ 30 px, boards inside the frame and out of the band, 8-12 min.

```bash
node tools/recipe_build.mjs <slug> --check --qa-sample 5    # drafts: QA every 5th output frame
node tools/recipe_build.mjs <slug>                          # gen + registry + RECIPE_QA.md + chapters.txt + cues
npx remotion render <entry> <Pascal>Recipe out/longform/<slug>.mp4 --gl=angle --concurrency=8 --codec=h264 --crf=18 --pixel-format=yuv420p
#   cloud proof: --scale=0.5 --gl=swangle --concurrency=4 --timeout=600000
```

Each kit's own long-form section has the details: KIT_TECH3D.md §12, KIT_LAW3D.md §12, KIT_BIZ3D.md §14,
KIT_CYBER3D.md §14, and LONGFORM.md for Block Money.

The test recipes, about 30 s each with 3 chapters and passing the hard gates, are
`finance/longform/{tech,law,biz,cyber}-demo-landscape/` and Block Money's `shop-too-fast`. Their 0.5-scale renders and
contact sheets are in `finance/longform/kit-tests/`.

## Shorts from a long video: clip_short

```bash
node tools/clip_short.mjs <slug> --from-word X --to-word Y --out <slug>-short-N [--hook "TEXT"] [--stake "TEXT"]
node tools/recipe_build.mjs <slug>-short-N      # the kit's full Shorts QA + frame-0 gate
```

This works for every kit. clip_short cuts the words and re-anchors every time to the new word timings. For a kit
recipe, the kit's `clipAdapter` (exported by `tools/<kit>_entry.ts`) does the kit-specific part:
- it re-times the shot fields (cards, gavels, cutaways…);
- it writes a fresh frame-0 hook shot that passes the kit's own gate;
- it formats the hook text the kit's way, for example law3d's single `*gold*` word.

The Short is rendered natively in portrait, not cropped. Working examples:
- `finance/shorts/shop-too-fast-short-1`
- `finance/shorts/{tech,law,biz,cyber}-demo-landscape-short-1`

## Performance (long-form)

These timings come from synthetic 8.6-9.5 min recipes, each kit's landscape demo repeated 16 times: 208-256 shots,
1,472-1,600 words, 8 chapters. They ran on the 4-core cloud machine while a render was running.

| kit | `--check` (QA every frame) | `--check --qa-sample 5` |
|---|---|---|
| tech3d | 1.15 s | 0.64 s |
| law3d | 0.78 s | 0.55 s |
| biz3d | 0.86 s | 0.48 s |
| cyber3d | 0.83 s | 0.54 s |
| Block Money (LONGFORM.md §4, 8.7 min) | 1.3 s | 0.9 s |

- **Shot lookup:** `shotAt` is a binary search in every compiler.
- **Assets:** Block Money loads its CC0 models per window (the current and next shot), never all at once. The four
  kits are procedural (no model or texture files), so there is nothing to preload.
- **Caches:** their text textures (headlines, email tiles, BOLT faces, boards) live in bounded caches that dispose
  evicted GPU objects, so a 10-minute render does not grow memory.
- **WebGL canvas:** it stays mounted across shots in every film, so shaders are compiled once per render tab.

## Regression rule

Without `"format": "landscape"`, every recipe compiles exactly as before. This was checked for engine/all by rebuilding
every recipe before and after: the 22 Block Money Shorts, `shop-too-fast`, and the four kit demos. The generated
`.gen.ts` files, the cue plans and the QA reports hash the same, and the exit codes match. The kit registries only
gained the new test recipes. The kit demos' first 3 s were also rendered before and after and compared.

## Known limits

- **Timings:** all demo and test voice timings are synthetic (`make_timings.py`-style). Lip-sync and pacing need the
  real Whisper timings.
- **Sets:** the kits' sets were authored for 9:16. Very wide 16:9 shots can show set edges; check the stills. There are
  no new sets for long-form yet.
- **Chapter card:**
  - It has one fixed placement (left, top 330 px) and covers a centred face for 2.6 s.
  - The kits pass their own accent colours; there are no per-channel layout themes.
- **clip_short:**
  - It keeps the source cameras. Block Money refits boards for 9:16, but the kits have no portrait-fit pass, so a wide
    two-person 16:9 shot may need a hand edit.
  - The kit adapters set no loop ending, so the "loop ending" warning stays on clipped kit Shorts.
  - The law3d, biz3d and cyber3d Shorts rules want 30-55 s, so 20-30 s clips get a length warning (tech3d's 32 s clip
    meets it).
- **Caption-safe lift:**
  - It follows faces only: executives in biz3d, BOLT in tech3d, figures in law3d, BOLT and the figure in cyber3d.
  - Text props in the band only warn.
- **Unrendered fixes:** a few card positions fixed in the landscape tests were checked by geometry only before the
  final renders: biz THE DECISION, cyber ALERT, the law case card. The kit-tests contact sheets are the visual check.
- **Render time:** rendering on the cloud CPU (swangle) is slow, about 1-2 s per frame at 0.5 scale. Render finals on
  the PC's GPU (`--gl=angle`).
- **Block Money:** the `<Pascal>RecipeSub` compositions are still registered (unchanged generated files), but they are
  not used.
