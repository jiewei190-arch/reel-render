# biz-demo-landscape-short-1: biz3d recipe QA (tools/biz_build.mjs)

Composition: `BizDemoLandscapeShort1Recipe` in `src/index.biz.ts` (portrait 1080x1920, 30 fps, no motion blur). 12 shots, 31.70 s.

## Clip QA: 951 frames x 4 sub-frames, 0 clip(s)

- none: no executive's body or head enters a set blocker, a kit prop or another executive; nobody below the floor.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | ceo 58 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *accent* word | PASS | "THE *$50* MILLION OFFER" (4 words, 2 line(s), widest ~883 px of 980, accent: *$50*, until 2.50 s) |
| the dollar stake / a number on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s | PASS | It at 0.10 s |
| a sound punch at 0.00 s | PASS | impact |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, hit 0.45, cut 1.00, hit 1.00 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an acting beat by 1.5 s (a frame-0 executive changes pose) | PASS | at 0.40 s |
| no wide shot in the first 1 s | PASS | S01 hookZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 1.00 s |
| heads clear of the caption band on >= 90 % of caption time | PASS | 100 % |
| labels: <= 3 words (compile-enforced), one at a time (>= 0.3 s apart) | PASS | 1 label(s) |
| no label or device card over a head | PASS | none |
| the hook card never covers a head | PASS | clear |
| text cards never overlap each other or the hook | PASS | none |
| label and device cards above the caption band | PASS | all above |
| no static frames: the camera moves on every frame (freeze-frames included) | PASS | moves on every frame |
| the signature chart flythrough is used | PASS | S07 14.46-18.75 s, S08 18.75-20.82 s |
| story devices: a company card and THE DECISION | PASS | board, counter, decision, stamp, company, worth |
| loop ending: the hook comes back and the last shot frames the first shot's subject | warn | hook again not set; last target "chart" |
| length 30-55 s | PASS | 31.70 s |

Frame-0 coverage by subject: ceo 58 %, backWall 0 %.
