# prices-double: recipe QA (tools/recipe_build.mjs)

Composition: `PricesDoubleRecipe` (+ `PricesDoubleRecipeSub`) in `src/index.toolkit.ts`. Style S3. 16 shots, 29.50 s.

## Clip QA: 885 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | clerk 89 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "EVERYTHING COSTS 2X" (3 words, until 3.49 s) |
| who + what readable at frame 0 (a character >= 15 % and a prop in view) | PASS | who: clerk; what: r3, r2, r1 |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | POV: at 0.09 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | paper |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | tag from 1.00 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 0.05, hit 0.30, hit 0.55, cut 1.42, hit 1.42, cut 2.46, hit 2.82 |
| music + an SFX at frame 0 | PASS | upbeat, paper, impact, thud |
| an emotion change by 1.5 s | PASS | at 0.63 s |
| no wide or dark shot in the first 1 s | PASS | S01 povFirstPerson/home |
| length 20-30 s | PASS | 29.50 s |

Frame-0 coverage by subject: clerk 89 %, r3 20 %, r2 12 %, r1 10 %, egg.cat0 0 %.
