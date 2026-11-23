# DOC_WRITER_REPORT: reelbot writes long-form law / biz / cyber videos in the doc engine

Branch `bot/doc-writer` (from `claude/beautiful-hypatia-0w2o96`, not merged). Engine tested against `engine/all` at
`7d710a5` (KIT_DOC.md, src/doc/*, tools/doc_build.mjs, finance/longform/pearson-doc).

## TL;DR

- For a `--long` video on law, biz or cyber, `reelbot recipe` (and `continue` / `make --auto`) now writes
  **doc.json + one chapters/NN.json per chapter**. Each chapter is one Claude call (effort medium, at most 32K output),
  validated with `doc_build.mjs --check --chapter N`. The writer retries only that chapter, up to 5 attempts, with history.
  Then the whole-video `--check` runs, and each FAIL line goes back to the chapter that holds it. Then the real build
  runs, plus `tsc`, with rollback, under the engine lock.
- Render: `<Pascal>Doc` from `src/index.doc.ts` (motion blur off). The editor's revise step rewrites only the chapters
  its timestamped issues fall in. The best editor round is still kept.
- Shorts, Block Money, Justin and long-form on other channels are unchanged. `REELBOT_DOC_ENGINE=0` turns the doc
  path off.
- **12/12 tests pass** with no API spend. The integration test runs the **real `doc_build --check`** (per chapter and
  whole video). It also runs the **real build + `tsc`** on the doc.json + chapters this bot writes, using the reference
  chapters as the stubbed Claude output. A single frame of `PearsonDocDoc` was rendered with Remotion as a smoke test.
- Estimated recipe cost is **about $2-4 per 10-minute video**, against **$7-13** on the old single-recipe path. This
  number is an estimate (see Cost), not a measurement: the tests spend nothing.

## Design

`bot/reelbot/docwriter.py` (new):

1. **When.** `applies(script)` is true when `format == "landscape"`, the channel is in {law, biz, cyber}, and
   `REELBOT_DOC_ENGINE` is not `0`. `is_doc(folder)` is the switch the cli, render and editor stages branch on.
2. **doc.json (`plan`).** Most of it is deterministic:
   - `theme` = the channel id.
   - `chapters` come from script.json `chapters`. Each `starts_with` is matched to its line: an exact prefix match first,
     then a fuzzy match. `from` = `"N:FirstWord"` of that line. Chapter 1 always starts on the first word, so the cold
     open belongs to it.
   - Chapter 1's `card` is its own opening line when that line comes after 30 s. Otherwise it is the first line that
     starts after 30 s (KIT_DOC C1).
   - `sources` = script.json sources (title + url) + every fact-checked claim with its basis. This feeds the S1
     name/number checks.
   - ONE small Claude call (medium effort, 16K max) returns the hook text, the kit3d cast as JSON, and the beats. The
     hook is repaired locally to <= 6 words with exactly one `*accent*`. Beats that are not voice words are dropped.
3. **Chapters (`write_chapter`).** Each chapter is one call:
   - **System prompt**: two blocks, both with `cache_control`. Block 1 is the role, KIT_DOC.md and KIT_<KIT3D>.md, the
     same for every chapter of every video. Block 2 is doc.json and the whole numbered script, the same for every
     chapter of this video.
   - **User prompt**: the chapter's window (its lines with `word@time` timings), its start and end, its card, its
     planned beats, the previous chapter's summary (continuity), and the feedback.
   - **Output**: `chapter_json`, `summary`, an optional `card` patch, and optional `number_exempt` entries (KIT_DOC lets
     N1 be exempted with a reason).
   - **Check**: `node tools/doc_build.mjs <slug> --check --chapter N --shorts <shorts_dir>` runs under the engine lock.
     FAIL lines go back to that chapter only, with the earlier attempts' failures listed ("don't swing back"), up to
     `REELBOT_DOC_CHAPTER_ATTEMPTS` = 5.
   - **Best attempt kept**: the attempt with the fewest FAIL lines is kept. On a rewrite, the current file is the
     baseline that an attempt must beat.
   - **doc.json errors**: a `FAIL  doc.json:` schema error (e.g. a bad cast field) re-runs `plan` with those errors.
4. **Whole video (`finish`).** `--check` runs on the whole video. `fail_lines` splits gate summary rows from detail
   lines. `route` sends each detail line to a chapter:
   - first by the first scene id it names (`S27` → chapter; global ids are computed the same way `compile.ts` numbers
     them, and user `id`s are mapped too);
   - else by `chapter N`;
   - else by its first time (`88.55 s` → the chapter that holds it);
   - else by an `"N:word"` anchor.

   Lines that no chapter owns go to every chapter, marked as video-wide. Only the routed chapters are rewritten (each
   goes through its own `--chapter` loop), then the whole video is checked again. This repeats up to
   `REELBOT_DOC_ROUNDS` = 3 rounds, then stops with `SystemExit` like the Shorts path.
5. **Type gate.** `recipe.typecheck_build(cmd)` was split out of `recipe._typecheck`; Shorts call it exactly as before.
   For a doc video it runs the real `doc_build.mjs` (writing src/doc/gen and the registry) plus `tsc --noEmit`, under
   the engine lock. On failure, the files this build touched are rolled back (same git-state logic as before). The
   errors go to the chapters whose JSON contains the bad literal (e.g. `'"slamZoom"' is not assignable`), or to every
   chapter if none matches.
6. **Render (`render.py`).**
   - The doc path builds with `node tools/doc_build.mjs <slug> --shorts <shorts_dir>` and renders comp
     `<PascalSlug>Doc` from `src/index.doc.ts`.
   - Motion blur is never used (the doc kit renders 30 fps straight). Lambda gets the doc entry.
   - `sound.design` and `story_mix.py` use the same comp id: doc_build writes `out/tmp/<slug>.cues.json` keyed by
     `PearsonDocDoc`, which I checked.
   - `chapters.txt` (real YouTube timestamps from the builder) is copied next to video.mp4.
7. **Editor (`cli.stage_edit` + `docwriter.revise`).**
   - Each issue's `t_start` is mapped to its chapter. Only those chapters are rewritten, with their own notes, then the
     whole-video gate runs again.
   - Best-round keeping still works: each round snapshots `doc.json` + `chapters/` to `doc_roundN/`, and the best one is
     restored.
8. **Cost per chapter.** The Claude spend (API $ + CLI API-equivalent) before and after each part is logged to
   `doc_cost.json` (`plan`, `chapter 01`, ..., `by_part`, `total_usd`, `attempts`) and printed at the end of
   build/revise. `cost.py` now also counts **cache-write tokens** (1.25x input). Before this change they were not
   counted at all.

### An engine quirk I worked around (worth fixing in the engine)

With `--chapter N`, a doc.json `beats` entry that falls in a chapter **not written yet** is judged against chapter N's
**last scene**. The real checker printed `FAIL S17 is a big beat (doc.json beat "23:cried") shown as recap` while
chapter 1 was written and chapter 3 did not exist yet. The same thing happened again for chapter 2.

Workaround: the planned beats are held in `doc_writer.json` while chapters are written. Each chapter writer is told
which beats fall in its window (and marks those scenes `"beat": true`). `finish()` adds the beats to doc.json before
the whole-video check, when every chapter exists.

Engine fix suggestion: in doc_build.mjs V5, skip `doc.beats` whose time is past the last written chapter's start when
`--chapter` is used.

## Files changed

| file | change |
|---|---|
| `bot/reelbot/docwriter.py` | **new**: the doc writer: outline, plan call, per-chapter loop, routing, whole-video gate, type gate, revise, snapshots, cost log |
| `bot/reelbot/cli.py` | `stage_recipe` → `docwriter.build` for doc videos; `stage_edit` → `docwriter.revise` + doc snapshots/restore for best-round keeping |
| `bot/reelbot/render.py` | doc build command, comp `<Pascal>Doc`, entry `src/index.doc.ts`, no blur, `chapters.txt` copied (Shorts unchanged) |
| `bot/reelbot/recipe.py` | `typecheck_build(cmd)` split out of `_typecheck` (Shorts behaviour identical) |
| `bot/reelbot/claude.py` | `system` may be a list of text blocks (API: prompt caching; CLI: joined into one text) |
| `bot/reelbot/cost.py` | cache-write tokens counted (1.25x input) |
| `bot/README.md` | new section "Long-form (doc engine)" |
| `bot/tests/test_docwriter.py` | **new**: 12 tests |
| `bot/tests/fixtures/pearson-doc/` | copy of the engine's reference doc (doc.json, chapters, script.txt, vo/timings.json) |
| `bot/tests/fixtures/whole_video_fail.log` | real `doc_build --check` output for a broken copy of pearson-doc (routing test) |

## Test results

`cd bot && REELBOT_TEST_TSC=1 python -m pytest tests -v` gives **12 passed in 13.4 s** (Python 3.13, node 22, engine/all
7d710a5 with `npm ci`).

| test | proves |
|---|---|
| applies_only_to_long_law_biz_cyber | Shorts, other channels and the off switch keep the old path |
| outline_matches_reference_doc | the generated chapter `from`s equal the reference (`1:A`, `14:The`, `22:The`), card `7:In`, comp ids |
| route_real_fail_lines | real whole-video FAIL output: S27 → ch3, S23 and the "$1,500 spoken at 88.55 s" line (by time) → ch2, S04 → ch1; footer and summary rows are not treated as fixes |
| build_happy_path_one_call_per_chapter | 1 plan call + 1 call per chapter; effort medium, <= 32K; chapter 2's prompt holds only lines 14-21 plus chapter 1's summary; system cached; checks run ch1, ch2, ch3, video, then the build + tsc; per-chapter cost logged |
| chapter_retry_feeds_fails_back_to_that_chapter_only | a bad chapter 2 is retried alone: its FAIL line goes back, then the history of earlier attempts; the attempt count is logged |
| chapter_gives_up_after_5_and_keeps_best | stops after 5 attempts and keeps the best one |
| whole_video_fail_is_routed_to_its_chapter | a whole-video V1 FAIL on S27 rewrites chapter 3 only, with the current file and the line |
| type_check_failure_goes_to_the_chapter_with_the_bad_value | a tsc error naming `"slamZoom"` rewrites chapter 2 only |
| editor_revise_rewrites_only_affected_chapters | issues at 70 s and 110.5 s rewrite chapters 2 and 3 with their own notes; chapter 1 is byte-identical; snapshot/restore works |
| render_builds_and_renders_the_doc_composition | build cmd `node tools/doc_build.mjs pearson-doc --shorts <dir>`; render `PearsonDocDoc` from `src/index.doc.ts` even with `REELBOT_MOTION_BLUR=1`; story_mix gets `PearsonDocDoc` |
| shorts_still_use_the_kit_recipe | a portrait video is not a doc video; `_pascal` is unchanged |
| **real_doc_build_check** | the REAL checker: the bot's doc.json + chapters pass `--check --chapter N` and the whole-video `--check`; a stub chapter 2 showing `$1,600` was FAILed by the real checker (S1/N1) and fixed by the retry; with `REELBOT_TEST_TSC=1` the real build + `tsc --noEmit` pass too |

Also checked by hand:

- `npx remotion still src/index.doc.ts PearsonDocDoc --frame=900` rendered a correct frame (the law-theme "Pearson v.
  Chung" compare card).
- I restored the engine worktree's generated file afterwards.

Not tested here: real Claude output quality and a full GPU render plus mix (no API spend, no GPU in the container).

## Cost: doc path vs the old single recipe

The old path: one call per attempt that writes the whole 9-12 min recipe (128K max output, effort medium). That is
**~$1.7 per attempt and $7-13 per 10-minute video** (several attempts plus editor rounds that rewrite everything).

The doc path. This is an estimate at the prices in `cost.py` ($4 in / $20 out / $0.20 cache-read / $5 cache-write per
1M tokens):

| part | tokens (est.) | $ (est.) |
|---|---|---|
| plan call | ~14K in, ~2-3K out | ~$0.10 |
| chapter attempt | ~17K system (cached after the first: one ~$0.09 write per video, then ~$0.004 reads) + ~3-6K fresh in, ~6-10K out (scenes + thinking) | ~$0.15-0.25 |
| 6 chapters x ~2 attempts | 12 attempts | ~$2-3 |
| whole-video rounds | ~2-3 chapter rewrites | ~$0.4-0.7 |
| **recipe stage total** | | **~$2.5-4** |
| one editor revise round | only the 1-3 chapters with issues | ~$0.2-0.8 (old path: a full ~$1.7+ rewrite) |

Each chapter's real spend is now printed and logged to `doc_cost.json`, so the first real video gives the measured
number to replace this estimate. A retry costs one chapter (~$0.2), not the whole video (~$1.7). The 128K-token calls
are gone.

## What the PC operator must run

1. Get the bot branch and the doc engine:
   ```
   cd <reel-render checkout>
   git fetch origin bot/doc-writer && git checkout bot/doc-writer        # (review first; it is not merged)
   cd <REELBOT_RENDER_ROOT parent repo, rr-all>
   git fetch origin engine/all && git checkout engine/all                 # needs 7d710a5 or later: KIT_DOC.md, src/doc, tools/doc_build.mjs
   cd finance/render-pc && npm ci                                         # if package-lock changed
   ```
2. Check the engine alone:
   `node tools/doc_build.mjs pearson-doc --check`
   It should print `PASSED (the whole video)`.
3. Run the bot tests (no API spend). They use the real engine via `REELBOT_TEST_ENGINE`:
   ```
   cd bot
   pip install pytest
   set REELBOT_TEST_ENGINE=C:\...\rr-all\finance\render-pc        (PowerShell: $env:REELBOT_TEST_ENGINE="...")
   python -m pytest tests -q                                      # add REELBOT_TEST_TSC=1 for the real build + tsc
   ```
4. Make a real long-form video:
   `python -m reelbot make "<topic>" --channel law --long`
   Then `python -m reelbot continue <slug>`. For a video that is already voiced, run
   `python -m reelbot recipe <slug>` and then `python -m reelbot render <slug>`.
5. Watch `doc_cost.json`, `doc_check_*.log` and `RECIPE_QA.md` in `work/shorts/<slug>/`.
   - `chapters.txt` lands next to video.mp4.
   - If it misbehaves, `REELBOT_DOC_ENGINE=0` restores the old single-recipe long-form path.
