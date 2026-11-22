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

## Framing QA (screen space, all engines)

`tools/framing_qa.mjs` is the shared core. Each engine gives it a scene sampler: Block Money's `framingAt` in
`src/fin/recipe/compile.tsx`, and the four kits' samplers in `tools/framing_kits.mjs`. The core projects heads, bodies,
boards, cards and props through the shot camera (vertical fov plus roll, as View.tsx sets the camera up) into output
pixels on every output frame (long-form: every `--qa-sample` frame). It adds five rules to the build. The plain-words
version for writers is RECIPE_GUIDE.md §4.1 and each KIT guide's "Framing rules".

| rule | result | check |
|---|---|---|
| R1 | CLIP | No board, card or prop is over a head on screen. The head includes antennae, hair, hat or hood, split into the head proper plus each antenna / ear / hair part. |
| R2 | FAIL | The shot's subject is >= 85 % in frame (left to right), with the head 11 px clear of every edge; in a close shot, the head is centred. No other head is sliced by an edge. |
| R3 | FAIL | Every landed board or card is inside the frame with a 3 % margin. |
| R4 | FAIL | Every text line is >= 4.5:1 against its fill (WCAG); a featured main line is >= 42 px font size. |
| R5 | FAIL | Shorts, frame 0: the hook is at full size and the subject's face is >= 16 % of the frame height. |

A violation must last 3 output frames (0.1 s) to count. A board flying through a face, or a whip pan, is motion.

**Tuning, with the reasons** (none of it was done to make an existing recipe pass):
- **R1: big props.** A non-text prop counts when its box half-size is <= 0.75 m and it is within 0.6 m of the head (3D
  gap). Cars, sofas and counters behind a character are staging, and the 3D clip QA already keeps them out of bodies.
- **R1: text boards count at any depth.** Stills of `minimum-payment-trap` S07 showed Spender's antennae over the OWE
  block 3 m behind him. That is defect 1 as the owner described it.
- **R1: exact outlines.** R1 overlaps the exact screen outline of each box (the convex hull of its 8 projected corners),
  needs 144 px² (12 x 12) of overlap, and models BOLT's shell as a sphere. A bounding cube's empty corners gave false
  hits beside BOLT (tech-demo S10, checked on a still).
- **R2: close shots.** In a close shot the arms reach past the frame on purpose, so "85 % of the body" is replaced by
  "head centred and clear of the edges".
- **R2: the only actor.** "The shot's only actor" is the subject only while their head is >= 50 % on screen. An insert
  shot of a hand stays legal.
- **R2: whip-ins.** The first 0.35 s of a whip-in is skipped, because it swings across the set on purpose.
- **R3: background boards.** Multi-shot background boards count only when their main line would read on screen (>= half
  the R4 size). Out-of-focus clutter at the edge is set dressing; a readable cut-off word is a defect. `rain` copies are
  exempt.
- **R4: text size is the font size (em).** "42 px" means the font size, measured as cap height (0.709 em in Poppins 800,
  so 29.8 px). Reading it as 42 px of cap height would ask for a 59 px font and fail every kit's 50-54 px callout label.
  It also equals the existing long-form rule (cap >= 30 px).
- **R4: which boards count, and which size.** Only boards listed in the shot, or the camera target, are "featured" for
  the size rule. The size used is the median while landed and fully in frame, so a push-in that reaches the size only
  at the end does not pass.
- **R5: the existing 50 % gate let a weak frame 0 pass.** It counts any subject, so a body or a prop covering 50 % passed
  even when the face was small. R5 measures the subject's face, on screen. The 16 % threshold sits between a mid-shot
  (the `medium` preset is about 15 %) and the default `hookZoom` frame 0 on a face (about 18 %).

**Engine colour fixes** (the writer cannot set these, so they had to pass in code):
- the calendar title / sub grey: `#736c84`, 4.8:1 (was 2.9:1);
- tech3d board titles on blueDeep, and their symbols `#B5521A`;
- biz3d `TEXT_TONE` shades for coloured text and for fills under white text;
- the law3d folder stamp.

These change how those elements render, not any compile output.

**Regression:** with this branch, every recipe's generated `.gen.ts`, registry and cue plan is byte-identical to
engine/all (rebuilt and compared). Three committed Block Money gen files were already stale before this branch
(`employer-match`, `minimum-payment-trap`, `ten-beats-thirty`: their caption-safe framing was not baked); a rebuild on
engine/all regenerates the same bytes.

**Speed:** the framing pass adds 0.04-0.18 s per Short (685-1,620 frames). A whole `--check` stays at 0.4-0.6 s.

**Fixture:** `tools/qa_fixtures/framing-defects` reproduces the five reported defects. Run
`node tools/recipe_build.mjs framing-defects --check --shorts tools/qa_fixtures` and check that it flags R1-R5. The
results on every existing recipe are in docs/FRAMING_QA_REPORT.md.

**Known limits:**
- **Declared colours only.** The rules read the colours the recipe and engine declare. On store-lit sets, rendered
  boards lose about 40 % of their contrast (a 4.50:1 default-red label measured 2.2-3.0:1 in stills). Aim for about
  6:1; a render-side fix (unlit or tone-map-free board decals) is a follow-up.
- **Box approximations.** Characters' heads are boxes (BOLT is a sphere). Projected box corners are conservative by a few
  px. The law3d head ignores head pitch, as `figHead` does.
- **Splits and DOM cards.**
  - Split-screen views are checked per view. A split's bottom view, lifted by caption-safe framing, often has the
    antennae touching the seam; this is the most common R2 hit (77 of 132 top-edge hits).
  - DOM cards are axis-aligned rects (the verdict and stamp rotations are ignored).
- **Not checked:** set-dressing text (wall posters, store signs, headline walls, evidence pins) and hooks / captions
  (they have their own gates).

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
