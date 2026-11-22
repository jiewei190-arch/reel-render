# law-demo-54-million-pants: law3d recipe QA (tools/law_build.mjs)

Composition: `LawDemo54MillionPantsRecipe` in `src/index.law.ts` (1080x1920, 30 fps, no motion blur). Kit law3d, format short. 19 shots, 42.00 s.

## Clip QA: 1260 frames x 4 sub-frames, 0 clip(s)

- none: no prop or set piece enters a figure's body or head, no two people overlap, nobody sinks below the floor.

## Framing QA (screen space, 1249 frames, 0.06 s): 2 clip(s), 12 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 2, R2 subject/edge 4, R3 board past edge 7, R4 contrast 0, R4 text size 1, R5 frame 0 0. Frame-0 face: pearson 352 px.

- CLIP S07 prop pants is on mom's head on screen (behind the head; head box incl. antennae/hair; worst at 12.10 s): move it down 0.16 m (add -0.00,-0.16,+0.01 to its at) or 0.22 m to screen-right of mom (add +0.22,-0.00,+0.01 to its at), or move mom clear of it.
- CLIP S17 card counter S17.counter.1 'HE PAYS COURT COSTS' covers pearson's head on screen (head box incl. hair) at 36.63 s (card x 220-860, y 290-560; head x 286-783, y 534-987): devices are placed by the engine: point the exhibit at a target away from the face ("on"), or frame the person on the other side / lower
- FAIL S02 mom's head is sliced by the left frame edge (worst at 1.50 s, 51 % of it in frame): move mom 0.20 m into frame (add +0.20,-0.00,-0.02 to its at) or fully out of frame, or re-aim the camera
- FAIL S02 son's head is sliced by the right frame edge (worst at 1.50 s, 42 % of it in frame): move son 0.21 m into frame (add -0.21,+0.00,+0.02 to its at) or fully out of frame, or re-aim the camera
- FAIL S07 mom's head is sliced by the left frame edge (worst at 11.40 s, 72 % of it in frame): move mom 0.10 m into frame (add +0.10,-0.00,+0.01 to its at) or fully out of frame, or re-aim the camera
- FAIL S07 son's head is sliced by the right frame edge (worst at 13.03 s, 63 % of it in frame): move son 0.14 m into frame (add -0.14,+0.00,+0.01 to its at) or fully out of frame, or re-aim the camera
- FAIL S05 board folder 'PEARSON v. CHUNG' crosses the left+right frame edge (x -124-1094, y 433-1679; keep 32 px clear; worst at 8.97 s): the board is wider/taller than the frame here: shrink its size (x0.77) or pull the camera back (cam.dist x1.30)
- FAIL S05 board ticket 'ALTERATION TICKET' crosses the right frame edge (x 831-1638, y 826-1864; keep 32 px clear; worst at 8.47 s): move it 0.31 m into frame (add -0.30,+0.01,+0.10 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S11 board sign2 'SAME DAY SERVICE' crosses the right frame edge (x 551-1123, y 947-1312; keep 32 px clear; worst at 23.03 s): move it 0.07 m into frame (add -0.07,+0.00,-0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S11 board sign1 'SATISFACTION GUARANTEED' crosses the left frame edge (x 0-535, y 933-1288; keep 32 px clear; worst at 23.03 s): move it 0.04 m into frame (add +0.04,-0.00,+0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S12 board n1 'JUDGE SUES CLEANERS' crosses the left frame edge (x -290-262, y 567-1245; keep 32 px clear; worst at 24.73 s): move it 0.37 m into frame (add +0.37,-0.00,+0.02 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S12 board n3 'PANTS CASE GOES TO TRIAL' crosses the right frame edge (x 822-1400, y 522-1243; keep 32 px clear; worst at 27.20 s): move it 0.38 m into frame (add -0.37,+0.00,+0.07 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S17 board pplate 'PLAINTIFF' crosses the right frame edge (x 771-1210, y 1411-1546; keep 32 px clear; worst at 37.93 s): move it 0.19 m into frame (add -0.17,+0.00,+0.09 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S06 board hanger 'CLAIM TICKET': main line 'CLAIM TICKET' is 26.7 px (font size; cap 19 px; median while on screen, e.g. at 9.77 s; needs 42 px to read on a phone): scale it up x1.65 ("s"), move the camera closer (cam.dist x0.60), or shorten the line 'CLAIM TICKET' (long lines shrink to fit)

## Polish QA (tools/polish_qa.mjs, 0.05 s): 0 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 0. Rules: LONGFORM.md "Polish rules".

- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face.

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
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | **FAIL** | 2 clip(s) (see Framing QA) |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | **FAIL** | 4 (see Framing QA) |
| framing R3: every landed board / card inside the frame (3 % margin) | **FAIL** | 7 (see Framing QA) |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | **FAIL** | 0 contrast, 1 size (see Framing QA) |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | pearson face 352 px (needs 307) |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 6 counter(s) land and hold |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 26 line(s) fit |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | PASS | faces clear |

Frame-0 coverage by subject: pearson 63 %, pants 39 %.
