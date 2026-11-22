# KIT_CYBER3D: the "Scams & Hacks" style kit

**What this is.** A recipe kit for the channel "Scams & Hacks": true stories of real scams, hacks and data breaches, told like heists. Each story covers the target, the trick, how it unfolded, how they got caught, and how to spot it.

**The look** is a dark cyber-heist thriller:
- a near-black background;
- neon cyan and magenta, plus **one** red that is kept for alerts and money leaving;
- six moody sets;
- a generic hooded figure with **no face**;
- story cards: CASE FILE, a money counter, a countdown, ALERT, and HOW TO SPOT IT.

Every frame moves.

**Audience and rule.** US adults, 18-45, educational. Tell the story at **story level**: what happened and how it ended. A Short is never a how-to: no steps, tools, templates or wording that would help anyone repeat the crime.

**How to use it:**
- **Write a Short** as `finance/shorts/<slug>/recipe.json` with `"kit": "cyber3d"`, plus `script.txt`, `sources.md` and `vo/timings.json`.
- **Build** it with `node tools/recipe_build.mjs <slug>`. A cyber3d recipe is handed to `tools/cyber_build.mjs`, which has its own compiler (`src/cyber/compile.ts`), registry and entry (`src/index.cyber.ts`).
- **Other kits are untouched.** Block Money and tech3d compile exactly as before.
- **Reference recipe:** `finance/shorts/cyber-fake-supplier/` (the $100M+ fake-supplier email scam, 40.8 s). It passes every check.
- **Plain 30 fps.** There is no motion-blur `Sub` composition: this was the owner's decision for the kit. Render `<Pascal>Recipe` directly.

```
finance/shorts/<slug>/recipe.json ("kit": "cyber3d") + vo/timings.json
        │  node tools/recipe_build.mjs <slug>          (or node tools/cyber_build.mjs <slug>)
        ▼
src/cyber/gen/<slug_>.cyber.gen.ts  →  <Pascal>Recipe in src/index.cyber.ts
        + clip QA + frame-0 gate + kit rules (text placement, flash safety, story cards) → RECIPE_QA.md   (exit 1 on a CLIP or a FAIL)
```

## 1. Workflow

1. **Research first.** Every number in the script must be checked against DOJ / FBI releases or major news.
   - Put each claim, its quote and its link in `sources.md`.
   - DOJ often withholds the victims' names ("Victim-1"). Name a company only if a major outlet reports that it confirmed being a victim.
   - Note: justice.gov blocks plain `curl`. Headless Chromium (`require('playwright')`) reads the releases fine.
2. **Write `script.txt`.** Put one spoken line on each line. 35-45 s is about 100-120 words at 2.8 words/s.
   - **Line 1 is the hook with the dollar stake** ("... over $100 million."). The gate checks for a `$` figure in line 1.
   - The beats are: the target → the trick → how it unfolded → how they got caught → how to spot it.
   - The **last line leads back into line 1**, so the Short loops ("Because one email is how" → "One man got Google and Facebook ...").
3. **Make draft timings.** From the short's folder, run `python ../../render-pc/tools/make_timings.py script.txt vo/timings.json`. Swap in the real voice timings later: shots anchor to words, so nothing else changes.
4. **Write `recipe.json`.** Start from the reference recipe (section 11).
5. **Check without writing anything:** `node tools/recipe_build.mjs <slug> --check`. Every error names the bad word, target, part, anchor or city, and lists the valid ones.
6. **Build:** `node tools/recipe_build.mjs <slug>`. This writes:
   - the gen module;
   - `src/cyber/registry.gen.ts`;
   - `out/tmp/<slug>.cues.json`;
   - `RECIPE_QA.md`.
7. **Stills:** `node tools/cyber_stills.mjs <Pascal>Recipe 0 1s mid end --scale 0.5`. It bundles once and writes to `out/cyber/stills/`. The GL backend is swangle (CPU) by default; on the PC, set `GL=angle`. Run `node tools/cyber_stills.mjs gallery` for every kit piece.
8. **Contact sheet:** `python tools/tech_review_sheet.py out/cyber/sheet.jpg "demo=out/cyber/stills/<Pascal>Recipe_f*.jpg" "gallery=out/cyber/stills/[a-z]*.jpg"`.
9. **Render:**
   - Preview: `npx remotion render src/index.cyber.ts <Pascal>Recipe out.mp4 --gl=swangle --scale=0.5`.
   - Final: the same command at scale 1, with `--gl=angle` on the GPU PC.
10. **Audio:** `STORY_CUES=out/tmp/<slug>.cues.json python tools/story_mix.py <Pascal>Recipe voice.wav <audio_dir> premix.wav`, then `tools/mux_voice.sh`.
    - The cues use the existing library names: impact, whoosh, boom, thud, ding, beep, buzz, alarm, clock, cash, paper, punch, slide.
    - The music defaults to `upbeat` (the only bed in the library today). Set `"music"` to a darker bed once one is added.

**`At` gotcha.** A bare number is **seconds**. To anchor to a spoken year or number, prefix the line: `"6:2013"`, not `"2013"`. The compiler refuses a bare 3+ digit string. A word that appears twice takes `"<line>:word"` or `"word#2"` (for example, the first "over" is in the hook line).

## 2. Layout: one place, two frames (src/cyber/layout.ts)

Every screen number lives in `LAYOUTS`: the hook, the caption band, the safe box for cards, label size, boards, and each story card's rect.

| frame | size | when |
|---|---|---|
| `portrait` | 1080 x 1920 | the default (Shorts); rendered and QA'd |
| `landscape` | 1920 x 1080 | `"format": "landscape"` (the engine/longform convention) or `"frame": "landscape"` |

- The compiler, the HUD, the gate, `project()` and the composition size all read `layoutOf(recipe)`.
- Text scales by `L.k` (portrait 1; landscape 1 too: a 1080-tall frame shows text as large as a Short does).
- The gate also compiles every Short in landscape ("the landscape layout compiles"). Long-form landscape: section 14.

## 3. Palette and light (src/cyber/palette.ts)

| token | hex | use |
|---|---|---|
| `bg` | `#05070D` | the near-black background |
| `cyan` | `#19E6FF` | the primary neon: the hook's key word, the active caption word, label edges, the checklist, packets |
| `magenta` | `#FF2BD6` | the second neon: the hook underline, routes, rim light, accents |
| `red` | `#FF2A3D` | **only** for alerts, the phishing email, money leaving, countdowns, "fake" labels, the CAUGHT stamp |
| `white` | `#EAF6FF` | text |
| `dim` | `#6F86A8` | small card captions |

**Light.** There is one dark mood per set: a low cool hemisphere, a cyan key, a magenta rim, deep fog, and strong bloom (threshold 0.62) so emissive and neon parts glow.

**Text.**
- Poppins 800 everywhere, always DOM overlay.
- Labels are 50 px, captions 80 px, the hook 96 px (portrait).
- The gate fails anything under 40 px.

## 4. Sets (src/cyber/sets.tsx)

Everything is procedural: canvas textures and primitives, with no logos, seals or brands. Every set keeps moving: code scrolls, LEDs step, scan lines sweep, nodes pulse, dust and data bits drift, the string sways.

| set | look | anchors |
|---|---|---|
| `room` | dim hacker room: desk, three monitors with scrolling code, a corner rack, a magenta wall strip, a far-city window | `seat` (put the figure here, `yaw: 180`), `desk`, `screens`, `keyboard`, `left`, `right`, `door`, `high`, `centre` |
| `vault` | black reflective grid floor, cyan + magenta stage rings, data columns far off; the stage for the `vault` object | `centre`, `stage`, `front`, `left`, `right`, `high` |
| `netmap` | a dotted stylised world map (48 x 24 m, equirectangular) with graticule, a scan meridian and glowing city nodes | cities: `svalley`, `newyork`, `taiwan`, `latvia`, `lithuania`, `cyprus`, `slovakia`, `hungary`, `hongkong`, `london`; plus `europe`, `asia`, `usa`, `atlantic`, `centre` |
| `inbox` | a wall of 7 x 8 email tiles (generic subjects) with a scan line; slot `phish` is left empty for the red email | `wall`, `phish`, `front`, `left`, `right`, `high`, `centre` |
| `evidence` | a dark cork board with pinned photo (a faceless silhouette), documents (FAKE stamp), notes, a map, red string, and a warm lamp. Generic: no agency names or seals. | pins: `suspect`, `invoice`, `email`, `bank`, `map`, `note`, `stamp`, `cyprus`; plus `board`, `front`, `left`, `right`, `centre` |
| `servers` | a corridor of racks with blinking LEDs, cyan ceiling strips, magenta floor guides, data pulses running down the floor | `start [0,0,4]`, `mid [0,0,-8]`, `end [0,0,-24]`, `left`, `right`, `high`, `centre` |

- **Offsets.** Anchors take an offset: `"latvia:0,0.5,0"`.
- **New cities.** Add a city to `CITIES` as `[lon, lat]`.
- **Set blockers** (QA boxes): `room.desk`, `servers.racksL/R`.

## 5. The figure (src/cyber/figure.tsx), kit `"figure"`

A generic hooded person: a low-poly hoodie, a black void where the face would be, and a chair. It has no identity and no likeness of anyone. **Never present it as the real defendant.**

`{ "id": "hk", "kit": "figure", "at": "seat", "yaw": 180, "pose": "type", "then": [{ "at": "how", "pose": "turn" }] }`

| pose | what it does |
|---|---|
| `type` | seated, hands tapping the keyboard, breathing |
| `idle` | seated, hands in the lap |
| `lean` | seated, leaning into the screens |
| `turn` | the hood slowly turns toward the side (and the lens) |
| `stand` | standing (no chair) |

- Poses blend over 0.45 s.
- Camera targets: `"hk.head"`, `"hk.hands"`, `"hk.body"`.
- The gate keeps the hood out of the caption band and from under the hook, labels and cards, exactly as it does for BOLT's screen face.

**Framing (portrait).** For a hook close-up, use `hookZoom` on `hk.head` with `dist` 1.6, `h` 0.1, `az` -105 (a side profile, monitors glowing on the hood) and `face` 0.46. Behind the figure (`az` 140) the chair back hides the hood: avoid it.

## 6. BOLT, optional narrator

`"cast": { "bolt": "BOLT" }` adds the tech3d robot (src/tech/bolt.tsx, same poses and faces, see KIT_TECH3D.md §3) as a side-character.
- Its white shell picks up the dark rig's cyan key and magenta rim, and its mint screen glows.
- Gallery still: `bolt-relit`.
- Use it sparingly, never as the star. The demo does not use it.
- The face-change rule is only a warning in this kit.

## 7. Objects and kit props

**Cutaway object `vault`** (src/cyber/objects.ts) is built with the tech3d CUTAWAY system, so `explode`, `assemble`, `slice`, `highlight` and `label` work as in KIT_TECH3D.md §5-6.
- It is a front wall of data blocks around a round door (`ring` "VAULT DOOR", `door`, `wheel`, `lock` "LOCK").
- Side and top block walls are `sL..`, `sR..`, `t..`.
- `back` and `floor`.
- Nine glowing "money" cubes `cash0..8` (`cash4` "THE MONEY").
- `explode` blows the blocks out and the money cubes fly. Frame it with `explodeOrbit`, `dist` 7-7.6, `h` 1.6, `az` 18-25.
- The highlight glow is tech3d's orange (shared code).

| `kit` | fields | what it is |
|---|---|---|
| `figure` | `pose`, `then` | the hooded figure (section 5) |
| `route` | `from` (a city), `to` [cities], `hit`, `color` (default magenta) | arcs draw city to city (staggered 0.18 s), then packets with trails fly along them in a loop; a ring pulses at each arrival |
| `email` | `text` (subject), `phish`, `hit`, `motion: "slideOut"` | an email tile. `phish: true` turns it red from `hit`, with a slow red glow (about 0.5 Hz) and a red light. Put it `at: "phish"` to fill the empty wall slot. `slideOut` pulls it 0.65 m off the wall and scales it up. |
| `string` | `from` (a pin), `to` [a pin], `hit` | a red string grows between two evidence pins in 0.5 s |
| `signal` | `color`, `s` | expanding pulse rings (lie flat on the map) |
| `block` | `size`, `color` | a neon-edged box |

**Motions:** `turntable`, `bob`, `popIn`, `dropIn`, `path` (eased per leg), `slideOut`.

## 8. Story devices (DOM, recipe level, rects from the layout)

```jsonc
"caseFile":  [{ "at": "arrested", "until": "Five-0.1", "name": "E. Rimasauskas", "year": "2013-2015", "amount": "$120M+", "status": "CAUGHT" }],
"money":     [{ "at": "6:2013", "until": "line:7", "label": "WIRED OUT", "from": 0, "to": 120000000, "dur": 2.0 }],
"countdown": [{ "at": "invoices,", "until": "lineEnd:5+0.2", "label": "PAY WITHIN", "from": 86400, "rate": 2400 }],
"alerts":    [{ "at": "6:Over", "text": "ALERT" }],
"checklist": { "at": "Spot", "items": ["NEW BANK DETAILS", "CHECK THE SENDER", "CALL A KNOWN NUMBER"], "ticks": ["bank", "Call-0.2", "number"] }
```

| device | look |
|---|---|
| **CASE FILE** | A dark glass card with a cyan header, rows NAME / YEARS / STOLEN typed out terminal-style (STOLEN in red), and an optional red rubber stamp (`status`) that slams in at +1.0 s. Optional `title`. |
| **money counter** | A big white number with a red glow, counting from → to over `dur` (eased). Its red bar **drains** as the money leaves. Optional `prefix` (default `$`), `suffix`, `decimals`. |
| **countdown** | Red HH:MM:SS ticking down from `from` seconds at `rate` per real second (urgency). |
| **ALERT** | A red banner with a warning triangle, and a soft red edge wash. It is a single pulse (in 0.15 s, out 0.5 s, 1.1 s total, peak 0.32). It never flashes the whole frame. |
| **HOW TO SPOT IT** | 2-4 items, ≤ 5 words each. Each ticks (an animated check plus a ding) on its `ticks` word, or every 0.6 s. The gate wants it in the last 40 % of the Short. |

Labels are placed around the visible cards. All cards sit above the caption band, and the gate checks this.

## 9. Cameras and transitions (CYBER_CAMS in src/cyber/compile.ts)

The tech3d presets carry over (`hookZoom`, `closeUp`, `medium`, `wide`, `slamZoom`, `pushIn`, `whip`, `orbit`, `flyThrough`, `explodeOrbit`; fields as in KIT_TECH3D.md §8), plus two new ones:

| preset | default dist / h / fov | move |
|---|---|---|
| `drift` | 3.4 / 0.6 / 44 | a slow sideways slide (`sweep` metres, default 0.9) with a creep in: the surveillance feel |
| `crane` | 5.0 / 1.2 / 46 | rises by 0.55 x dist and closes in 15 % over the shot: reveals a map or a board |

`flyThrough` also takes `to` (a place) to travel along a path, for example down the server corridor.

**Transitions (`"in"`):**
- **`glitch` (the default):** 0.22 s of low-opacity cyan/magenta slices hopping every 2 frames, a few px of horizontal jitter, a light RGB split on the hook, a 4° fov punch, and a quiet `buzz`.
- `punch`.
- `whip`.
- `cut`. slamZoom and whip shots come in as cuts.

**Flash safety (hard gate):**
- no more than **2** glitch/alert events in any 1 s;
- glitch peak ≤ 0.6 and alert wash ≤ 0.35;
- no white full-frame flash exists in this kit.

**Framing (portrait):**
- **netmap:** a city close-up is `pushIn`/`orbit` `dist` 3.2-3.4, `h` 1.9-2.2. Europe with the routes out is `crane` on `"europe:3,0.3,1.5"`, `dist` 6.5, `h` 3.6.
- **inbox:** the phish close-up is `pushIn` on the email prop, `dist` 2.3. The wall is `drift` on `wall`, `dist` 4.8.
- **evidence:** the board is `drift` on `"board:0,-0.1,0"`, `dist` 4.6. The suspect pin is `orbit`, `dist` 2.6.
- **servers:** `flyThrough` on `"mid:0,1.3,0"`, `dist` 11, `endDist` 3.5.

## 10. Text

**Hook:**
- A dark glass card with a cyan edge and a magenta underline, at the top from frame 0.
- ≤ 5 words, ≤ 2 lines, **exactly one `*word*`**, which shows in neon cyan. Make it the dollar stake: `"THE *$100M* EMAIL"`.
- `again` brings it back for the loop.

**Captions:**
- Word captions, centred at y 1344 (portrait), white with a thick black stroke; the spoken word glows cyan.
- They start at 1.0 s.
- `"caption": "off"` or a fixed string per shot overrides them.

**Labels:** ≤ 3 words, one at a time (≥ 0.3 s apart). `"tone": "red"` is for fakes and danger.

**Boards:** `{ "title", "at", "count" | "value", "pos": "left"|"right"|"top", "tone": "cyan"|"magenta"|"red" }`.

## 11. The build checks (tools/cyber_build.mjs → RECIPE_QA.md)

**Framing rules (screen space, every output frame; tools/framing_qa.mjs + tools/framing_kits.mjs; same rules as RECIPE_GUIDE.md §4.1).**
Run `node tools/recipe_build.mjs <slug> --check` until the "framing QA" line shows 0 clips and 0 fails. Every message
names the shot, the time, the card / prop / person and what to move where.
- **R1 CLIP, nothing on a head.** No card, board, label, story device, 3D text prop or small prop may overlap a head on
  screen. The head includes BOLT's shell, ears and antenna, and the hooded figure's hood (+0.19 m). Text counts at any depth; a small prop counts within 0.6 m of the head. Big staging
  objects (half-size > 0.75 m) are skipped.
- **R2 FAIL, the subject in frame.** The subject is the camera's target person, else the shot's `"subject"`, else its only
  person while their head is on screen. In a medium or wide shot, 85 % of the subject's body (left to right) is in
  frame. In a close shot, the head is centred (middle 60 % of the width). The head never touches an edge (11 px). Any
  other person's head is fully in or fully out. The first 0.35 s of a whip-in is skipped.
- **R3 FAIL, cards and boards inside the frame** with a 3 % margin (32 px), once landed (0.3 s after the hit).
- **R4 FAIL, text reads.** Every text colour is at least 4.5:1 against its fill (WCAG). Email tiles (3D) are checked too: keep the subject short, because the tile text is small; scale the tile (`s`) or move the camera in. A featured line is at least
  42 px font size (the median while on screen). Long-form uses the same 42 px at 1080 tall; its cards are checked for
  placement and colour only.
- **R5 FAIL (Shorts), frame 0 is a close-up of a face.** The hook is at the kit's full size, and the subject's face is
  at least 16 % of the frame height (307 px). A frame-0 shot on a prop with the person small fails.
- Typical fixes: aim the camera at the person, move them toward the centre, pull back (`cam.dist`); put a card's target
  (`on`) or `pos` on the side away from the face; raise `cam.dist` on close shots so the hood or antenna stays in frame.

**Clip QA** runs on every frame x 4 sub-frames. It checks:
- vault parts, the figure, kit blocks and set blockers against BOLT;
- BOLT below the ground;
- grounded objects below the floor.

**Gate** (hard = FAIL):
- a subject ≥ 50 % of the frame height at frame 0;
- the hook rules;
- **the dollar stake**: a `$` figure in line 1 and on screen by 0.5 s;
- the figure or BOLT ≥ 15 % at frame 0;
- the first word by 0.2 s;
- a sound punch at 0;
- ≥ 2 cuts or hits in the first 3 s;
- music plus an SFX at 0;
- no wide shot in the first 1 s;
- the first cut ≤ 1.25 s;
- faces (BOLT's screen, the figure's hood) out of the caption band ≥ 90 % of caption time;
- labels one at a time;
- no label, board or card over a face, and the hook never over a face;
- labels never over a board or card;
- labels and cards above the caption band;
- **the camera moves on every frame**;
- **flash safety**;
- **text ≥ 40 px**;
- **the landscape layout compiles**.

**Warn:**
- a CASE FILE card, and HOW TO SPOT IT in the last 40 %;
- BOLT's face change, if BOLT is at frame 0;
- the loop ending;
- length 30-55 s.

## 12. The reference Short: `cyber-fake-supplier` (40.8 s, 15 shots)

| shot (word) | set | camera | what happens |
|---|---|---|---|
| 0 | room | hookZoom on hk.head (profile) | the hooded figure types; hook "THE *$100M* EMAIL" |
| "Google" | netmap | pushIn on svalley | GOOGLE, then FACEBOOK labels |
| "wire" | vault | slamZoom | board WIRED $0→$100M+ |
| "He" (line 2) | room | drift | the figure leans in, then types on "sent" |
| "sent" | inbox | drift on the wall | the wall of emails |
| "Both" | netmap | crane on Taiwan | a cyan route Silicon Valley → Taiwan; REAL SUPPLIER |
| "So" | netmap | orbit on Latvia | a red signal; LATVIA, then SAME NAME (red) |
| "Then" | inbox | pushIn on the phish | "New bank details" slides out red; countdown PAY WITHIN; FAKE INVOICE, FAKE STAMPS |
| "From" | vault | explodeOrbit | money counter WIRED OUT → $120,000,000; the vault explodes on "paid."; ALERT on "Over" |
| "scattered" | netmap | crane over Europe | routes Latvia → Cyprus, Slovakia, Hungary, Hong Kong; HONG KONG |
| "But" | servers | flyThrough | the trail |
| "2017," | evidence | drift on the board | a new red string; CASE FILE card, CAUGHT stamp |
| "Extradited" | evidence | orbit on the suspect pin | board SENTENCE 5 YRS (red) |
| "Spot" | inbox | drift on the red email | HOW TO SPOT IT: three ticks |
| "Because" | room | hookZoom (as frame 0) | the hood turns on "how"; the hook returns on "one" → loops to line 1 |

## 13. Files

| file | role |
|---|---|
| `src/cyber/layout.ts` | **every screen number**, portrait and landscape |
| `src/cyber/palette.ts` | colours and the six dark moods |
| `src/cyber/figure.tsx` | the hooded figure: poses, rig, QA boxes |
| `src/cyber/objects.ts` | the `vault` cutaway object |
| `src/cyber/sets.tsx` | room, vault, netmap, inbox, evidence, servers; `CITIES`, `PINS` |
| `src/cyber/types.ts` | the recipe schema |
| `src/cyber/compile.ts` | the compiler: lenses, tracks, cutaway timelines, label layout, story devices, flash events, audio cues |
| `src/cyber/hud.tsx` | hook, captions, labels, boards, story cards, glitch, alert wash |
| `src/cyber/film.tsx` | the renderer (plain 30 fps): the portrait film and the long-form landscape film |
| `src/cyber/clip.ts` | the clip adapter (`clipAdapter`, re-exported by `tools/cyber_entry.ts`) for `tools/clip_short.mjs` |
| `src/cyber/root.tsx`, `src/index.cyber.ts` | compositions: `CyberGallery` and every recipe |
| `src/cyber/gallery.ts` | the gallery shots and `GALLERY_STILLS` |
| `tools/cyber_build.mjs`, `tools/cyber_entry.ts` | build, QA and gate |
| `tools/cyber_stills.mjs` | batch stills (`gallery`, or a composition's frames) |
| reused | `src/tech/bolt.tsx` (BOLT), `src/tech/cutaway.tsx` (the parts system), `tools/tech_review_sheet.py` (contact sheet), the engine's View and post chain |

## 14. Long-form (landscape)

A cyber3d recipe renders as a 1920x1080 long-form video with the same framing and caption rules as every other channel
(LONGFORM.md, shared pieces in `src/longform/kit.tsx` and `tools/kit_long.mjs`). The demo is
`finance/longform/cyber-demo-landscape/` (33.2 s, 13 shots, 3 chapters: the first 9 lines of `cyber-fake-supplier`),
and its Short is `finance/shorts/cyber-demo-landscape-short-1/`.

**Fields**

| field | what it does |
|---|---|
| `"format": "landscape"` (or `"frame": "landscape"`, an alias) | 1920x1080, composition `<Pascal>Recipe` in `src/index.cyber.ts` (plain 30 fps); the long-form gate instead of the Shorts gate |
| `"chapters": [{ "title", "word" }]` | landscape only (a compile error in portrait). A 2.6 s chapter card (cyan tab, magenta edge) at each chapter word, after the hook if chapter 1 starts under it; a whoosh + impact cue each; `chapters.txt` next to the recipe |
| `"beat": true` on a shot | a new story beat for the pacing gate (chapters and set changes count by themselves) |
| `hook` | top centre (top 70 px, 80 px type), until the end of line 1 (or `until`); the 5-word / `$` rules of a Short do not apply |
| captions | lower-third phrases of up to 7 words (2 lines, the 1440 px column), the spoken word in neon cyan as on the Shorts; nothing to set |

**What adapts (automatic)**

- Lens: the vertical fov is kept; each preset gets `landscapeLens(preset)` (fov x, preset dist x; `drift` counts as
  `medium`, 0.9). An explicit `cam.fov` is scaled too; an explicit `cam.dist` is kept. slamZoom's 60° start scales the same.
- Caption-safe framing: a shot whose face (BOLT's screen, the figure's hood) in the caption column lands in the
  lower-third band (833-977 px) gets its subject lifted (the lens's `face` fraction, down to 0.26) at compile time,
  unless the recipe sets `cam.face`. Nothing is baked into the gen file. What is left moves the lower third
  (`lowerThirdY`: 400-940 px); the report lists lifts and moves.
- Layout (`LAYOUTS.landscape`): caption centre 905, band ±72, side 240; cards and labels in the safe box y 90-800 (hook
  up: 320-800), x 60-1860; the story cards sit right of centre (case file, money, checklist, countdown at x 1370) so the
  subject can stay left/centre; the ALERT banner sits on the money card as in portrait.
- Film: one `View` 1920x1080 with `postScale={1}` (the post chain keeps its 1080 weight), never re-keyed per shot (the
  canvas and its shaders survive every cut). Everything is procedural: no model or texture file is fetched, so there is
  nothing to window. Per-text caches are bounded: email tile textures live in their own LRU (48, disposed on eviction);
  the cutaway state cache clears at 4,000; material and geometry caches are keyed by value and capped.
- `shotAt` is a binary search.

**Commands**

```bash
cd finance/render-pc
node tools/recipe_build.mjs cyber-demo-landscape --check                 # compile + clip QA + long-form gate (~0.3 s)
node tools/recipe_build.mjs cyber-demo-landscape --check --qa-sample 5   # clip QA on every 5th frame (long drafts)
node tools/recipe_build.mjs cyber-demo-landscape                         # gen + registry + RECIPE_QA.md + chapters.txt + cues
npx remotion still src/index.cyber.ts CyberDemoLandscapeRecipe out.jpg --frame=330 --scale=0.5 --gl=swangle
npx remotion render src/index.cyber.ts CyberDemoLandscapeRecipe out/longform/cyber-demo-landscape.mp4 --gl=angle --codec=h264 --crf=18
node tools/clip_short.mjs cyber-demo-landscape --from-word "1:One" --to-word "8:authorities" --out cyber-demo-landscape-short-1
node tools/recipe_build.mjs cyber-demo-landscape-short-1                 # the full Shorts gate (frame-0 rules)
```

**The long-form gate** (`kitLongGate`, hard unless noted): hook at frame 0, first word by 0.5 s, sound punch + music
at 0, >= 3 chapters from the first word, each >= 10 s, a visual change every 6 s (cuts, camera hits and kicks, prop
motions, figure poses, BOLT face/pose changes, labels, boards, cutaway actions, story cards, fx, chapter cards), a beat
every 40 s, lower-third captions >= 90 %; warns for shot length, open loops before chapters, text size (the headline
text of every card >= 30 px glyphs), cards inside the frame and out of the caption band, length 8-12 min. Kit rows on
top: flash safety (hard), text off faces, labels one at a time, a moving camera (warns). Exit 1 on a clip or a hard fail.

**Clips** (`src/cyber/clip.ts`): every `At` of a shot is re-anchored (shot `at`, `cam.hit`, BOLT `from` / `then[].at`,
prop `hit` / `then[].at` / `path` times, actions `at`/`until`, boards `at`/`until`, fx and sfx `at`); places are not.
Story devices and global props in the segment are re-timed, the rest dropped. The hook text is cut to <= 5 words that
fit two portrait lines, with the `$`/number word in neon. The frame-0 shot is a hookZoom on the hooded figure (its source
shot's place, or the room's seat; BOLT when the source shot only has BOLT) with the stake on a top board from frame 0,
a pose change + shake at 0.45 s, cut at 1.0 s. Pick segments whose line 1 says a `$` figure (the stake rule).

**Limits**

- Text cards are DOM at fixed sizes: a card never shrinks for a busy frame, and labels are placed once per label.
- The landscape demo reuses the portrait camera choices through the lens rule; wide netmap / vault shots show more set
  at the sides (the sets are built wide enough, but very low `h` values can show the floor edge).
- The clip keeps the source's cameras (no portrait refit of 3D email tiles); a 16:9 shot built around a wide layout may
  need a hand edit for 9:16.
- A Short cut from the 33 s demo is at most ~30 s, under the kit's 30-55 s Shorts rule (a warn).
- The figure has no face: "face change" at frame 0 is a pose change of the hood (BOLT changes face when he is the subject).

