STATE: stills v2 ready for review (motion test not rendered yet)

# The Pig War, blocky style test: status

Style test of `justinclips/shorts/pig-war`. Same script, `lines.json`, D2 voice (`project/input/voiceover.wav`),
shot plan, beats, tone guard and loop. Only the look changes. `pig-war/` itself is untouched.

## v2 (current): the owner-supplied blocky-shorts skill
Direction change from MAIN (the owner rejected v1): built on `skills/blocky-shorts` from branch `skill/blocky-shorts`
(commit 7626445, MIT, reviewed by MAIN). The skill's `template/` was copied to `blocky/`, its `scripts/` to
`blocky/scripts/`. Remotion + three.js / React Three Fiber.

- **Characters** (`blocky/src/blocky/Blocky.tsx`, extended; looks in `blocky/src/pigwar/cast.ts`): the skill's rigid
  blocky family. Rounded-cube head, wide block torso, separate block arms and legs that swing rigidly, a flat decal
  face (eyes with catch-lights, brows, mouth) that changes with emotion, shiny toy-plastic materials. I added our own
  accessories, uniform parts and two expressions (`angry`, `flat`):
  - Redcoat: red coat, white cross belts, a tall black block fur hat.
  - Bluecoat: blue coat, gold buttons, a forward-tilted cap with a visor.
  - Farmer: green shirt, suspenders, beard, a wide straw hat.
  - Pig (`pigwar/pig.tsx`): pink block pig, decal face, block snout, curly tail of little cubes.
  - Company man: plum-grey coat, mutton chops, top hat.
  - Extras: varied skin tones, hair and moustaches.
- **World** (`pigwar/world.tsx`), all blocks: island ground (the skill's grass texture), beach, shiny sea with drifting
  foam, block pines and oaks, log cabin, potato patch, block warships (sails broadside), flags made of rippling
  strips, rocks, tufts, cannons, tents, a rowboat and gulls. The skill's contact blobs give soft ground shadows.
- **Light** (`pigwar/mood.ts`, on the skill's rig: key from the lens's front-left, complementary fill, strong rim
  from behind, bloom, vignette). Three moods:
  - sunny island (s01-s08)
  - tense standoff (s09-s13b): steel sky, hot orange rim, haze
  - golden ending (s14)
- **Edit and captions** (`pigwar/PigWar.tsx`): shot times come from the pig-war voice timings
  (`pigwar/data/shots.json`, `words.json`, copied from `project/`). Every shot pushes in. Captions use the skill's
  `PopCaptions`: Poppins ExtraBold, white, thin dark outline, pop-in with overshoot, at most 2 lines, centred at 68 %,
  12 % side margins. Frame 1 shows the top caption "San Juan Island, 1859: / a 12-year standoff" and the first caption
  fully.
- **Staged so far:** s01 (hook), s02 (pig close), s05 (farmer close), s09 (opens on a redcoat close, pulls back to the
  arrest), s11 (opens on a bluecoat close, pulls back to the camp; 461 TROOPS counter), s13 (wide standoff +
  tumble-weed; SHOTS FIRED: 0).
- **Stand-ins:** the other shots render a stand-in set (corridor, garden or camp) until the motion pass. s06 (the
  cut-away to the birds) is NOT staged yet: when built it must stay a cut-away with no pig (tone guard).

### Stills (`stills/`, 1080x1920 PNG + `sheet.png`)
| file | frame |
|---|---|
| 01_frame1_hook.png | 0 (0.00 s) |
| 02_pig_closeup.png | 78 (2.60 s) |
| 03_farmer_closeup.png | 273 (9.10 s) |
| 04_redcoat_closeup.png | 415 (13.83 s) |
| 05_bluecoat_closeup.png | 537 (17.90 s) |
| 06_standoff_wide.png | 688 (22.93 s) |

v1 stills (my own first look, rejected by the owner) are kept in `stills_v1/`.

### Self-critique pass (done before pushing)
Fixed:
- Close-ups were too tight: the fur hat and straw hat were cropped.
- The potato hid the pig's snout.
- The farmer's beard blended into his skin.
- The straw-hat brim cast a shadow that turned the farmer's face grey (the brim no longer casts a shadow).
- The farmer's raised arm swung toward the lens and pushed the rifle out of frame.
- The rifle barrel went through his arm.
- The company man was cut off at the frame edge.
- The wide standoff showed mostly ground (now a longer lens).

Still open:
- Frame 1: the first caption ("america") sits over the pig's head.
- 06: the tumble-weed close to the lens reads as a dark clump.
- 05: a tan block shows low on the hero bluecoat's chest (his hand/belt area at that angle); check in motion.
- The rifle still slightly overlaps the farmer's sleeve.
- The skill's style.md also asks for numeric framing/motion checks (`tools/framing_check.ts` pattern). Not written yet.

## Re-render the stills
From `blocky/` (Node 18+, ffmpeg, Python 3 with numpy):

    npm ci
    GL=swiftshader BROWSER=/opt/pw-browsers/chromium COMP=PigWar SCALE=1 bash tools/stills.sh <new-tag> 0 78 273 415 537 688

Or render one PNG directly:

    npx remotion still build PigWar out.png --frame=0 --gl=swiftshader --browser-executable=/opt/pw-browsers/chromium

- `tools/stills.sh` and `render.sh` now read `GL` (default `angle`) and `BROWSER` (optional `--browser-executable`),
  so they run without a GPU. On a GPU machine leave both unset.
- `BROWSER` points Remotion at the container's pre-installed headless Chromium, so Remotion never downloads its own.

**SwiftShader speed (no GPU here):** about 14 s per still at 0.4 scale and about 15 s per full-res still. A 12 s
motion test with the skill's 4-sub-frame motion blur is 1,440 frames, so expect roughly 1-2 hours on 4 CPUs (estimate,
not measured). Rendering without sub-frames is about 4x faster.

## Next (after review)
Stage s07-s12 for real and render the 12 s motion test (10.4-22.4 s, the busiest stretch) with
`render.sh <N> PigWarSub 312-671`. Then mux the D2 voice and the toon3d:upbeat bed + SFX at -14 LUFS.
`motion_test.py` is the v1 (toon3d-kit) muxing script. Reuse its audio half: `audio/mix.py` on the whole Short, a
measured pass to -14 LUFS, then the range cut.

## v1 (rejected): my own box-built look on the toon3d kit
`project/scenes/_blocky.js`, `_ui.js`, `pig.js`, `kit.js`. Stills are in `stills_v1/`. The v1 motion test was stopped
when the direction changed and was never finished, so there is no `motion_test.mp4` and no sha256 yet.

## Licences
- The skill: MIT (`blocky/LICENSE`, `THIRD_PARTY_NOTICES.md`).
- Poppins: OFL.
- Remotion is NOT open source. It is free for individuals and companies with up to 3 employees; larger companies need a
  Remotion Company License (see the skill's SKILL.md).
- No game's names, logos, avatars, textures or meshes are used. There are no studs and no yellow-head/blue-torso/green-legs scheme.

Not posted or uploaded anywhere.
