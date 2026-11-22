# law-demo-landscape-short-1: law3d recipe QA (tools/law_build.mjs)

Composition: `LawDemoLandscapeShort1Recipe` in `src/index.law.ts` (1080x1920, 30 fps, no motion blur). Kit law3d, format short. 12 shots, 26.10 s.

## Clip QA: 783 frames x 4 sub-frames, 0 clip(s)

- none: no prop or set piece enters a figure's body or head, no two people overlap, nobody sinks below the floor.

## Framing QA (screen space, 783 frames, 0.04 s): 2 clip(s), 9 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 2, R2 subject/edge 2, R3 board past edge 6, R4 contrast 0, R4 text size 1, R5 frame 0 0. Frame-0 face: pearson 352 px.

- CLIP S01 card exhibit S01.exhibit.0 '$3,000' covers pearson's head on screen (head box incl. hair) at 0.23 s (card x 381-700, y 590-745; head x 289-816, y 710-1226): devices are placed by the engine: point the exhibit at a target away from the face ("on"), or frame the person on the other side / lower
- CLIP S03 prop pants is on mom's head on screen (behind the head; head box incl. antennae/hair; worst at 3.23 s): move it down 0.16 m (add -0.00,-0.16,+0.01 to its at) or 0.22 m to screen-right of mom (add +0.22,-0.00,+0.01 to its at), or move mom clear of it.
- FAIL S03 mom's head is sliced by the left frame edge (worst at 2.90 s, 75 % of it in frame): move mom 0.09 m into frame (add +0.09,-0.00,+0.01 to its at) or fully out of frame, or re-aim the camera
- FAIL S03 son's head is sliced by the right frame edge (worst at 4.13 s, 64 % of it in frame): move son 0.14 m into frame (add -0.14,+0.00,+0.01 to its at) or fully out of frame, or re-aim the camera
- FAIL S07 board sign1 'SATISFACTION GUARANTEED' crosses the left frame edge (x -166-534, y 949-1410; keep 32 px clear; worst at 14.17 s): move it 0.13 m into frame (add +0.13,-0.00,+0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S07 board sign2 'SAME DAY SERVICE' crosses the right frame edge (x 555-1323, y 978-1462; keep 32 px clear; worst at 14.17 s): move it 0.17 m into frame (add -0.17,+0.00,-0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S08 board n1 'JUDGE SUES CLEANERS' crosses the left frame edge (x -473-205, y 500-1326; keep 32 px clear; worst at 15.83 s): move it 0.47 m into frame (add +0.47,-0.00,+0.03 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S08 board n3 'PANTS CASE GOES TO TRIAL' crosses the right frame edge (x 878-1597, y 442-1333; keep 32 px clear; worst at 18.33 s): move it 0.47 m into frame (add -0.46,+0.00,+0.10 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S10 board plate 'THE COURT' crosses the left frame edge (x -821-270, y 1172-1443; keep 32 px clear; worst at 20.50 s): the board is wider/taller than the frame here: shrink its size (x0.86) or pull the camera back (cam.dist x1.17)
- FAIL S12 board plate 'THE COURT' crosses the left frame edge (x -841-0, y 1171-1396; keep 32 px clear; worst at 22.77 s): move it 0.49 m into frame (add +0.48,-0.00,-0.08 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S02 board hanger 'CLAIM TICKET': main line 'CLAIM TICKET' is 21.2 px (font size; cap 15 px; median while on screen, e.g. at 1.33 s; needs 42 px to read on a phone): scale it up x2.08 ("s"), move the camera much closer (cam.dist x0.48), or shorten the line 'CLAIM TICKET' (long lines shrink to fit)

## Polish QA (tools/polish_qa.mjs, 0.04 s): 0 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 0. Rules: LONGFORM.md "Polish rules".

- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | pearson 57 % |
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
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | **FAIL** | 2 clip(s) (see Framing QA) |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | **FAIL** | 2 (see Framing QA) |
| framing R3: every landed board / card inside the frame (3 % margin) | **FAIL** | 6 (see Framing QA) |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | **FAIL** | 0 contrast, 1 size (see Framing QA) |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | pearson face 352 px (needs 307) |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 4 counter(s) land and hold |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 14 line(s) fit |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | PASS | faces clear |

Frame-0 coverage by subject: pearson 57 %, hookProp 40 %.
