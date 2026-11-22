# biz-demo-blockbuster-passed: biz3d recipe QA (tools/biz_build.mjs)

Composition: `BizDemoBlockbusterPassedRecipe` in `src/index.biz.ts` (portrait 1080x1920, 30 fps, no motion blur). 15 shots, 38.17 s.

## Clip QA: 1145 frames x 4 sub-frames, 0 clip(s)

- none: no executive's body or head enters a set blocker, a kit prop or another executive; nobody below the floor.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | ceo 61 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *accent* word | PASS | "THE *$50M* NO" (3 words, 1 line(s), widest ~759 px of 980, accent: *$50M*, until 3.81 s) |
| the dollar stake / a number on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s | PASS | Blockbuster at 0.00 s |
| a sound punch at 0.00 s | PASS | impact |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, cut 0.96, hit 1.08, cut 2.34, hit 2.34, hit 2.59 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an acting beat by 1.5 s (a frame-0 executive changes pose) | PASS | at 0.57 s |
| no wide shot in the first 1 s | PASS | S01 hookZoom, S02 slamZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 0.96 s |
| heads clear of the caption band on >= 90 % of caption time | PASS | 100 % |
| labels: <= 3 words (compile-enforced), one at a time (>= 0.3 s apart) | PASS | 1 label(s) |
| no label or device card over a head | PASS | none |
| the hook card never covers a head | PASS | clear |
| text cards never overlap each other or the hook | PASS | none |
| label and device cards above the caption band | PASS | all above |
| no static frames: the camera moves on every frame (freeze-frames included) | PASS | moves on every frame |
| the signature chart flythrough is used | PASS | S09 18.27-22.56 s, S10 22.56-24.63 s |
| story devices: a company card and THE DECISION | PASS | company, counter, board, decision, stamp, worth |
| loop ending: the hook comes back and the last shot frames the first shot's subject | PASS | hook again at 36.41 s; last target "ceo" |
| length 30-55 s | PASS | 38.17 s |

Frame-0 coverage by subject: ceo 61 %, bm1 0 %, bm2 0 %, backWall 0 %.
