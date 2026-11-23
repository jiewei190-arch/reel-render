# cash-on-trial: law3d recipe QA (tools/law_build.mjs)

Composition: `CashOnTrialRecipe` in `src/index.law.ts` (1080x1920, 30 fps, no motion blur). Kit law3d, format short. 14 shots, 35.60 s.

## Clip QA: 1068 frames x 4 sub-frames, 0 clip(s)

- none: no prop or set piece enters a figure's body or head, no two people overlap, nobody sinks below the floor.

## Framing QA (screen space, 1058 frames, 0.11 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0. Frame-0 face: pros 353 px.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Polish QA (tools/polish_qa.mjs, 0.09 s): 0 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 0. Rules: LONGFORM.md "Polish rules".

- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | pros 65 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *gold* word | PASS | "*$124,700* ON TRIAL" (3 words, 2 line(s), widest ~564 px, gold: *$124,700*, until 5.80 s) |
| who + what at frame 0 (a person >= 15 % and a prop in view) | PASS | who: pros; what: cash |
| the stake (a number, $ or a question) on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s | PASS | The at 0.08 s |
| a sound punch at 0.00 s | PASS | impact |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, cut 1.10, hit 1.10, hit 1.91, hit 2.25, hit 2.38 |
| music + an SFX at frame 0 | PASS | suspense, impact |
| a face changes by 1.5 s | PASS | at 0.57 s |
| no wide shot in the first 1 s | PASS | S01 hookZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 1.10 s |
| faces clear of the caption band on >= 90 % of caption time | PASS | 100 % |
| text off faces: no device card over a face | PASS | none |
| the hook card never covers a face | PASS | clear |
| cards never overlap each other or the hook | PASS | none |
| tags and counters above the caption band | PASS | all above |
| no static frames: the camera moves on every frame | PASS | moves on every frame |
| story devices: a case-file card, an exhibit and a verdict | PASS | exhibit, caseCard, counter, gavel, verdict |
| loop ending: the hook comes back and the last shot frames the first shot's subject | PASS | hook again at 34.79 s; last target "pros.face" |
| length 20-55 s | PASS | 35.60 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | pros face 353 px (needs 307) |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 1 counter(s) land and hold |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 12 line(s) fit |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | PASS | faces clear |

Frame-0 coverage by subject: pros 65 %, cash 7 %.
