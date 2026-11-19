# s2-same-paycheck: recipe QA (tools/recipe_build.mjs)

Composition: `S2SamePaycheckRecipe` (+ `S2SamePaycheckRecipeSub`) in `src/index.toolkit.ts`. Style S2. 8 shots, 23.13 s.

## Clip QA: 694 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender (half) 95 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "SAME $2,000. ONE IS BROKE." (5 words, until 4.42 s) |
| who + what readable at frame 0 (a character >= 15 % and a prop in view) | PASS | who: spender (half), saver, saver (half); what: payP (half), payS, payS (half) |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | Same at 0.00 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | tag from 4.52 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 1.95, hit 0.12, cut 1.03 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an emotion change by 1.5 s | PASS | at 1.00 s |
| no wide or dark shot in the first 1 s | PASS | S01 splitScreen/home |
| a live race or ticking stake through the middle 35-70 % (watch-time data) | PASS | race "SAVED SO FAR" |
| first cut by 1.5 s (research round 2) | PASS | S02 at 1.03 s |
| about 12-14 shots per 30 s (research round 2) | warn | 8 shots in 23.1 s = 10.4 per 30 s |
| the last frame matches frame 0 (loop) | warn | lens moved 1.95 m, fov 34 vs 45 |
| length 20-30 s | PASS | 23.13 s |

Frame-0 coverage by subject: spender (half) 95 %, saver 95 %, saver (half) 95 %, payP (half) 38 %, payS 38 %.
