# minimum-payment-trap: recipe QA (tools/recipe_build.mjs)

Composition: `MinimumPaymentTrapRecipe` (+ `MinimumPaymentTrapRecipeSub`) in `src/index.toolkit.ts`. Style S1. 22 shots, 23.30 s.

## Clip QA: 699 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 52 % |
| hook text on screen at frame 0, <= 8 words | PASS | "19 YEARS TO PAY OFF A TV" (7 words, until 3.69 s) |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.3 s | PASS | Spender at 0.00 s |
| music + an SFX at frame 0 | PASS | upbeat, whoosh |
| an emotion change by 1.5 s | PASS | at 1.07 s |
| no wide or dark shot in the first 1 s | PASS | S01 slamZoom/store |
| length 20-30 s | PASS | 23.30 s |

Frame-0 coverage by subject: spender 52 %, owe 33 %, tvDrop 28 %, cal 20 %, wallCal 20 %.
