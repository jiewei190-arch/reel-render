# tech-demo-planes-land-blind: tech3d recipe QA (tools/tech_build.mjs)

Composition: `TechDemoPlanesLandBlindRecipe` (+ `TechDemoPlanesLandBlindRecipeSub`) in `src/index.tech.ts`. Kit tech3d, format short. 14 shots, 34.20 s.

## Clip QA: 1026 frames x 4 sub-frames, 0 clip(s)

- none: no part, kit prop or set piece enters BOLT's shell or mitts; BOLT stays above the ground; grounded objects stay above the floor.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | bolt 52 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *orange* word | PASS | "HOW PLANES LAND *BLIND*" (4 words, 2 line(s), widest ~710 px, orange: *BLIND*, until 3.34 s) |
| who + what at frame 0 (BOLT >= 15 % and an object in view) | PASS | who: bolt; what: jet |
| the question (how/why/what... or a number) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s | PASS | How at 0.00 s |
| a sound punch at 0.00 s | PASS | impact |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, cut 0.85, hit 0.97, cut 2.19, hit 2.19 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| BOLT's face changes by 1.5 s | PASS | at 0.40 s |
| no wide shot in the first 1 s | PASS | S01 hookZoom, S02 slamZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 0.85 s |
| BOLT's face clear of the caption band on >= 90 % of caption time | PASS | 95 %; face in the band in S11 |
| labels: <= 3 words each (compile-enforced), popping in one at a time (>= 0.3 s apart) | PASS | 7 label(s) |
| text off faces: no label card or board over BOLT's screen face | PASS | none |
| the hook card never covers BOLT's screen face | PASS | clear |
| label cards never overlap a board | PASS | none |
| label cards above the caption band | PASS | all above |
| no static frames: the camera moves on every frame | PASS | moves on every frame |
| loop ending: the hook comes back and the last shot frames the first shot's subject | PASS | hook again at 33.24 s; last target "bolt" |
| length 30-55 s | PASS | 34.20 s |

Frame-0 coverage by subject: bolt 52 %, jet 50 %.
