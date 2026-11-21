# KIT_BIZ3D: the "costly mistakes and collapses" style kit

**What this is.** A recipe kit for the business channel: true stories of companies that blew a fortune or died from one decision. The look is a stylised **3D miniature city and boardroom world**, shot like a premium documentary: clean directional light, rich colour, a **green accent for growth** and a **red accent for collapse**, gold for money. The cast is generic, **faceless executives in suits**, coloured per story. Every frame moves, and the signature shot is the **flythrough along a giant 3D chart** that rises and crashes.

- **Write a Short** as `finance/shorts/<slug>/recipe.json` with `"kit": "biz3d"`, plus `script.txt`, `sources.md` and `vo/timings.json`.
- **Build** it with `node tools/recipe_build.mjs <slug>`. A biz3d recipe is handed to `tools/biz_build.mjs`, which has its own compiler, registry and entry (`src/index.biz.ts`).
- **Block Money and tech3d are never touched.** Their recipes, registries and entries compile exactly as before.
- **Reference recipe:** `finance/shorts/biz-demo-blockbuster-passed/`. It runs 38.2 s and passes every check.
- **No motion blur.** The kit registers only the plain 30 fps composition (`<Pascal>Recipe`); there is no `Sub` composition. This is the owner's decision.

```
finance/shorts/<slug>/recipe.json ("kit": "biz3d") + vo/timings.json
        │  node tools/recipe_build.mjs <slug>          (or node tools/biz_build.mjs <slug>)
        ▼
src/biz/gen/<slug_>.biz.gen.ts  →  <Pascal>Recipe in src/index.biz.ts (size from the layout)
        + clip QA + frame-0 gate + kit rules → finance/shorts/<slug>/RECIPE_QA.md   (exit 1 on a CLIP or a FAIL)
```

## 1. Workflow

1. **Write `script.txt`.** Put one spoken line on each line. A Short runs 30-55 s, which is about 85-150 words at 2.8 words/s.
   - **Line 1 is the hook with the dollar stake** ("Blockbuster could have bought Netflix for fifty million dollars.").
   - The last line leads back into line 1, so the Short loops ("All from one meeting back in 2000, when" → line 1).
2. **Write `sources.md`.** Every number on screen or in the voice needs a source. Where sources differ, hedge it in the script ("about", "over", "by one founder's account") and say so in the table.
3. **Make timings.**
   - To draft without a voice, run `python tools/make_timings.py script.txt vo/timings.json` from the short's folder (use the path to `finance/render-pc/tools/`).
   - Swap in the real Whisper or ElevenLabs timings later. Shots anchor to words, so nothing else changes.
4. **Write `recipe.json`.** Start from the reference recipe (section 11).
5. **Check without writing anything:** `node tools/recipe_build.mjs <slug> --check`. Fix every `CLIP`, every `FAIL` and every `COMPILE ERROR`. Each message names the bad word, target, anchor or prop, and lists the valid ones.
6. **Build:** `node tools/recipe_build.mjs <slug>`. This writes:
   - `src/biz/gen/<slug_>.biz.gen.ts`;
   - `src/biz/registry.gen.ts`;
   - `out/tmp/<slug>.cues.json`, the audio plan for `tools/story_mix.py`;
   - `RECIPE_QA.md`.
7. **Stills.**
   - `node tools/biz_stills.mjs <Pascal>Recipe 0 1s 3s mid end --scale 0.5` bundles once and renders the listed frames into `out/biz/stills/` (`--out` to change).
   - `node tools/biz_stills.mjs gallery --scale 0.5` renders every kit piece (`--only <substring>` to filter).
   - The GL backend is swangle (CPU) by default. On the PC, set `GL=angle`.
   - For a single still: `npx remotion still src/index.biz.ts <Pascal>Recipe out.jpg --frame=N --gl=swangle`.
8. **Render.**
   - Preview: `npx remotion render src/index.biz.ts <Pascal>Recipe out.mp4 --gl=swangle --scale=0.5`.
   - Final: the same command at full scale (on the PC `--gl=angle`). Do **not** use the `render.sh` motion-blur path for this kit.
9. **Audio:** `STORY_CUES=out/tmp/<slug>.cues.json python tools/story_mix.py <Pascal>Recipe voice.wav <audio_dir> premix.wav`, then `tools/mux_voice.sh`.
10. **Contact sheet:** `python tools/tech_review_sheet.py <out.jpg> demo='out/biz/demo/*.jpg'` (the tool is kit-agnostic).

## 2. Formats and layout (src/biz/layout.ts)

**Every screen-space number of the kit is in `src/biz/layout.ts`**: frame size, hook, caption band, safe area, label, board, company card, decision, counter and worth slots, chart tags, plus the camera's `fovK` and `distK`. Nothing else in the kit hard-codes 1080 or 1920.

| `format` in recipe.json | layout | size | gate length |
|---|---|---|---|
| `"short"` (default), `"portrait"` | portrait | 1080 x 1920 | 30-55 s |
| `"long"` | portrait | 1080 x 1920 | 5-8 min |
| `"landscape"` | landscape | 1920 x 1080 | 5-8 min |

- **Portrait** is built and tested today.
- **Landscape** is wired through end to end: the composition size, the View, the projection, the HUD and the gate all read the layout. It uses the same `"format": "landscape"` key that the engine/longform branch is adding. Its numbers are a first pass; tune them in `LAYOUTS.landscape` when the first landscape recipe is reviewed. Camera presets are authored for portrait, and landscape scales the vertical fov by `fovK` (0.62) so subjects keep their size.

## 3. Palette and look (src/biz/palette.ts)

| token | hex | use |
|---|---|---|
| `green` | `#22C55E` | growth: rising chart segments, the "worth today" bar, company tone for the winner |
| `red` | `#EF3B36` | collapse: falling segments, the crack, THE DECISION, the hook accent, drains, stamps |
| `gold` | `#F5B324` | money and the spoken caption word, the multiple badge |
| `ink` / `navy` | `#0E1726` / `#13233F` | text on white cards, the caption stroke |
| `paper` | `#F6F1E7` | newspapers |

**Light.** One mood per set (`BIZ_MOODS`): `boardroom` (warm wood and lamps, a cool dusk skyline), `city` (deep blue dusk, warm windows), `chart` (a dark navy void, strong bloom), `warehouse` (cool steel, warm hanging lamps), `headlines` (warm paper). All use thin ink outlines, gentle bloom and a vignette.

**Suits** (`SUITS`): `charcoal`, `navy`, `olive`, `teal`, `burgundy`, `grey`, `cream`. Pick one colour family per side of the story (the demo: charcoal with a red tie for the incumbent, greens for the startup).

**Text.**
- Poppins 800 everywhere.
- Text is always DOM overlay, never 3D, so it stays crisp at phone size. The only in-world lettering is set dressing: generic store signs ("VIDEO", "RENTALS"), generic newspaper mastheads, and the hero headline (set per shot).

## 4. Cast: the executive (src/biz/exec.tsx)

`"cast": { "ceo": "charcoal", "f1": { "suit": "#2F5A3A", "tie": "#22C55E", "skin": "#D9A47E", "hair": "#2B1D14", "hairStyle": "short" } }`.

**Design.** A stylised miniature figure about 1.8 m tall: a rounded jacket, a white shirt V and a tie, two buttons, trousers, shoes. The head is **smooth and faceless**: ears and a hair cap only, no eyes or mouth, so it is never anyone's likeness.
- Look fields: `suit`, `tie`, `shirt`, `skin`, `hair`, `hairStyle` (`short`, `bald`, `long`, `bun`), `build` (width), `height` (scale).

**Movement.** Pose changes blend with anticipation and overshoot over 0.34 s, starting 2 frames before their word. Every pose breathes and sways. While the voice speaks and the camera is on an executive, the head nods and the hand beats (`"talk": false` on the actor, or `"talk": "none"` on the recipe, turns it off).

| pose | what it does |
|---|---|
| `idle` | standing, breathing, a slow sway |
| `talk` | both hands gesturing, nodding |
| `point` | right arm straight out, a lean in |
| `fold` | arms crossed: the "no" (a small head shake on entry) |
| `laugh` | head back, shoulders shaking, hands on the belly |
| `slam` | the fist goes up, then down hard at 0.3 s (a camera kick and a "punch" SFX) |
| `despair` | head in hands, hunched |
| `shrug` | forearms out, shoulders up |
| `celebrate` | both arms up, pumping, bouncing |
| `walk` | a gait in place; combine with `to` to cross the room |
| `phone` | hand to the ear, pacing in place |

**Seated.** `"seated": true` bends the legs at the seat; the upper body still acts (seated `slam` and `laugh` work). A seated executive with no `look` faces the table (side seats) or down the table (the head chair).

**Actor fields:**
```jsonc
{ "id": "ceo", "pose": "fold", "at": "head", "seated": true,
  "then": [{ "at": "answer", "pose": "slam" }], "look": 30, "to": "foot", "scale": 1, "talk": true }
```
- `look` is a yaw in degrees (0 = facing +z) or a target to face; the default is the lens.
- `to` glides the executive over the shot (with `walk` it reads as walking in).
- Camera targets: `"ceo"` (the chest) and `"ceo.head"`.

## 5. Sets (src/biz/sets.tsx)

Every set keeps moving: skyline windows twinkle, clouds and traffic drift, lamps sway, dust floats, papers flutter, the conveyor runs, the chart grid scans, the wall clock ticks.

| set | look | anchors |
|---|---|---|
| `boardroom` | dark wood floor and rug, a long polished table (along z, -3.2..2.8) with folders, glasses and a speakerphone, 8 chairs, the tall CEO chair at the head, a glass wall over a dusk skyline at z -6, wood side walls, a back wall with a double door, a clock | `head` (CEO chair), `seatL1..4`, `seatR1..4`, `tableTop`, `tableEnd`, `foot` (standing at the foot of the table), `door`, `standL`, `standR`, `window`, `high`, `centre` |
| `city` | a miniature street at dusk: a row of **9 stores** (x -7.6..7.6, fronts at z -2.2) with glowing windows, generic signs and awnings, towers behind (an open plaza behind the middle stores), lane markings, a crosswalk, street lamps, trees, traffic | `store0..store8`, `stores`, `street`, `hq` (the plaza, for a `tower` prop), `front`, `corner`, `high`, `centre` |
| `chart` | a dark void with a glowing grid floor and a scan line, rising motes, faint bars far back; draws `recipe.chart` | `start`, `peak`, `end`, `mid` (from the chart), `floor`, `high`, `centre` |
| `warehouse` | steel racks of product boxes on both sides, a running conveyor down the middle, swaying lamps with light cones, dust | `aisle` (clear floor past the conveyor), `conveyor`, `rackL`, `rackR`, `back`, `dock`, `high`, `centre` |
| `headlines` | a wall of 13 newspapers (generic mastheads like "THE DAILY LEDGER", generic headlines) around one big hero paper carrying the shot's `"headline"` | `hero`, `wall`, `left`, `right`, `floor`, `centre` |

- **Anchors take an offset:** `"hq:0,4.2,0"`, `"stores:0,0.9,0"`.
- **Targets beyond anchors:** `"store:<i>"` (a store front), `"chart"` (the middle of the chart), `"chart:<i>"` (a chart point, fractional allowed).
- **Set blockers** (QA boxes): the table, the window and back walls, every store, the conveyor and both racks.

## 6. The chart (src/biz/chart.tsx): the signature

```json
"chart": { "pts": [0.2, 1.6, 3.6, 6.0, 7.7, 9.1, 7.9, 6.0, 3.3],
           "tags": [{ "i": 0, "text": "1985" }, { "i": 5, "text": "2004" }, { "i": 8, "text": "2010" }],
           "step": 3, "height": 9 }
```
- `pts` are values left to right in any unit; the tallest is drawn `height` m high, `step` m apart.
- Each segment is a thick glowing bar: **green if it rises, red if it falls**. A glass curtain of thin bars fills the area under the line, every point has a dot and a thin pillar, and a pulsing tip leads the draw.
- `tags` are DOM pills riding their points (green on a rise, red on a fall). They appear once the draw reaches them.
- The draw: full by default; with any `draw` action it starts empty. A `chartFly` shot always keeps the draw just ahead of the lens.
- **The chart is illustrative.** Say so in `sources.md` unless you plot real data.

**`chartFly`** (camera preset, chart set only): the lens rides behind and beside the line from point `from` to point `to` (default the whole chart) over `dur` (default the shot). It looks ahead along the line, banks with the slope, and breathes the fov, so a climb lifts the camera and a **crash becomes a dive**. `dist` (default 7) and `az` (default 38°) set the offset, `h` the height above the line. Split the ride across two shots (rise, then crash) to cut on a word.

## 7. Story devices (DOM, in `"devices"` on a shot)

| device | fields | what it does |
|---|---|---|
| `company` | `name`, `year`, `icon`, `tone`, `tagline`, `pos` (`top`, `mid`, `low`) | the company card: a **generic pictogram** (`film`, `mail`, `store`, `tower`, `rocket`, `cart`, `chip`, `phone`, `camera`, `bank`), the name as plain text, "FOUNDED <year>". **Never a logo.** The name auto-fits the card. |
| `decision` | `text` (default "THE DECISION"), `sub`, `until` (default +1.6 s), `freeze` (default true) | **the freeze-frame**: the world clock holds while the lens keeps creeping in and rolling, the frame desaturates with a red edge, letterbox bars and viewfinder brackets slide in, the red banner slams in, the `sub` question follows |
| `counter` | `title`, `from`, `to`, `dur`, `tone` | a money counter (compact: $50M, $1.46B). Draining is red with a ▼ and a shake; rising is green with a ▲ |
| `worth` | `a: { label, value, text }`, `b: { label, value, text }`, `multiple` | "WHAT IT'S WORTH TODAY": the small bar (a sliver, on purpose), the big bar grows, the multiple pops in gold ("5,000×") |
| `board` | `title` (≤ 3 words), `value` or `count`, `pos`, `tone` | a number board |
| `stamp` | `text`, `tone`, `y` | a rubber stamp slams in, tilted (BANKRUPT, NO, SOLD) |

Devices sit in fixed layout slots (layout.ts) below the hook while it shows and above the caption band. The gate fails any device card over a head, over another card or into the caption band (THE DECISION is exempt from the head check: it is meant to cover the frame).

## 8. Kit props and actions

| `kit` | what it is |
|---|---|
| `tower` | a generic glass headquarters tower (`size` [w, h, d], `color`); crackable |
| `boxes` | a stack of product boxes (`size` [columns, rows, layers]) |
| `cash` | a stack of cash bundles; drainable |
| `disc` | a plain disc in a dark case (the generic "movie rental") |
| `envelope` | a plain mailer (deliberately not red) |
| `block` | a plain box (`size`, `color`) |

Motions: `turntable`, `bob`, `popIn`, `dropIn` (lands on `hit` with a kick and an impact SFX). Recipe-level `props` with `from`/`until`/`sets` live across shots.

| action | fields | what it does |
|---|---|---|
| `crack` | `on` (a tower), `dur`, `collapse` | **the crack** runs down the tower's face, glowing red, top to bottom; at `collapse` the halves split apart, tilt and sink while debris falls. Crash + rumble SFX, a boom on the collapse |
| `dark` / `lit` | `on: "stores"`, `stagger`, `order` (`left`, `right`, `shuffle`), `keep` | the city's stores flicker and go dark (or light up) one by one; the state carries across later city shots |
| `drain` | `on` (a cash prop), `dur`, `to` | the cash stack shrinks |
| `draw` | `on: "chart"`, `to`, `dur` | draws the chart up to point `to` |
| `slam` | `on: "papers"`, `stagger` | the newspapers fly onto the wall, the hero paper last |
| `label` | `on`, `text` (≤ 3 words), `until`, `side`, `tone` | a callout line and a white card; one at a time (≥ 0.3 s apart) |

| `fx` | what it does |
|---|---|
| `shake` | a camera kick at `at` (`gain`) |
| `flash` | a white flash |
| `debris` | chunks burst from `p` and fall |

## 9. Cameras (BIZ_CAMS in src/biz/compile.ts)

All cameras keep moving, including through a freeze-frame. The gate FAILs a Short with even one still frame.

**Fields:** `target`, `az` (0 = from +z), `dist`, `h`, `fov`, `face` (where the target sits, from the top), `hit`, `sweep`, `roll`, `blur`; `from`, `to`, `dur` for chartFly.

| preset | default dist / h / fov | move |
|---|---|---|
| `hookZoom` | 2.2 / 0.1 / 40 | frame 0: from 1.3x out into a close-up in 0.4 s, a landing kick, then a creep |
| `slamZoom` | 2.6 / 0.2 / 42 | the fov slams in at `hit`, then a creep; impact SFX |
| `whip` | 3.2 / 0.3 / 46 | the look swings 35° onto the target in 0.22 s; whoosh |
| `pushIn` | 3.2 / 0.35 / 42 | a push with a punch window |
| `closeUp` | 1.6 / 0.05 / 38 | a slow push |
| `medium` | 3.4 / 0.3 / 42 | a slow push |
| `wide` | 9 / 2.6 / 48 | a slow push (not allowed in the first 1 s) |
| `orbit` | 4.5 / 1.0 / 42 | orbits `sweep` degrees (default 40) |
| `dolly` | 4.0 / 0.6 / 42 | a lateral track of `sweep` m (default 2.4) past the subject: parallax |
| `crane` | 6.0 / 0.5 / 44 | rises 3.2 m and pulls back, tilting down onto the subject |
| `chartFly` | 7.0 / 2.2 / 50 | **the signature ride along the chart** (section 6) |

**Transitions (`"in"`):** `punch` (default: fov +7° snapping in plus a kick), `whip` (a 32° swing with a whoosh), `cut`. slamZoom, whip and chartFly shots come in as cuts.

**Framing, portrait:**
- A seated executive at the head chair, frame 0: `hookZoom`, `target` the exec, `dist` 2.3, `h` 0.35, `face` 0.66 keeps the head under the hook card.
- A standing executive full length: `medium`, `dist` 3.4-3.6.
- The store row: `dist` 9.5-10, `h` 1.4-2.2, target `"stores:0,0.9,0"`.
- A tower at `hq`: `dist` 15-16, target `"hq:0,4.2,0"`.
- The whole chart: `orbit` on `"chart"`, `dist` 26-30.

## 10. Text, and the build checks (tools/biz_build.mjs → RECIPE_QA.md)

**Hook** (`hook.text`): at the top on a white card with a red underline, from frame 0; **≤ 5 words, ≤ 2 lines, exactly one `*word*`** in the accent (red; `"tone": "green"` for a win story). **Put the dollar stake in it** ("THE *$50M* NO"). `until` defaults to the end of line 1 + 0.25 s; `again` brings it back for the loop ending.

**Captions:** the fixed caption band from the layout (portrait: centre y 1344, 170 px side margins), 1-3 words per chunk, white with a thick ink stroke (readable on the dark and light sets), the spoken word in gold. They start at 1.0 s. `"caption": "off"` or a fixed string per shot overrides them.

**Clip QA** runs on every frame × 4 sub-frames: each executive's body and head against the set blockers, kit props (tower, block, boxes) and the other executives; nobody below the floor. Limbs are not tested: hands on the table and legs under it are acting.

**Gate** (hard = FAIL):
- frame 0 has a subject ≥ 50 % of the frame height;
- the hook is ≤ 5 words, ≤ 2 lines, fits, and has exactly one accent word;
- the dollar stake or a number is on screen by 0.5 s;
- the first word comes by 0.2 s; there is an impact at 0.00 s; music plus an SFX at frame 0;
- there are ≥ 2 cuts or hits in the first 3 s; the first cut comes ≤ 1.25 s; no wide shot in the first 1 s;
- a frame-0 executive changes pose by 1.5 s;
- heads are clear of the caption band ≥ 90 % of caption time;
- labels are ≤ 3 words and start ≥ 0.3 s apart;
- no label or device card over a head; the hook never covers a head; text cards never overlap each other or the hook; cards stay above the caption band;
- **the camera moves on every frame** (freeze-frames included).

**Warn:** the chart flythrough is used; a company card and THE DECISION are used; the loop ending (the hook comes back and the last shot targets the first shot's subject); length.

## 11. Content rules (the owner's)

- **No real logos, trademarks, trade dress or mascots on screen.** Company names may be spoken and shown as plain text (company card, headline, labels). Icons are generic pictograms; avoid a company's colour scheme on store fronts (the demo's stores are a varied palette with generic signs).
- **No real people's likeness.** Executives are faceless and generic; name people only in the voice or `sources.md`.
- **No game or TV IP; no copying other creators' styles.**
- **CC0 or procedural assets only.** Everything in this kit is procedural (three.js primitives and canvas textures).
- **Every number is sourced** in `sources.md` and hedged where sources differ.

## 12. Example: the reference Short

`finance/shorts/biz-demo-blockbuster-passed/recipe.json` runs 38.2 s in 15 shots. Facts and hedges are in `sources.md`.

| shot (word) | set | camera | what happens |
|---|---|---|---|
| 0 | boardroom | hookZoom on ceo | the boss at the head of the table, arms folded, then a shrug; hook "THE *$50M* NO" |
| "have" | warehouse | slamZoom on the disc | a disc and mailers; company card NETFLIX, FOUNDED 1997 (mail icon, green) |
| "fifty" | boardroom | pushIn on the cash | a cash stack drops on the table; counter THE ASKING PRICE $0 → $50M |
| line 2 | warehouse | dolly along the conveyor | board THE YEAR 2000; counter NETFLIX LOSSES, 2000 → -$57M |
| line 3 | boardroom | orbit on the founders | two founders walk in from the door, talk and point; label THE FOUNDERS |
| line 4 | boardroom | closeUp on ceo | the boss tries not to laugh |
| line 5 (whip) | boardroom | pushIn on ceo | the fist comes down; **THE DECISION** freeze, "SELL FOR $50M?", stamp NO |
| "Blockbuster" | city | crane over the stores | every store lit; company card BLOCKBUSTER, FOUNDED 1985 (film icon, red) |
| line 6 | chart | **chartFly 0 → 5.2** | ride the green climb to the 2004 peak; board STORES ~9,000 |
| line 7 | chart | **chartFly 5 → 8** | streaming: the line turns red and the lens dives |
| "stores" | city | pushIn | the stores go dark one by one |
| line 8 | city | slamZoom on the tower | the crack runs down the tower on "filed", it splits on "bankruptcy", debris |
| "with" | headlines | pushIn on the hero paper | papers slam onto the wall: "BLOCKBUSTER FILES FOR BANKRUPTCY"; counter DEBT → $1.46B |
| line 9 | chart | orbit on the whole chart | WHAT IT'S WORTH TODAY: $50M vs $250B+, "5,000×" |
| line 10 | boardroom | hookZoom on ceo | loop: the boss laughs, then folds his arms; the hook returns on "back" |

## 13. Files

| file | role |
|---|---|
| `src/biz/layout.ts` | **all layout numbers**, one block per format |
| `src/biz/palette.ts` | colours, suit presets, light moods |
| `src/biz/exec.tsx` | the executive: poses, rig, QA boxes |
| `src/biz/sets.tsx` | boardroom, city, chart, warehouse, headlines |
| `src/biz/chart.tsx` | the chart geometry and view |
| `src/biz/props.tsx` | tower (crack, collapse), boxes, cash, disc, envelope, block |
| `src/biz/types.ts` | the recipe schema |
| `src/biz/compile.ts` | the compiler: lenses (chartFly), the freeze clock, world timelines, label/tag/device layout, audio cues |
| `src/biz/hud.tsx` | hook, captions, labels, chart tags, the story devices |
| `src/biz/film.tsx` | the renderer |
| `src/biz/root.tsx`, `src/index.biz.ts` | compositions: `BizGallery` and every recipe |
| `src/biz/gallery.ts` | the gallery shots and `GALLERY_STILLS` |
| `tools/biz_build.mjs`, `tools/biz_entry.ts` | build, QA and gate |
| `tools/biz_stills.mjs` | batch stills (`gallery`, or a composition's frames) |
