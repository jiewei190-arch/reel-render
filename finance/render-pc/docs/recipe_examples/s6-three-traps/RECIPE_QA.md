# s6-three-traps: recipe QA (tools/recipe_build.mjs)

Composition: `S6ThreeTrapsRecipe` (+ `S6ThreeTrapsRecipeSub`) in `src/index.toolkit.ts`. Style S6. 6 shots, 24.17 s.

## Clip QA: 725 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 56 % |
| hook text on screen at frame 0, <= 8 words | PASS | "3 MONEY TRAPS. #1 IS THE WORST." (7 words, until 4.24 s) |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.3 s | PASS | Three at 0.00 s |
| music + an SFX at frame 0 | PASS | upbeat, whoosh |
| an emotion change by 1.5 s | PASS | at 0.20 s |
| no wide or dark shot in the first 1 s | PASS | S01 slamZoom/earth |
| length 20-30 s | PASS | 24.17 s |

Frame-0 coverage by subject: spender 56 %, three 0 %, every 0 %.
