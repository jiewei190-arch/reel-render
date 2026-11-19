# s1-split-payments: recipe QA (tools/recipe_build.mjs)

Composition: `S1SplitPaymentsRecipe` (+ `S1SplitPaymentsRecipeSub`) in `src/index.toolkit.ts`. Style S1. 8 shots, 23.87 s.

## Clip QA: 716 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 72 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "$500 GONE IN ONE DAY" (5 words, until 4.46 s) |
| who + what readable at frame 0 (a character >= 15 % and a prop in view) | PASS | who: spender; what: shoes |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | Four at 0.00 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | tag from 5.72 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 0.38, hit 0.30, cut 2.07, hit 2.07 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an emotion change by 1.5 s | PASS | at 0.23 s |
| no wide or dark shot in the first 1 s | PASS | S01 hookZoom/store |
| a live race or ticking stake through the middle 35-70 % (watch-time data) | warn | count-up props only |
| length 20-30 s | PASS | 23.87 s |

Frame-0 coverage by subject: spender 72 %, shoes 17 %, egg.mug0 2 %, egg.cat1 0 %.
