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
