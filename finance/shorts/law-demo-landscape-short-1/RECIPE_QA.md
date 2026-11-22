# law-demo-landscape-short-1: law3d recipe QA (tools/law_build.mjs)

Composition: `LawDemoLandscapeShort1Recipe` in `src/index.law.ts` (1080x1920, 30 fps, no motion blur). Kit law3d, format short. 12 shots, 26.10 s.

## Clip QA: 783 frames x 4 sub-frames, 0 clip(s)

- none: no prop or set piece enters a figure's body or head, no two people overlap, nobody sinks below the floor.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | pearson 58 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *gold* word | PASS | "A *JUDGE* SUES OVER PANTS" (5 words, 2 line(s), widest ~806 px, gold: *JUDGE*, until 2.50 s) |
| who + what at frame 0 (a person >= 15 % and a prop in view) | PASS | who: pearson; what: hookProp |
| the stake (a number, $ or a question) on screen by 0.5 s | PASS | at 0.07 s |
| first spoken word by 0.2 s | PASS | They at 0.10 s |
| a sound punch at 0.00 s | PASS | impact, ding |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, hit 0.45, cut 1.00, hit 1.00, cut 1.39, hit 1.39 |
| music + an SFX at frame 0 | PASS | suspense, impact, ding |
| a face changes by 1.5 s | PASS | at 0.40 s |
| no wide shot in the first 1 s | PASS | S01 hookZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 1.00 s |
| faces clear of the caption band on >= 90 % of caption time | PASS | 100 % |
| text off faces: no device card over a face | PASS | none |
| the hook card never covers a face | PASS | clear |
| cards never overlap each other or the hook | PASS | none |
| tags and counters above the caption band | PASS | all above |
| no static frames: the camera moves on every frame | PASS | moves on every frame |
| story devices: a case-file card, an exhibit and a verdict | warn | exhibit, counter, gavel, verdict |
| loop ending: the hook comes back and the last shot frames the first shot's subject | warn | hook again not set; last target "judge.face" |
| length 30-55 s | warn | 26.10 s |

Frame-0 coverage by subject: pearson 58 %, hookProp 39 %.
