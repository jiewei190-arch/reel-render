# polish-defects: law3d long-form recipe QA (tools/law_build.mjs + tools/kit_long.mjs)

Composition: `PolishDefectsRecipe` in `src/index.law.ts` (1920x1080, 30 fps, plain composition: no motion blur). Kit law3d, format landscape. 7 shots, 20.07 s (0.33 min), 57 words, 2 chapters.

## Clip QA: 602 of 602 frames (every frame), 0 clip(s), 0.0 s

- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "$64 MILLION FOR PANTS" until 3.47 s |
| first spoken word by 0.5 s | PASS | A at 0.00 s |
| a sound punch + music at 0.00 s | PASS | suspense, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | **FAIL** | 2 chapters, first "A Judge Sues Over One Pair Of Pants" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | **FAIL** | 1:12s 2:8s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 3.35 s from 8.7 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 8.4 s from 3.6 s; 2 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | PASS | mean 2.87 s over 7 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | PASS | every chapter |
| text readable: text >= 30 px tall at 1080p | PASS | all readable |
| every landed text board / card fully inside the frame (1.5 % margin) | PASS | all inside |
| no text board or card in the lower-third caption band | PASS | none |
| length 8-12 min | warn | 0.33 min |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 4 counter(s) land and hold |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 10 line(s) fit |
| polish P3: chapter cards fully on screen at rest, one line, in their own region (no board / label over them) | PASS | 2 card(s) clear |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | **FAIL** | 1 (see Polish QA) |

Pacing: 11 visual-change marks, longest gap 3.35 s, mean shot 2.87 s, 2 beat marks.

## Framing QA (screen space, 602 frames, 0.03 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close.

## Polish QA (tools/polish_qa.mjs, 0.03 s): 1 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 1. Rules: LONGFORM.md "Polish rules".

- FAIL S07 set piece set.chairDL covers 100 % of mom's face (camera target) on screen (worst at 17.33 s, for more than 5 frames): move mom 0.38 m sideways clear of it, or swing the camera around (cam.az +-20) so set.chairDL is not between the lens and the face

Cards overlapping each other or the hook: none.

Caption-safe framing (lower third): no shot needed a lift; caption moved in no shot.

## chapters.txt

```
00:00 A Judge Sues Over One Pair Of Pants
00:12 The Dry Cleaner's Last Stand
```
