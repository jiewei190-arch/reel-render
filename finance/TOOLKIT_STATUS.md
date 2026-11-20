# Toolkit status (branch finance/toolkit, 2026-11-18)

Everything is under `finance/render-pc/`. Nothing touches the per-Short `.tsx` files or `src/Root.tsx`, and the change is backward-compatible.
- The toolkit adds a second entry, `src/index.toolkit.ts`.
- The only edit to a shared tool is an opt-in `STORY_CUES=<file>` override in `tools/story_mix.py`.

## 1) CC0 prop library: DONE
- **Contents:** 155 props from 13 packs, 7.0 MB of GLB in `public/assets/cc0/`. Props and sets only: no characters, mannequins, figurines or animals.
- **Packs:**
  - Kenney: Mini Shop, Mini Arcade, Platformer (coins), Survival, Car Kit, City Commercial, City Suburban, City Roads, Food, Prototype, Furniture.
  - Quaternius: Furniture Vol.2, Car Pack.
- **Licences:** all CC0. Every Kenney zip's `License.txt` is copied next to its models. Both the OpenGameArt page and quaternius.com were checked. The record is in `public/assets/cc0/LICENSES.md`.
- **Network note.** From this cloud machine, kenney.nl returned 403 and Quaternius's Google Drive returned "quota exceeded".
  - The same packs were taken from the authors' own OpenGameArt uploads. The CC0 licence was confirmed on each page and in each Kenney zip.
  - `tools/fetch_cc0.sh` re-downloads them with pinned sha256 and rebuilds the library. Run it on the owner's PC to reproduce the library from the original zips.
  - No network changes were requested.
- **Formats.** glTF only.
  - The OBJ-only packs (Kenney Furniture, both Quaternius packs) were converted with our own `tools/obj2glb.py`.
  - The retro-urban pack was dropped: its photo textures clash with the look.
  - One Quaternius TV was dropped: its screen and palette don't read.
- **Loader.** `src/fin/lib/assets.tsx` provides `<Asset id="tv" />`. Each model is scaled to metres, has its bottom centre on `p`, and faces +z (each facing was checked on a rendered contact sheet).
  - The loader also provides `assetSize`, `assetBox` (QA boxes), `assetsTagged` and `usePreload`.
  - The typed catalogue is `assets.catalog.gen.ts`: id, tags, size.
- **Contact sheets.** `bash tools/asset_sheet.sh` renders the `AssetGallery` composition: one frame per asset, with a 1.45 m reference block.
- **Fix found during the build:** the 3D canvas only redraws on a frame change, so models must be preloaded outside the canvas. `usePreload` does this.

## 2) Shot-recipe system: DONE
- **Recipe format.** `finance/shorts/<slug>/recipe.json` is a list of shots.
  - Every time is a voice word (`"nineteen"`, `"5:nineteen"`, `"end:years+0.2"`, `"line:3"`) or seconds.
  - The schema is in `src/fin/recipe/types.ts`.
- **Presets:**
  - poses (13): idle, smug, shock, despair, push, reach, swipe-card, kneel (with the legs split, no sinking), collapse, point, celebrate, walk, run.
  - cameras (9): slamZoom, whip, pushIn, orbit, closeUp, medium, wide, splitScreen (S2), povFirstPerson (S3).
  - prop motions (6): dropSlam, fly-in, stick-to-face (outside the head box), rain, burst, count-up.
  - fx (4): shake, flash, dust, debris.
  - sets (5): store, home, street, bank, office, built from CC0 props plus our kit.
- **Compiler and renderer.** `src/fin/recipe/compile.tsx` compiles the recipe. `RecipeFilm` renders it: one View, or two for the split screen. It also handles motion-blur sub-frames, the hook text, word captions, flash, the corner tag and an automatic SFX cue plan.
- **CLI:** `node tools/recipe_build.mjs <slug>` (or `--check` to write nothing):
  - writes `src/shorts/<slug_>.recipe.gen.ts` and the registry, which adds `<Pascal>Recipe` and `<Pascal>RecipeSub` to `src/index.toolkit.ts`;
  - writes `out/tmp/<slug>.cues.json` for `story_mix.py`;
  - runs the **clip QA**: every frame × 4 sub-frames; props and set pieces against heads, torsos, hands and forearms; props below the floor; feet sinking or floating; actor against actor;
  - runs the **frame-0 gate**: frame-0 closeness (a projected subject ≥ 50 % of the frame height), hook ≤ 8 words at frame 0, the stake by 0.5 s, the first word by 0.3 s, music + SFX at 0, an emotion change by 1.5 s, no wide or dark shot in the first 1 s;
  - writes `RECIPE_QA.md` and exits 1 on a clip or a FAIL.
- **Finding:** a torso pitch also swings the rigid legs. The hand-written leaning poses (shock, despair, reach) put the soles 1-2 cm under the floor. The recipe compiler re-grounds every standing pose from the actual leg angles. The hand-written Shorts are unchanged; their builders may want the same fix.
- **Reference port: minimum-payment-trap.**
  - Files: `finance/shorts/minimum-payment-trap/recipe.json`, 22 shots in 46 lines. The hand-written `mintrap.tsx` is 339 lines.
  - QA: 0 clips, all gate checks PASS (frame 0: Spender covers 52 % of the frame height).
  - Comparison: CPU stills (`--gl=swangle`) are in `recipe_compare_a.jpg` and `recipe_compare_b.jpg` (top: the hand-written Short, bottom: the recipe; 18 frames).
  - Verdict: comparable. The recipe adds the CC0 shop dressing. The hand-written version still has a few bespoke touches the presets don't reproduce, such as calendar pages flying out of the counter calendar and the chip knocked off the OWE block.
- **Six style examples, S1-S6.** They live in `finance/render-pc/docs/recipe_examples/`. Each has a script, synthetic timings (`tools/make_timings.py`) and a 15-17-line recipe. All pass the QA and the gate, and all are registered as compositions.
  - The example scripts are demos. Their facts are illustrative and not sourced.

## 3) Borrowed code (MIT only): DONE
- **Source repositories:** mromidev/claude-animated-shorts (e3b817b) and hassancs91/claude-faceless-shorts-creator (773054b). Both were read as text only; nothing was installed or run.
- **What was rewritten:**
  - `src/fin/lib/camera.ts`: the impact kick, push-in with a punch window, zoom fov and quintic glide.
  - `src/fin/lib/motion.ts`: the reaction LEAD of 2 frames, bezier easings, the stamp slam, wind-up and loop punch.
  - `src/fin/lib/captions.tsx`: chunking with hold, per-word pop and the safe zone.
- **Notices:** both MIT licence texts are in `THIRD_PARTY_NOTICES.md`.
- **Not used:** no AGPL code (OpenMontage) and no reference frames.

## 4) Docs: DONE
- `finance/render-pc/RECIPE_GUIDE.md`: the workflow, the schema, every preset with a thumbnail (`docs/presets/*.jpg`, rendered from the `PresetGallery` composition by `tools/preset_sheet.sh`), the QA and gate, and the six examples.

## Not done / next
- **No full video render or audio mix here.** CPU stills only. The recipe Shorts render on the PC with the usual `render.sh`, pointed at `src/index.toolkit.ts`.
- **Root.tsx.** To show recipes in the main studio, add `RECIPES` from `src/fin/recipe/registry.gen.ts` to `src/Root.tsx`. This was left to the owner so the shared file isn't touched.
- **Possible preset additions:** a "pages fly out" motion (the mintrap S03 calendar), an "object chip" motion, and held props with a proper grip.

## Update: day-1 fixes in the gate (2026-11-18, later)
`tools/recipe_build.mjs` now enforces the FORMAT_V1 section "Day-1 data and fixes":
- hook ≤ 5 words;
- first word by 0.2 s;
- a sound punch at 0.00 s (the compiler's default cue at 0 is now `impact`; set `recipe.sfx0` for another, e.g. a rip);
- no character names in the first 2 s of speech;
- no tag before 1.0 s;
- 2-3 cuts or big moves in the first 3 s.

`RecipeFilm` now holds word captions until 1.0 s, so frame 0 has one text layer.

The six style examples were updated and pass. The minimum-payment-trap port (the live TV Short, 59.7 % stayed) passes the clip QA but fails two of these checks: the 7-word hook, and "Spender" as its first word. It is kept as a faithful port.

The two new Shorts MAIN asked for (ten-beats-thirty with ElevenLabs Tyler, prices-double with Christopher) are NOT started. They need the owner's OK on the paid ElevenLabs API and on pushing to finance/v1rebuild.

## Update: animation quality pass (2026-11-18, late)
It is on by default for every recipe; set `"quality": false` for the plain look. `<Id>Plain` renders the same recipe without it. Full details are in RECIPE_GUIDE.md, section 6.

What it adds:
- **Lip-sync:** 6 mouth shapes on the face decal, driven by the word timings (or by ElevenLabs per-character times when `vo/timings.json` has them). Shapes lead their sound by about 50 ms and hold at least 2 frames, with nods on stressed words.
- **Always alive:** blinks every 2-5 s on each actor's own rhythm, weight shifts, and a look-at (the lens while talking, the subject otherwise).
- **Acting:** pose blends with anticipation and overshoot, expression swaps hidden behind a blink, and spring wobble on antennae and upper body after hits.
- **Gestures:** point, count, palmsUp, facepalm, clutchHead, shrug.
- **Sets and polish:** passers-by (included in the clip QA), posters on every set, money sparkles, dust motes, soft contact shadows, and 1.5× depth of field on close shots.
- **Transitions:** punch-in, whip or match on each cut, and a crash-zoom pull-back before slams.

Sources: maath (spring), TalkingHead (coarticulation), Melvynx (S-curve), video-shotcraft and herk-edit-kit (ideas). The "Sources used" table is in RECIPE_GUIDE and the notices are in THIRD_PARTY_NOTICES. postprocessing is zlib and `@remotion/transitions` is under the Remotion License; neither is used.

Demo, in `finance/shorts/minimum-payment-trap/`:
- `quality_pass_compare_10s.mp4`: before and after, side by side, 2-12 s, with the voice.
- `quality_pass_stills.jpg`: top row before, bottom row after.

Cost: a CPU render (`--gl=swangle`, 540×960, sharp, no sub-frames) takes about 8 min per 10 s of video. QA: the mintrap port and all six examples have 0 clips with the pass on.

Not done:
- Merging into finance/v1rebuild (needs the owner's OK).
- ten-beats-thirty and prices-double (need the owner's OK on ElevenLabs and on the target branch).
