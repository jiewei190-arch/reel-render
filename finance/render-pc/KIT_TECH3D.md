# KIT_TECH3D: the "Tech explained" style kit

**What this is.** A recipe kit for the channel "Tech explained": how technology and engineering really work. The look is bright, low-poly 3D cutaways on a light background. An object splits open, its parts fly out, and labels pop in **one at a time**. The mascot is **BOLT**, a small round robot with a screen for a face. Every frame moves.

- **Write a Short** as `finance/shorts/<slug>/recipe.json` with `"kit": "tech3d"`, plus `script.txt` and `vo/timings.json`.
- **Build** it with `node tools/recipe_build.mjs <slug>`. A tech3d recipe is handed to `tools/tech_build.mjs`, which has its own compiler, registry and entry.
- **Block Money is never touched.** Block Money recipes (no `kit` field) compile exactly as before.
- **Reference recipe:** `finance/shorts/tech-demo-planes-land-blind/`. It is 34 s long and passes every check.

```
finance/shorts/<slug>/recipe.json ("kit": "tech3d") + vo/timings.json
        │  node tools/recipe_build.mjs <slug>          (or node tools/tech_build.mjs <slug>)
        ▼
src/tech/gen/<slug_>.tech.gen.ts  →  <Pascal>Recipe and <Pascal>RecipeSub in src/index.tech.ts
        + clip QA + frame-0 gate + kit rules → finance/shorts/<slug>/RECIPE_QA.md   (exit 1 on a CLIP or a FAIL)
```

## 1. Workflow

1. **Write `script.txt`.** Put one spoken line on each line. A Short runs 30-55 s, which is about 85-150 words at 2.8 words/s.
   - Line 1 is the question.
   - The last line leads back into line 1, so the Short loops.
2. **Make timings.**
   - To draft without a voice, run `python tools/make_timings.py script.txt vo/timings.json` from the short's folder (use the path to `finance/render-pc/tools/`).
   - Swap in the real Whisper or ElevenLabs timings later. Shots anchor to words, so nothing else changes.
3. **Write `recipe.json`.** Start from the reference recipe (section 9).
4. **Check without writing anything:** `node tools/recipe_build.mjs <slug> --check`. Fix every `CLIP`, every `FAIL` and every `COMPILE ERROR`. Each message names the bad word, target, part or anchor, and lists the valid ones.
5. **Build:** `node tools/recipe_build.mjs <slug>`. This writes:
   - `src/tech/gen/<slug_>.tech.gen.ts`;
   - `src/tech/registry.gen.ts`;
   - `out/tmp/<slug>.cues.json`, the audio plan for `tools/story_mix.py`;
   - `RECIPE_QA.md`.
6. **Stills.**
   - `node tools/tech_stills.mjs <Pascal>Recipe 0 1s 3s mid end --scale 0.5` bundles once and renders the listed frames into `out/tech/stills/`.
   - The GL backend is swangle (CPU) by default. On the PC, set `GL=angle`.
   - For a single still: `npx remotion still src/index.tech.ts <Pascal>Recipe out.jpg --frame=N --gl=swangle`.
7. **Render.**
   - Preview: `npx remotion render src/index.tech.ts <Pascal>Recipe out.mp4 --gl=swangle --scale=0.5`.
   - Final: run the existing `render.sh` flow on `<Pascal>RecipeSub`, which has 4 sub-frames for motion blur, pointed at `src/index.tech.ts`.
8. **Audio:** `STORY_CUES=out/tmp/<slug>.cues.json python tools/story_mix.py <Pascal>Recipe voice.wav <audio_dir> premix.wav`, then `tools/mux_voice.sh`.

## 2. Palette and look (src/tech/palette.ts)

| token | hex | use |
|---|---|---|
| `bg` | `#F5F7FA` | background, studio |
| `blue` | `#2F80ED` | electric blue: primary accents, card stripes, the hook underline |
| `mint` | `#3DDC97` | BOLT's face glyphs, the thruster, "good/on" signals, the localizer beam |
| `orange` | `#FF8A3D` | the ONE hook word, the active caption word, highlights, callout dots, the glideslope beam |
| `navy` | `#14213D` | all text on cards and the caption words |

**Light.** Three light moods are tuned bright, soft and low-contrast, with thin navy ink outlines: `studio`, `blueprint` and `sky`. There is also `skyFog` (shot `"mood": "fog"`).

**Text.**
- Poppins 800 everywhere.
- Text is always DOM overlay, never 3D text, so it stays crisp at phone size.

## 3. Cast: BOLT (src/tech/bolt.tsx)

`"cast": { "bolt": "BOLT" }`. BOLT is the only mascot, and the cast id can be anything.

**Design.**
- A faceted white shell about 0.6 m across.
- **One screen face** in mint on navy.
- A blue bezel, orange side ears, and an orange-tipped antenna that wobbles.
- Two stubby arms with round mitts.
- A mint band and a hover thruster.

**Movement.** BOLT **hovers and never walks**: it bobs, drifts and blinks all the time. `at` is the point *under* BOLT, and the shell floats `hover` m above it (default 1.05). In the sky set, give `at` a height, for example `[1.5, 2.6, 57]`.

**Facing.** BOLT turns to face the camera unless `look` is set.

| pose | what it does | default face |
|---|---|---|
| `idle` | hover-bob, arms swinging gently, slow turn | happy |
| `point` | right arm aims at `pointAt` (default: the shot's camera target, or the lens if the camera is on BOLT) | excited |
| `shrug` | both arms up and out, a little hop, head tilt | thinking |
| `celebrate` | a full spin, both arms pumping, hopping | excited |
| `shock` | recoils back and up, arms flung, trembles, squash on the hit | shocked |
| `explain` | both hands moving in turn, body swaying (talking) | happy |
| `peek` | dips down and leans out sideways, one hand on an edge (place BOLT beside an object) | curious |

| face | screen |
|---|---|
| `curious` | one big eye, a raised brow, a small "o" |
| `shocked` | huge ring eyes, raised brows, an O mouth |
| `happy` | ^ ^ eyes, a smile |
| `thinking` | a squint, a flat mouth, three dots filling one by one |
| `worried` | slanted brows, a wavy mouth, a sweat drop |
| `excited` | spinning star eyes, an open grin |

**Pose changes** blend with anticipation and overshoot over 0.34 s. Each change starts 2 frames before its word.

**Face changes** hide behind a blink.

**Talking.** With `"talk": "auto"` (the default), BOLT's screen mouth lip-syncs the voice when the camera targets BOLT. Set `"talk": true/false` on an actor, or `"talk": "none"` on the recipe, to override this.

**Actor fields:**
```jsonc
{ "id": "bolt", "pose": "point", "face": "excited", "at": [4.0, 0.6, -12.5],
  "then": [{ "at": "right", "pose": "celebrate", "face": "excited" }, { "at": "ask", "face": "curious" }],
  "pointAt": "gs:0,4,0", "look": 30, "to": "right", "scale": 1, "hover": 1.05, "from": "word" }
```
- `then` lets you change only the face (no `pose`) or the pose.
- `to` glides BOLT to a new place over the shot.

## 4. Sets (src/tech/sets.tsx)

Every set keeps moving: shapes drift, the grid scans, clouds and the approach-light strobe run, and lamps twinkle.

| set | look | anchors |
|---|---|---|
| `studio` | light cyclorama (the floor curves up into the back wall), a soft blue disc stage with a turning ring, floating pastel low-poly shapes, soft shadow | `centre`, `stage`, `left`, `right`, `back`, `front`, `high` |
| `blueprint` | blue grid floor with a sweeping scan line, drifting dimension crosses, deep blue | same as studio |
| `sky` | low-poly sky dome, drifting clouds, grass, hills, trees; a runway (x -4..4, threshold at z 0, far end z -128) with piano keys, centreline, touchdown and aiming-point marks, twinkling edge lights, sequenced approach lights at z +6..+42; the **localizer array** past the far end; the **glideslope mast** beside the touchdown zone | `threshold [0,0,0]`, `touchdown [0,0,-14]`, `rollout`, `farEnd`, `loc [0,0,-134]`, `gs [7,0,-16]`, `approach`, `final`, `short`, `left`, `right`, `side`, `high`, `centre` |

- **Fog.** `"mood": "fog"` on a sky shot gives thick grey fog: the runway fades out within about 20 m, and the sky dome turns grey.
- **Anchors.** An anchor takes an offset: `"gs:0,2.6,0"`.
- **Set blockers.** The sky set's `gsMast` and `locArray` are QA boxes. BOLT may not enter them.

## 5. Cutaway objects (src/tech/cutaway.tsx, src/tech/objects.ts)

An object is a list of low-poly parts. Every part has:
- an `id`;
- an explode vector (the direction it flies out on `explode`);
- a role: `shell` parts are cut by the slice plane; `inner` parts stay whole and are what the cut reveals;
- an optional default label.

| `obj` | orientation | parts (default label) |
|---|---|---|
| `airplane` | nose toward +x, wings along z, wheels on y 0; about 6.2 m long, 5.2 m span | `fuselage`, `stripe`, `nose` (RADOME), `windows`, `tailcone`, `ilsAntenna` (ILS ANTENNA), `ilsReceiver` (RADIO RECEIVER), `autopilot` (AUTOPILOT), `cabinFloor`, `seats1`..`seats5`, `wingR`/`wingL` (WING), `tipR`/`tipL`, `engineR`/`engineL` (ENGINE), `intakeR`/`intakeL`, `vstab` (TAIL FIN), `hstabR`/`hstabL`, `noseGear`, `noseWheel`, `gearR` (LANDING GEAR), `gearL`, `wheelR`, `wheelL`. Default slice: z, keeps the back half |
| `smartphone` | screen toward +z, standing on y 0; 0.8 x 1.62 m | `glass` (GLASS), `screen` (SCREEN), `frameL/R/T/B`, `band1` (ANTENNA), `band2`, `board` (LOGIC BOARD), `chip` (PROCESSOR), `chip2` (MEMORY), `battery` (BATTERY), `batteryTab`, `camera` (CAMERA), `camera2`, `lensRing`, `speaker` (SPEAKER), `back` (BACK GLASS). Layers explode along z. Default slice: x |
| `ship` | bow toward +x, keel on y 0; about 5.5 m long | `hullLow` (HULL), `hullTop`, `deck`, `ballastL` (BALLAST TANK), `ballastR`, `hold` (CARGO HOLD), `engine` (ENGINE), `shaft`, `propeller` (PROPELLER), `rudder`, `bridge` (BRIDGE), `bridgeWin`, `funnel`, containers `box00`..`box41` (`box21` = CONTAINERS). Default slice: z |

**Using an object in a shot:** `{ "id": "cut", "obj": "airplane", "at": "centre", "yaw": 0, "s": 1 }`.
- `id` is how actions, cameras and labels refer to it.
- `"cut.ilsAntenna"` is a part target.
- **The cutaway state belongs to the prop id across the whole Short.** Re-declare the same `id` in the next shot and it stays exploded or sliced.

**To add an object:** write an `ObjDef` in `src/tech/objects.ts` with parts from these primitives:
- `box`, `cyl`, `sphere`, `ico`, `cone`, `torus`;
- `prism`, a polygon extruded along z. Rotate it with `r: [-PI/2, 0, 0]` to lie flat.

Then add the object to `OBJECTS`. Give it no brand marks.

## 6. Actions (anchored to voice words)

```jsonc
"actions": [
  { "do": "explode",   "on": "cut", "at": "nose", "dur": 0.8, "amount": 1, "stagger": 0.035, "parts": ["nose", "ilsAntenna"] },
  { "do": "assemble",  "on": "cut", "at": "back", "dur": 0.75 },
  { "do": "slice",     "on": "cut", "at": "inside", "dur": 0.7, "axis": "z", "keep": "neg", "stop": 0.02 },
  { "do": "unslice",   "on": "cut", "at": "closed" },
  { "do": "highlight", "on": "cut.ilsAntenna", "at": "catch", "until": "beams" },
  { "do": "label",     "on": "cut.ilsAntenna", "text": "ILS ANTENNA", "at": "catch", "until": "down", "side": "auto" }
]
```

| action | what it does |
|---|---|
| `explode` | Parts fly out along their own axes, staggered, with overshoot and a little spin in flight. `amount` is 0-1 (0.75 is a partial explode). `parts` limits it to those parts. A camera kick and whoosh + boom SFX come with it. |
| `assemble` | Flies the parts back to 0. |
| `slice` | A cutaway plane sweeps in along `axis`. `keep` is the side that stays; `stop` is where the plane stops, as -1..1 of the half extent. Shell parts are clipped (you see their insides), inner parts stay whole, and a translucent blue section sheet with an orange frame flashes at the cut, then fades. |
| `unslice` | Sweeps the plane back out. |
| `highlight` | An orange glow shell plus an emissive pulse and a small scale pulse on one part, until `until` (default: the end of the shot). |
| `label` | A callout line draws from the part to a white card (blue stripe, navy text), then the card pops in. |

**Label rules:**
- The text is **≤ 3 words**; the compile errors on more. With no `text`, the part's default label is used.
- `on` may be a part, a prop, an anchor (`"gs:0,4,0"`) or a point.
- Cards are placed automatically and never cover BOLT's screen, the hook, the caption band or the part itself. `side` is `left`, `right` or `auto`.

**One at a time.** Labels in a shot must start ≥ 0.3 s apart; the gate FAILs otherwise. Put each on its own word.

## 7. Kit props, motions and fx

| `kit` | what it is |
|---|---|
| `locBeam` | the localizer: a narrow mint horizontal fan from `at` toward +z (yaw to turn it), a bright centre line, pulses running out. Put it `at: "loc"`. |
| `gsBeam` | the glideslope: an orange sheet rising from `at` toward +z at `deg` (default **3°**, the real standard), with pulses. Put it `at: "touchdown"`. |
| `signal` | expanding radio rings (`color`, `s`) |
| `block` | a plain box (`size`, `color`), e.g. a crate for BOLT to `peek` from |

| `motion` | what it does |
|---|---|
| `turntable` | slow yaw spin (`spin` deg/s, default 12) |
| `bob` | gentle float |
| `popIn` | scales in with overshoot, landing on `hit` (use it to "fire" a beam) |
| `dropIn` | falls and lands on `hit`, with a kick and impact |
| `path` | keyframes `[[At, Place], ...]`, linear per leg. The object heads along the path (front = +x), holds a nose-up approach attitude, flares in the last 0.5 s before a leg that ends on the ground, and rolls level on the runway. |

**Multi-shot props.** Recipe-level `props` with `from`/`until` live across shots. `sets: ["sky"]` limits one to shots in those sets. The demo's `jet` flies one continuous 3° glide path across every sky shot.

| `fx` | what it does |
|---|---|
| `shake` | a camera kick at `at` (`gain`) |
| `flash` | a white flash |
| `sparks` | mint/orange/white sparks burst from `p` (a target) |

## 8. Cameras (TECH_CAMS in src/tech/compile.ts)

All cameras keep moving. The gate FAILs a Short that has even one frame with a still camera.

**Fields:** `target` is `"bolt"`, `"bolt.face"`, a prop, `"<prop>.<part>"`, an anchor (plus offset) or `[x, y, z]`. The other fields are:
- `az`: azimuth in degrees; 0 = from +z, 90 = from +x;
- `dist`, `h`, `fov`;
- `face`: where the target sits, as a fraction from the top;
- `hit`;
- `sweep`;
- `endDist`, `dur`;
- `blur`.

The lens follows a moving target (a flying plane).

| preset | default dist / h / fov | move |
|---|---|---|
| `hookZoom` | 2.0 / 0.15 / 44 | frame 0: from 1.3x out into a close-up in 0.4 s, a landing kick, then a creep |
| `slamZoom` | 2.6 / 0.25 / 44 | fov slams from 60 at `hit`, with a pull-back first, then a creep; impact SFX |
| `whip` | 3.0 / 0.35 / 48 | look swings 35° onto the target in 0.22 s, roll 4° to 0; whoosh |
| `pushIn` | 3.0 / 0.4 / 44 | push 0.3 %/f with a punch window |
| `orbit` | 4.0 / 0.9 / 44 | orbits `sweep` degrees (default 44) over the shot |
| `closeUp` | 1.5 / 0.1 / 40 | slow push |
| `medium` | 3.2 / 0.4 / 46 | slow push |
| `wide` | 8.0 / 2.2 / 50 | slow push (not allowed in the first 1 s) |
| `flyThrough` | 6.0 / 1.0 / 46 | **NEW**: travels from `dist` into the cutaway to `endDist` (default 0.9 m) over `dur` (default the shot), swinging 18° and dropping to the part's height, fov opening +16°. Aim it at a part (`"cut.autopilot"`), ideally after a slice or explode. |
| `explodeOrbit` | 6.5 / 2.0 / 44 | **NEW**: orbits `sweep` degrees (default 80) while the object explodes; the distance grows with the explode amount, so the flying parts stay in frame. Target the prop. |

**Transitions (`"in"`):**
- `punch` (default): fov +7° snapping in plus a small kick.
- `whip`: a 32° swing with a whoosh.
- `cut`.
- slamZoom, whip and flyThrough shots come in as cuts.

**Framing vertical 9:16:**
- A 6 m plane needs `dist` 10-12 with `az` 50-60 (a 3/4 front view).
- The phone needs `dist` 4-5.
- The ship needs `dist` 9-10 with `az` 50.
- On BOLT, `hookZoom`/`closeUp` at `dist` 1.4-1.9 fills the frame.

## 9. Text

**Hook** (`hook.text`):
- At the top, on a white card with a blue underline, from frame 0.
- **≤ 5 words, ≤ 2 lines** (auto-balanced, or split it with `\n`).
- **Exactly one `*word*`**, which shows in orange and wiggles.
- `until` defaults to the end of line 1 + 0.25 s.
- `again` brings it back for the loop ending.

**Captions:**
- Bottom-centre word captions, the same fixed band as Block Money: centre y 1344, 170 px side margins, nothing below y 1500.
- 1-3 words per chunk, navy with a thick white stroke (readable on the light sets and the blue blueprint); the spoken word is orange.
- They start at 1.0 s.
- `"caption": "off"` or a fixed string per shot overrides them.

**Boards:** `"boards": [{ "title": "GLIDE PATH", "at": "three", "count": { "from": 0, "to": 3, "dur": 0.6, "suffix": "°" }, "pos": "right" }]`.
- A number board with a blue title strip and a big navy number. It counts up; non-digits show in orange.
- `value` gives fixed text instead of a count.
- `pos` is `left`, `right` or `top`. Boards sit below the hook and above the caption band.

**Hook-safe.** The hook card covers about y 236-500. On frame-0 and loop close-ups, frame BOLT with `face` ≈ 0.47 and `dist` ≈ 2.0, so the screen sits below the card and above the captions.

**Caption-safe.** Keep BOLT's screen face out of y 1239-1449. Frame BOLT with the face at 0.42-0.5 of the height (the presets do this). The gate measures it.

## 10. The build checks (tools/tech_build.mjs → RECIPE_QA.md)

**Framing rules (screen space, every output frame; tools/framing_qa.mjs + tools/framing_kits.mjs; same rules as RECIPE_GUIDE.md §4.1).**
Run `node tools/recipe_build.mjs <slug> --check` until the "framing QA" line shows 0 clips and 0 fails. Every message
names the shot, the time, the card / prop / person and what to move where.
- **R1 CLIP, nothing on a head.** No card, board, label, story device, 3D text prop or small prop may overlap a head on
  screen. The head includes BOLT's round shell, ears and antenna (the antenna tip is 0.48 m above the body centre at scale 1). Text counts at any depth; a small prop counts within 0.6 m of the head. Big staging
  objects (half-size > 0.75 m) are skipped.
- **R2 FAIL, the subject in frame.** The subject is the camera's target person, else the shot's `"subject"`, else its only
  person while their head is on screen. In a medium or wide shot, 85 % of the subject's body (left to right) is in
  frame. In a close shot, the head is centred (middle 60 % of the width). The head never touches an edge (11 px). Any
  other person's head is fully in or fully out. The first 0.35 s of a whip-in is skipped.
- **R3 FAIL, cards and boards inside the frame** with a 3 % margin (32 px), once landed (0.3 s after the hit).
- **R4 FAIL, text reads.** Every text colour is at least 4.5:1 against its fill (WCAG). Board titles are white on blueDeep `#1C5BBF` (6.4:1) and value symbols deep orange `#B5521A` (5.0:1); they were 3.9:1 and 2.3:1 before. A featured line is at least
  42 px font size (the median while on screen). Long-form uses the same 42 px at 1080 tall; its cards are checked for
  placement and colour only.
- **R5 FAIL (Shorts), frame 0 is a close-up of a face.** The hook is at the kit's full size, and the subject's face is
  at least 16 % of the frame height (307 px). A frame-0 shot on a prop with the person small fails.
- **R6 FAIL, no caption on a face or neck.** While a word caption is on screen, its real line boxes (the chunk's words in the bottom band; long-form: the lower third) must not overlap a character's head, face or neck / collar. Here BOLT has no neck: only the shell, ears, antenna and a short chin under the bezel (0.2 x the face height) count. A very close BOLT (dist under ~1.5 m) puts the face itself on the band: pull back or lower `face`. Characters under 15 % of the frame height and grazes under 3 frames / 20 x 20 px are ignored. The message gives `cam.face a -> b`, `cam.dist xN` or a sideways move for the actor.
- Typical fixes: aim the camera at the person, move them toward the centre, pull back (`cam.dist`); put a card's target
  (`on`) or `pos` on the side away from the face; raise `cam.dist` on close shots so the antenna stays in frame.

**Clip QA** runs on every frame × 4 sub-frames and checks:
- every cutaway part (exploded positions included), kit block and set blocker against BOLT's shell and both mitts;
- BOLT below the ground;
- grounded objects below the floor;
- BOLT against BOLT.

**Gate** (hard = FAIL):
- frame 0 has a subject ≥ 50 % of the frame height;
- the hook is ≤ 5 words, ≤ 2 lines, fits, and has exactly one orange word;
- BOLT is ≥ 15 % and an object is in view at frame 0;
- a question or number is on screen by 0.5 s;
- the first word comes by 0.2 s;
- there is an impact at 0.00 s;
- there are ≥ 2 cuts or hits in the first 3 s;
- music plus an SFX play at frame 0;
- BOLT's face changes by 1.5 s;
- there is no wide shot in the first 1 s;
- the first cut comes ≤ 1.25 s;
- BOLT's face is clear of the caption band ≥ 90 % of caption time;
- labels are ≤ 3 words and start ≥ 0.3 s apart;
- no label or board sits over BOLT's face, and the hook card never covers it;
- no label card overlaps a board (cards are placed around boards; end labels with `until` before a board appears in the same place);
- labels sit above the caption band;
- **the camera moves on every frame**.

**Warn:**
- loop ending: the hook comes back and the last shot targets the first shot's subject;
- length: short 30-55 s, long 300-480 s.

## 11. Example: the reference Short

`finance/shorts/tech-demo-planes-land-blind/recipe.json` runs 34.2 s in 14 shots. Its facts are in `sources.md`.

| shot (word) | set / mood | camera | what happens |
|---|---|---|---|
| 0 | sky / fog | hookZoom on bolt | BOLT shrugs in the fog, the jet right behind it; hook "HOW PLANES LAND *BLIND*"; face curious → worried |
| "land" | fog | slamZoom on jet | the jet in fog, side on |
| "see" | fog | closeUp on bolt | shock |
| line 2 | fog | orbit on jet | the runway is invisible |
| "runway" | clear (whip in) | orbit over the runway | BOLT points at the touchdown zone |
| "antenna" | sky | pushIn on loc | the localizer beam pops in on "beam"; label ANTENNA ARRAY |
| "down" | sky (whip) | orbit from behind the array | the beam runs down the centreline; label LOCALIZER |
| line 4 | sky | medium on gs | BOLT points at the mast; the 3° glideslope pops in |
| "three" | sky | pushIn side-on | the jet on the glide path; board GLIDE PATH 0→3°; label GLIDESLOPE |
| line 5 | blueprint | medium on bolt | BOLT explains; SIGNAL A, then SIGNAL B; board ON THE PATH "A = B"; celebrate |
| line 6 | studio | explodeOrbit | the airplane explodes on "nose"; ILS ANTENNA highlighted and labelled on "catch" |
| "autopilot" | studio | flyThrough to cut.autopilot | AUTOPILOT highlighted and labelled |
| line 7 | sky / fog | medium side-on | autoland: flare and touchdown on "land" |
| "so" | sky / fog | hookZoom on bolt | loop: BOLT shrugs, then points; the hook returns on "ask" |

**Minimal skeleton** (a studio cutaway Short):
```json
{
  "kit": "tech3d", "slug": "whats-inside-a-phone", "format": "short",
  "hook": { "text": "WHAT'S *INSIDE* A PHONE", "again": "6:look" },
  "cast": { "bolt": "BOLT" },
  "shots": [
    { "at": 0, "set": "studio", "cam": { "preset": "hookZoom", "target": "bolt", "dist": 1.5 },
      "actors": [{ "id": "bolt", "pose": "peek", "face": "curious", "at": [-0.9, 0, 0.6], "then": [{ "at": "inside", "face": "excited" }] }],
      "props": [{ "id": "ph", "obj": "smartphone", "at": [0.3, 0, -0.4], "yaw": -25 }] },
    { "at": "phone", "cam": { "preset": "explodeOrbit", "target": "ph", "dist": 4.6, "h": 0.6, "az": 22 },
      "props": [{ "id": "ph", "obj": "smartphone", "at": [0.3, 0, -0.4], "yaw": -25 }],
      "actions": [{ "do": "explode", "on": "ph", "at": "apart" },
                  { "do": "label", "on": "ph.battery", "at": "battery" },
                  { "do": "label", "on": "ph.board", "at": "brain" }] }
  ]
}
```

## 12. Long-form (landscape)

The kit also renders **landscape long-form** (1920x1080, 30 fps) by the shared rules in `LONGFORM.md` (the same chapter
card, lower-third captions, 16:9 lens rule and long-form gate as the Block Money engine and the other kits). Portrait
Shorts (`"format"` absent, `"short"` or `"long"`) are unchanged: same compiler output, same generated files, same gate.

**Fields**

| field | what it does |
|---|---|
| `"format": "landscape"` | 1920x1080 composition `<Pascal>Recipe` in `src/index.tech.ts` (plain 30 fps only, no `Sub`). The folder may be `finance/longform/<slug>/`. |
| `"chapters": [{ "title", "word" }]` | YouTube chapters (landscape only; a portrait recipe with chapters fails to compile). Each plays the shared 2.6 s `ChapterCard` (orange tab, blue edge) on its word, or just after the hook text for a chapter on the first word, with a whoosh + impact cue. |
| `"beat": true` on a shot | a new story beat for the pacing gate (chapters and set changes count by themselves). |
| `hook` | top-centre at y 70, 80 px type, one line when it fits (the Shorts 5-word / 2-line limits do not apply). |

**What adapts (automatic)**

- Layout (`landscapeLayout` in `src/tech/compile.ts`; portrait keeps `PORTRAIT_LAYOUT`, today's numbers): label cards and
  boards stay between y 60 (below the hook card while it shows) and y 819, i.e. above the lower-third band (centre 905 +-
  72), and 60 px from the sides; boards sit 80 px in from the side (`left` / `right`) or top-centre (`top`).
- Camera: three.js keeps the vertical fov; each preset gets `landscapeLens(preset)` (fov x, dist x; `flyThrough` and
  `explodeOrbit` 0.9, `wide` 0.8 and 0.95 dist). An explicit `cam.fov` is scaled too; a `slamZoom` starts from 60 x fov.
- Caption-safe framing: when BOLT's screen face (in the 1440 px caption column) lands in the lower-third band in any of 5
  samples of a shot, the shot's face fraction is lifted (`liftNeeded`, down to 0.26) at compile time, unless the recipe
  sets `cam.face`. Nothing is baked into the generated file. Whatever is left moves that shot's caption (`lowerThirdY`).
- Captions: `LowerThirdCaptions` phrases of up to 7 words, the spoken word in the kit's orange (as on the Shorts), from 1.0 s.
- Rendering: one 1920x1080 `View` with `postScale={1}`, never re-keyed, so the WebGL canvas stays mounted across shots.
  The kit is procedural (no GLB or texture fetches); its caches are keyed by values (colours, sizes, face states), not by
  shot or text, and BOLT's face textures are held in their own bounded map (288 states), so nothing grows with length.

**Commands**

```bash
node tools/recipe_build.mjs <slug> --check [--qa-sample 5]   # finance/longform/<slug> is found automatically
node tools/recipe_build.mjs <slug>                           # gen file, registry, RECIPE_QA.md, chapters.txt, cues
npx remotion still src/index.tech.ts <Pascal>Recipe out.jpg --frame=N --scale=0.5 --gl=swangle --timeout=600000
node tools/clip_short.mjs <slug> --from-word X --to-word Y --out <slug>-short-N [--hook "TEXT"] [--stake "TITLE: VALUE"]
node tools/recipe_build.mjs <slug>-short-N                   # the full Shorts QA + the tech3d frame-0 gate
```

The long-form check: clip QA on every `--qa-sample`th output frame (Shorts ignore `--qa-sample` and keep every frame x 4),
then `kitLongGate` with the kit's visual-change events (cuts, camera hits and kicks, cutaway explode / slice / highlight,
explodeOrbit / flyThrough moves, popIn / dropIn / path keys, BOLT pose and face changes, labels, boards, fx), the
chapters, the caption share (lower-third centre >= 75 % of the height) and the label / board boxes at 1920x1080. Exit 1 on
a clip or a hard-gate fail. The demo is `finance/longform/tech-demo-landscape/` (32 s, 3 chapters; its Short is
`finance/shorts/tech-demo-landscape-short-1/`).

**The clip adapter (`src/tech/clip.ts`)** re-times every time field of a shot (`at`, `cam.hit`, actor `from` /
`then[].at`, prop `hit` / `path` keys, action `at` / `until`, board `at` / `until`, fx `at`, sfx `at`; actor and prop
`at` / `to` are places and stay), and the recipe props' `from` / `until` / `path`. Its hook text keeps <= 5 words in 2
lines of <= 14 characters with one *orange* word and adds a `?` when there is no question word or number. Its frame-0
shot is a `hookZoom` on BOLT (from the source shot, else the nearest shot of the same set with BOLT): shrug + curious,
then shock + shocked with a shake and an impact at 0.45 s, the segment's cutaway object (about 1.5 m, turning) behind
BOLT to one side, and the stake board (`--stake "TITLE: VALUE"`, top-centre; BOLT is framed lower then). It cuts at 1.0 s.

**Limits**

- The chapter card is the shared fixed look (top 330 px, left): for 2.6 s it can cover BOLT in a centred shot.
- Only BOLT's face drives caption-safe framing; a cutaway object or a label in the band only warns (labels are kept
  above it by the layout).
- There is no tag / button-rail HUD in this kit, so none in landscape either.
- The clip adapter's hook object is placed by geometry (behind BOLT, to the side of the lens): an unusual set or BOLT
  place can still need a hand edit of the hook shot. The loop rule (hook again on the last shot) is not re-created.

## 13. Files

| file | role |
|---|---|
| `src/tech/palette.ts` | colours and light moods |
| `src/tech/bolt.tsx` | BOLT: poses, faces, rig, QA boxes |
| `src/tech/cutaway.tsx` | the parts system: geometry, explode, slice, highlight, QA boxes |
| `src/tech/objects.ts` | airplane, smartphone, ship |
| `src/tech/sets.tsx` | studio, blueprint, sky |
| `src/tech/types.ts` | the recipe schema |
| `src/tech/compile.ts` | the compiler: lenses, tracks, cutaway timelines, label layout, audio cues |
| `src/tech/hud.tsx` | hook, captions, label cards, boards |
| `src/tech/film.tsx` | the renderer |
| `src/tech/root.tsx`, `src/index.tech.ts` | compositions: `TechGallery` and every recipe |
| `src/tech/gallery.ts` | the gallery shots and `GALLERY_STILLS` |
| `src/tech/clip.ts` | the clip adapter for `tools/clip_short.mjs` (`clipAdapter`, re-exported by `tools/tech_entry.ts`) |
| `tools/tech_build.mjs`, `tools/tech_entry.ts` | build, QA and gate (Shorts gate; long-form gate via `tools/kit_long.mjs`) |
| `tools/tech_stills.mjs` | batch stills (`gallery`, or a composition's frames) |
