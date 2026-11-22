# Caption-safe framing: framing QA rule R6 (branch `engine/caption-safe`)

## The problem
Burned-in word captions (the bottom-centre band) landed on characters' chins, necks or chests in close and mid shots.
An AI editor flagged it on 4 of 8 recent Shorts. The existing caption plan and caption-safe lift only look at the
eyes-to-mouth box, so a caption on the chin or neck passed every check.

## What changed
- **`tools/framing_qa.mjs`, a new rule R6 (FAIL)**, shared by Block Money and all four kits, Shorts and long-form.
  While a caption is on screen, its line boxes may not overlap any character's head box (the R1/R2 head incl.
  hair / antennae), face box, or a neck / collar box hanging under the face.
  - `captionLines()` lays the chunk out like the caption components do: Poppins 800 widths, flex-wrap in the 240 px
    box, or the long-form 2-line balanced lower third, plus the stroke. So "A JOKE" is a ~350 px box, not the whole band.
  - Tuning:
    - actors under 15 % of the frame height are skipped;
    - the overlap must be > 6 px on both axes and >= 400 px² of the exact silhouette;
    - it must last 3 frames (like R1).
  - The worst frame is the one needing the most lift. The head room is tracked over the whole shot, so a push-in can't
    turn the advice into an R2 failure.
  - Advice, with numbers:
    1. `put <id> higher in frame: lift it N px (cam.face a -> b ...)`
    2. `pull the camera back (cam.dist xN)` (only up to x2.5)
    3. lift what fits and pull back, or re-aim at the face (`"<id>.face"`; biz3d `"<id>.head"`) at `cam.face 0.40`
       with `cam.dist xN`
    4. move the actor sideways out of the caption's width, only if R2 still holds afterwards
- **Caption geometry per engine** (the real constants from each film / hud / layout):
  - **Block Money:** `framingAt` in `src/fin/recipe/compile.tsx` returns `captionSpec`: `capPlan(c, shot).y`, 84 px,
    170 px sides; long-form `capPlanL`. `recipe_build.mjs` turns it into line boxes.
  - **Kits** (`tools/framing_kits.mjs` `kitCaption`):
    - tech3d: `CAP_CENTRE` 1344, 82 px, 170 px sides
    - law3d: `capCentre` 1350, `capFs` 84, `capSide` 150
    - biz3d: `cap.centre` 1344, 82 px, 170 px sides
    - cyber3d: `cap.centre` 1344, 80 px, 150 px sides
    - long-form: the shot's lower-third `capY` (60 px, 240 px sides)
  - Shared by all: the same chunking (`chunkWords`, now exported as `capChunkWords` from each kit entry), the 1.0 s
    start, fixed shot captions, and `"off"`.
- **Neck box per cast** (`neckDrop` x the face-box height; checked on stills):
  - law3d / cyber3d figures: 0.3. With 0.5, three law3d shots fired with the caption on the shirt front, which the
    owner's rule v2 allows.
  - biz3d executives: 0.5 (a long neck).
  - BOLT: 0.2 (no neck, just the bezel's chin).
  - Block Money: 0.05 (the block head sits on the torso). With 0.3, `overdraft-35` fired 10 times, all captions on the
    chest (checked on stills of all 7 shots); with 0.05, 0.
- **Gate row** `framing R6` in the kit reports; the summary line gains `R6 caption on face/neck N`.
- **Docs:** ENGINE.md "Framing QA" (R6 row, geometry, tuning and reasons), RECIPE_GUIDE.md §4.1 (R6 row + typical
  fix), each KIT_*.md "Framing rules" (R6 bullet with that cast's neck and the usual fix).
- **Item 3, the caption-safe lift also clearing the neck: NOT done (it was optional).** Changing the lift re-frames
  existing Shorts and changes their `.gen.ts`, which breaks "don't change other behaviour". R6 now reports what the
  lift leaves. It's an easy follow-up: in `capPlan`, use the face bottom + 0.05 x head height for Block Money, and the
  kits' long-form `faceBands`.

## Counts: `node tools/recipe_build.mjs <slug> --check`, all 35 recipes
R1-R5: every R1-R5 line is identical before and after on all 35 recipes (diffed with timings normalised). Every exit
code is identical too. Only these 4 exit 0, before and after: biz-demo-blockbuster-passed, biz-demo-landscape-short-1,
cyber-demo-landscape-short-1, cyber-fake-supplier. No passing recipe newly fails. Every recipe where R6 fires was
already failing on R1-R5. The fixture `tools/qa_fixtures/framing-defects` still flags R1-R5 (R6 0).
`dollar-1970`, `four-money-minds`, `penny-doubles`, `rule-of-72`, `same-car-more`, `surprise-bill`,
`thousand-four-ways` (shorts) and `kit-tests` (longform) have no recipe.json, so there is nothing to check.

| recipe | engine | R6 before | R6 after |
|---|---|---|---|
| atm-fee-twenty | blockmoney | 0 | 1 |
| biz-demo-blockbuster-passed | biz3d | 0 | 0 |
| biz-demo-landscape-short-1 | biz3d | 0 | 0 |
| biz-demo-landscape | biz3d/landscape | 0 | 0 |
| coffee-could-be | blockmoney | 0 | 1 |
| credit-score-car | blockmoney | 0 | 0 |
| cyber-demo-landscape-short-1 | cyber3d | 0 | 0 |
| cyber-demo-landscape | cyber3d/landscape | 0 | 0 |
| cyber-fake-supplier | cyber3d | 0 | 0 |
| delivery-markup | blockmoney | 0 | 1 |
| employer-match | blockmoney | 0 | 2 |
| fake-sale | blockmoney | 0 | 1 |
| fee-one-percent | blockmoney | 0 | 0 |
| free-trial-204 | blockmoney | 0 | 1 |
| law-demo-54-million-pants | law3d | 0 | 2 |
| law-demo-landscape-short-1 | law3d | 0 | 2 |
| law-demo-landscape | law3d/landscape | 0 | 0 |
| minimum-payment-trap | blockmoney | 0 | 1 |
| mortgage-year-ten | blockmoney | 0 | 0 |
| overdraft-35 | blockmoney | 0 | 0 |
| payday-rollover | blockmoney | 0 | 2 |
| prices-double | blockmoney | 0 | 0 |
| quit-cash-out | blockmoney | 0 | 0 |
| raise-tax-myth | blockmoney | 0 | 3 |
| same-raise | blockmoney | 0 | 1 |
| seven-year-car | blockmoney | 0 | 0 |
| shop-too-fast-short-1 | blockmoney | 0 | 0 |
| shop-too-fast | blockmoney/landscape | 0 | 1 |
| start-25-vs-35 | blockmoney | 0 | 0 |
| tech-demo-landscape-short-1 | tech3d | 0 | 2 |
| tech-demo-landscape | tech3d/landscape | 0 | 2 |
| tech-demo-planes-land-blind | tech3d | 0 | 3 |
| ten-beats-thirty | blockmoney | 0 | 0 |
| wedding-or-keys | blockmoney | 0 | 0 |
| zero-percent-couch | blockmoney | 0 | 3 |

Total: 29 R6 findings in 17 of 35 recipes (all 0 before). By engine:
- **Block Money Shorts:** 17 in 11 recipes. Mostly a head low in a split-screen bottom view, or a close-up with the
  chin on the band.
- **tech3d:** 7 (5 in the 2 Shorts, 2 in the long-form), very close BOLT shots.
- **law3d:** 4 in the 2 Shorts, close-ups of Pearson.
- **long-form Block Money:** 1 (`shop-too-fast`).
- **biz3d and cyber3d:** 0. The demos' biz3d shots frame the executives' heads high. Even a full-face-height neck box
  only grazes once (`biz-demo-blockbuster-passed` S15).

The Shorts the editor named (the "A JOKE" / "SAYING" / "PART WRONG" ones) are not in this repo: no timings.json has
those words. So the law3d and biz3d before/after examples below are the closest available ones.

## Before / after stills (plain 30 fps composition, 0.5 scale, no motion blur)
`docs/framing_qa/r6/r6_before_after.jpg`, left to right:

1. `law_S08_before`: `law-demo-54-million-pants` S08 at 14.93 s, "MY PANTS" on Pearson's neck. R6 says: lift 210 px
   (cam.face 0.44 -> 0.33) or cam.dist x1.53.
2. `law_S08_after`: S08 with `"face": 0.33`; the caption is on the shirt.
3. `law_S10_before`: S10 at 18.53 s, "HE SAID NO" over the chin / neck. R6 says: cam.face 0.44 -> 0.38.
4. `law_S10_after`: S10 with `"face": 0.38`; the caption is clear of the neck.
5. `biz_S06_before`: biz3d, a copy of `biz-demo-blockbuster-passed` with S06 pushed in too close (closeUp
   `dist` 1.5, `face` 0.85, aimed at the chest), so "BY ONE" sits on the CEO's neck / collar. No real biz3d recipe in
   the repo triggers R6, so this break is constructed. R6 says: the target (the chest) is under the caption, so
   aim at `"ceo.head"` with `cam.face 0.40`, `cam.dist x1.30`.
6. `biz_S06_after`: that fix (dist 1.95). The shot pushes in, so a second `--check` asked for `cam.face 0.40 -> 0.35`.
   Applied: the head is high and the caption sits on the shirt.
7. `biz_S06b_before`: the same shot at 13.73 s.
8. `biz_S06b_after`: the same shot at 13.73 s, fixed.

The copies passing:
- `docs/framing_qa/r6/law-r6-fix.recipe.json`: R6 2 -> 0. R1-R4 are unchanged; they were the original recipe's own
  findings.
- `biz-r6-break.recipe.json`: R6 1.
- `biz-r6-fix.recipe.json`: 0 clips, 0 fails, exit 0.

To reproduce, put the file as `<dir>/<slug>/recipe.json` with the original's `vo/timings.json`, then run
`node tools/recipe_build.mjs <slug> --check --shorts <dir>`. The stills' temporary `.gen.ts` / registry entries were
generated, rendered and reverted. Nothing about them is committed.

## Checks
- `npx tsc --noEmit` passes.
- `--check` is deterministic: two runs diff equal, timings aside.
- R6 costs < 0.05 s per Short.

## Left / known limits
- **Item 3, the caption-safe lift with the neck,** is not done; see above.
- **Boxes are approximations.** The neck box is a box under the face. On a strongly yawed head its corners are a few
  px generous.
- **Pops are not modelled.** The caption's 0.92-1.05 word pop and its 14 px enter slide are ignored; the final
  position is used.
- **A push-in can need two passes.** A shot that keeps pushing in can still need a second `--check` pass after the
  first fix (the biz example did). The advice is sized at the worst frame, but a new target or face changes the push.
- **Split-screen wording.** For the split-screen bottom view, the advice says `cam.face` but means `face2` / `dist2`.
  RECIPE_GUIDE says so.

## All R6 findings (after)

**atm-fee-twenty**

- S10 caption 'THAT'S OVER / FIVE' covers spender's chin (worst at 22.50 s: caption line 'THAT'S OVER' x 260-820, y 1251-1346; spender head-to-neck box y 980-1263, 1406 px² covered). Fix: put spender higher in frame: lift it 24 px (cam.face 0.26 -> 0.25, or aim cam.target lower on the body; its head keeps >= 466 px below the top all shot), or pull the camera back (cam.dist x1.07)

**coffee-could-be**

- S13 caption 'EIGHTY-SIX / THOUSAND SIX' covers saver's head (worst at 24.30 s: caption line 'THOUSAND SIX' x 214-866, y 1356-1452; saver head-to-neck box y 1386-2036, 7047 px² covered). Fix: put saver higher in frame: lift it 811 px (cam.face 0.48 -> 0.06, or aim cam.target lower on the body; its head keeps >= 419 px below the top all shot)

**delivery-markup**

- S06 caption 'HIGHER MENU / PRICE' covers spender's chin (worst at 15.20 s: caption line 'HIGHER MENU' x 243-838, y 1236-1332; spender head-to-neck box y 728-1266, 8381 px² covered). Fix: put spender higher in frame: lift it 42 px (cam.face 0.32 -> 0.30, or aim cam.target lower on the body; its head keeps >= 628 px below the top all shot), or pull the camera back (cam.dist x1.11)

**employer-match**

- S11 caption 'THEN THE / STATEMENTS' covers spender's chin (worst at 19.80 s: caption line 'THEN THE' x 333-747, y 1236-1332; spender head-to-neck box y 157-1252, 3192 px² covered). Fix: put spender higher in frame: lift it 28 px (cam.face 0.48 -> 0.47, or aim cam.target lower on the body; its head keeps >= 66 px below the top all shot), or pull the camera back (cam.dist x1.14)
- S13 caption 'SPENDER' covers saver's head (worst at 25.57 s: caption line 'SPENDER' x 347-733, y 1296-1392; saver head-to-neck box y 1379-2139, 1187 px² covered). Fix: lift it 826 px (cam.face 0.48 -> 0.05) and pull the camera back (cam.dist x1.07)

**fake-sale**

- S02 caption 'IN THIS EXAMPLE' covers spender's head (worst at 5.10 s: caption line 'IN THIS EXAMPLE' x 177-903, y 1296-1392; spender head-to-neck box y 928-1474, 3021 px² covered). Fix: put spender higher in frame: lift it 189 px (cam.face 0.44 -> 0.34, or aim cam.target lower on the body; its head keeps >= 693 px below the top all shot), or pull the camera back (cam.dist x1.48)

**free-trial-204**

- S11 caption 'ABOUT TWO / HUNDRED' covers spender's face (worst at 20.27 s: caption line 'ABOUT TWO' x 273-807, y 1236-1332; spender head-to-neck box y 1071-1414, 18775 px² covered). Fix: put spender higher in frame: lift it 190 px (cam.face 0.26 -> 0.16, or aim cam.target lower on the body; its head keeps >= 188 px below the top all shot), or pull the camera back (cam.dist x1.31)

**law-demo-54-million-pants**

- S08 caption 'MY PANTS' covers pearson's chin / neck (worst at 14.93 s: caption line 'MY PANTS' x 311-769, y 1299-1401; pearson head-to-neck box y 393-1497, 46896 px² covered). Fix: put pearson higher in frame: lift it 210 px (cam.face 0.44 -> 0.33, or aim cam.target lower on the body; its head keeps >= 168 px below the top all shot), or pull the camera back (cam.dist x1.53)
- S10 caption 'HE SAID NO' covers pearson's chin / neck (worst at 18.53 s: caption line 'HE SAID NO' x 289-791, y 1299-1401; pearson head-to-neck box y 511-1411, 48072 px² covered). Fix: put pearson higher in frame: lift it 124 px (cam.face 0.44 -> 0.38, or aim cam.target lower on the body; its head keeps >= 372 px below the top all shot), or pull the camera back (cam.dist x1.33)

**law-demo-landscape-short-1**

- S04 caption 'MY PANTS' covers pearson's chin / neck (worst at 6.03 s: caption line 'MY PANTS' x 311-769, y 1299-1401; pearson head-to-neck box y 393-1495, 46896 px² covered). Fix: put pearson higher in frame: lift it 208 px (cam.face 0.44 -> 0.33, or aim cam.target lower on the body; its head keeps >= 170 px below the top all shot), or pull the camera back (cam.dist x1.53)
- S06 caption 'HE SAID NO' covers pearson's chin / neck (worst at 9.67 s: caption line 'HE SAID NO' x 289-791, y 1299-1401; pearson head-to-neck box y 507-1411, 45960 px² covered). Fix: put pearson higher in frame: lift it 124 px (cam.face 0.44 -> 0.38, or aim cam.target lower on the body; its head keeps >= 368 px below the top all shot), or pull the camera back (cam.dist x1.33)

**minimum-payment-trap**

- S22 caption 'LIKE SPENDER' covers spender's head (worst at 23.23 s: caption line 'LIKE SPENDER' x 248-832, y 874-969; spender head-to-neck box y 854-1327, 5535 px² covered). Fix: put spender higher in frame: lift it 466 px (cam.face 0.52 -> 0.28, or aim cam.target lower on the body; its head keeps >= 330 px below the top all shot)

**payday-rollover**

- S11 (bottom) caption 'SPENDER HAS / PAID' covers saver's head (worst at 21.73 s: caption line 'PAID' x 434-646, y 1356-1452; saver head-to-neck box y 1368-1764, 7601 px² covered). Fix: saver's head sits in the caption band (y 1368-1764): aim this shot at saver (cam.target "saver.face" with cam.face 0.40), or move saver out of the shot or behind the subject
- S14 (bottom) caption 'SAVER PAID / ONCE' covers saver's head (worst at 27.33 s: caption line 'ONCE' x 416-664, y 1356-1452; saver head-to-neck box y 1361-1724, 6639 px² covered). Fix: saver's head sits in the caption band (y 1361-1724): aim this shot at saver (cam.target "saver.face" with cam.face 0.40), or move saver out of the shot or behind the subject

**raise-tax-myth**

- S02 caption 'DOLLAR RAISE / BECAUSE' covers spender's chin (worst at 2.40 s: caption line 'DOLLAR RAISE' x 239-841, y 1236-1332; spender head-to-neck box y 801-1249, 2096 px² covered). Fix: put spender higher in frame: lift it 25 px (cam.face 0.35 -> 0.33, or aim cam.target lower on the body; its head keeps >= 730 px below the top all shot), or pull the camera back (cam.dist x1.09)
- S18 caption 'SAVER KEEPS / ABOUT' covers saver's chin (worst at 43.83 s: caption line 'SAVER KEEPS' x 256-824, y 1278-1373; saver head-to-neck box y 991-1292, 1560 px² covered). Fix: put saver higher in frame: lift it 27 px (cam.face 0.26 -> 0.25, or aim cam.target lower on the body; its head keeps >= 566 px below the top all shot), or pull the camera back (cam.dist x1.08)
- S20 caption 'THOUSAND / DOLLARS HE' covers saver's chin (worst at 51.07 s: caption line 'THOUSAND' x 296-784, y 1236-1332; saver head-to-neck box y 747-1272, 7329 px² covered). Fix: put saver higher in frame: lift it 48 px (cam.face 0.28 -> 0.25, or aim cam.target lower on the body; its head keeps >= 614 px below the top all shot), or pull the camera back (cam.dist x1.11)

**same-raise**

- S04 (bottom) caption 'SPENDER SPENDS / ALL' covers spender's head (worst at 4.17 s: caption line 'ALL' x 464-616, y 960-1054; spender head-to-neck box y 922-1373, 5187 px² covered). Fix: spender's head sits in the caption band (y 922-1373): aim this shot at spender (cam.target "spender.face" with cam.face 0.40), or move spender out of the shot or behind the subject, or move spender 0.26 m to screen-right (add +0.26,-0.00,+0.00 to its at) so the caption (x 464-616) clears it

**shop-too-fast**

- S08 caption 'SALES DOUBLED IN THE FIRST YEAR' covers sam's face (worst at 15.20 s: caption line 'SALES DOUBLED IN THE FIRST YEAR' x 435-1485, y 868-942; sam head-to-neck box y 741-932, 5962 px² covered). Fix: put sam higher in frame: lift it 76 px (cam.face 0.38 -> 0.31, or aim cam.target lower on the body; its head keeps >= 291 px below the top all shot), or pull the camera back (cam.dist x1.22)

**tech-demo-landscape-short-1**

- S03 caption 'RUNWAY' covers bolt's chin (worst at 3.53 s: caption line 'RUNWAY' x 342-738, y 1294-1394; bolt head-to-neck box y 261-1581, 39734 px² covered). Fix: pull the camera back (cam.dist x1.90), or lift it 151 px (cam.face 0.48 -> 0.40) and pull the camera back (cam.dist x1.34)
- S11 caption 'AND THE / AUTOPILOT' covers bolt's chin (worst at 25.23 s: caption line 'AND THE' x 351-729, y 1234-1334; bolt head-to-neck box y 1019-1382, 1381 px² covered). Fix: put bolt higher in frame: lift it 160 px (cam.face 0.47 -> 0.39, or aim cam.target lower on the body; its head keeps >= 676 px below the top all shot), or pull the camera back (cam.dist x1.56)

**tech-demo-landscape**

- S03 caption 'SEE THE RUNWAY' covers bolt's chin (worst at 3.43 s: caption line 'SEE THE RUNWAY' x 693-1227, y 868-942; bolt head-to-neck box y 147-889, 7768 px² covered). Fix: put bolt higher in frame: lift it 33 px (cam.face 0.48 -> 0.45, or aim cam.target lower on the body; its head keeps >= 37 px below the top all shot), or pull the camera back (cam.dist x1.14), or move bolt 0.57 m to screen-right (add +0.55,-0.01,+0.15 to its at) so the caption (x 693-1227) clears it
- S11 caption 'ANTENNAS IN THE NOSE CATCH BOTH BEAMS' covers bolt's chin (worst at 23.73 s: caption line 'ANTENNAS IN THE NOSE CATCH BOTH BEAMS' x 274-1646, y 868-942; bolt head-to-neck box y 586-908, 5828 px² covered). Fix: put bolt higher in frame: lift it 51 px (cam.face 0.47 -> 0.42, or aim cam.target lower on the body; its head keeps >= 395 px below the top all shot), or pull the camera back (cam.dist x1.19)

**tech-demo-planes-land-blind**

- S03 caption 'RUNWAY' covers bolt's chin (worst at 3.43 s: caption line 'RUNWAY' x 342-738, y 1294-1394; bolt head-to-neck box y 261-1581, 39734 px² covered). Fix: pull the camera back (cam.dist x1.90), or lift it 151 px (cam.face 0.48 -> 0.40) and pull the camera back (cam.dist x1.34)
- S11 caption 'AND THE / AUTOPILOT' covers bolt's chin (worst at 25.13 s: caption line 'AND THE' x 351-729, y 1234-1334; bolt head-to-neck box y 1016-1380, 1381 px² covered). Fix: put bolt higher in frame: lift it 158 px (cam.face 0.47 -> 0.39, or aim cam.target lower on the body; its head keeps >= 671 px below the top all shot), or pull the camera back (cam.dist x1.55)
- S14 caption 'ASK' covers bolt's face (worst at 34.17 s: caption line 'ASK' x 447-633, y 1294-1394; bolt head-to-neck box y 213-1611, 18647 px² covered). Fix: pull the camera back (cam.dist x1.94), or lift it 77 px (cam.face 0.47 -> 0.43) and pull the camera back (cam.dist x1.61)

**zero-percent-couch**

- S07 (bottom) caption 'TWELVE MONTHS / LATER' covers saver's head (worst at 10.00 s: caption line 'LATER' x 408-672, y 1356-1452; saver head-to-neck box y 1339-1691, 11675 px² covered). Fix: saver's head sits in the caption band (y 1339-1691): aim this shot at saver (cam.target "saver.face" with cam.face 0.40), or move saver out of the shot or behind the subject
- S12 caption 'ABOUT TWO / HUNDRED' covers spender's head (worst at 23.93 s: caption line 'ABOUT TWO' x 273-807, y 1236-1332; spender head-to-neck box y 1176-1450, 14611 px² covered). Fix: put spender higher in frame: lift it 226 px (cam.face 0.34 -> 0.22, or aim cam.target lower on the body; its head keeps >= 568 px below the top all shot), or pull the camera back (cam.dist x1.45)
- S13 (bottom) caption 'SAVER PAID / NOTHING' covers saver's head (worst at 27.07 s: caption line 'NOTHING' x 338-742, y 1356-1452; saver head-to-neck box y 1360-1715, 6510 px² covered). Fix: saver's head sits in the caption band (y 1360-1715): aim this shot at saver (cam.target "saver.face" with cam.face 0.40), or move saver out of the shot or behind the subject

