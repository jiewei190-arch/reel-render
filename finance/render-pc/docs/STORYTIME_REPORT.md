# storytime kit: report (episode 1 "Deez Nuts")

A new vertical (1080 x 1920, 30 fps) kit for an animated school-storytime account ("My Homie Wildin"), built in the
`claymation` look, with its first episode. Kit doc: `KIT_STORYTIME.md`. Code: `src/storytime/`. Build/QA:
`tools/storytime_build.mjs` (through `node tools/recipe_build.mjs <slug>`). Branch `engine/storytime`, draft PR #100
into `engine/all` (not merged). No other kit was changed (one `KITS` entry added to `tools/recipe_build.mjs`).

## Cast (original designs)

| id | look |
|---|---|
| **me** (narrator) | warm brown skin `#9a6240`, black flat-top, dark-brown eyes, **mustard hoodie** `#f2b632` with white drawstrings + pouch pocket, navy pants, white shoes |
| **homie** | pale freckled skin `#f4cfa6`, **copper clay curls** `#c4541c` (the `curls` hair style: a mop of rolled clay balls), green eyes, **purple tee** `#7b4fd6` with a white band, olive pants, dark shoes |

Classmates (extras) reuse the same body with other colours/hair and simple faces.

**Expressions** (snapping clay replacement faces, the speaker's mouth flaps from the voice amplitude, quantised to
clay mouth shapes; only the speaker's mouth moves): `neutral`, `annoyed`, `furious`, `shocked`, `deadpan`, `smug`,
`laughing`, `sideeye`, plus `yell` (the cold open) and `scream` (the held "UUUP").
**Poses**: `idle`, `talk`, `yell`, `phone`, `laugh`, `point`, `lean`.

## Claymation look

- Plasticine `MeshPhysicalMaterial`: chalky, slightly desaturated matte colour; a soft wax sheen; a procedural
  fingerprint-whorl / thumb-press / tool-smear bump map.
- Hand-made shapes:
  - every block and ball is lumpy, with a slow silhouette wobble and 2-3 thumb dents;
  - limbs are tapered, slightly bent hand-rolled sausages with elbows;
  - thin darker creases sit where pieces join (neck, sleeves, wrists, ankles).
- Faces are separate clay pieces: eye discs, pupils, clipped lids, capsule brows and sculpted mouths with teeth and a tongue. Expressions **snap**.
- Characters, set motion and the glass shards animate **on twos** (15 fps poses in a 30 fps film).
- Sets are clay, felt and cardboard: felt floors, card walls, printed paper posters and chalkboard, and lumpy clay furniture. Warm soft tabletop key light, a cool bounce and a gentle vignette.
- The cafeteria window shatter: sugar-glass clay chunks plus a 2D crack overlay.
- Captions are unchanged by the style: white Poppins 800 with a black outline and one yellow accent word.

## Sets

`classroom` (desks, chalkboard, posters, clock, windows), `hallway` (lockers, doors, notice board), `cafeteria`
(tables + benches, trays, serving counter, the window wall that shatters). Each set has lead marks, extras, a
camera-bounds box (cameras are clamped inside the room) and blockers.

## Recipe schema (summary; full spec in KIT_STORYTIME.md)

- `lines`: speaker, text (stylised spellings like `FUUUCK` are kept in the captions), `shout`, start faces and accent words.
- `shots[]`: `at` (seconds or word anchors `"L:word#k+0.2"`, `"L"`, `"L:end"`), `set`, and `cam`. The camera takes a `preset` plus `on`/`az`/`dist`/`h`/`face`/`roll`. Presets: `closeup_me`, `closeup_homie`, `closeup`, `punch_in`, `two_shot`, `ots`, `insert`, `wide_class`, `crowd`, `windows`.
- Per-shot events: `face`, `pose` and `look` events, `fx` (`shake`, `punch`, `flash`, `shatter`), `class` (turn, laugh or front) and `hold`.
- `end` is the hard cut to black.
- `--check` validates the schema.
- QA:
  - clip-free 3D cameras;
  - kit framing R1-R6 (subject in frame, faces clear of the edges, caption safe zone, contrast and size, the frame-0 hook, captions never over a face or neck);
  - caption text-fit (1-3 words, shout lines ALL CAPS and bigger).

Episode 1 has 13 lines and 53 shots (15 punch-ins, 25 close-ups, 4 OTS, 3 two-shots, 2 inserts, 2 wides, 1 crowd, 1 windows). QA result: 0 clips and 0 framing fails over 2,342 sampled frames, and all gate rows PASS (`finance/shorts/deez-nuts-ep1/RECIPE_QA.md`).

## Episode render

**Render on the PC (GPU)** from `finance/render-pc`:

```
node tools/recipe_build.mjs deez-nuts-ep1          # codegen + QA (writes src/storytime/gen + RECIPE_QA.md); add --check to only validate
npx remotion render src/index.storytime.ts DeezNutsEp1Recipe out/storytime/deez-nuts-ep1.mp4 --gl=angle --crf=20
```

- Composition `DeezNutsEp1Recipe` (1080x1920, 30 fps, 2366 frames, 78.87 s, black from 78.06 s).
- Audio is `public/storytime/deez-nuts-ep1.mp3`, played via `staticFile("storytime/deez-nuts-ep1.mp3")`. It is a copy of `previews/deez_nuts_voiceover_v6.mp3`; the timings came from `previews/deez_nuts_v6_timings.json` and are now in `finance/shorts/deez-nuts-ep1/vo/`.
- The PC's first GPU render (c249dd0) took **78 s**. A CPU (swangle) render in the cloud container ran at about 5.7 s per frame (about 3.7 h for the film), so it was stopped in favour of the PC render.

**QA fixes after the PC's first render**:

- **A. Edge-on face pieces** (OTS at 11-12 s): the flat clay face pieces of a kid turned more than 62° from the lens are now hidden (`FACE_CULL` / `faceAngle` in compile.ts, used by the renderer and by QA). A new gate row counts lead faces seen edge-on (55-62°). It is a warning, not a hard failure; currently 1 frame in S21, and 159 lead-frames are culled.
- **B. Cafeteria lighting**: the cafeteria key now comes from the same side as the classroom's, so the cast's colours match across sets. The brown-hair kid's skin and the mustard hoodie no longer wash out.
- **C. Double captions**: a chunk's linger now ends where the next chunk starts, so only one chunk is ever on screen. There is a gate row for this.
- **D. Caption baseline and the foreground blob**:
  - All captions now share ONE baseline (the lowest any shot needs, y 1536 px). A gate row checks it.
  - In a close-up or punch-in, the other lead is cheated out of the shot when he stands between the lens and the subject. This removes the out-of-focus shoulder/arm blob at the lower right of the cafeteria shots. OTS shots keep their foreground shoulder.

The QA run now shows 0 clips and 0 framing fails over 2,342 frames. All hard gate rows PASS.

## Stills

The contact sheet and key stills come from the PC's MP4 (one still every 2 s; `ffmpeg -i out/storytime/deez-nuts-ep1.mp4 -vf "fps=1/2,scale=270:-1,tile=8x5" docs/storytime/contact_sheet.jpg`). They are not made in this container: the cloud CPU render was stopped.

## Branding ("My Homie Wildin")

- `docs/storytime/branding/pfp.png` (1080x1080) is a tight head-and-shoulders of homie: wild grin, one brow up, a cocky head tilt, readable inside the centre circle, on orange with a yellow radial glow.
- `docs/storytime/branding/pfp_text.png` is the same image with "MY HOMIE **WILDIN**".
- `docs/storytime/branding/banner.png` (2560x1440) shows homie mid-yell (bent, mid-gesture arm) and me face-palming. Their heads and chests sit in the left part of the 1546x423 safe band, and the name sits on the right, inside the band.
- Compositions are `StoryPfp`, `StoryPfpText` and `StoryBanner` in `src/index.storytime.ts`.

## What's left

- The final GPU render of the latest commit on the PC, plus the contact sheet and stills from that MP4.
- The face cull is a hard hide. A sculpted profile face (pieces that wrap around the head) would look better for long profile shots.
- `me`'s colours are set per character. If the PC still shows a skin shift in other sets, compare the average skin colour per set in a still, as the main QA did.

---

## HAND-OFF: low-poly restyle (in progress, stopped mid-way)

The owner rejected the claymation look, and MAIN sent a new low-poly spec. Work stopped part-way when the restyle was handed to the PC (GPU) session. Everything is on `engine/storytime`. `tsc --noEmit` passes for `src/storytime`.

**Nothing below has been rendered or visually checked yet.** The recipe and compiler are still the claymation-era ones, and the low-poly code below has never been rendered.

### Done (code written, typechecks, NOT rendered or visually checked)

- **`src/storytime/poly.ts`** (new) holds the low-poly toolkit. Everything is flat-shaded, matte and one colour per part.
  - Geometry: `polyBox` (single-chamfer box), `polyBall`, `polyIco`, `polyLimb` (6-sided prism hanging from 0 to -len), `polyCone`, `polyTorus`.
  - Materials:
    - `polyMat(c)`: MeshStandard with flatShading;
    - `decalMat(c)`: face decals, with polygon offset;
    - `printMat(tex)`: whiteboard, posters, lockers;
    - `sunMat(k)`: additive warm window-light patches.
- **`src/storytime/face.ts`** (rewritten): `FaceP` vector + `FACES` presets.
  - Expressions now differ only in brows (`browY`/`browA`/`browAsym`), lids (`lid`/`lower`) and `eyeS`.
  - The `open`/`teeth` fields are ignored by the renderer.
  - `drawFace` (canvas) is removed.
- **`src/storytime/cast.tsx`** (rewritten as low-poly):
  - `Kid`:
    - boxy torso, 6-sided limbs with an elbow, `Mitten` hands, chamfered `polyBox` head (`HB` chamfer);
    - outfit variants by `topStyle`: `bomber` (open jacket + `inner` tee, ribbed collar/cuffs/waist in `trim`, zip pull), `tee` (white stripe band) and `hoodie`;
    - `chain` (gold torus) and `cargo` (thigh pockets).
  - `Face`:
    - decals on the head's flat front (`ZF`): solid black octagon eyes clipped by the lids (`octagon`, `clipY`), thick bar brows (`bar`), an extruded wedge nose (`NOSE`) and a static thin mouth bar;
    - hidden past `FACE_CULL` (62°) via `faceAngle()` in compile.ts.
  - `Hair`: `twists` (new; for me: rows of 5-sided cones on a cap) and `curls` (faceted icosahedron mop for homie); also `flattop`, `spiky`, `puff`, `bob` and the default buzz for extras.
  - `Phone`: generic video-app screen drawn on a canvas (`drawScreen`): "VINES 2015 COMPILATION", "Clips", an orange play glyph, no real logos.
- **`src/storytime/types.ts`**:
  - `CamPreset` adds `pov_phone` and `pov_tray`; they are in the schema but **not implemented in compile.ts**.
  - `CastSpec` adds `hairStyle: "twists"`, `topStyle: "bomber"`, `inner`, `chain` and `cargo`.
- **`src/storytime/sets.tsx`** (partly converted):
  - all materials are `polyMat`/`printMat`; walls cream/beige (`WALL`, `WALL2`); ceiling grey (`CEIL`);
  - classroom whiteboard with readable generic text (`chalkboard()` now draws a whiteboard), a corkboard (`corkTex`), a `Bookshelf` and a clock on the back wall;
  - window sun stripes on the back walls (`sunStripes()` + `Patch`, directions `SUN_CLASS` and `SUN_CAF`);
  - after the break, the cafeteria windows show cracked panes (`crackTex`/`crackMat`) and static glass shards on the floor.
- **`public/fonts/BarlowCondensed-Bold.woff2`** is added (OFL; Fontsource 5.1.0) for the condensed captions. It is **not wired up yet**.

### NOT done (the rest of the spec)

1. **compile.ts**:
   - Mouths: make `mouthOf` return 0 and drop the auto `talk` pose. There is no lip-sync; "talking" is the camera on the speaker.
   - Animation: remove `onTwos` (make it identity) and calm `POSE_ARMS.idle`.
   - Camera: remove the shake/punch in `camAt` and the flash in `fxAt`, and remove the punch-in slam intro in `camBase`.
   - POV presets: implement `pov_phone` (camera at me's eye looking toward the homie; a camera-space rig with the phone held by the homie's mitten plus me's hand) and `pov_tray` (camera above me's cafeteria tray, looking down; me's green-sleeve mittens on the tray edges). Hide `me` in POV shots.
   - DOF: blur on close-ups and POV only, focus on the subject. The View in film.tsx takes `blur`/`focus`.
2. **Captions** (compile.ts `CAP`, `buildChunks`; hud.tsx `StoryCaption`):
   - Barlow Condensed Bold, ~96 px (5 % of the height), white, NO outline, a faint drop shadow, centre at 0.62 H.
   - 1-4 words per chunk; accent colour `#FFB020`; shouts ALL CAPS; no pop.
   - `fitFs` uses Poppins widths, so scale by ~0.74 for the condensed face (also in `tools/storytime_build.mjs` `capLines`).
   - Load the font with a FontFace + `delayRender` in hud.tsx.
3. **film.tsx**:
   - Mood: no outline (`post.outline.strength 0`), low contrast, warm low key from the windows (classroom ≈ -`SUN_CLASS`, cafeteria ≈ -`SUN_CAF`), ambient fill.
   - Pass `blur`/`focus` per preset.
   - Remove `Shards`/`CrackOverlay` (fx.tsx) and render the POV rigs.
4. **Delete the claymation files**: `src/storytime/clay.ts` (still used by `fx.tsx` and `branding.tsx` only) and `fx.tsx`.
5. **Episode recipe** `finance/shorts/deez-nuts-ep1/recipe.json`:
   - Rewrite the shot plan from MAIN's spec: ~2.9 s average (0.7-6.5 s), hard cuts, the narrator visible in ~60 % of shots, POV inserts, the 4× "Deez nuts" tightening close-ups, a slow push through "SHUT THE FUCK UUUP", a hard cut to the broken windows, the smug homie, then black.
   - New cast:
     - me: `hairStyle "twists"` (#141414), `topStyle "bomber"` top `#2f5d3a`, inner `#f4f4f0`, trim `#24452c`, khaki pants `#c8b48a`, white shoes;
     - homie: curls `#c4541c`, purple tee `#7b4fd6` with a white stripe, `cargo: true` olive pants `#6b7a3a`, `chain: "#d4a62a"`, red shoes `#d62828`.
   - Remove the shake/flash/punch fx.
6. **QA gates** (`tools/storytime_build.mjs`):
   - shot length becomes 0.7-6.5 s with a ~2.9 s average;
   - "mouths never move";
   - narrator visible in ~60 % of shots;
   - captions 1-4 words;
   - drop the shout punch/shake row.
7. **Branding** (`branding.tsx`): redo the pfp (tight homie, smug, one brow up) and the banner in low-poly. It still imports clay-era faces and props.
8. **KIT_STORYTIME.md**: replace section 0 (claymation) with the low-poly spec.

### How to run

`node tools/recipe_build.mjs deez-nuts-ep1`, then `npx remotion render src/index.storytime.ts DeezNutsEp1Recipe out/storytime/deez-nuts-ep1.mp4 --gl=angle --crf=20`.

For stills: `node tools/storytime_stills.mjs DeezNutsEp1Recipe 11s 27s --scale 0.5`.
