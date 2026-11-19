# seven-year-car: recipe QA (tools/recipe_build.mjs)

Composition: `SevenYearCarRecipe` (+ `SevenYearCarRecipeSub`) in `src/index.toolkit.ts`. Style S1. 18 shots, 29.50 s.

## Clip QA: 885 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 71 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "$12K FOR A LOW PAYMENT?" (5 words, until 3.75 s) |
| who + what readable at frame 0 (a character >= 15 % and a prop in view) | PASS | who: spender; what: tag0 |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | Your at 0.08 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | tag from 1.00 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 0.38, hit 0.06, hit 0.10, cut 1.00, hit 1.52 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an emotion change by 1.5 s | PASS | at 0.63 s |
| no wide or dark shot in the first 1 s | PASS | S01 hookZoom/earth |
| caption centre >= 65 % of the height on >= 90 % of caption time (faces framed above the bottom band) | PASS | 100 %; nudged: none |
| frame-0 board shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 1.00 s |
| loop board lands on the last word (not before) | PASS | last word starts 29.10 s; tag1 at 29.12 s |
| every landed text prop fully inside its view (1.5 % margin) | PASS | all inside |
| no text board in the caption band (recompose: raise the board or lower the target) | warn | S02@1.0s:intr |
| length 20-30 s | PASS | 29.50 s |

Frame-0 coverage by subject: spender 71 %, tag0 11 %, egg.cat0 0 %, egg.sticky1 0 %.
