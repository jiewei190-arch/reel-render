# biz-demo-blockbuster-passed: biz3d recipe QA (tools/biz_build.mjs)

Composition: `BizDemoBlockbusterPassedRecipe` in `src/index.biz.ts` (portrait 1080x1920, 30 fps, no motion blur). 15 shots, 38.17 s.

## Clip QA: 1145 frames x 4 sub-frames, 0 clip(s)

- none: no executive's body or head enters a set blocker, a kit prop or another executive; nobody below the floor.

## Framing QA (screen space, 1134 frames, 0.03 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close.

## Frame-0 opener (tools/frame0_hero.mjs): 0 fail(s)

- none: hero prop rc (case) 47 % of the height.

Hero props in S01: rc (case) 47 %. Number cards at 0.00 s: none.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height (or the hero-prop / giant-board opener below) | PASS | ceo 55 %; opener: hero prop rc (case) 47 % of the height |
| frame 0: no faceless figure from behind, and none without a hero prop or stake number beside it | PASS | no faceless figure is the subject |
| frame 0 opens on a hero prop close-up (>= 35 % of the height) or a giant stake board (>= 50 % of the width) | PASS | hero prop rc (case) 47 % of the height |
| frame 0: every number card on screen is fully opaque (no fade-in at 0.00 s) | PASS | no number card at frame 0 |
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
| loop ending: the hook comes back and the last shot frames the first shot's subject | warn | hook again at 36.41 s; last target "ceo" |
| length 30-55 s | PASS | 38.17 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | face rule replaced by the opener: hero prop rc (case) 47 % of the height |

Frame-0 coverage by subject: ceo 55 %, rc 46 %, bm1 0 %, bm2 0 %, backWall 0 %.
