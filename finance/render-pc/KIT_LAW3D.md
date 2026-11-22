# KIT_LAW3D: the "weird true court cases" style kit

**What this is.** A recipe kit for the Law channel: real, well-documented bizarre lawsuits and trials told as stories. Each one has the claim nobody believes, the twist, then the verdict. The audience is US adults, 18-45. It tells stories only and never gives legal advice. The look is a **dark, moody, cinematic 3D courtroom**: a warm spotlight on the judge's bench, dust drifting in the light beams, deep navy and wood tones, and **one gold accent**. Paper documents and exhibits fly in, and a gavel slams on the verdict. The cast is simple stylized low-poly people (judge, plaintiff, defendant, lawyer, witness, bailiff, juror silhouettes). Their outfits, colours and nameplates change per case. Every frame moves.

- **Write a Short** as `finance/shorts/<slug>/recipe.json` with `"kit": "law3d"`, plus `script.txt`, `sources.md` and `vo/timings.json`.
- **Build** it with `node tools/recipe_build.mjs <slug>`. A law3d recipe is handed to `tools/law_build.mjs`, which has its own compiler, registry and entry.
- **Block Money and tech3d are never touched.** Their recipes compile exactly as before.
- **Reference recipe:** `finance/shorts/law-demo-54-million-pants/` (Pearson v. Chung, 2005-2007). It is 42.0 s long and passes every check.
- **No motion blur.** The owner renders the plain 30 fps composition only, so this kit registers no `...Sub` composition.

```
finance/shorts/<slug>/recipe.json ("kit": "law3d") + vo/timings.json
        │  node tools/recipe_build.mjs <slug>          (or node tools/law_build.mjs <slug>)
        ▼
src/law/gen/<slug_>.law.gen.ts  →  <Pascal>Recipe in src/index.law.ts
        + clip QA + frame-0 gate + kit rules → finance/shorts/<slug>/RECIPE_QA.md   (exit 1 on a CLIP or a FAIL)
```

## 1. Workflow

1. **Pick a real case and verify it first.** Use court records (opinions, dockets) or major news (AP, Reuters, NYT, WaPo, ABA Journal, NPR). Every number, date and quote in the script goes in `sources.md` with a link. Paraphrase a quote unless you have the exact words, and say so in `sources.md`.
2. **Write `script.txt`.** Put one spoken line on each line. A Short runs 30-55 s, which is about 85-150 words at 2.8 words/s.
   - Line 1 is the hook, and it names the stake ("A judge sued his dry cleaner for $54 million over one pair of pants.").
   - The structure is the claim, then the twist, then the verdict.
   - The last line leads back into line 1, so the Short loops ("All because, one day," → "A judge sued...").
   - In a `"at"` value, a word that is only digits ("2005") reads as seconds, so write it as `"2:2005"` (line 2).
3. **Make timings.**
   - To draft without a voice, run `python tools/make_timings.py script.txt vo/timings.json` from the short's folder (use the path to `finance/render-pc/tools/`).
   - Swap in the real Whisper or ElevenLabs timings later. Shots anchor to words, so nothing else changes.
4. **Write `recipe.json`.** Start from the reference recipe (section 11).
5. **Check without writing anything:** `node tools/recipe_build.mjs <slug> --check`. Fix every `CLIP`, every `FAIL` and every `COMPILE ERROR`. Each message names the bad word, target or anchor and lists the valid ones.
6. **Build:** `node tools/recipe_build.mjs <slug>`. This writes:
   - `src/law/gen/<slug_>.law.gen.ts`;
   - `src/law/registry.gen.ts`;
   - `out/tmp/<slug>.cues.json`, the audio plan for `tools/story_mix.py`;
   - `RECIPE_QA.md`.
7. **Stills.**
   - `node tools/law_stills.mjs <Pascal>Recipe 0 1s 3s mid end --scale 0.5` bundles once and renders the listed frames into `out/law/stills/`.
   - `node tools/law_stills.mjs gallery --scale 0.35` renders every kit piece (src/law/gallery.ts) into the same folder.
   - The GL backend is swangle (CPU) by default. On the PC, set `GL=angle`.
   - Contact sheet: `python tools/tech_review_sheet.py sheet.jpg "shots=out/law/stills/<Pascal>Recipe_*.jpg"`.
8. **Render.**
   - Preview: `npx remotion render src/index.law.ts <Pascal>Recipe out.mp4 --gl=swangle --scale=0.5`.
   - Final: `npx remotion render src/index.law.ts <Pascal>Recipe out.mp4 --gl=angle` on the PC. This is the plain 30 fps composition, with no sub-frames.
9. **Audio:** `STORY_CUES=out/tmp/<slug>.cues.json python tools/story_mix.py <Pascal>Recipe voice.wav <audio_dir> premix.wav`, then `tools/mux_voice.sh`.
   - Cues use only library names: `impact`, `thud`, `boom`, `whoosh`, `ding`. The default music name is `suspense`, so add that track to the library or set `"music"`.

## 2. Palette, light and layout

**Palette (src/law/palette.ts):**

| token | hex | use |
|---|---|---|
| `bg` / `navy` | `#0B1426` / `#0F1C33` | the frame, card backgrounds, caption stroke |
| `wood`, `woodDark`, `woodLight` | `#5A3720`, `#3B2314`, `#8A5A35` | bench, tables, panels |
| `gold` | `#E8B44A` | **the one accent**: the hook word, the spoken caption word, card trims, the verdict stamp, the gavel bands, the $ in counters |
| `cream` | `#FFF4DE` | all text on dark cards and the captions |
| `spot` | `#FFD9A0` | the warm spotlight colour |

**Light.** There is one mood per set: `courtroom`, `evidence`, `casefile`, `headlines` and `steps` (`LAW_MOODS`).
- A low navy hemisphere and a warm key from high in front.
- A cool blue rim from behind, almost no fill, and a heavy navy vignette.
- Every set adds real spotlights through `SpotBeam` (src/law/beam.tsx). Each beam is a three.js spotlight plus a visible additive cone, with dust motes drifting and twinkling inside it.

**Text.**
- Poppins 800 everywhere.
- Text is always DOM overlay, never 3D text. Text on props (signs, headlines, folder tabs, nameplates) is drawn on canvas textures.

**Layout (src/law/layout.ts).** Every screen-space number lives here, once per format:
- the hook position and size;
- the caption band;
- the card safe box;
- the case card, verdict and counter boxes;
- the face fraction each camera preset frames a subject at.

`recipe.format` picks the layout:
- `"short"` (the default) and `"long"` use **portrait 1080x1920**.
- `"landscape"` uses **1920x1080**: long-form, see section 12 "Long-form (landscape)".

The gate's length check is 30-55 s for `"short"` and 5-8 min otherwise.

## 3. Cast (src/law/cast.tsx)

`"cast"` maps an id to a **CastSpec**. Only `role` is required.

```jsonc
"pearson": { "role": "plaintiff", "skin": "#8a5a3c", "hairStyle": "short", "hair": "#3a3634", "suit": "#2e3d5e", "pants": "#26324c",
             "tie": "#7a1f24", "build": "broad", "plate": "PLAINTIFF" },
"mom": { "role": "defendant", "apron": "#2b4f7a", "hairStyle": "bun", "build": "slim", "height": 0.93 }
```

**Roles:** `judge` (a black robe with a white collar), `plaintiff`, `defendant`, `lawyer`, `witness`, `bailiff` and `juror` (a dark silhouette with no face). Role defaults set the outfit colours, and every colour can be overridden.

**Options:** `skin`, `suit`, `pants`, `shirt`, `tie`, `hair`, `hairStyle` (`short`, `side`, `bald`, `long`, `bun`, `curly`, `none`), `glasses`, `beard`, `apron`, `build` (`slim`, `avg`, `broad`), `height` (a multiplier) and `plate` (the text of a nameplate that has `"of": "<id>"`).

**Generic by rule.** Never model a real person's likeness. Real names appear only in the narration and on the case card.

**Faces** are drawn on the head: `neutral`, `stern`, `angry`, `smug`, `shocked`, `sad`, `happy`, `worried`, `crying` (with falling tears). A face swap hides behind a blink.

| pose | what it does | default face |
|---|---|---|
| `idle` | breathing, a slow sway, small head moves | neutral |
| `talk` | both hands gesturing, body turning | neutral |
| `point` | the right arm aims at `pointAt` (default: the camera target if it is someone else, else the lens) | angry |
| `shock` | recoils, hands up by the face, trembling | shocked |
| `slump` | head down, shoulders forward, arms hanging | sad |
| `cheer` | both arms pumping | happy |
| `gavel` | raises the gavel and strikes on every `gavel` action of the shot (the judge holds a gavel) | stern |
| `present` | one hand out, offering something | neutral |
| `cross` | arms crossed | stern |
| `cry` | hands to the face, sobbing | crying |
| `smug` | leans back, chin up, head tilted, arms crossed | smug |

**Pose changes** blend with anticipation and overshoot over 0.34 s. Each change starts 2 frames before its word.

**Actor fields:**
```jsonc
{ "id": "pearson", "pose": "point", "face": "smug", "at": "plaintiff", "pointAt": "pants",
  "then": [{ "at": "sued", "face": "angry" }, { "at": "no", "pose": "smug" }],
  "sit": false, "look": 0, "to": "steps:0,0,0.4", "talk": false, "scale": 1 }
```
- `at` is the floor or platform point under the figure (an anchor or `[x, y, z]`).
- `sit` seats them, for the bench, the witness stand or a table.
- `look` is a yaw in degrees (0 = facing +z, toward the gallery) or a target. By default the figure faces the lens.
- `to` moves them over the shot, and the legs stride while they move.
- `talk: true` lip-syncs the mouth to the voice-over. The default is off, because the voice is a narrator. Use it when the line quotes that person.

## 4. Sets (src/law/sets.tsx)

Every set keeps moving: dust in the beams, flickering practicals, breathing silhouettes, steam and drifting fog.

| set | look | anchors |
|---|---|---|
| `courtroom` | wood-panelled room; the judge's platform and bench under the hero spotlight, a high-back chair, a gold-framed panel (no seal); the witness stand (stage right); plaintiff (stage left) and defense tables with brass lamps; the jury box with six silhouettes; the gallery rail, benches and spectator silhouettes; tall windows with a cool moonlight beam | `bench` (the judge's seat, sit), `benchTop`, `gavel`, `witness` (sit), `witnessRail`, `plaintiff`, `plaintiff2`, `defendant`, `defendant2`, `defendant3`, `pTable`, `dTable`, `podium`, `well`, `jury`, `gallery`, `aisle`, `door`, `centre` |
| `evidence` | a dark room with one evidence table under a hard top light, and shelves of evidence boxes in the back | `table` (the table top), `left`, `right`, `back`, `front`, `high`, `centre` |
| `casefile` | a big wooden desk with a green blotter, folders, photos, a steaming mug, a pen and a brass desk lamp | `desk` (the desk top), `left`, `right`, `back`, `front`, `lamp`, `high`, `centre` |
| `headlines` | a cork wall of newspaper pages (a fictional masthead, generic headlines) with pins and red string; the middle is left free for the recipe's pages | `wall` (the wall surface at eye height), `left`, `right`, `high`, `low`, `floor`, `centre` |
| `steps` | outside the courthouse at night: wide stone steps, six columns, a plain pediment with a gold line, glowing doors, lamp posts, stars and ground fog | `bottom`, `steps` (mid-flight), `top`, `door`, `left`, `right`, `plaza`, `high`, `centre` |

- **Offsets.** An anchor takes an offset, for example `"dTable:-0.55,0.02,0.1"`.
- **Jury.** `"jury": false` on a courtroom shot empties the jury box. Use it for a bench trial: Pearson v. Chung had no jury.
- **Set blockers.** The bench, the witness rail, both tables, the jury rail and the gallery rail are QA boxes, and no figure may enter them. A figure stands behind a table at `plaintiff`/`defendant` (z 1.15) and sits at the bench at `bench`.

## 5. Props (src/law/objects.tsx)

`{ "id": "pants", "kit": "pants", "at": "table", "s": 0.85, "yaw": -12, "motion": "popIn", "hit": "pants" }`

| `kit` | what it is | fields |
|---|---|---|
| `gavel` | a gavel on a sound block with gold bands; it lifts and slams on each `gavel` action (or `hits`) | `hits` |
| `paper` | a document with a title and ruled lines | `text` (the title) |
| `folder` | a manila case folder with a label and a CASE FILE stamp | `text` |
| `photo` | an instant photo | `photo`: `pants`, `shop`, `person`, `blank` |
| `pants` | trousers on a coat hanger (cuffs at the origin, 1.25 m tall at s 1); it floats or stands as an exhibit | `color` |
| `sign` | a shop sign | `text` (use `\n` for 2 lines) |
| `money` | a banded stack of bills | |
| `newspaper` | a page with a headline (fictional masthead) | `text` |
| `nameplate` | a wooden wedge with a gold plate | `text` or `of` (the cast entry's `plate`) |
| `box` | an evidence box with a label | `text` |

| `motion` | what it does |
|---|---|
| `flyIn` | paper flight: comes in from `fromOff` (default `[-2.4, 1.6, 1.4]`), tumbling and fluttering, and settles on `hit` (whoosh) |
| `dropIn` | falls and lands on `hit`, with a kick, an impact and a thud |
| `popIn` | scales in with overshoot, landing on `hit` |
| `float` | hovers and turns slowly (an exhibit in the light) |
| `bob` | gentle float |
| `turntable` | slow spin (`spin` deg/s) |

**Multi-shot props.** Recipe-level `props` with `from`/`until`/`sets` live across shots.

**No real marks.** No logos, seals, flags or real mastheads.

## 6. Story devices and actions (anchored to voice words)

```jsonc
"actions": [
  { "do": "caseCard", "at": "Roy", "until": "suit", "title": "PEARSON v. CHUNG", "year": "2005-2007", "place": "Washington, D.C." },
  { "do": "exhibit",  "at": "pants+0.2", "label": "EXHIBIT A", "text": "THE PANTS", "on": "pants" },
  { "do": "gavel",    "at": "8:no" },
  { "do": "verdict",  "at": "8:no", "until": "reads", "text": "DENIED", "sub": "JUNE 25, 2007" },
  { "do": "counter",  "at": "$54", "title": "DAMAGES SOUGHT", "prefix": "$", "from": 0, "to": 54000000, "dur": 0.9, "pos": "center" },
  { "do": "counter",  "at": "line:9", "title": "DAMAGES AWARDED", "value": "$54,000,000", "to": 54000000, "prefix": "$", "zeroAt": "zero" }
]
```

| action | what it does |
|---|---|
| `caseCard` | a manila case-file card with a tab, a paper insert, the case name, then the year · place in a line below; it slides up (whoosh + thud) |
| `exhibit` | an **EXHIBIT** tag: a gold label over a dark card, ≤ 4 words. With `on` (a prop, person or anchor in the shot), a gold line draws from the exhibit to the card. Cards are placed automatically, off faces and off other cards. |
| `gavel` | a strike: every gavel prop of the shot (or `on`) and the gavel-holding judge slam on `at`, with a camera kick, impact and thud |
| `verdict` | **the verdict reveal**: a big gold stamped word (1-2 words) slams down from 2.4x, squashes, shakes and holds, with a warm flash and a kick (impact + boom). `sub` adds one cream line below it. Pair it with a `gavel` on the same word. |
| `counter` | a number board (gold title strip, cream number, gold $): it counts `from` → `to` over `dur`, or shows a fixed `value`. `zeroAt` drains it to $0 with a pop (the "he got nothing" beat). `compact` writes millions as `54M`. `pos` is `top`, `left`, `right` or `center`. |

**Fx:** `shake`, `flash`, and `papers` (a burst of sheets flying out of `p`).

**One device at a time per spot.** End a counter with `until` before the next one appears in the same `pos`. The gate FAILs cards that overlap each other or the hook.

## 7. Cameras (LAW_CAMS in src/law/compile.ts)

All cameras keep moving. The gate FAILs a Short that has even one frame with a still camera.

**Fields:** `target` is `"<cast id>"` (chest), `"<id>.face"`, `"<id>.head"`, a prop id, an anchor (plus offset) or `[x, y, z]`. The other fields are:
- `az`: azimuth in degrees; 0 = from +z, the gallery side;
- `dist`, `h`, `fov`;
- `face`: where the target sits, as a fraction from the top (the default comes from the layout);
- `hit`;
- `sweep`;
- `roll`;
- `blur`.

| preset | default dist / h / fov | move |
|---|---|---|
| `hookZoom` | 1.25 / 0.05 / 40 | frame 0: from 1.35x out into the close-up in 0.4 s, a landing kick, then a creep |
| `closeUp` | 1.15 / 0.05 / 38 | slow push (faces) |
| `medium` | 2.4 / 0.25 / 42 | slow push |
| `wide` | 7.5 / 1.8 / 50 | slow push (not allowed in the first 1 s) |
| `slamZoom` | 1.6 / 0.1 / 40 | the fov slams from 62 at `hit`, then a creep; impact SFX |
| `pushIn` | 2.6 / 0.3 / 42 | push 0.3 %/f with a punch window |
| `whip` | 2.4 / 0.25 / 44 | the look swings 35° onto the target in 0.22 s; whoosh |
| `orbit` | 3.2 / 0.8 / 42 | orbits `sweep`° (default 36) over the shot |
| `dolly` | 2.6 / 0.35 / 42 | slides sideways `sweep` m (default 1.2) while it keeps aiming |
| `crane` | 4.0 / 0.6 / 44 | rises `sweep` m (default 1.0) and eases in |
| `topDown` | 0.55 / 1.6 / 44 | looks down on a desk, turning slowly and sinking a little (case file, money) |

**Transitions (`"in"`):**
- `punch` (default): fov +7° snapping in plus a small kick.
- `whip`: a 32° swing with a whoosh.
- `cut`.
- slamZoom and whip shots come in as cuts.

**Framing vertical 9:16:**
- A face close-up is `closeUp` / `hookZoom` at `dist` 1.15-1.7 on `<id>.face`.
- Three people behind a table need `medium` at `dist` 3.1-3.2, with the people 0.62 m apart.
- The judge at the bench: `pushIn`/`medium` on `judge.face` at `dist` 2.2, with `h` -0.15 to -0.2 (a low, imposing angle).
- The witness: `orbit` on `<id>.face` at `dist` 1.45.
- The evidence table: `crane`/`pushIn` on `table:0,0.4,0` at `dist` 2.3-3.3. Two signs need `s` ≤ 0.36 at x ±0.23.
- The desk: `topDown` on `desk`.

## 8. Text

**Hook** (`hook.text`):
- At the top, on a dark card with a gold rim and a gold underline, from frame 0.
- **≤ 5 words, ≤ 2 lines** (auto-balanced, or split it with `\n`).
- **Exactly one `*segment*`** in gold, which wiggles. It may be two words: `*$54 MILLION*`.
- `until` defaults to the end of line 1 + 0.25 s.
- `again` brings it back for the loop ending.

**Captions:**
- 1-3 words per chunk, cream with a thick navy stroke; the spoken word is gold.
- They start at 1.0 s.
- `"caption": "off"` or a fixed string per shot overrides them. Turn them off on the verdict stamp and on full-screen counters.
- Portrait band: centre y 1350, ±105 px.

**Hook-safe.** The hook card covers about y 230-490 (2 lines). Frame faces at 0.44-0.46 of the height (the presets do this).

## 9. The build checks (tools/law_build.mjs → RECIPE_QA.md)

**Framing rules (screen space, every output frame; tools/framing_qa.mjs + tools/framing_kits.mjs; same rules as RECIPE_GUIDE.md §4.1).**
Run `node tools/recipe_build.mjs <slug> --check` until the "framing QA" line shows 0 clips and 0 fails. Every message
names the shot, the time, the card / prop / person and what to move where.
- **R1 CLIP, nothing on a head.** No card, board, label, story device, 3D text prop or small prop may overlap a head on
  screen. The head (which now follows the head pitch and yaw, e.g. a slump) includes the hair (short +0.175 m, side +0.2, bun +0.245, curly +0.235 above the head centre). Text counts at any depth; a small prop counts within 0.6 m of the head. Big staging
  objects (half-size > 0.75 m) are skipped.
- **R2 FAIL, the subject in frame.** The subject is the camera's target person, else the shot's `"subject"`, else its only
  person while their head is on screen. In a medium or wide shot, 85 % of the subject's body (left to right) is in
  frame. In a close shot, the head is centred (middle 60 % of the width). The head never touches an edge (11 px). Any
  other person's head is fully in or fully out. The first 0.35 s of a whip-in is skipped.
- **R3 FAIL, cards and boards inside the frame** with a 3 % margin (32 px), once landed (0.3 s after the hit).
- **R4 FAIL, text reads.** Every text colour is at least 4.5:1 against its fill (WCAG). The 3D signs, papers, boxes and nameplates are checked too (cap heights from TEXT3D). The folder's CASE FILE stamp is now `#85241e` (9.3:1; it was 3.0:1). A featured line is at least
  42 px font size (the median while on screen). Long-form uses the same 42 px at 1080 tall; its cards are checked for
  placement and colour only.
- **R5 FAIL (Shorts), frame 0 is a close-up of a face.** The hook is at the kit's full size, and the subject's face is
  at least 16 % of the frame height (307 px). A frame-0 shot on a prop with the person small fails.
- Typical fixes: aim the camera at the person, move them toward the centre, pull back (`cam.dist`); put a card's target
  (`on`) or `pos` on the side away from the face; raise `cam.dist` on close shots so the hair stays in frame.

**Clip QA** runs on every frame × 4 sub-frames and checks:
- every figure's body, legs and head against set blockers and props;
- different people against each other;
- anyone below the floor.

Hands are not checked, because they rest on tables and benches.

**Gate** (hard = FAIL):
- frame 0 has a subject ≥ 50 % of the frame height (a person counts hip to head);
- the hook is ≤ 5 words, ≤ 2 lines, fits, and has exactly one gold segment;
- a person ≥ 15 % and a prop are in view at frame 0;
- the stake (a number, $ or a question) is on screen by 0.5 s;
- the first word comes by 0.2 s;
- there is a sound punch at 0.00 s;
- there are ≥ 2 cuts or hits in the first 3 s;
- music plus an SFX play at frame 0;
- a face changes by 1.5 s;
- there is no wide shot in the first 1 s;
- the first cut comes ≤ 1.25 s;
- faces are clear of the caption band ≥ 90 % of caption time;
- no device card covers a face;
- the hook never covers a face;
- no card overlaps another card or the hook;
- tags and counters sit above the caption band;
- **the camera moves on every frame**.

**Warn:**
- the story devices are used: a case card, an exhibit and a verdict;
- loop ending: the hook comes back and the last shot targets the first shot's subject;
- length.

## 10. Example: the reference Short

`finance/shorts/law-demo-54-million-pants/recipe.json` runs 42.0 s in 19 shots. Its facts are in `sources.md`.

| shot (word) | set | camera | what happens |
|---|---|---|---|
| 0 | courtroom (no jury) | hookZoom on pearson.face | the plaintiff points at the floating pants; hook "*$54 MILLION* FOR PANTS"; face smug → angry |
| "dry" | courtroom (whip) | medium on the family | the three cleaners recoil, shocked |
| "$54" | casefile | topDown | money stacks drop; counter DAMAGES SOUGHT 0 → $54,000,000 |
| "pants" | evidence | crane | the pants pop into the spotlight; EXHIBIT A, THE PANTS |
| "2005" | casefile | topDown | folder and ticket fly in; case card PEARSON v. CHUNG; counter THE ALTERATION $10.50 |
| line 3 | evidence | dolly | the empty table: a claim ticket and no pants |
| "family" | courtroom | dolly | the mother presents the pants they found |
| "These" | courtroom | closeUp | the plaintiff, arms crossed, angry, lip-synced: "not my pants" |
| line 4 | casefile | topDown | three offers drop; counters OFFER 1/2/3 |
| line 4 "He" | courtroom | slamZoom on "no" | the plaintiff goes smug |
| line 5 | evidence | pushIn | the two signs pop in; EXHIBIT B, THE SIGNS |
| line 6 | headlines | dolly | three headlines fly onto the wall; counter $1,500; papers burst on "three" |
| line 7 | courtroom | orbit | on the witness stand: talk → cry on "cried" |
| line 8 | courtroom | pushIn | the judge at the bench, the nameplate in the spotlight |
| "verdict" | courtroom | slamZoom on the gavel | the gavel slams on "no"; the stamp DENIED, JUNE 25, 2007 |
| "reads" | courtroom | medium on the judge | the ruling (lip-synced) |
| line 9 | courtroom | dolly | counter DAMAGES AWARDED $54,000,000 → $0 on "zero"; then ~$1,000 COURT COSTS; shocked → slump |
| "soon" | steps | crane | he walks down the courthouse steps at night; tag NOV. 2007, NOT REAPPOINTED |
| line 10 | courtroom | hookZoom on pearson.face | loop: the hook returns |

## 11. Files

| file | role |
|---|---|
| `src/law/palette.ts` | colours and light moods |
| `src/law/layout.ts` | **every screen-space number**, per format (portrait, landscape) |
| `src/law/cast.tsx` | the figures: roles, outfits, poses, faces, QA boxes |
| `src/law/objects.tsx` | the props (gavel, paper, folder, photo, pants, sign, money, newspaper, nameplate, box) |
| `src/law/beam.tsx` | spotlight + volumetric cone + dust |
| `src/law/sets.tsx` | courtroom, evidence, casefile, headlines, steps |
| `src/law/types.ts` | the recipe schema |
| `src/law/compile.ts` | the compiler: lenses, figure tracks, props, gavel strikes, device layout, audio cues |
| `src/law/hud.tsx` | hook, captions, case card, exhibit tags, verdict stamp, counters |
| `src/law/film.tsx` | the renderer |
| `src/law/root.tsx`, `src/index.law.ts` | compositions: `LawGallery` and every recipe |
| `src/law/gallery.ts` | the gallery shots and `GALLERY_STILLS` |
| `tools/law_build.mjs`, `tools/law_entry.ts` | build, QA and gate |
| `tools/law_stills.mjs` | batch stills (`gallery`, or a composition's frames) |

## 12. Long-form (landscape)

`"format": "landscape"` makes a 1920x1080 long-form video with the same framing and caption rules as every other channel
(LONGFORM.md, shared pieces in `src/longform/kit.tsx` and `tools/kit_long.mjs`). Shorts (`"short"`, `"long"` or no
format) compile, QA and render exactly as before: the generated file, `RECIPE_QA.md` and the cue file of the reference
Short hash the same before and after this change.

**Fields**

| field | what it does |
|---|---|
| `"format": "landscape"` | 1920x1080, composition `<Pascal>Recipe` in `src/index.law.ts` (plain 30 fps, no motion blur) |
| `"chapters": [{ "title", "word" }]` | YouTube chapters (landscape only; a portrait recipe with chapters is a compile error). Each plays the shared 2.6 s chapter sting (gold `CHAPTER n` tab) when its word is spoken; chapter 1 at the first word plays as soon as the hook text has gone. Each card adds a whoosh + impact cue. |
| `"beat": true` on a shot | a new story beat for the pacing gate (chapters and set changes count by themselves) |
| `hook` | the title text, top centre (70 px), one line when it fits (about 28 characters), until the end of line 1. The Shorts hook rules (5 words, one gold word) do not apply; `*gold*` still works. |

**What adapts by itself**

- Layout (`LAYOUTS.landscape`): lower-third captions centred at 905 px (band +-72), 240 px side margins, the spoken
  word in the kit's gold (as on the Shorts), phrases of up to 7 words, 2 lines max. Cards stay above the band
  (bottom 800 px) and inside the frame: the case-file card sits left of centre (x 760, y 598) so a `"top"` counter fits
  above it; exhibit labels are 44 px.
- Camera: three.js keeps the vertical fov, so every preset frames the same height as on a Short; the shared lens rule
  `landscapeLens(preset)` scales the fov (and `crane`'s distance): hookZoom/closeUp x1, slamZoom/pushIn/topDown x0.95,
  medium/whip/orbit/dolly x0.9, crane x0.85 (dist x0.95), wide x0.8 (dist x0.95). An explicit `cam.fov` is scaled too.
- Caption-safe framing: a shot whose face (inside the 1440 px caption column, sampled at 5 points of the shot) lands
  in the band is lifted (the lens `face` fraction, down to 0.26) at compile time; whatever is left moves the caption
  (`lowerThirdY`). A shot with `cam.face` set is never lifted. Nothing is baked into the gen file (law3d never bakes).
- Render: one View at 1920x1080 with `postScale={1}` (the outline / bloom / depth of field keep the Shorts weight); the
  canvas stays mounted across shots. law3d is procedural (no model or texture files to load): geometry, materials
  and canvas textures are cached by a fixed name or by the board text, never by shot or time.

**Commands**

```bash
node tools/recipe_build.mjs <slug> --check [--qa-sample 5]   # finance/longform/<slug> is found automatically
node tools/recipe_build.mjs <slug>                           # gen file, registry, RECIPE_QA.md, chapters.txt, cues
npx remotion still src/index.law.ts <Pascal>Recipe out.jpg --frame=330 --scale=0.5 --gl=swangle --timeout=600000
node tools/clip_short.mjs <slug> --from-word X --to-word Y --out <slug>-short-N [--hook "TEXT"] [--stake "TEXT"]
node tools/recipe_build.mjs <slug>-short-N                   # the law3d Shorts gate
```

The long-form check runs the clip QA on output frames (every Nth with `--qa-sample N`; Shorts ignore it and keep every
frame x 4 sub-frames) and the shared long-form gate: hook at frame 0, first word by 0.5 s, a sound punch, >= 3 chapters
(first at 00:00, each >= 10 s), a visual change every 6 s (cuts, camera hits and gavels, pose/face changes, prop
landings, device pop-ins, a counter draining, fx, chapter cards), a beat every 40 s, lower-third captions (centre >= 75 %
of the height on >= 90 % of caption time). Warnings: shot length, open loops before chapters, text under 30 px (cards
by font size, 3D boards by their projected glyph height), boards off the frame or in the caption band, cards
overlapping each other or the hook, length 8-12 min. Exit 1 on a clip or a hard failure.

The demo is `finance/longform/law-demo-landscape/` (lines 1-8 of the reference Short, 35 s, 3 chapters, 16 shots) and its
Short `finance/shorts/law-demo-landscape-short-1/` (`--from-word "3:They" --to-word "8:demands"`, 26 s).

**The clip adapter** (`clipAdapter` in `tools/law_entry.ts`, used by `tools/clip_short.mjs`): re-times every time field
(shot `at`, `cam.hit`, actor `from` / `then[].at`, prop `hit` / `hits`, action `at` / `until` / `zeroAt`, fx `at`, sfx `at`;
an actor's or prop's `at` and an actor's `to` are places and stay), drops a device that ended before the segment, and
builds a fresh frame-0 shot: a hookZoom on the person seen most in the segment (smug, shocked at 0.45 s, a shake), a
small prop of the case floating by them, and the stake on an `AT STAKE` exhibit tag when the hook has no number (the
face then sits at 0.52 so the tag never covers it). The hook text is cut to 5 words with one gold word (a `$`/number
word, else the longest) and a line break when two words do not fit on one line.

**Limits**

- The clip keeps the source's camera choices: a 16:9 shot with two people far apart, or a board far off-centre, may
  need a hand edit for 9:16 (the law3d Shorts gate reports faces in the caption band and cards over faces).
- No `tag` (top-right label) in law3d.
- The verdict stamp sits over the centre of the frame, as on the Shorts (it covers the gavel it lands on).
- Canvas textures are cached up to 120 and then dropped without being disposed (shared `src/blocky/mat.ts`); a very long
  video with more than 120 different board texts re-creates them.
