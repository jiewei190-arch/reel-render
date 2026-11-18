# s4-penny-or-million: recipe QA (tools/recipe_build.mjs)

Composition: `S4PennyOrMillionRecipe` (+ `S4PennyOrMillionRecipeSub`) in `src/index.toolkit.ts`. Style S4. 6 shots, 21.00 s.

## Clip QA: 630 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | million 80 % |
| hook text on screen at frame 0, <= 8 words | PASS | "$1 MILLION OR A DOUBLING PENNY?" (6 words, until 5.42 s) |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.3 s | PASS | A at 0.00 s |
| music + an SFX at frame 0 | PASS | upbeat, whoosh, whoosh |
| an emotion change by 1.5 s | PASS | at 1.03 s |
| no wide or dark shot in the first 1 s | PASS | S01 splitScreen/store |
| length 20-30 s | PASS | 21.00 s |

Frame-0 coverage by subject: million 80 %, million (half) 80 %, spender 0 %, saver 0 %, penny 0 %.
