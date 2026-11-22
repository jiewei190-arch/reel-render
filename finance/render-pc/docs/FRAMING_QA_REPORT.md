# Framing QA: every recipe, engine-caused vs recipe-caused (branch engine/qa-framing)

Every recipe was run with `node tools/recipe_build.mjs <slug> --check` on the 4-core cloud machine, after the engine
follow-ups (ENGINE.md "Framing QA" → "Engine follow-ups").

## Summary

**Engine-caused: 0 findings.** These are findings the writer cannot fix:
- a callout label the kit placed over a head;
- a view lifted by caption-safe framing that touches the top edge or the split seam;
- an engine text colour under 4.5:1.

Before the follow-ups there were 77+ such seam hits, plus 2 auto-placed tech labels on BOLT's antenna.

**Recipe-caused: 597 findings in all 35 recipes.** The writer fixes these; each message says what to change. By rule:

| rule | findings |
|---|---|
| R1 head clips | 117 |
| R2 subject / head cut | 112 |
| R3 board past the edge | 232 |
| R4 contrast | 122 |
| R4 size | 11 |
| R5 frame 0 | 3 |

**Exposed by the split reframe: 62 findings (51 R3 + 11 R4 size).** These are writer-fixable, so they are not engine
bugs. Once the engine keeps the bottom view's head below the seam (by pulling that view back):
- boards that float **above** that head cross the seam;
- some bottom-view boards drop under 42 px.

The fix is to put the board beside the head, or make it bigger.

**Old gates:** 12 of the 35 already failed an older gate before this branch.

### Why the recipe-caused findings happen

- **R1:** labels floating just above or behind a character's head, and the OWE / calendar / TV boards behind the head.
- **R2:**
  - tight slam-zooms whose antennae touch the top edge;
  - a second character sliced by a side edge.
- **R3:**
  - background boards (OWE, calendar, jar, pay box, TV) cropped at the sides;
  - boards wider than the frame in close shots;
  - featured boards at the top margin.
- **R4 contrast:** mostly the standard green label. Cream or white on `#1f9e4f` is 3.1-3.5:1. Fix: `color` `#197e3f`, or
  `"fg": "#16121c"`.
- **R5:**
  - `minimum-payment-trap`: frame 0 on the falling TV;
  - two biz3d hook shots: the executive's face is 259 px.

## Per recipe

"Engine-caused" is the count the writer cannot fix. The middle column is per rule. The last column is writer-fixable
but appeared when the engine reframed a split view.

| recipe | exit | --check | engine-caused | recipe-caused (R1 / R2 / R3 / R4 contrast / R4 size / R5) | writer-fixable, exposed by the split reframe (R3 / R4 size) |
|---|---|---|---|---|---|
| atm-fee-twenty | 1 | 0.53 s | 0 | 5 / 2 / 6 / 3 / 1 / 0 (total 17) | 3 / 0 |
| biz-demo-blockbuster-passed | 1 | 0.46 s | 0 | 0 / 2 / 0 / 0 / 0 / 1 (total 3) | 0 / 0 |
| biz-demo-landscape-short-1 | 1 | 0.45 s | 0 | 1 / 1 / 0 / 0 / 0 / 1 (total 3) | 0 / 0 |
| coffee-could-be | 1 | 0.64 s | 0 | 1 / 7 / 4 / 5 / 0 / 0 (total 17) | 5 / 0 |
| credit-score-car | 1 | 0.52 s | 0 | 4 / 5 / 5 / 5 / 0 / 0 (total 19) | 3 / 0 |
| cyber-demo-landscape-short-1 | 1 | 0.47 s | 0 | 0 / 0 / 2 / 0 / 0 / 0 (total 2) | 0 / 0 |
| cyber-fake-supplier | 1 | 0.47 s | 0 | 0 / 0 / 2 / 0 / 0 / 0 (total 2) | 0 / 0 |
| delivery-markup | 1 | 0.52 s | 0 | 3 / 4 / 9 / 4 / 0 / 0 (total 20) | 2 / 2 |
| employer-match | 1 | 0.47 s | 0 | 1 / 4 / 7 / 8 / 0 / 0 (total 20) | 0 / 0 |
| fake-sale | 1 | 0.56 s | 0 | 4 / 5 / 6 / 3 / 0 / 0 (total 18) | 2 / 2 |
| fee-one-percent | 1 | 0.47 s | 0 | 2 / 5 / 9 / 4 / 0 / 0 (total 20) | 0 / 0 |
| free-trial-204 | 1 | 0.48 s | 0 | 5 / 2 / 11 / 6 / 0 / 0 (total 24) | 2 / 1 |
| law-demo-54-million-pants | 1 | 0.45 s | 0 | 2 / 4 / 7 / 0 / 1 / 0 (total 14) | 0 / 0 |
| law-demo-landscape-short-1 | 1 | 0.38 s | 0 | 2 / 2 / 6 / 0 / 1 / 0 (total 11) | 0 / 0 |
| minimum-payment-trap | 1 | 0.52 s | 0 | 18 / 8 / 34 / 2 / 0 / 1 (total 63) | 1 / 0 |
| mortgage-year-ten | 1 | 0.51 s | 0 | 2 / 1 / 10 / 3 / 0 / 0 (total 16) | 2 / 3 |
| overdraft-35 | 1 | 0.55 s | 0 | 3 / 4 / 11 / 6 / 0 / 0 (total 24) | 4 / 0 |
| payday-rollover | 1 | 0.48 s | 0 | 2 / 5 / 5 / 4 / 0 / 0 (total 16) | 0 / 0 |
| prices-double | 1 | 0.50 s | 0 | 0 / 0 / 15 / 6 / 0 / 0 (total 21) | 2 / 0 |
| quit-cash-out | 1 | 0.45 s | 0 | 3 / 2 / 5 / 7 / 0 / 0 (total 17) | 0 / 0 |
| raise-tax-myth | 1 | 0.54 s | 0 | 16 / 4 / 1 / 11 / 0 / 0 (total 32) | 0 / 0 |
| same-raise | 1 | 0.58 s | 0 | 10 / 4 / 13 / 7 / 0 / 0 (total 34) | 11 / 0 |
| seven-year-car | 1 | 0.53 s | 0 | 11 / 0 / 0 / 4 / 0 / 0 (total 15) | 0 / 1 |
| shop-too-fast-short-1 | 1 | 0.40 s | 0 | 0 / 1 / 2 / 1 / 1 / 0 (total 5) | 0 / 0 |
| start-25-vs-35 | 1 | 0.59 s | 0 | 10 / 5 / 18 / 6 / 0 / 0 (total 39) | 10 / 0 |
| tech-demo-landscape-short-1 | 1 | 0.52 s | 0 | 1 / 5 / 0 / 0 / 0 / 0 (total 6) | 0 / 0 |
| tech-demo-planes-land-blind | 1 | 0.52 s | 0 | 1 / 6 / 0 / 0 / 0 / 0 (total 7) | 0 / 0 |
| ten-beats-thirty | 1 | 0.68 s | 0 | 1 / 4 / 21 / 5 / 1 / 0 (total 32) | 2 / 0 |
| wedding-or-keys | 1 | 0.53 s | 0 | 4 / 2 / 10 / 5 / 0 / 0 (total 21) | 2 / 2 |
| zero-percent-couch | 1 | 0.57 s | 0 | 2 / 4 / 6 / 5 / 0 / 0 (total 17) | 0 / 0 |
| biz-demo-landscape | 1 | 0.34 s | 0 | 1 / 1 / 0 / 0 / 0 / 0 (total 2) | 0 / 0 |
| cyber-demo-landscape | 1 | 0.40 s | 0 | 0 / 0 / 0 / 0 / 1 / 0 (total 1) | 0 / 0 |
| law-demo-landscape | 1 | 0.35 s | 0 | 1 / 0 / 3 / 0 / 3 / 0 (total 7) | 0 / 0 |
| shop-too-fast | 1 | 0.66 s | 0 | 0 / 12 / 4 / 12 / 2 / 0 (total 30) | 0 / 0 |
| tech-demo-landscape | 1 | 0.39 s | 0 | 1 / 1 / 0 / 0 / 0 / 0 (total 2) | 0 / 0 |


## The writer loop on a real Short: `shop-too-fast-short-1`

This was run the way reelbot would: run `--check`, edit only `recipe.json` from the messages, and repeat. The
recipe had passed every older gate.

**Pass 0: 5 findings.**
- R2: Sam's head sliced by the right edge in S03.
- R3: the jar `SHOP 1` (S05) and the `24% APR` board (S08) cross the left edge.
- R4: white on `#1f9e4f` is 3.46:1; `QUIET STREET` is 41.7 px.

**Pass 1: 5 edits, each straight from a message.**
- Sam `mark:-0.66,0,0`.
- Jar: `at +0.02` and `color #1a8643`.
- APR: `at +0.03`.
- `QUIET STREET`: `size [1.38, 0.43]`.

Pass 1 left 5 findings, and showed two weaknesses in the advice:
- The jar is the **camera target**, so moving it moved the camera too.
- Moves taken from the first violating frame were too small for a push-in.

The QA was fixed:
- advice now comes from the worst frame;
- target boards get "shrink it / pull back".

**Pass 2: 3 edits.**
- Sam `mark:0.8,0,0`, fully out of the slam (the message's "or fully out of frame").
- S05 `cam.dist 3.4 → 3.8` (the message's x1.11).
- APR `at +0.04`.

**Result: `--check` exit 0, 0 framing findings.** That took 2 passes, 8 field edits, and 7 that stuck (Sam's first
move was replaced).

Stills, before / after (frames 96, 345, 570): docs/framing_qa/writer_loop_shop_too_fast_short_1.jpg.

## The fixture: the five reported defects, all caught

`node tools/recipe_build.mjs framing-defects --check --shorts tools/qa_fixtures`. After the follow-ups, the fixture's
lifted shot no longer touches the top: that one was engine-caused.

- FAIL S03 subject spender (camera target) is cut by the frame (worst at 11.23 s): its head box (incl. antennae/hair) touches the left edge; head centre x 553 of 1080. Fix: pull the camera back (cam.dist +0.4)
- FAIL S04 spender's head is sliced by the right frame edge (worst at 12.67 s, 10 % of it in frame): move spender 0.41 m into frame (add -0.41,+0.00,-0.00 to its at) or fully out of frame, or re-aim the camera
- FAIL S02 board due 'MINIMUM DUE / $143 -> $90' crosses the left+right+top frame edge (x -223-1179, y -285-510; keep 32 px clear; worst at 7.53 s): the board is wider/taller than the frame here: shrink its size (x0.67) or pull the camera back (cam.dist x1.50)
- FAIL S03 board yrs '16 YEARS' crosses the right+top frame edge (x 76-1215, y -186-308; keep 32 px clear; worst at 11.23 s): the board is wider/taller than the frame here: shrink its size (x0.82) or pull the camera back (cam.dist x1.22)
- FAIL S04 board b1 '$143' crosses the left frame edge (x -524-2, y 336-611; keep 32 px clear; worst at 15.13 s): move it 0.54 m into frame (add +0.54,-0.01,+0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S05 board owe 'OWE $4,950' crosses the left frame edge (x -1205-0, y 674-975; keep 32 px clear; worst at 17.97 s): the board is wider/taller than the frame here: shrink its size (x0.77) or pull the camera back (cam.dist x1.29)
- FAIL S06 board fine 'FINE PRINT / MIN 2% OR $25' crosses the right frame edge (x 825-1124, y 1218-1377; keep 32 px clear; worst at 24.63 s): move it 0.07 m into frame (add -0.07,+0.00,-0.01 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S04 label b2 '$90': text #fff4c8 on fill #1f9e4f is 3.14:1 (needs 4.5:1, line '$90'): set its color to #197e3f (same hue, 4.6:1) or set its fg to #16121c
- FAIL S06 label fine 'FINE PRINT / MIN 2% OR $25': text #fff4c8 on fill #a89f8c is 2.38:1 (needs 4.5:1, line 'FINE PRINT'): set its color to #716b5f (same hue, 4.8:1) or set its fg to #16121c
- FAIL S06 board fine 'FINE PRINT / MIN 2% OR $25': main line 'FINE PRINT' is 37.9 px (font size; cap 27 px; median while on screen, e.g. at 22.07 s; needs 42 px to read on a phone): enlarge it to size [0.30, 0.14, 0.05] (x1.16), move the camera closer (cam.dist x0.86), or shorten the line 'FINE PRINT' (long lines shrink to fit)
- FAIL frame 0 subject spender's face is 245 px tall (13 % of the frame; a close shot needs 307 px): aim the frame-0 camera at "spender.face" and move it in (cam.dist x0.80), e.g. hookZoom with dist 1.7
- CLIP S02 board due 'MINIMUM DUE / $143 -> $90' is on spender's head on screen (at the head; head box incl. antennae/hair; worst at 7.53 s): move it up 0.16 m (add +0.00,+0.16,-0.02 to its at) or 0.46 m to screen-left of spender (add -0.45,+0.01,+0.06 to its at), or move spender clear of it.
- CLIP S03 board yrs '16 YEARS' is on spender's head on screen (at the head; head box incl. antennae/hair; worst at 7.63 s): move it up 0.09 m (add +0.00,+0.09,-0.01 to its at) or 0.57 m to screen-right of spender (add +0.57,-0.00,+0.04 to its at), or move spender clear of it.
