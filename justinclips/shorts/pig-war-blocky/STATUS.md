STATE: stills v2 (with MAIN's review fixes) + 12 s motion test ready for review

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
- **Review fixes (MAIN, on 16ff1ec):** captions keep the script's casing ("America", "Britain"; Whisper had
  lowercased them); word captions are hidden while the hook caption is up (0-3.4 s); the dark tumble-weed in s13 is now a
  plainly green leafy bush with a yellow flower; no half faces at the frame edges: a numeric edge check (soldier faces
  projected through each shot's lens over the whole shot) set per shot which front rows are left out and how wide the
  corridor is (s01 and s13b: front two rows out; s13: front two rows out, corridor 0.62 m; s02: the pig close-up shows only
  the bay, flags and ships behind the pig, no soldiers).
- **Staged so far:** s01 (hook), s02 (pig close), s05 (farmer close), s07 (coin offer, $10), s08 (hand up for $100,
  farmer shocked), s09 (opens on a redcoat close, pulls back to the
  arrest), s11 (opens on a bluecoat close, pulls back to the camp; 461 TROOPS counter), s10 (bluecoats march up
  from the rowboats, the front man raises the flag on "soldiers"; U.S. ARMY LANDS), s12 (five warships past two worried
  bluecoats; × 5 WARSHIPS, 2,000+ men aboard), s13 (wide standoff + rolling bush; SHOTS FIRED: 0).
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

**SwiftShader speed (no GPU here):** about 14 s per still at 0.4 scale and about 15 s per full-res still; the 12 s
motion test (1,440 sub-frames) took ~40 min. A full 27 s Short would take ~1.5 h.

## Motion test: `motion_test.mp4`
- 12.000 s, 360 frames, 1080x1920, 30 fps, H.264 + AAC 192k. Output frames 313-672 of PigWar = 10.433-22.433 s:
  s07 $10, s08 $100, s09 ARREST HIM, s10 the landing, s11 461 TROOPS, s12 five warships (+4 frames of s13).
- Rendered with the skill's pipeline: `render.sh` (typecheck, bundle, PigWarSub at 4 sub-frames per frame, tmix motion
  blur, flicker + pacing QA). Log/QA: `blocky/out/renders/` (not committed); contact sheet: `motion_test_contact_sheet.jpg`.
  QA: 6 hard cuts, 2.5 % still frames, 6 flicker spikes (frames 117-120 = the s09 pull-back from the redcoat close-up,
  the fastest camera move; 60-66 = the $100 hand fling).
- Audio: the real D2 voice (`project/input/voiceover.wav`) + the toon3d:upbeat bed already used in pig-war + the SFX cues
  from lines.json, mixed for the whole Short with the kit's `audio/mix.py`, then build_short's measured pass to
  -14.02 LUFS / TP -1.32 dBTP, then the same range cut sample-exact with 15 ms edge fades. The clip itself measures
  -13.81 LUFS, TP -1.40 dBTP.
- **sha256 `aea095d47e5c5ae1ab09b4f32137c14af1ab8d49528476e04109d27a18a2a97c`** (also in `motion_test.sha256`).
- Render time on SwiftShader (4 CPUs, CONC=4): 2,375 s (~40 min) for 1,440 sub-frames.

### Re-render the motion test
    cd blocky && NAME=motion_v CONC=4 GL=swiftshader BROWSER=/opt/pw-browsers/chromium bash render.sh <N> PigWarSub 313-672
    # audio: in a toon3d-fx kit checkout with projects/pig-war-blocky -> this project/ folder
    python audio/mix.py --project projects/pig-war-blocky          # writes project/build/mix.wav
    # then build_short.py's measured -14 LUFS pass (loud() + volume/alimiter) -> project/build/master.wav, and
    ffmpeg -i blocky/out/renders/motion_v<N>.mp4 -ss 10.43333 -t 12 -i project/build/master.wav -map 0:v -map 1:a \
      -af "afade=t=in:d=0.015,afade=t=out:st=11.985:d=0.015" -c:v copy -c:a aac -b:a 192k -movflags +faststart motion_test.mp4
(`motion_test.py` is the v1 toon3d-kit version of the same steps.)

## Known issues in the motion test
- s09: the pull-back from the redcoat close-up to the arrest wide is fast (flicker spikes); ease it over more frames.
- s07/s08: the farmer's offering arm comes close to the company man's arm; at the s08 fling both arms overlap briefly.
- s10: the raised flag sits high in frame; a slightly lower lens would show more of it.
- s12: the two foreground bluecoats are backs/heads at the bottom edge (over-the-shoulder, faces not shown).

## Next
Stage the remaining shots (s03, s03b, s04, s06 cut-away with gulls and no pig, s13b, s14 golden angel pig), then a full
render. Not started.

## v1 (rejected): my own box-built look on the toon3d kit
`project/scenes/_blocky.js`, `_ui.js`, `pig.js`, `kit.js`. Stills are in `stills_v1/`. The v1 motion test was stopped
when the direction changed and never finished; `motion_test.mp4` is the v2 one.

## Licences
- The skill: MIT (`blocky/LICENSE`, `THIRD_PARTY_NOTICES.md`).
- Poppins: OFL.
- Remotion is NOT open source. It is free for individuals and companies with up to 3 employees; larger companies need a
  Remotion Company License (see the skill's SKILL.md).
- No game's names, logos, avatars, textures or meshes are used. There are no studs and no yellow-head/blue-torso/green-legs scheme.

Not posted or uploaded anywhere.
