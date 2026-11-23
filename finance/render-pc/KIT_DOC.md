# KIT_DOC.md: the documentary long-form kit ("doc")

The doc kit makes 9-12 minute landscape videos (1920x1080, 30 fps, no motion blur) for the law, biz and cyber
channels. A video is a run of **scenes**. Nine scene types are 2D documentary graphics (map, timeline, document,
quote, compare, chart, evidence board, recap, stat). The tenth, `scene3d`, is one shot from the channel's existing 3D
kit (law3d, biz3d or cyber3d) for the human moments. The 3D kits are used as they are: the doc builder turns every
`scene3d` scene into a shot of a kit recipe and renders it with the kit's own film.

Why it exists: long videos built only from the Shorts kits looped the same 3-5 rooms, played big lines over empty sets,
and spoke numbers that never appeared on screen. The doc kit fixes this by construction (more scene types) and by
gates (the variety, number, budget and wording rules below). Every FAIL line says what to change.

The writer is an LLM that writes **one chapter at a time** from that chapter's script lines and word timings. The
schema is small, flat and fully validated.

## 1. Files and commands

```
finance/longform/<slug>/
  doc.json            the video: theme, hook, chapter outline, 3D cast, sources, beats, exemptions
  chapters/01.json    chapter 1's scenes (one file per chapter, written one at a time)
  chapters/02.json    ...
  vo/timings.json     the WHOLE voice-over (global word timings; every "at" is a word of it)
  script.txt          the script (one line per voice line; make_timings.py makes draft timings from it)
```

```bash
cd finance/render-pc
node tools/recipe_build.mjs <slug> --check --chapter 2    # check ONE chapter (the other files may not exist yet)
node tools/recipe_build.mjs <slug> --check                # check every chapter AND the whole video; writes nothing
node tools/recipe_build.mjs <slug>                        # + src/doc/gen, the registry, RECIPE_QA.md, chapters.txt, cues
node tools/doc_stills.mjs <slug>                          # start / mid / end stills of every scene type
npx remotion render src/index.doc.ts <Pascal>Doc out/longform/<slug>.mp4 --gl=angle --concurrency=8 --codec=h264 --crf=18 --pixel-format=yuv420p
STORY_CUES=out/tmp/<slug>.cues.json python tools/story_mix.py <Pascal>Doc voice.wav <audio_dir> premix.wav
bash tools/mux_voice.sh out/longform/<slug>.mp4 premix.wav out/longform/<slug>_final.mp4
```

`recipe_build.mjs` sends a folder that has `doc.json` (and no `recipe.json`) to `tools/doc_build.mjs`. `<Pascal>` is the
slug in PascalCase plus `Doc` (`pearson-doc` -> `PearsonDocDoc`). `--qa-sample N` checks every Nth frame of the 3D shots
(drafts). Exit code 1 means at least one FAIL.

## 2. doc.json

```jsonc
{
  "kit": "doc", "slug": "pearson-doc",
  "theme": "law",                                  // law (wood / navy / gold, 3D kit law3d) | biz (bright, biz3d) | cyber (neon dark, cyber3d)
  "music": "suspense",
  "hook": { "text": "*$54 MILLION* FOR PANTS" },  // cold-open title, top centre from frame 0: <= 6 words, exactly one *accent* word
  "voice": { "timings": "vo/timings.json" },
  "chapters": [                                    // the outline, decided BEFORE any chapter is written; >= 3
    { "file": "chapters/01.json", "title": "The Missing Pants", "from": "1:A", "card": "7:In" },
    { "file": "chapters/02.json", "title": "The $67 Million Demand", "from": "14:The" },
    { "file": "chapters/03.json", "title": "The Verdict", "from": "22:The" }
  ],
  "kit3d": { "cast": { "pearson": { "role": "plaintiff", ... } } },   // merged into the 3D kit recipe (its "cast" etc.)
  "sources": ["Pearson v. Chung, Superior Court of the District of Columbia; ruling of June 25, 2007 ..."],
  "beats": ["23:cried"],                           // optional extra big-beat words (scenes can also say "beat": true)
  "numberExempt": [{ "word": "5:three", "why": "a count of owners, not a figure" }]   // optional, each with a reason
}
```

- `from`: the word each chapter starts on (its YouTube timestamp). Chapter 1 starts at the first word.
- `card`: when the chapter's title card plays (default `from`). No card may play in the first 30 s, so chapter 1's
  `card` is the first word after the cold open.
- `sources`: the facts behind the video. Names, places, dates and numbers on screen must be in the script or here.

## 3. A chapter file

```jsonc
{ "chapter": 2, "heroSet": "evidence", "scenes": [ { "at": "14:The", "type": "chart", ... }, ... ] }
```

- `scenes` are in time order. Each starts at its `at` and runs to the next scene; the last one runs to the next
  chapter's `from`. The first scene's `at` is the chapter's `from`.
- `heroSet`: the chapter's main 3D set, which must be its most-used set (by time). It is required when the chapter has
  `scene3d` shots.

### Fields every scene has

| field | meaning |
|---|---|
| `at` | the start: a voice word `"$54"`, `"3:The"` (the word on line 3), `"word#2"` (its 2nd use), `"line:7"`, `"end:pants"`, `"word+0.2"`, or seconds |
| `type` | map, timeline, document, quote, compare, chart, evidenceboard, recap, stat, scene3d |
| `beat` | `true` on a BIG BEAT line: must be scene3d with people, document, quote or compare |
| `move` | 2D only: the slow camera, `push` / `pull` / `panL` / `panR` / `drift` / `rise` (default per type) |
| `caption` | `"off"` hides the word captions during the scene |
| `id` | a name (a tease's payoff) |
| `tease` | cold open only: the `id` of the later scene that shows this moment in full |
| `note` | free text |

Text is written in normal case; the engine sets it in upper case where the design does. All 2D text is measured
(Poppins 800 widths) and shrinks to fit. A line that would need less than 42 px (secondary lines: 32 px) FAILS with
the number of characters that fit.

### The scene types

**stat**: one giant number with a caption. The value is shown final, never counted.
```json
{ "at": "2:Not", "type": "stat", "value": "$54,000,000", "label": "Damages sought", "sub": "for one pair of pants" }
```

**compare**: side by side. The right side appears at `rightAt` (default 40 % into the scene). `win` is optional
(`"left"` / `"right"`) and draws a highlight.
```json
{ "at": "25:unreasonable", "type": "compare", "title": "The outcome", "left": { "label": "Demanded", "value": "$54,000,000" },
  "right": { "label": "Awarded", "value": "Nothing" }, "rightAt": "26:awarded", "beat": true }
```

**chart**: `bar` / `line` / `pie`. Pieces build one by one on their `at` (default: spread over the first 60 %). `text` is
the value as shown. Bar and line charts need the `x` and `y` axis labels. There are no tick numbers: every number on
screen comes from `data`.
```json
{ "at": "14:The", "type": "chart", "kind": "bar", "title": "Settlement offers", "x": "Offer", "y": "Amount offered",
  "data": [ { "label": "First", "value": 3000, "text": "$3,000", "at": "14:$3,000" }, { "label": "Second", "value": 4600, "text": "$4,600", "at": "14:$4,600" } ] }
```
Limits: 2-6 data points (pie: 2-5).

**timeline**: years and events build left to right, and the camera pans to keep the newest one in view. 1-6 events.
`when` may be a year or words ("A week later").
```json
{ "at": "22:The", "type": "timeline", "events": [ { "when": "2005", "text": "The pants go missing" }, { "when": "2007", "text": "The trial begins", "at": "22:2007" } ] }
```

**document**: a page with real text from the sources and a slow push-in. A marker sweeps the key line at
`highlightAt` (default 35 % into the scene). `kind` is `ruling` / `filing` / `email` / `contract` / `article` /
`receipt` / `letter`. An article needs a `headline`, and every word of it must be in the script or sources. Wrapped,
the page holds about 7 body lines; the gate fails text that reaches the caption band. Mark paraphrases as such in
`meta` or the first line.
```json
{ "at": "25:ruling", "type": "document", "kind": "ruling", "heading": "Superior Court of the District of Columbia",
  "meta": ["Pearson v. Chung", "Judge Judith Bartnoff, June 25, 2007"],
  "lines": ["Ruling, paraphrased:", "No reasonable customer reads 'Satisfaction Guaranteed' as a promise to meet unreasonable demands."],
  "key": 1, "highlightAt": "25:reads", "beat": true }
```

**quote**: a real quote (not narration) with attribution and a source line.
```json
{ "at": "12:He", "type": "quote", "text": "These are not my pants.", "who": "Roy Pearson", "source": "to the shop owners, on the pair they found" }
```

**map**: a stylised map from the bundled outlines (src/doc/maps.ts; no tiles, no network). The camera zooms from the
region to the pins.
- `region`: `world`, `city` (procedural streets; needs `name`), or one of `usa`, `uk`, `france`, `germany`, `india`,
  `bangladesh`, `china`, `japan`, `australia`, `brazil`, `nigeria`.
- Pins name a bundled city id (`washington-dc`, `new-york`, `london`, `dhaka`, ... the full list is in `CITIES`) or
  `[lon, lat]`. A city must be in the map's country.
- `route: { "from", "to", "at", "label" }` draws a dashed line between two places.
- The script or sources must name the region (or one of its cities).
```json
{ "at": "7:in#2", "type": "map", "region": "usa", "pins": [ { "place": "washington-dc", "label": "Washington, D.C.", "at": "7:Washington" } ] }
```

**evidenceboard**: 2-6 pinned cards (`person` = a generic silhouette, `doc`, `place`, `object`), with strings between
them and a legal-safe label on each string (say only what the script states: "sued", "owners", "son"). The camera
pans across. A string label is placed where it covers no card.
```json
{ "at": "10:The", "type": "evidenceboard", "title": "The owners", "cards": [ { "id": "jin", "kind": "person", "label": "Jin Nam Chung" },
  { "id": "shop", "kind": "place", "label": "Custom Cleaners" } ], "links": [ ["jin", "shop", "owners"] ] }
```

**recap**: a chapter recap card with 1-5 points that tick in one by one.
```json
{ "at": "21:But", "type": "recap", "title": "The demand", "points": ["Offers: $3,000, $4,600, $12,000", "He asked for $67 million"] }
```

**scene3d**: one shot of the theme's 3D kit. It takes every field of that kit's shot except `at`: `set`, `cam`,
`actors`, `props`, `actions`, `fx`, `jury`, `in`, `subject` (see KIT_LAW3D.md, KIT_BIZ3D.md, KIT_CYBER3D.md). `set` and
`cam.preset` are checked against the kit, and actor ids against `doc.json` `kit3d.cast`. Use scene3d for people:
reactions, the stand, the gavel, the boardroom.
```json
{ "at": "23:On", "type": "scene3d", "id": "cry", "set": "courtroom", "jury": false, "beat": true,
  "cam": { "preset": "closeUp", "target": "pearson.face", "dist": 1.3, "az": 14 },
  "actors": [ { "id": "pearson", "pose": "talk", "face": "sad", "at": "witness", "sit": true, "then": [ { "at": "23:cried", "pose": "cry", "face": "crying" } ] } ] }
```
The kit draws its own captions in these shots (with its caption-safe lift). The doc's chapter cards and hook stay on
top.

**Themes.** Every type has a per-channel look (src/doc/themes.ts):
- law: navy, a wood-panel band and gold rules, cream cards, a cork evidence board;
- biz: a bright paper grid with white cards and blue and red accents;
- cyber: a neon grid on near-black glass with cyan and magenta.

## 4. The gates (`--check`)

### Variety (per chapter and the whole video)

| rule | limit | the FAIL message tells you |
|---|---|---|
| V1 | a new shot or scene type at least every 6 s: no scene longer than 6.0 s | the words near the middle where you can split it |
| V2 | no identical type + set + camera within 45 s (2D: set = region / kind; camera = `move`; 3D: set + preset + target) | which `move` / `cam` to change |
| V3 | scene3d <= 40 % of the runtime | how many 3D shots to turn into 2D scenes, and which ones |
| V4 | every chapter uses >= 4 distinct scene types | which types to add |
| V5 | big beats (`"beat": true` or `doc.json` `beats`) are scene3d with people, document, quote or compare | never an empty set |

### Budget (whole video)

| rule | limit |
|---|---|
| B1 | no scene type and no 3D set above 30 % of the shots |
| B2 | at least 8 distinct scene/set combinations per 10 min (at least 4 for any length) |
| B3 | one hero set per chapter: `heroSet` is the chapter's most-used 3D set (consecutive chapters with the same hero get a warning) |

### Numbers, cards and text

| rule | what it checks |
|---|---|
| N1 | Every spoken figure needs a board showing that exact value within ±1.5 s: a stat, compare, chart, timeline or recap, a document's key line, a 3D counter or card, or the hook. Spoken figures are `$` amounts, digits and number words ("fifty-four million"). A number word under 10 counts only with a unit after it ("two years", not "three owners"). `$54M`, `$54,000,000` and "54 MILLION" all match 54,000,000. |
| C1 | One chapter card per chapter, in one style, never in the first 30 s, inside its chapter. The title fits one line at >= 56 px, and the card never covers the scene text under it (it takes a free top: 330 / 130 / 560 px). |
| T1 | A callout (a string label, a route label, a 3D exhibit / label card) never covers the text it explains or a 3D text prop. No three text layers stack in the first 3 s. No scene text sits under the cold-open hook. |
| T2 | 2D text fits (>= 42 px, secondary >= 32 px), stays inside the frame and out of the caption band (y 833-977), and every theme colour pair is >= 4.5:1. |

### Wording and accuracy

| rule | what it checks |
|---|---|
| S1 | Names, places and dates on screen (pins, map titles, card labels, attributions, document headers, headlines, all 3D prop and card text) are words of the script or `sources`. Months and every number on screen must be in them too. A map's country must be named in the script or sources: no US map for a Bangladesh story, no "LATVIA" the script never mentions, no envelope addressed to a city the story is not about. |
| S2 | No verdict words (CONVICTED, GUILTY, SENTENCED, FRAUDSTER, SCAMMER, CRIMINAL, ARRESTED, INDICTED, ...) unless the voice says them in that chapter. No picture that contradicts the line: a COLLAPSE / CRASH / LOST label while the voice says "didn't collapse" fails. A 3D callout with `on` must say what the voice (±3 s) or its target says: the "LOSE IT?" stamp goes on the can the voice names. |
| S3 | Every cold-open scene with `"tease": "<id>"` is paid off after the chapter 1 card by the scene with that `id`, as a moment (scene3d with people, document, quote or compare). The cold open's people shots without a tease are listed, so you can see what the cold open promises. |

### Reused QA

- The 3D kit's own QA runs only on the scene3d windows: clip QA, framing R1-R6 (cards off heads, the subject in frame,
  boards inside the frame, contrast and size, captions never on faces or necks), and polish P1 (counters snap to the
  exact value; COUNT_UP is off), P2 (kit text fit) and P4 (no set piece over a face). The doc's C1 replaces P3.
- The shared long-form gate (tools/kit_long.mjs) also runs: hook at frame 0, first word by 0.5 s, a sound punch and
  music at 0, >= 3 chapters with the first at 00:00, >= 10 s each, a visual change every 6 s, a beat every 40 s,
  lower-third captions, an open loop before each chapter, and 8-12 min (a warning).

## 5. How to plan and write a chapter (the writer's loop)

1. Outline first. Put the chapter titles and `from` words in `doc.json`, plus chapter 1's `card` (the first word after
   30 s). End each chapter with a question or a tease (the open-loop rule).
2. For each chapter, read its lines and timings and mark:
   - every spoken figure: it needs a stat, compare, chart or board within ±1.5 s;
   - every BIG BEAT: give it a scene3d with people, a document, a quote or a compare, and `"beat": true`;
   - every name, place and date: it goes on a map, board or document, spelled as in the script.
3. Cut the lines into scenes of 3-6 s, starting each on a word. Aim for 4-6 types per chapter and at most about one
   scene3d in three. Put people moments in scene3d, facts in 2D. Choose one hero set per chapter and switch hero sets
   between chapters.
4. Cold open (before the chapter 1 card): mark each promised moment with `"tease"` and show it in full later with the
   same `id`.
5. Run `node tools/recipe_build.mjs <slug> --check --chapter N`, fix every FAIL line (each says what to change) and run
   it again. Then run `--check` on the whole video.

Tips:
- A scene3d's spoken number goes on a kit counter (law3d `counter` with `"value"`; it snaps to the final value).
- Chart bars start on the words that say them.
- A timeline with one event is fine for a single date.
- A recap closes a chapter.

## 6. Engine files

| file | role |
|---|---|
| src/doc/types.ts | the schema |
| src/doc/compile.ts | validateDoc (schema + references, with fixes), compileDoc (timeline, chapters, the 3D sub-recipe, cues) |
| src/doc/layout.ts | the pure 2D layouts: every text box and graphic as a function of t (shared by the render and the gate) |
| src/doc/scenes.tsx, film.tsx, root.tsx, src/index.doc.ts | the render: the 2D scenes, the kit film in the scene3d windows (nested Sequence, absolute frames), the hook, the chapter cards, the captions |
| src/doc/maps.ts | the bundled outlines and cities (coarse, hand-made) |
| src/doc/themes.ts | the law / biz / cyber looks |
| tools/doc_build.mjs, tools/doc_entry.ts | the builder and every gate |
| tools/doc_stills.mjs, tools/doc_sheet.py | review stills and contact sheets |

The 3D kits are imported read-only. The only shared-code change is an optional `within` / `shotsIn` filter in
tools/polish_qa.mjs. It is off by default, so the kits' own builds are unchanged.

## 7. Limits

- Fonts: only Poppins is bundled, so document pages use it too (700 for the body, 800 for the key line). They read as
  clean printed pages, not typewriter or serif.
- Maps are coarse stylised outlines: 11 countries and about 40 cities. A country without an outline uses `world` with a
  pin.
- The S1 name check works on words: it cannot tell a true name from a wrong one if both appear in the sources.
- The meaning checks (S2) are keyword rules (verdict words, negated events, callout targets). They catch the reported
  failures; they are not a full reading of the line.
- Teases are declared, not inferred from the voice.
- The reference video has synthetic timings (make_timings.py). Use the real Whisper timings before rendering.
