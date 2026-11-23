# minimum-payment-trap: recipe QA (tools/recipe_build.mjs)

Composition: `MinimumPaymentTrapRecipe` (+ `MinimumPaymentTrapRecipeSub`) in `src/index.toolkit.ts`. Style S1. 22 shots, 23.30 s.

## Clip QA: 699 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 52 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | **FAIL** | "19 YEARS TO PAY OFF A TV" (7 words, until 3.69 s) |
| who + what readable at frame 0 (a character >= 15 % and a prop in view) | PASS | who: spender; what: owe, tvDrop, cal |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | Spender at 0.00 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact |
| no character names in the first 2 s of speech (day-1 fix 1) | **FAIL** | Spender@0.00 |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | tag from 4.10 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 0.32, cut 1.06, hit 1.06, cut 1.80, hit 1.85, cut 2.72, hit 2.72 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an emotion change by 1.5 s | PASS | at 1.07 s |
| no wide or dark shot in the first 1 s | PASS | S01 slamZoom/store |
| length 20-30 s | PASS | 23.30 s |

Frame-0 coverage by subject: spender 52 %, owe 33 %, tvDrop 28 %, cal 20 %, wallCal 20 %.
