# law-demo-54-million-pants: law3d recipe QA (tools/law_build.mjs)

Composition: `LawDemo54MillionPantsRecipe` in `src/index.law.ts` (1080x1920, 30 fps, no motion blur). Kit law3d, format short. 19 shots, 42.00 s.

## Clip QA: 1260 frames x 4 sub-frames, 0 clip(s)

- none: no prop or set piece enters a figure's body or head, no two people overlap, nobody sinks below the floor.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | pearson 63 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *gold* word | PASS | "*$54 MILLION* FOR PANTS" (4 words, 2 line(s), widest ~745 px, gold: *$54 MILLION*, until 4.36 s) |
| who + what at frame 0 (a person >= 15 % and a prop in view) | PASS | who: pearson; what: pants |
| the stake (a number, $ or a question) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s | PASS | A at 0.00 s |
| a sound punch at 0.00 s | PASS | impact |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, cut 1.06, cut 2.01, hit 2.01, hit 2.16, hit 2.27, hit 2.47 |
| music + an SFX at frame 0 | PASS | suspense, impact |
| a face changes by 1.5 s | PASS | at 0.47 s |
| no wide shot in the first 1 s | PASS | S01 hookZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 1.06 s |
| faces clear of the caption band on >= 90 % of caption time | PASS | 100 % |
| text off faces: no device card over a face | PASS | none |
| the hook card never covers a face | PASS | clear |
| cards never overlap each other or the hook | PASS | none |
| tags and counters above the caption band | PASS | all above |
| no static frames: the camera moves on every frame | PASS | moves on every frame |
| story devices: a case-file card, an exhibit and a verdict | PASS | counter, exhibit, caseCard, gavel, verdict |
| loop ending: the hook comes back and the last shot frames the first shot's subject | PASS | hook again at 40.14 s; last target "pearson.face" |
| length 30-55 s | PASS | 42.00 s |

Frame-0 coverage by subject: pearson 63 %, pants 39 %.
