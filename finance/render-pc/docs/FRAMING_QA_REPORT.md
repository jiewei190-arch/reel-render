# Framing QA: every existing recipe, rule by rule (branch engine/qa-framing)

Every recipe was run with `node tools/recipe_build.mjs <slug> --check` on the 4-core cloud machine. Nothing was
loosened to make a recipe pass: the tuning and its reasons are in ENGINE.md "Framing QA".

## What the new rules catch

**All 35 recipes now flag**, so every exit code is 1:
- 30 Shorts;
- 5 long-form tests (the Shorts R5 rule is skipped there).

Before this branch, 12 of them already failed an older gate (exit 1 in "before"). The other 23 are **newly flagged**.

**Most of the flags are real defects.** Stills of `minimum-payment-trap` (frames 2, 201, 366), `seven-year-car` (235)
and `shop-too-fast-short-1` (70) show every class:
- antennae inside a board or over the OWE block;
- a board cropped at the frame edge;
- a head cut at the frame edge;
- washed-out boards.

### Why they flag, by rule

**R1, a board on a head (107 clips).**
- 95 are boards: mostly labels floating just above or behind a character's head, and the big OWE / calendar / TV boards
  behind the head.
- 8 are kit cards over BOLT or a figure.
- 4 are small props.

**R2, the subject in frame (171).** Most of these are the head box touching the top edge (106), i.e. the antennae cut
off:
- 77 of those are in split screens, where the bottom view is lifted under the seam by caption-safe framing;
- the rest are tight slam-zooms.

The other R2 hits:
- 26 are another actor's head sliced by a side edge;
- 13 are a subject with less than 85 % of the body in frame.

**R3, a board past the frame edge (237).**
- Featured boards near the top margin under the hook.
- Background boards (OWE, calendar, jar, pay box, TV) cropped at the sides.
- Boards wider than the frame in close shots (44 hits say "wider/taller than the frame").

**R4, contrast (122).** 107 are the standard green:
- cream `#fff4c8` on green `#1f9e4f`, or green text on the cream plate: 3.14:1;
- white on green: 3.46:1.

The rest are yellow, orange and blue fills under cream text. Fix: `color` `#197e3f`, or `"fg": "#16121c"`.

**R4, text size (11).** Small featured boards and email tiles.

**R5, frame 0 (3).**
- `minimum-payment-trap`: frame 0 on the falling TV, with Spender small.
- The two biz3d hook shots: the executive's face is 259 px, at 2.3-2.6 m.

## Per recipe

R1 counts clips; the other columns count fails. "Framing time" is the framing pass alone. "Build --check" is the whole
compile + QA + gate.

| recipe | kit / format | exit before -> now | build --check | frames | framing time | R1 clips | R2 | R3 | R4 contrast | R4 size | R5 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| atm-fee-twenty | blockmoney/short | 0 -> 1 | 0.48 s | 867 | 0.09 s | 5 | 5 | 6 | 3 | 1 | 0 |
| biz-demo-blockbuster-passed | biz3d/short | 0 -> 1 | 0.41 s | 1134 | 0.04 s | 0 | 2 | 0 | 0 | 0 | 1 |
| biz-demo-landscape-short-1 | biz3d/short | 0 -> 1 | 0.43 s | 940 | 0.04 s | 1 | 2 | 0 | 0 | 0 | 1 |
| coffee-could-be | blockmoney/short | 0 -> 1 | 0.55 s | 885 | 0.14 s | 1 | 13 | 5 | 5 | 0 | 0 |
| credit-score-car | blockmoney/short | 1 -> 1 | 0.50 s | 875 | 0.11 s | 4 | 10 | 5 | 5 | 0 | 0 |
| cyber-demo-landscape-short-1 | cyber3d/short | 0 -> 1 | 0.41 s | 890 | 0.04 s | 0 | 0 | 2 | 0 | 0 | 0 |
| cyber-fake-supplier | cyber3d/short | 0 -> 1 | 0.44 s | 1223 | 0.05 s | 0 | 0 | 2 | 0 | 0 | 0 |
| delivery-markup | blockmoney/short | 1 -> 1 | 0.49 s | 874 | 0.10 s | 3 | 7 | 9 | 4 | 0 | 0 |
| employer-match | blockmoney/short | 1 -> 1 | 0.44 s | 874 | 0.08 s | 1 | 7 | 7 | 8 | 0 | 0 |
| fake-sale | blockmoney/short | 1 -> 1 | 0.47 s | 874 | 0.10 s | 4 | 7 | 6 | 3 | 0 | 0 |
| fee-one-percent | blockmoney/short | 0 -> 1 | 0.45 s | 874 | 0.09 s | 2 | 7 | 9 | 4 | 0 | 0 |
| free-trial-204 | blockmoney/short | 0 -> 1 | 0.50 s | 885 | 0.10 s | 5 | 5 | 13 | 6 | 0 | 0 |
| law-demo-54-million-pants | law3d/short | 0 -> 1 | 0.43 s | 1249 | 0.07 s | 1 | 4 | 7 | 0 | 1 | 0 |
| law-demo-landscape-short-1 | law3d/short | 0 -> 1 | 0.39 s | 783 | 0.07 s | 2 | 2 | 5 | 0 | 1 | 0 |
| minimum-payment-trap | blockmoney/short | 1 -> 1 | 0.51 s | 699 | 0.10 s | 18 | 9 | 34 | 2 | 0 | 1 |
| mortgage-year-ten | blockmoney/short | 1 -> 1 | 0.48 s | 885 | 0.09 s | 2 | 3 | 11 | 3 | 0 | 0 |
| overdraft-35 | blockmoney/short | 1 -> 1 | 0.50 s | 885 | 0.12 s | 3 | 8 | 11 | 6 | 0 | 0 |
| payday-rollover | blockmoney/short | 0 -> 1 | 0.46 s | 885 | 0.08 s | 2 | 6 | 5 | 4 | 0 | 0 |
| prices-double | blockmoney/short | 1 -> 1 | 0.50 s | 874 | 0.12 s | 0 | 2 | 15 | 6 | 0 | 0 |
| quit-cash-out | blockmoney/short | 0 -> 1 | 0.44 s | 874 | 0.08 s | 3 | 4 | 5 | 7 | 0 | 0 |
| raise-tax-myth | blockmoney/short | 0 -> 1 | 0.58 s | 1620 | 0.12 s | 16 | 5 | 1 | 11 | 0 | 0 |
| same-raise | blockmoney/short | 1 -> 1 | 0.53 s | 885 | 0.11 s | 3 | 11 | 14 | 7 | 0 | 0 |
| seven-year-car | blockmoney/short | 0 -> 1 | 0.47 s | 885 | 0.10 s | 11 | 2 | 0 | 4 | 0 | 0 |
| shop-too-fast-short-1 | blockmoney/short | 0 -> 1 | 0.40 s | 674 | 0.05 s | 0 | 1 | 2 | 1 | 1 | 0 |
| start-25-vs-35 | blockmoney/short | 1 -> 1 | 0.48 s | 885 | 0.12 s | 6 | 10 | 18 | 6 | 0 | 0 |
| tech-demo-landscape-short-1 | tech3d/short | 0 -> 1 | 0.48 s | 945 | 0.06 s | 2 | 5 | 0 | 0 | 0 | 0 |
| tech-demo-planes-land-blind | tech3d/short | 0 -> 1 | 0.53 s | 1005 | 0.07 s | 2 | 6 | 0 | 0 | 0 | 0 |
| ten-beats-thirty | blockmoney/short | 1 -> 1 | 0.62 s | 874 | 0.15 s | 1 | 5 | 21 | 5 | 1 | 0 |
| wedding-or-keys | blockmoney/short | 0 -> 1 | 0.47 s | 885 | 0.09 s | 4 | 4 | 11 | 5 | 0 | 0 |
| zero-percent-couch | blockmoney/short | 1 -> 1 | 0.42 s | 885 | 0.07 s | 2 | 5 | 6 | 5 | 0 | 0 |
| biz-demo-landscape | biz3d/long | 0 -> 1 | 0.31 s | 1054 | 0.05 s | 1 | 1 | 0 | 0 | 0 | 0 |
| cyber-demo-landscape | cyber3d/long | 0 -> 1 | 0.34 s | 996 | 0.04 s | 0 | 0 | 0 | 0 | 1 | 0 |
| law-demo-landscape | law3d/long | 0 -> 1 | 0.36 s | 1039 | 0.07 s | 1 | 0 | 3 | 0 | 3 | 0 |
| shop-too-fast | blockmoney/long | 0 -> 1 | 0.54 s | 2608 | 0.18 s | 0 | 12 | 4 | 12 | 2 | 0 |
| tech-demo-landscape | tech3d/long | 0 -> 1 | 0.36 s | 942 | 0.06 s | 1 | 1 | 0 | 0 | 0 | 0 |

Totals over 35 recipes: 35 flag; R1 107, R2 171, R3 237, R4 contrast 122, R4 size 11, R5 3.

## The fixture: the five reported defects, all caught

`node tools/recipe_build.mjs framing-defects --check --shorts tools/qa_fixtures`
(tools/qa_fixtures/framing-defects; stills checked at frames 90, 350 and 471):

- FAIL S03 subject spender (camera target) is cut by the frame at 8.47 s: its head box (incl. antennae/hair) touches the right edge; head centre x 567 of 1080. Fix: move spender 0.01 m toward screen centre (add -0.01,+0.00,-0.00 to its at), or pull the camera back (cam.dist +0.4)
- FAIL S04 spender's head is sliced by the right frame edge at 11.40 s (35 % of it in frame): move spender 0.29 m into frame (add -0.29,+0.00,-0.00 to its at) or fully out of frame, or re-aim the camera
- FAIL S07 subject spender (camera target) is cut by the frame at 29.70 s: its head box (incl. antennae/hair) touches the top edge; head centre x 544 of 1080. Fix: lower the framing (cam.face +0.08), or pull the camera back (cam.dist +0.4)
- FAIL S02 board due 'MINIMUM DUE / $143 -> $90' crosses the left frame edge (x 22-935, y 156-642; keep 32 px clear) at 3.67 s: move it 0.02 m into frame (add +0.02,-0.00,-0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S03 board yrs '16 YEARS' crosses the right frame edge (x 200-1066, y 66-437; keep 32 px clear) at 7.93 s: move it 0.02 m into frame (add -0.02,+0.00,-0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S04 board b1 '$143' crosses the left frame edge (x -263-133, y 477-679; keep 32 px clear) at 11.63 s: move it 0.38 m into frame (add +0.38,-0.00,+0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S05 board owe 'OWE $4,950' crosses the left frame edge (x -981-77, y 709-968; keep 32 px clear) at 15.67 s: the board is wider/taller than the frame here: shrink its size (x0.91) or pull the camera back
- FAIL S06 board fine 'FINE PRINT / MIN 2% OR $25' crosses the right frame edge (x 794-1049, y 1184-1316; keep 32 px clear) at 22.80 s: move it 0.01 m into frame (add -0.01,+0.00,-0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S04 label b2 '$90': text #fff4c8 on fill #1f9e4f is 3.14:1 (needs 4.5:1, line '$90'): set its color to #197e3f (same hue, 4.6:1) or set its fg to #16121c
- FAIL S06 label fine 'FINE PRINT / MIN 2% OR $25': text #fff4c8 on fill #a89f8c is 2.38:1 (needs 4.5:1, line 'FINE PRINT'): set its color to #716b5f (same hue, 4.8:1) or set its fg to #16121c
- FAIL S06 board fine 'FINE PRINT / MIN 2% OR $25': main line 'FINE PRINT' is 38 px (font size; cap 27 px; median while on screen, e.g. at 22.07 s; needs 42 px to read on a phone): enlarge it to size [0.30, 0.14, 0.05] (x1.16), move the camera closer (cam.dist x0.86), or shorten the line 'FINE PRINT' (long lines shrink to fit)
- FAIL frame 0 subject spender's face is 245 px tall (13 % of the frame; a close shot needs 307 px): aim the frame-0 camera at "spender.face" and move it in (cam.dist x0.80), e.g. hookZoom with dist 1.7
- CLIP S02 board due 'MINIMUM DUE / $143 -> $90' is on spender's head on screen (at the head; head box incl. antennae/hair) at 2.90 s: move it up 0.16 m (add -0.00,+0.16,-0.02 to its at) or 0.49 m to screen-left of spender (add -0.49,+0.00,+0.07 to its at), or move spender clear of it
- CLIP S03 board yrs '16 YEARS' is on spender's head on screen (at the head; head box incl. antennae/hair) at 7.63 s: move it up 0.09 m (add +0.00,+0.09,-0.01 to its at) or 0.57 m to screen-right of spender (add +0.57,-0.00,+0.04 to its at), or move spender clear of it
