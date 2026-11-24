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

**Every screen-space number of the kit is in `src/biz/layout.ts`**: frame size, hook, caption band, safe area, label, board, company card, decision, counter and worth slots, chart tags. Nothing else in the kit hard-codes 1080 or 1920.

| `format` in recipe.json | layout | size | gate length |
|---|---|---|---|
| `"short"` (default), `"portrait"` | portrait | 1080 x 1920 | 30-55 s |
| `"long"` | portrait | 1080 x 1920 | 5-8 min |
| `"landscape"` | landscape | 1920 x 1080 | 8-12 min (the shared long-form gate, section 14) |

- **Portrait** is built and tested today.
- **Landscape** is long-form (LONGFORM.md): see section 14.

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
| `board` | `title` (≤ 3 words), `value` or `count`, `pos`, `tone`, `size` | a number board. **`"size": "giant"`** is the stake board: centred, 920 px wide (85 % of the frame), the value up to 220 px (it shrinks to fit). With `"at": 0` it is fully on at frame 0: a frame-0 opener (section 8a) |
| `stamp` | `text`, `tone`, `y` | a rubber stamp slams in, tilted (BANKRUPT, NO, SOLD) |

A device that starts at `0` is fully on at frame 0 (no fade-in ghost); every other device fades in over 0.22 s.

Devices sit in fixed layout slots (layout.ts) below the hook while it shows and above the caption band. The gate fails any device card over a head, over another card or into the caption band (THE DECISION is exempt from the head check: it is meant to cover the frame).

**Counting devices land on the word (polish rule P1, LONGFORM.md 7a).** `counter`, a board's `count` and `worth` (its big
row) end their count no later than the **anchor word**, the voice saying the number. It is found in the voice-over:
`50 million` matches `$50M`, and a compact value matches within 5 %. Or set it with `"land": "<word>"` on the device
(on `count` for a board). The final value holds for at least 0.5 s before the device leaves or the shot cuts, and the
landing `cash` / `ding` moves with it. **Text is measured (P2):** the company name and tagline, THE DECISION and its
sub, the counter title and value, the worth rows, board titles and values (normal and giant), stamps, callout labels
and chart tags use the real Poppins widths and shrink to fit on one line. Counting values are fitted at their widest.
Below 42 px (titles 32 px) the build fails with how many characters fit, or "use `"size": "giant"`".

## 8. Kit props and actions

| `kit` | what it is |
|---|---|
| `tower` | a generic glass headquarters tower (`size` [w, h, d], `color`); crackable |
| `boxes` | a stack of product boxes (`size` [columns, rows, layers]) |
| `cash` | a stack of cash bundles; drainable |
| `disc` | a plain disc in a dark case (the generic "movie rental") |
| `envelope` | a mailer with a printed address block (`label` = the addressee, `lines` = up to 3 address lines; a generic address when left out) and a stamp. Never blank |
| `block` | a plain box (`size`, `color`) |
| hero props | `can`, `cup`, `box`, `bottle`, `phone`, `case`, `camera`, `shoe`, `burger`, `laptop`, `card`, `bag`, `letter`: section 8a |

Motions: `turntable`, `bob`, `popIn`, `dropIn` (lands on `hit` with a kick and an impact SFX). `"spin"` (deg/s) with no motion turns a prop slowly on the spot from its first frame in the shot, so its front faces `yaw` when the shot starts. `"scale"` is the same as `"s"`. Recipe-level `props` with `from`/`until`/`sets` live across shots.

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

## 8a. Hero props (src/biz/hero.tsx): what the story is about, at frame 0

The cast is faceless, so a close-up "reaction" at frame 0 reads as nothing. **Open on a hero prop**: a generic, labelled
product that says what the story is about (a red can for a cola story, a rental case for a video chain, a film camera
for a photo company). All are procedural ORIGINAL designs in the kit's premium miniature look (satin plastic, rounded
edges, a soft highlight), lit by the set.

```json
{ "id": "can", "kit": "can", "label": "COLA", "color": "#D7262E", "at": "tableTop:0,0,-2.35", "scale": 0.8, "spin": 8 }
```

| field | meaning |
|---|---|
| `kit` | one of the kinds below |
| `color` | the product colour (body, panel); the label ink turns dark on a light colour, white on a dark one |
| `label` | the text printed on it: **≤ 14 characters, ≤ 2 words, plain generic text** ("COLA", "NEW", "CLASSIC", "FILM", "SALE"). A real brand name is a compile error (the guard lists the famous marks; brand names belong on the company card). `""` = an unlabelled product (two plain cups). The letter needs one: it is its headline |
| `lines` | `letter` / `envelope`: the body text, up to 7 lines of ≤ 40 characters; a generic letter when left out. **Paper is never blank** |
| `at`, `yaw`, `scale` (= `s`), `spin`, `motion`, `hit` | as for every prop. **Hero scale:** each prop is 0.5-1 m (2-3x life size) so `closeUp` / `hookZoom` fill the frame at 1.3-1.8 m; `"scale": 0.35` is about life size on the table |

| kit | default | what it is | still |
|---|---|---|---|
| `can` | `#D7262E` "COLA" | a soda can: wrap-around label with straight bands, silver lid and tab, condensation beads. Optional small line under the label = `lines[0]` (e.g. "NEW TASTE"); none by default, so the can never states a flavour the story contradicts | [hero-can](docs/hero_props/biz/hero-can.jpg) |
| `cup` | white "CLASSIC" | a paper cup with a printed sleeve, a lid and a straw | [hero-cup](docs/hero_props/biz/hero-cup.jpg) |
| `box` | `#F2B830` "CEREAL" | a cereal / product box: FAMILY SIZE band, the label badge, a NEW burst | [hero-box](docs/hero_props/biz/hero-box.jpg) |
| `bottle` | `#2F7D4A` "SODA" | a glass bottle (lathe profile) with a label band and a gold cap | [hero-bottle](docs/hero_props/biz/hero-bottle.jpg) |
| `phone` | `#1C2230` "NEW" | a smartphone; the label on the lit screen (a card and app tiles) | [hero-phone](docs/hero_props/biz/hero-phone.jpg) |
| `case` | `#1E3A8A` "MOVIE" | a video rental case (DVD/VHS): 2-NIGHT RENTAL band, the label, NEW RELEASE, RETURN BY 9 PM | [hero-case](docs/hero_props/biz/hero-case.jpg) |
| `camera` | `#2A2A2E` "FILM" | a film camera: silver body, leatherette band in `color`, lens, dials, the label plate | [hero-camera](docs/hero_props/biz/hero-camera.jpg) |
| `shoe` | `#E04E2C` "RUN" | a sneaker in side view: cupsole, toe cap, laces, heel tab, the label on both side panels | [hero-shoe](docs/hero_props/biz/hero-shoe.jpg) |
| `burger` | `#E8A33A` "BURGER" | a burger box with its lid open on a burger | [hero-burger](docs/hero_props/biz/hero-burger.jpg) |
| `laptop` | `#B8BEC8` "ONLINE" | a laptop; the label on the screen over a rising line chart | [hero-laptop](docs/hero_props/biz/hero-laptop.jpg) |
| `card` | `#1F2937` "GOLD" | a credit card standing in a stand: chip, the label, generic digits, CREDIT (no network logo) | [hero-card](docs/hero_props/biz/hero-card.jpg) |
| `bag` | `#C8102E` "SALE" | a shopping bag with rope handles, THANK YOU band, the label badge | [hero-bag](docs/hero_props/biz/hero-bag.jpg) |
| `letter` | cream "NOTICE" | a letter / document: an accent bar, the **headline** (`label`), the body `lines`, a signature line | [hero-letter](docs/hero_props/biz/hero-letter.jpg) |

Table scale and unlabelled cups: [hero-labels](docs/hero_props/biz/hero-labels.jpg). The gallery renders them all:
`node tools/biz_stills.mjs gallery --only hero-`.

**Frame-0 recipe pattern** (the reference Short, section 12): the prop on the boardroom table in front of the
executive, `"cam": { "preset": "hookZoom", "target": "<prop id>", "dist": 1.45, "h": 0.12, "face": 0.52 }`, with
`"scale": 0.8` and a slow `"spin"`. The executive behind can still fold his arms and shrug (the acting beat). No hero
prop fits? Open on the stake instead: `"devices": [{ "do": "board", "size": "giant", "title": "the price", "value": "$50M", "at": 0, "tone": "red" }]`.

Before / after on the reference Short: [before](docs/hero_props/frame0/biz-demo-blockbuster-passed_before.jpg) (a
faceless boss) → [after](docs/hero_props/frame0/biz-demo-blockbuster-passed_after.jpg) (the rental case); the clip
adapter's giant-board opener: [biz-demo-landscape-short-1](docs/hero_props/frame0/biz-demo-landscape-short-1_after.jpg).

## 8b. Props pack (src/props/pack.tsx): animals, gadgets, vehicles, everyday objects

Five Shorts failed the AI editor because their SUBJECT could not be shown (the monkey-selfie case showed a man, a
pocket music player rendered as a modern smartphone). The **props pack** is a shared set of 34 hero props that
law3d, biz3d and cyber3d all take, built once in `src/props/pack.tsx` and themed per kit by a `PackTheme` built from
the kit's own palette and materials: in biz3d they are smooth satin plastic and clear-coat metal, with green screen accents. They are generic, ORIGINAL, low-poly shapes (no logo, no trade
dress: the music player has a plain button row, never a wheel or a pad; the console, headset and speaker are generic).
biz3d keeps its own `laptop` and `shoe` (same names: the biz3d versions win, so the pack's shoe `variant` is not taken here); the pack's `digitalCamera` is a compact digital camera beside biz3d's film `camera`, its `sodaBottle` a plastic bottle beside the glass `bottle`.

**Is the subject showable?** Look it up in `src/props/catalog.json` (`index`: a lowercase keyword → the kinds; every
kind of every kit is listed with its kits, description, params and keywords, e.g. "monkey", "macaque", "selfie" →
`monkey`; "zune", "mp3" → `mp3Player`; "juicero" → `juicer`). Regenerate it with `node tools/props_catalog.mjs`
(`--check` fails when it is stale).

```json
{ "id": "player", "kit": "mp3Player", "screen": "NOW PLAYING", "lines": ["Track 01", "0:42 / 3:15"], "color": "#5B6270", "at": "aisle", "spin": 6 }
```

Same fields as the hero props above (`color`, `label`, `lines`, `at`, `yaw`, `scale` / `s`, `spin`, `motion`, `hit`;
labels follow the same rule: ≤ 14 characters, ≤ 2 words, no brand), plus:

| field | kinds | meaning |
|---|---|---|
| `holding` | `monkey` | `"camera"`: a selfie: the camera held up in front at arm's length, its lens to the monkey, its back screen (the selfie: a grinning monkey face) to the lens; a grin |
| `spots` | `cow` | black patches (default `true`; `false` = a plain brown cow) |
| `variant` | `chicken`, `shoe` | chicken: `hen` (default, white) / `rooster` (red-brown, big comb, dark sickle tail); shoe: `sneaker` (default) / `heel` (a pump on a stiletto) |
| `screen` | `mp3Player`, `smartwatch`, `tablet`, `flipPhone`, `laptop`, `cashRegister`, `wristwatch` | the big text on the screen (≤ 18 characters, brand-checked): "NOW PLAYING", "12:30", "$12.00"; `lines` go under it. A `wristwatch` takes `"HH:MM"` and sets its hands |
| `label` | all | animals: a round name tag on a red collar; vehicles: the plates / the name on the hull / the side; `briefcase`, `suitcase`: a paper luggage tag; `juicer`: the juice pouch; `vendingMachine`: the lit header; `pizzaBox`: the lid and the box front; gadgets: a small printed line |

A wrong param is a compile error ("`spots` is for the cow", "a monkey's `holding` is one of camera"). Every prop is a
pure function of (spec, t, seed) and has an idle loop with no motion blur: animals blink every ~3.4 s and breathe, and
move a tail / ears / head (the dog wags, the cat's tail sways, the rabbit's nose twitches, the hen bobs); the drone
hovers with turning rotors, the plane's propeller turns, the boat bobs on ripples, the juicer presses and drips, the
soda fizzes, the watch's second hand ticks, the diamond glints.

**Scale.** Like the other hero props, each is 0.6-1.5 m at `"scale": 1` so `closeUp` / `hookZoom` fill the frame.
The **life** column is the scale at which it is life size next to the cast (a monkey beside a person: `"scale": 0.6`;
a cow: 1.3). Animals and vehicles are built side-on, head / front to +x, the head turned toward the lens: see them
from 3/4 front (`"az": 40-50`, or `"yaw": -40` on the prop).

| kit | group | default | what it is | life | still |
|---|---|---|---|---|---|
| `monkey` | animal | `#8A5A3C` | a sitting monkey (holding: "camera": a selfie, the camera at arm's length and a grin) | 0.6 | [monkey](docs/hero_props/pack/biz/monkey.jpg), [selfie](docs/hero_props/pack/biz/monkey-camera.jpg) |
| `cow` | animal | `#F4F1EA` | a standing cow (spots: default true; false = a plain brown cow) | 1.3 | [cow](docs/hero_props/pack/biz/cow.jpg), [plain](docs/hero_props/pack/biz/cow-plain.jpg) |
| `dog` | animal | `#C98A4B` | a standing dog, floppy ears, wagging tail | 0.75 | [dog](docs/hero_props/pack/biz/dog.jpg) |
| `cat` | animal | `#E39A4C` | a sitting cat, white chest, swaying tail | 0.45 | [cat](docs/hero_props/pack/biz/cat.jpg) |
| `horse` | animal | `#7A4A2A` | a standing horse, dark mane and tail, white blaze | 1.15 | [horse](docs/hero_props/pack/biz/horse.jpg) |
| `pig` | animal | `#F2A7A8` | a standing pig, snout, curly tail | 1 | [pig](docs/hero_props/pack/biz/pig.jpg) |
| `chicken` | animal | per variant | a chicken (variant: hen = white hen, rooster = red-brown rooster with a big comb and tail) | 0.5 | [chicken](docs/hero_props/pack/biz/chicken.jpg), [rooster](docs/hero_props/pack/biz/chicken-rooster.jpg) |
| `shark` | animal | `#6E8496` | a swimming shark (hovering), white belly, a toothy smile | 1.6 | [shark](docs/hero_props/pack/biz/shark.jpg) |
| `bird` | animal | `#3B7DD8` | a small songbird on a branch perch | 0.25 | [bird](docs/hero_props/pack/biz/bird.jpg) |
| `rabbit` | animal | `#D8CFC4` | a sitting rabbit, long ears, twitching nose | 0.45 | [rabbit](docs/hero_props/pack/biz/rabbit.jpg) |
| `mp3Player` | gadget | `#2B2F3A`, screen "NOW PLAYING" | a pocket music player: a screen (screen + lines) over a plain button row, earbuds on a cable | 0.14 | [mp3Player](docs/hero_props/pack/biz/mp3Player.jpg) |
| `juicer` | gadget | `#EEF0F2`, "JUICE PACK" | a countertop juice press squeezing a juice pouch (the label) into a glass | 0.45 | [juicer](docs/hero_props/pack/biz/juicer.jpg) |
| `gameConsole` | gadget | `#1E2128` | a generic game console standing up, a controller leaning in front | 0.45 | [gameConsole](docs/hero_props/pack/biz/gameConsole.jpg) |
| `vrHeadset` | gadget | `#F2F2F0` | a VR headset on a display block: visor, strap, face cushion | 0.35 | [vrHeadset](docs/hero_props/pack/biz/vrHeadset.jpg) |
| `smartwatch` | gadget | `#1E2128`, screen "12:30" | a smartwatch on a display: screen = the big time / text, lines under it | 0.12 | [smartwatch](docs/hero_props/pack/biz/smartwatch.jpg) |
| `drone` | gadget | `#D8DCE0` | a hovering quadcopter drone, four turning rotors, a camera under the nose | 0.5 | [drone](docs/hero_props/pack/biz/drone.jpg) |
| `tablet` | gadget | `#2A2E36`, screen "HOME" | a tablet on a stand: screen = the title banner, an app grid, lines | 0.3 | [tablet](docs/hero_props/pack/biz/tablet.jpg) |
| `flipPhone` | gadget | `#3A4456`, screen "1 NEW TEXT" | an open flip phone: keypad below, the small screen (screen + lines) above | 0.12 | [flipPhone](docs/hero_props/pack/biz/flipPhone.jpg) |
| `digitalCamera` | gadget | `#B8BEC8` | a compact digital camera: lens barrel, flash, shutter button | 0.22 | [digitalCamera](docs/hero_props/pack/biz/digitalCamera.jpg) |
| `smartSpeaker` | gadget | `#3A3F47` | a fabric smart speaker, a glowing ring on top | 0.35 | [smartSpeaker](docs/hero_props/pack/biz/smartSpeaker.jpg) |
| `headphones` | gadget | `#22252B` | over-ear headphones on a stand | 0.45 | [headphones](docs/hero_props/pack/biz/headphones.jpg) |
| `sedan` | vehicle | `#2F4A7A` | a generic four-door sedan (label = the plates) | 3.2 | [sedan](docs/hero_props/pack/biz/sedan.jpg) |
| `pickup` | vehicle | `#B03A2E` | a generic pickup truck, open bed (label = the plates) | 3.4 | [pickup](docs/hero_props/pack/biz/pickup.jpg) |
| `airplane` | vehicle | `#C0392B` | a small high-wing propeller plane, white with a colour trim (label = painted on the side) | 5.5 | [airplane](docs/hero_props/pack/biz/airplane.jpg) |
| `boat` | vehicle | `#1F6FB2` | a small motorboat on a patch of water, outboard motor (label = the name on the hull) | 3 | [boat](docs/hero_props/pack/biz/boat.jpg) |
| `shoppingCart` | everyday | `#D7262E` | a wire shopping cart, a coloured handle | 1 | [shoppingCart](docs/hero_props/pack/biz/shoppingCart.jpg) |
| `cashRegister` | everyday | `#D9D4C7`, screen "$12.00" | a cash register, drawer open with bills: screen = the display | 0.6 | [cashRegister](docs/hero_props/pack/biz/cashRegister.jpg) |
| `vendingMachine` | everyday | `#3A6EA5`, "SNACKS" | a vending machine: glass front with rows of snacks and drinks, the label lit on top | 1.2 | [vendingMachine](docs/hero_props/pack/biz/vendingMachine.jpg) |
| `pizzaBox` | everyday | `#C89A5E`, "PIZZA" | an open pizza box, a whole pepperoni pizza (label printed on the box) | 0.45 | [pizzaBox](docs/hero_props/pack/biz/pizzaBox.jpg) |
| `sodaBottle` | everyday | `#2F9E44`, "SODA" | a plastic soda bottle, label band, bubbles rising | 0.35 | [sodaBottle](docs/hero_props/pack/biz/sodaBottle.jpg) |
| `wristwatch` | everyday | `#5A3722`, screen "10:10" | an analog wristwatch on a cushion: screen = "HH:MM" sets the hands | 0.12 | [wristwatch](docs/hero_props/pack/biz/wristwatch.jpg) |
| `ring` | everyday | `#E8B44A` | a diamond ring standing in an open ring box (color = the metal) | 0.08 | [ring](docs/hero_props/pack/biz/ring.jpg) |
| `briefcase` | everyday | `#3B2314` | a leather briefcase, gold latches (label = a luggage tag on the handle) | 0.55 | [briefcase](docs/hero_props/pack/biz/briefcase.jpg) |
| `suitcase` | everyday | `#2F7D8A` | a hard-shell rolling suitcase, handle up (label = a luggage tag) | 0.6 | [suitcase](docs/hero_props/pack/biz/suitcase.jpg) |

The gallery renders them all in the biz3d look: `node tools/biz_stills.mjs gallery --only pack-` (cloud boxes:
`BROWSER_EXE=<chrome-headless-shell path>`); contact sheet: [docs/hero_props/pack/sheet-biz.jpg](docs/hero_props/pack/sheet-biz.jpg).

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

**Framing rules (screen space, every output frame; tools/framing_qa.mjs + tools/framing_kits.mjs; same rules as RECIPE_GUIDE.md §4.1).**
Run `node tools/recipe_build.mjs <slug> --check` until the "framing QA" line shows 0 clips and 0 fails. Every message
names the shot, the time, the card / prop / person and what to move where.
- **R1 CLIP, nothing on a head.** No card, board, label, story device, 3D text prop or small prop may overlap a head on
  screen. The head includes the hair cap (`execHead().c` is the drawn head centre since 2026-11-22; it was 0.13 m high). Text counts at any depth; a small prop counts within 0.6 m of the head. Big staging
  objects (half-size > 0.75 m) are skipped.
- **R2 FAIL, the subject in frame.** The subject is the camera's target person, else the shot's `"subject"`, else its only
  person while their head is on screen. In a medium or wide shot, 85 % of the subject's body (left to right) is in
  frame. In a close shot, the head is centred (middle 60 % of the width). The head never touches an edge (11 px). Any
  other person's head is fully in or fully out. The first 0.35 s of a whip-in is skipped.
- **R3 FAIL, cards and boards inside the frame** with a 3 % margin (32 px), once landed (0.3 s after the hit). A
  board's title and value must also **fit the board**: a line wider than the card is cut off by its edge ("200,000" at
  108 px is ~450 px in a 420 px board; "April 1985" ~540 px). Shorten it ("200K", "APR 1985") or use `"size": "giant"`.
- **R4 FAIL, text reads.** Every text colour is at least 4.5:1 against its fill (WCAG). Coloured text and fills under white text use the text-safe tones `TEXT_TONE` in src/biz/hud.tsx: green `#15803D` 5.0:1, red `#C62828` 5.6:1, gold `#8A6212` 5.5:1 (the bright tones were 2.3, 3.9 and 1.9:1; they stay for bars, borders, lines and the chart). A featured line is at least
  42 px font size (the median while on screen). Long-form uses the same 42 px at 1080 tall; its cards are checked for
  placement and colour only.
- **R5 FAIL (Shorts), frame 0 is a close-up of a face.** The hook is at the kit's full size, and the subject's face is
  at least 16 % of the frame height (307 px). In this kit the face part is **replaced by the frame-0 opener** below when
  it passes (the cast is faceless); the hook-size part always applies.
- **R6 FAIL, no caption on a face or neck.** While a word caption is on screen, its real line boxes (the chunk's words in the bottom band; long-form: the lower third) must not overlap a character's head, face or neck / collar. Here the executives have a long neck, so the neck / collar box hangs 0.5 x the head height under the head. A close shot aimed at the chest (`"ceo"`) with a high `face` (0.7+) puts the neck on the band: aim at `"ceo.head"` with `face` about 0.35-0.40 instead. Characters under 15 % of the frame height and grazes under 3 frames / 20 x 20 px are ignored. The message gives `cam.face a -> b`, `cam.dist xN` or a sideways move for the actor.
- Typical fixes: aim the camera at the person, move them toward the centre, pull back (`cam.dist`); put a card's target
  (`on`) or `pos` on the side away from the face; raise `cam.dist` on close shots so the hair stays in frame.

**Hook** (`hook.text`): at the top on a white card with a red underline, from frame 0; **≤ 5 words, ≤ 2 lines, exactly one `*word*`** in the accent (red; `"tone": "green"` for a win story). **Put the dollar stake in it** ("THE *$50M* NO"). `until` defaults to the end of line 1 + 0.25 s; `again` brings it back for the loop ending.

**Captions:** the fixed caption band from the layout (portrait: centre y 1344, 170 px side margins), 1-3 words per chunk, white with a thick ink stroke (readable on the dark and light sets), the spoken word in gold. They start at 1.0 s. `"caption": "off"` or a fixed string per shot overrides them.

**Clip QA** runs on every frame × 4 sub-frames: each executive's body and head against the set blockers, kit props (tower, block, boxes) and the other executives; nobody below the floor. Limbs are not tested: hands on the table and legs under it are acting.

**Frame-0 opener (hard FAILs; tools/frame0_hero.mjs, screen space through tools/framing_qa.mjs).** The editor that
scores hooks reads a faceless executive at frame 0 as "nothing", so:
- **F1** the frame-0 subject (the camera target, else the biggest figure) is never a faceless executive seen from
  behind (the camera more than 90° off the way he faces), and a faceless executive at frame 0 always shares the frame
  with a hero prop or a stake-number card;
- **F2** frame 0 shows **a hero prop close-up (≥ 35 % of the frame height)** or **a giant stake board (≥ 50 % of the
  frame width**, a number card with a non-zero digit, fully on);
- **F3** every number card on screen at 0.00 s (board, counter, worth, stamp, a label with a digit) is **fully
  opaque**: start it at `0` or after the first cut.
Each FAIL names the shot, the prop or card, its measured size and the change (cam.dist x…, "scale" x…, `"size": "giant"`,
`"at": 0`, or a ready-to-paste hero prop / giant board). The section "Frame-0 opener" of RECIPE_QA.md lists every hero
prop's frame-0 share and every number card's width and opacity.

**Gate** (hard = FAIL):
- frame 0 has a subject ≥ 50 % of the frame height (or the opener passes);
- the frame-0 opener rules F1-F3 above;
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

- **No real logos, trademarks, trade dress or mascots on screen.** Company names may be spoken and shown as plain text (company card, headline, labels). **Hero-prop labels are generic words only** ("COLA", not a brand; the compiler refuses famous marks), and a prop never copies a product's trade dress (no ribbon on a red can, no blue-and-yellow rental case). Icons are generic pictograms; avoid a company's colour scheme on store fronts (the demo's stores are a varied palette with generic signs).
- **No real people's likeness.** Executives are faceless and generic; name people only in the voice or `sources.md`.
- **No game or TV IP; no copying other creators' styles.**
- **CC0 or procedural assets only.** Everything in this kit is procedural (three.js primitives and canvas textures).
- **Every number is sourced** in `sources.md` and hedged where sources differ.

## 12. Example: the reference Short

`finance/shorts/biz-demo-blockbuster-passed/recipe.json` runs 38.2 s in 15 shots. Facts and hedges are in `sources.md`.

| shot (word) | set | camera | what happens |
|---|---|---|---|
| 0 | boardroom | hookZoom on the rental case | **the hero prop**: a burgundy `case` labelled RENTAL on the table (47 % of the frame height at 0.00 s), the boss behind it, arms folded, then a shrug; hook "THE *$50M* NO" |
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
| `src/biz/hero.tsx` | the hero props (section 8a) + the props-pack theme (`BIZ_PACK_THEME`) |
| `src/props/pack.tsx` | the props pack: 34 shared animals / gadgets / vehicles / everyday hero props, themed per kit (section 8b) |
| `src/props/catalog.json`, `tools/props_catalog.mjs` | every prop kind of law3d / biz3d / cyber3d with kits, description, params, keywords, and a keyword index (generated) |
| `src/biz/types.ts` | the recipe schema |
| `src/biz/compile.ts` | the compiler: lenses (chartFly), the freeze clock, world timelines, label/tag/device layout, audio cues |
| `src/biz/hud.tsx` | hook, captions, labels, chart tags, the story devices |
| `src/biz/film.tsx` | the renderer |
| `src/biz/root.tsx`, `src/index.biz.ts` | compositions: `BizGallery` and every recipe |
| `src/biz/gallery.ts` | the gallery shots and `GALLERY_STILLS` |
| `tools/biz_build.mjs`, `tools/biz_entry.ts` | build, QA and gate |
| `tools/biz_stills.mjs` | batch stills (`gallery`, or a composition's frames) |
| `finance/longform/biz-demo-landscape/` | the landscape test recipe (35.5 s, 3 chapters); its Short: `finance/shorts/biz-demo-landscape-short-1/` |

## 14. Long-form (landscape)

**Chapter cards and the polish rules.** biz3d's chapter card (gold tab, red edge) is the `safe` card: it fades in
instead of sliding in from off screen, the title is one line (fitted down to 56 px), and it takes the first top
(330 / 130 / 560 px) that no device uses during its 2.6 s. Callout labels avoid it. Polish rules P1-P4
(tools/polish_qa.mjs, LONGFORM.md 7a) run on every biz3d recipe. P4 knows the boardroom's nine chair backs (`occluders`
in src/biz/sets.tsx), the table, the warehouse racks and conveyor, and the store blocks. Walls are skipped: they are
one-sided, so an orbit may look through them.

`"format": "landscape"` makes a 1920x1080, 30 fps long-form video with the same rules as the Block Money engine
(LONGFORM.md) and the shared pieces of `src/longform/kit.tsx` / `tools/kit_long.mjs`. Recipes live in
`finance/longform/<slug>/` (recipe.json, script.txt, vo/timings.json); the builder finds them there.

**Fields**

| field | what it does |
|---|---|
| `"format": "landscape"` | the landscape layout (`LAYOUTS.landscape`), composition `<Pascal>Recipe` 1920x1080 in `src/index.biz.ts` |
| `"chapters": [{ "title", "word" }]` | YouTube chapters (landscape only; a compile error in portrait). Each plays the shared 2.6 s chapter card (gold tab, red edge) at its word, or after the hook text for chapter 1, plus a whoosh + impact cue. `chapters.txt` is written next to the recipe. |
| `"beat": true` on a shot | marks a new story beat for the pacing gate (chapters and set changes count by themselves) |
| `hook` | top-centre from frame 0 (top 70, 80 px), the kit's white card with the accent word; the Shorts 5-word limit does not apply |
| `cam.face` | as in portrait; setting it opts the shot out of caption-safe framing |

**What adapts (automatic)**

- Lens: the shared 16:9 rule. The vertical fov is kept and each preset gets `landscapeLens(preset)` = [fov x, dist x]
  (hookZoom / closeUp 1.0, slamZoom / pushIn 0.95, medium / whip / orbit / dolly 0.9, crane 0.85 + dist 0.95, wide 0.8 +
  dist 0.95, chartFly 0.9 by default). The dist factor applies to the preset distance only, as in the engine.
- Captions: the shared lower third (`LowerThirdCaptions`, 7-word phrases, 2 lines in the 1440 px column), the spoken word
  in the kit's gold (as on the Shorts). Caption-safe framing: a shot whose face (in the caption column) lands in the
  band 833-977 px is lifted (its lens `face`, down to 0.26) at compile time; what is left moves the caption centre
  (`lowerThirdY`, per shot). Nothing is baked into the gen file (the kit never bakes, in portrait either).
- Cards: every card, label and chart tag is laid out from `LAYOUTS.landscape`: inside x 80-1840, below y 60 (300 while
  the hook shows) and above y 817 (the caption band). THE DECISION sits high (y 262), so put a stamp under it with
  `"y"` (px of the 1080-tall frame, e.g. 548) and frame the face low (the demo uses `cam.face` 0.68 there).
- Rendering: `BizFilmL` (src/biz/film.tsx): one View, no per-shot key, so the WebGL canvas stays mounted across shots;
  `postScale={1}` so the outline / bloom / DOF keep their Shorts weight. The kit is procedural (no GLB, no fetched
  texture): geometry and materials are cached by fixed names; the hero headline paper (one texture per headline text)
  keeps the last 6 and disposes older ones.

**Commands**

```bash
node tools/recipe_build.mjs biz-demo-landscape --check                # compile + clip QA + the long-form gate
node tools/recipe_build.mjs biz-demo-landscape --check --qa-sample 5  # QA every 5th frame (drafts of a 10-min video)
node tools/recipe_build.mjs biz-demo-landscape                        # gen file, registry, cues, RECIPE_QA.md, chapters.txt
npx remotion still src/index.biz.ts BizDemoLandscapeRecipe out.jpg --frame=130 --scale=0.5 --gl=swangle --timeout=600000
npx remotion render src/index.biz.ts BizDemoLandscapeRecipe out/longform/biz-demo-landscape.mp4 --gl=angle --codec=h264 --crf=18
# a portrait Short from it (the biz3d clip adapter in tools/biz_entry.ts), then the full Shorts gate
node tools/clip_short.mjs biz-demo-landscape --from-word "2:It" --to-word "9:dollars" --out biz-demo-landscape-short-1
node tools/recipe_build.mjs biz-demo-landscape-short-1
```

The long-form gate (`kitLongGate`) gets: every shot (+ `beat`), the visual-change events of this kit (camera hits and
kicks, dropIn / popIn props, pose changes, label and device pop-ins, actions such as crack / dark / drain / slam / draw,
fx), the chapters, the words, the audio, the hook, the lower-third share and the cards' font size / frame edge / band
notes. Shorts keep the kit's full frame-0 gate and every-frame x 4 QA; `--qa-sample` is ignored for them, with a note.

**The clip adapter** (`clipAdapter` in tools/biz_entry.ts) re-times every time field of a biz3d shot (shot `at`,
`cam.hit`, actor `from` / `then[].at`, prop `hit`, action `at` / `until` / `collapse`, device `at` / `until`, fx `at`,
sfx `at`; places stay), keeps the global props that overlap the segment, and makes a fresh frame-0 shot that passes the
frame-0 opener rules: the segment's first executive seated at the boardroom head (arms folded, a shrug + shake at
0.45 s), the hook text (<= 5 words, the `$`/number word in the accent, cut to fit the portrait card), and in front of
him **the source's first hero prop** as a hookZoom close-up (scale 0.8 on the table). With no hero prop in the source,
the stake goes on a **giant board** at frame 0 (the hook's `$` accent word with its unit: "$50" + "MILLION" → "$50M"),
over the executive framed low; with no stake either, a `letter` carrying the hook as its headline. From a landscape
source it drops explicit `cam.face` values, re-places stamps for 9:16 and frames THE DECISION shots so the head stays
above the card (`face` 0.4, `dist` x1.15).

**Limits**

- The sets were built for 9:16. A 16:9 frame shows 3.2x the width at the same height: wide shots of the boardroom and
  warehouse show more of the walls and racks (fine on the sets today), but very wide `dist` values on small sets can
  reach their edges. Check stills.
- The lower third only moves (or lifts the subject) for executives' heads; kit props are never treated as faces.
- The hook card, chapter card and lower-third looks are fixed (the kit's hook card, the shared chapter card).
- The test recipe uses the synthetic timings of the portrait demo (35.5 s); the pacing warnings about length and open
  loops are expected for it.
