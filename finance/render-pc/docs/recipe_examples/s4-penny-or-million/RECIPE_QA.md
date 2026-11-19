# s4-penny-or-million: recipe QA (tools/recipe_build.mjs)

Composition: `S4PennyOrMillionRecipe` (+ `S4PennyOrMillionRecipeSub`) in `src/index.toolkit.ts`. Style S4. 7 shots, 21.00 s.

## Clip QA: 630 frames x 4 sub-frames, 0 clip(s)

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 85 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "$1M OR A PENNY?" (4 words, until 5.42 s) |
| who + what readable at frame 0 (a character >= 15 % and a prop in view) | PASS | who: spender, spender (half), saver (half); what: million, million (half) |
| the stake ($ or a time) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | A at 0.00 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact, whoosh |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s (day-1 fix 2; the big caption chunk may show from frame 0) | PASS | tag from 6.03 s |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | hit 1.38, hit 0.25, cut 1.03 |
| music + an SFX at frame 0 | PASS | upbeat, impact, whoosh |
| an emotion change by 1.5 s | PASS | at 1.03 s |
| no wide or dark shot in the first 1 s | PASS | S01 splitScreen/store |
| a live race or ticking stake through the middle 35-70 % (watch-time data) | PASS | count-up props only |
| first cut by 1.5 s (research round 2) | PASS | S02 at 1.03 s |
| about 12-18 shots per 30 s (research round 2; 5-6 cuts per 10 s for two-character stories) | warn | 7 shots in 21.0 s = 10.0 per 30 s |
| the last frame matches frame 0 (loop) | warn | lens moved 2.10 m, fov 34 vs 45 |
| a specific noun and a number in the first 3 words (TOP3D study) | PASS | A million dollars |
| the camera never fully stops (TOP3D study) | PASS | every shot drifts >= 1 cm/s (pos + look + fov) |
| length 20-30 s | PASS | 21.00 s |

Frame-0 coverage by subject: spender 85 %, spender (half) 85 %, saver (half) 84 %, million 76 %, million (half) 76 %.
