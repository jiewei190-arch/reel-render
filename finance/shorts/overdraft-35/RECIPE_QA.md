# overdraft-35: recipe QA (tools/recipe_build.mjs)

Composition: `Overdraft35Recipe` (+ `Overdraft35RecipeSub`) in `src/index.toolkit.ts`. Style S2. 16 shots, 29.50 s.

## Clip QA: 885 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 65 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "$35 FOR A $5 COFFEE?" (5 words, until 4.44 s) |
| who + what readable at frame 0 (a character >= 15 % and a prop in view) | PASS | who: spender; what: dec0 |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | Your at 0.09 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | tag from 1.00 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 0.38, hit 0.06, hit 0.10, cut 1.00, hit 1.05, cut 1.44, hit 1.44 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an emotion change by 1.5 s | PASS | at 0.63 s |
| no wide or dark shot in the first 1 s | PASS | S01 hookZoom/store |
| length 20-30 s | PASS | 29.50 s |

Frame-0 coverage by subject: spender 65 %, dec0 12 %, egg.cat0 8 %, egg.sticky1 7 %.
