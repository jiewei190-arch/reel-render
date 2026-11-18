# s6-three-traps: recipe QA (tools/recipe_build.mjs)

Composition: `S6ThreeTrapsRecipe` (+ `S6ThreeTrapsRecipeSub`) in `src/index.toolkit.ts`. Style S6. 6 shots, 24.17 s.

## Clip QA: 725 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 56 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "3 TRAPS. #1 IS WORST." (5 words, until 4.24 s) |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | Three at 0.00 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | tag from 4.34 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 0.25, hit 0.20 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an emotion change by 1.5 s | PASS | at 0.20 s |
| no wide or dark shot in the first 1 s | PASS | S01 slamZoom/earth |
| length 20-30 s | PASS | 24.17 s |

Frame-0 coverage by subject: spender 56 %, three 0 %, every 0 %.
