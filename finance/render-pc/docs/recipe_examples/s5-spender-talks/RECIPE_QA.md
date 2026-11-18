# s5-spender-talks: recipe QA (tools/recipe_build.mjs)

Composition: `S5SpenderTalksRecipe` (+ `S5SpenderTalksRecipeSub`) in `src/index.toolkit.ts`. Style S5. 6 shots, 22.50 s.

## Clip QA: 675 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 79 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "$432 ON FORGOTTEN APPS" (4 words, until 4.32 s) |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | I at 0.00 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | tag from 11.34 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 0.42, hit 1.41 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an emotion change by 1.5 s | PASS | at 0.10 s |
| no wide or dark shot in the first 1 s | PASS | S01 closeUp/home |
| length 20-30 s | PASS | 22.50 s |

Frame-0 coverage by subject: spender 79 %.
