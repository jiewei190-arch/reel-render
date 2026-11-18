# s2-same-paycheck: recipe QA (tools/recipe_build.mjs)

Composition: `S2SamePaycheckRecipe` (+ `S2SamePaycheckRecipeSub`) in `src/index.toolkit.ts`. Style S2. 7 shots, 23.13 s.

## Clip QA: 694 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | saver 95 % |
| hook text on screen at frame 0, <= 8 words | PASS | "SAME $2,000. ONE IS BROKE." (5 words, until 4.42 s) |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.3 s | PASS | Same at 0.00 s |
| music + an SFX at frame 0 | PASS | upbeat, whoosh |
| an emotion change by 1.5 s | PASS | at 1.00 s |
| no wide or dark shot in the first 1 s | PASS | S01 splitScreen/home |
| length 20-30 s | PASS | 23.13 s |

Frame-0 coverage by subject: saver 95 %, saver (half) 95 %, spender 0 %, payS 0 %, payP 0 %.
