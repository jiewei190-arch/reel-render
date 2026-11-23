# LONGFORM_DOC_REPORT: the documentary long-form engine ("doc" kit)

- **Branch:** `engine/longform-doc`.
- **PR:** draft PR #101 into `engine/all`, not merged.
- **Writer's guide:** `KIT_DOC.md`.
- **Reference video:** `finance/longform/pearson-doc`.
- **Stills:** `docs/longform_doc/`.

## Summary

- **What it is.** A new kit, `"doc"`. It builds a 9-12 min landscape video (1920x1080, plain 30 fps, no motion blur)
  from chapter recipes.
- **Scene types.** Nine are 2D documentary scenes: map, timeline, document, quote, compare, chart, evidence board,
  recap and stat. The tenth, `scene3d`, is one shot from the channel's existing 3D kit:
  - `law` → law3d;
  - `biz` → biz3d;
  - `cyber` → cyber3d.
- **Themes.** Each theme has its own look:
  - law: wood, navy and gold;
  - biz: a clean bright page;
  - cyber: neon on dark.
- **The kits are unchanged.** A scene3d is compiled into a kit sub-recipe and rendered by the kit's own film in that
  window.
- **The reference passes.** Pearson v. Chung is 3 chapters, 34 scenes, all 10 types and 2.2 min. `--check` passes
  every hard gate, for every chapter and for the whole video. The only warning is the 8-12 min length.
- **Existing outputs are unchanged.** The `--check` output of 18 existing recipes is identical to engine/all; only
  timing lines differ. Those recipes are the kit demos, kit Shorts and Block Money.

## What was built

| piece | file |
|---|---|
| schema | `src/doc/types.ts`: `doc.json` (theme, hook, chapter outline, `kit3d` cast, sources, beats, number exemptions) and `chapters/NN.json` (`heroSet`, scenes) |
| compiler | `src/doc/compile.ts`: `validateDoc` (every field, with the fix) and `compileDoc` (global timeline from the global voice timings, chapter cards placed clear of text, the 3D kit sub-recipe with hidden filler shots so each visible 3D shot spans exactly its scene, audio cues) |
| 2D layouts | `src/doc/layout.ts`: pure; every text box (measured Poppins 800, fitted, min 42 / 32 px) and graphic as a function of t, shared by the render and the gate |
| render | `src/doc/scenes.tsx` (2D scenes per theme), `film.tsx` (nested `Sequence` keeps the kit film's frames absolute; contiguous 3D windows share one canvas mount; hook, chapter cards, lower-third captions), `root.tsx`, `src/index.doc.ts` |
| maps | `src/doc/maps.ts`: hand-made coarse outlines (continents plus 11 countries) and about 40 cities; city maps are procedural streets. No tiles, no network. |
| builder | `tools/doc_build.mjs` + `tools/doc_entry.ts`; `recipe_build.mjs` sends a folder with `doc.json` there |
| stills | `tools/doc_stills.mjs` (start / mid / end per type, `--all`, `--theme biz|cyber` for the other looks) and `tools/doc_sheet.py` |
| docs | `KIT_DOC.md` (new), `ENGINE.md` (table row + section), `LONGFORM.md` §7b |

Shared-code changes, both opt-in:
- **`tools/recipe_build.mjs`:** one line dispatches to the doc builder.
- **`tools/polish_qa.mjs`:** optional `within` and `shotsIn` filters, off by default. The doc builder runs P1/P2/P4 on
  the scene3d windows only.
- **Not changed:** Shorts behaviour, Block Money, tech3d and the kits' compilers and renders.

## Schema summary (KIT_DOC.md §2-3)

```jsonc
// doc.json
{ "kit": "doc", "slug": "...", "theme": "law|biz|cyber", "music": "...", "hook": { "text": "*ONE* accent word" },
  "chapters": [ { "file": "chapters/01.json", "title": "...", "from": "1:A", "card": "7:In" }, ... ],
  "kit3d": { "cast": { ... } }, "sources": ["..."], "beats": ["23:cried"], "numberExempt": [ { "word": "...", "why": "..." } ] }
// chapters/NN.json
{ "chapter": 2, "heroSet": "evidence", "scenes": [ { "at": "14:The", "type": "chart", ... }, ... ] }
```

- **Every scene:** `at` (a word or seconds), `type`, and optionally `beat`, `move` (push / pull / panL / panR / drift /
  rise), `caption: "off"`, `id`, `tease`.
- **Per-type fields:**
  - **stat:** `value`, `label`, `sub`.
  - **compare:** `left` / `right`, each a `{label, value}`; `rightAt`; `win`.
  - **chart:** `kind` (bar / line / pie), `title`, `x`, `y`, and `data[{label, value, text, at}]`.
  - **timeline:** `events[{when, text, at}]`.
  - **document:** `kind` (ruling / filing / email / contract / article / receipt / letter), `heading`, `meta`,
    `headline`, `lines`, `key`, `highlightAt`.
  - **quote:** `text`, `who`, `source`.
  - **map:** `region`, `name`, `title`, `pins[{place, label, at}]`, `route`.
  - **evidenceboard:** `cards[{id, kind, label, sub}]` and `links[[a, b, label]]`.
  - **recap:** `title`, `points`.
  - **scene3d:** the kit's shot fields minus `at`.
- **Writing.** The writer writes one chapter at a time against the `doc.json` outline. `--check --chapter N` judges
  that chapter alone; chapters not written yet are fine.

## The gates (`node tools/recipe_build.mjs <slug> --check [--chapter N]`)

| rule | check |
|---|---|
| schema | every field and reference (word anchors, 3D sets / cameras / cast, map region vs city country, chart axes, document key line) |
| V1 | a new shot / scene type at least every 6 s (no scene > 6.0 s); the message lists words near the middle to split on |
| V2 | no identical type + set + camera within 45 s; the message lists the other `move`s, or says to change `cam` |
| V3 | scene3d ≤ 40 % of runtime; the message names the non-beat 3D shots to convert |
| V4 | ≥ 4 distinct scene types per chapter |
| V5 | big beats (`beat`, `doc.json` `beats`) use scene3d with people, or document / quote / compare |
| B1 | no scene type or 3D set above 30 % of shots (**main session**) |
| B2 | ≥ 8 distinct scene/set combos per 10 min (**main session**) |
| B3 | one hero set per chapter (`heroSet` = the chapter's most-used 3D set) (**main session**) |
| N1 | every spoken figure (`$`, digits, number words; words under 10 only with a unit) has a board with that exact value within ±1.5 s: a 2D scene, a document's key line, a 3D counter / card, or the hook (**main session**) |
| C1 | one card per chapter, the same style, none in the first 30 s, inside its chapter, one line ≥ 56 px, never over scene text (**main session**) |
| T1 | a callout (string / route label, 3D card) never covers what it explains or a 3D text prop; no text 3-deep in the first 3 s; nothing under the hook (**main session**) |
| T2 | 2D text fits (≥ 42 / 32 px), stays in frame and out of the caption band; theme colours ≥ 4.5:1 |
| S1 | names / places / dates / headlines / all 3D text on screen are in the script or sources; months and every on-screen number too; a map's country must be named (**main session**: no "Dallas" envelope, no "LATVIA", no US map for Bangladesh) |
| S2 | no verdict words (CONVICTED, GUILTY, ...) the voice does not say in that chapter; no picture that contradicts a negated line ("didn't collapse"); a 3D callout `on` a target says what the voice or the target says (**main session**) |
| S3 | every cold-open `tease` is paid off later by a moment scene with that `id` (**main session**) |
| 3D | the theme kit's clip QA, framing R1-R6 and polish P1 (snap counters) / P2 / P4, on scene3d windows only |
| long-form | the shared kit_long gate (hook at 0, first word, punch + music, ≥ 3 chapters from 00:00, ≥ 10 s each, change every 6 s, beat every 40 s, lower-third captions, open loops, 8-12 min warn) |

## --check results

The reference `pearson-doc`, whole video:

```
chapter 1 'The Missing Pants': 17 scenes, 9 types (scene3d, stat, evidenceboard, document, map, compare, timeline, quote, recap), scene3d 24 %, clean
chapter 2 'The $67 Million Demand': 9 scenes, 6 types (chart, scene3d, document, compare, stat, recap), scene3d 31 %, clean
chapter 3 'The Verdict': 8 scenes, 5 types (timeline, scene3d, document, compare, recap), scene3d 32 %, clean
PASS  V1 longest 5.8 s | V2 none | V3 26 % | V4 9 / 6 / 5 | V5 6 beats ok
PASS  B1 scene3d 10 of 34 (29 %), courtroom 6 | B2 16 combos | B3 courtroom / evidence / courtroom
PASS  N1 15 of 15 spoken figures shown | C1 cards at 30.7 / 65.4 / 102.7 s | T1 0 | T2 0 | S1 0 | S2 clean | S3 1 tease paid off
PASS  3D clip QA 0 | framing R1-R4, R6 clear | polish P1 1 counter snaps, P2 6 lines fit, P4 faces clear
PASS  long-form gate (all hard rows); warn: length 2.22 min (8-12 min)
PASSED (the whole video) in 0.7 s
```

`--check --chapter 1|2|3` passes for each chapter (0.5-0.7 s). It also passes with chapters 2-3 deleted, which is the
writer's one-chapter-at-a-time loop.

**Seeded defects.** A copy with seeded defects (scratch only, not committed) failed with these messages:

```
FAIL S09 repeats S02 (timeline / strip / move drift) 26 s later (the limit is 45 s): give S09 another "move" (push / pull / panL / panR / rise) or use another scene type
FAIL S16 is a big beat ("beat": true) shown as stat: make it a scene3d shot with the people in it ("actors"), or a document / quote / compare
FAIL chapter 1 card at 23.41 s: no chapter card in the first 30 s (never interrupt the cold open): set its "card" in doc.json to a word after 30 s, e.g. "7:In" (30.71 s)
FAIL S07 map shows 'LATVIA': "LATVIA" is not in the script or doc.json "sources": ...
FAIL S07 is a map of BANGLADESH, but the script and sources never name it or one of its cities: use the region the story is about
FAIL S25 chart shows 10.75 ('$10.75'), a number that is not in the script or sources: every number on screen must come from them
FAIL S16 shows 'GUILTY': "GUILTY" is a verdict word the voice never says in this chapter: ...
FAIL "$10.50" is spoken at 44.35 s (line 9) with no board showing 10.5 between 42.85 s and 46.28 s: ... cut to a stat at "9:$10.50"
```

**What the first run caught.** The first run on the hand-written reference found:
- a 6.05 s scene;
- two chapter cards over a timeline year;
- a red-on-cream compare value at 2.95:1;
- a parse quirk ("fifty-four million" also yielded "four million").

All four were fixed: the scene was split, the layout and theme were fixed, and the builder now keeps the outer phrase.

**Regression.** `--check` on 18 existing recipes, before (engine/all `polish_qa.mjs` + `recipe_build.mjs`) and after:
identical, except the timing lines. The recipes:
- the law, biz, cyber and tech landscape demos;
- shop-too-fast;
- 8 Block Money Shorts;
- 6 law3d / biz3d / cyber3d Shorts.

`npx tsc --noEmit` is clean.

## Stills (`docs/longform_doc/`)

- `<type>_<Sxx>_{start,mid,end}.jpg`: the first scene of each of the 10 types, at 1920x1080, law theme. All 10 types
  in one image: `sheet_law.jpg`.
- `biz_*` and `cyber_*`: the same 9 2D scenes in the biz and cyber looks (0.5 scale), with `sheet_biz.jpg` and
  `sheet_cyber.jpg`. These come from `doc_stills.mjs --theme`, a review-only override; scene3d stays in the video's own
  kit.

The review stills showed four layout problems, all fixed:
- an evidence-board label hidden under another label;
- no board surface;
- the map title over the outline;
- undersized quote / recap / document text and an over-tall receipt page.

## Render time

Measured on the 4-core cloud CPU with `--gl=swangle`, at 1920x1080 and concurrency 4:

| | measured | per minute of video |
|---|---|---|
| 2D scenes | 150 frames in 11.0 s, including ~5 s of bundling (~0.04 s/frame) | about 1.2 min |
| scene3d (law3d courtroom, frames 345-434) | 90 frames in 448.5 s (~5.0 s/frame) | about 150 min |
| stills | 2D 0.5 s each; scene3d about 12 s each (a page load per still) | |

A doc minute at the reference mix (26 % scene3d) costs about **40 min** of CPU render (0.26 × 150 + 0.74 × 1.2). This is much less than an
all-3D kit video, because 74 % of the frames are cheap 2D.

The PC's RTX 4060 (`--gl=angle`, concurrency 8) will be far faster on the 3D share. The 2D share is DOM-bound and
scales with CPU cores.

## What's left

1. **Real voice.** The reference uses synthetic timings (`make_timings.py`, 2.5 words/s). Re-time it with the real
   Whisper timings, then re-run `--check`. Its facts are from the earlier demo plus well-known case facts, all listed
   in `sources`. Check the court record before publishing, especially the paraphrased document lines, which are
   labelled "paraphrased".
2. **Length.** The reference is 2.2 min, so it shows the system, not a full 10-minute episode. A full episode is about
   9 chapters with the same schema; the budgets scale (B2 needs 8 combos per 10 min).
3. **biz / cyber scene3d.** The biz and cyber scene3d paths compile through the same code, but no reference video
   exercises them yet. Write a short biz and cyber doc to prove the sub-recipe path (fillers use the `wide` preset,
   which both kits have).
4. **Caption gradient on biz.** The shared `LowerThirdCaptions` gradient darkens the bottom of the bright biz look (see
   `sheet_biz.jpg`). A per-theme caption plate would be cleaner. I left it shared so captions match the kits.
5. **Meaning checks.** These are keyword rules: verdict words, negated events and callout targets. Teases are
   declared, not inferred from the voice. Map outlines are coarse (11 countries); add more to `src/doc/maps.ts` as
   stories need them.
6. **Fonts.** Only Poppins is bundled, so documents are sans-serif.
7. **Full render.** No full-length render yet: stills and two timed segments only. Do a full render on the PC
   (`--gl=angle`).
