# webvan: biz3d recipe QA (tools/biz_build.mjs)

Composition: `WebvanRecipe` in `src/index.biz.ts` (portrait 1080x1920, 30 fps, no motion blur). 13 shots, 35.60 s.

## Clip QA: 1068 frames x 4 sub-frames, 0 clip(s)

- none: no executive's body or head enters a set blocker, a kit prop or another executive; nobody below the floor.

## Framing QA (screen space, 1057 frames, 0.08 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Polish QA (tools/polish_qa.mjs, 0.04 s): 0 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 0. Rules: LONGFORM.md "Polish rules".

- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face.

## Frame-0 opener (tools/frame0_hero.mjs): 0 fail(s)

- none: hero prop bag (bag) 53 % of the height.

Hero props in S01: bag (bag) 53 %. Number cards at 0.00 s: none.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height (or the hero-prop / giant-board opener below) | PASS | ceo 55 %; opener: hero prop bag (bag) 53 % of the height |
| frame 0: no faceless figure from behind, and none without a hero prop or stake number beside it | PASS | no faceless figure is the subject |
| frame 0 opens on a hero prop close-up (>= 35 % of the height) or a giant stake board (>= 50 % of the width) | PASS | hero prop bag (bag) 53 % of the height |
| frame 0: every number card on screen is fully opaque (no fade-in at 0.00 s) | PASS | no number card at frame 0 |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *accent* word | PASS | "*$800M* ON GROCERIES" (3 words, 2 line(s), widest ~636 px of 980, accent: *$800M*, until 4.68 s) |
| the dollar stake / a number on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s | PASS | Webvan at 0.10 s |
| a sound punch at 0.00 s | PASS | impact |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, cut 1.00, hit 1.00 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an acting beat by 1.5 s (a frame-0 executive changes pose) | PASS | at 0.43 s |
| no wide shot in the first 1 s | PASS | S01 hookZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 1.00 s |
| heads clear of the caption band on >= 90 % of caption time | PASS | 100 % |
| labels: <= 3 words (compile-enforced), one at a time (>= 0.3 s apart) | PASS | 0 label(s) |
| no label or device card over a head | PASS | none |
| the hook card never covers a head | PASS | clear |
| text cards never overlap each other or the hook | PASS | none |
| label and device cards above the caption band | PASS | all above |
| no static frames: the camera moves on every frame (freeze-frames included) | PASS | moves on every frame |
| the signature chart flythrough is used | PASS | S08 16.96-21.98 s, S09 21.98-26.08 s |
| story devices: a company card and THE DECISION | PASS | counter, company, decision, stamp, board |
| loop ending: the hook comes back and the last shot frames the first shot's subject | PASS | hook again at 34.83 s; last target "bag" |
| length 20-55 s | PASS | 35.60 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | face rule replaced by the opener: hero prop bag (bag) 53 % of the height |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 2 counter(s) land and hold |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 14 line(s) fit |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | PASS | faces clear |

Frame-0 coverage by subject: ceo 55 %, bag 52 %, backWall 0 %.
