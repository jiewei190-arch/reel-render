# cyber-demo-landscape: cyber3d long-form recipe QA (tools/cyber_build.mjs + tools/kit_long.mjs)

Composition: `CyberDemoLandscapeRecipe` in `src/index.cyber.ts` (1920x1080, 30 fps, plain composition: no motion blur). Kit cyber3d, format landscape. 13 shots, 33.20 s (0.55 min), 92 words, 3 chapters.

## Clip QA: 332 of 996 frames (every 3th frame), 0 clip(s), 0.0 s

- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "THE $100M EMAIL" until 3.94 s |
| first spoken word by 0.5 s | PASS | One at 0.00 s |
| a sound punch + music at 0.00 s | PASS | upbeat, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 3 chapters, first "The $100M Email" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | PASS | 1:10s 2:12s 3:11s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 1.94 s from 20.0 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 5.8 s from 27.4 s; 12 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | PASS | mean 2.55 s over 13 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | warn | none before ch2 "The Copycat Company" |
| text readable: text >= 30 px tall at 1080p | PASS | all readable |
| every landed text board / card fully inside the frame (1.5 % margin) | PASS | all inside |
| no text board or card in the lower-third caption band | PASS | none |
| length 8-12 min | warn | 0.55 min |
| flash safety: <= 2 glitch/alert events in any 1 s, glitch <= 0.6, alert wash <= 0.35, no white flash | PASS | 11 event(s), worst 1 in 1 s (at 0.71 s); peaks glitch 0.55, alert 0.32 |
| text off faces: no label, board or story card over a face | PASS | none |
| labels one at a time (>= 0.3 s apart) | PASS | ok |
| the camera moves on every frame | PASS | not checked (--qa-sample) |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | **FAIL** | 0 contrast, 1 size (see Framing QA) |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 2 counter(s) land and hold; 1 without an anchor word (warn) |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 21 line(s) fit |
| polish P3: chapter cards fully on screen at rest, one line, in their own region (no board / label over them) | PASS | 3 card(s) clear |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | **FAIL** | 1 (see Polish QA) |

Pacing: 36 visual-change marks, longest gap 1.94 s, mean shot 2.55 s, 12 beat marks.

## Framing QA (screen space, 332 frames, 0.01 s): 0 clip(s), 1 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 1, R5 frame 0 0.

- FAIL S05 board ml 'Invoice 4470': main line 'Invoice 4470' is 28.3 px (font size; cap 20 px; median while on screen, e.g. at 6.10 s; needs 42 px to read on a phone): scale it up x1.56 ("s"), move the camera closer (cam.dist x0.64), or shorten the line 'Invoice 4470' (long lines shrink to fit)

## Polish QA (tools/polish_qa.mjs, 0.01 s): 1 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 1. Rules: LONGFORM.md "Polish rules".

- FAIL S04 set piece set.monitor3 covers 58 % of hk's face (camera target) on screen (worst at 5.40 s, for more than 5 frames): raise the camera 0.44 m (cam.h +0.44) to look over it, or move hk 0.50 m sideways clear of it, or swing the camera around (cam.az +-20) so set.monitor3 is not between the lens and the face

- warn S03 board 'WIRED OVER' (target $100M): no anchor word: the voice never says $100M between 1.5 and 4.0 s, so it lands by 3.54 s (0.5 s before it leaves); say the number there or set "land" to the word that means it

Caption-safe framing (lens face lifted, not baked): none. Lower third moved: none.

## chapters.txt

```
00:00 The $100M Email
00:10 The Copycat Company
00:21 The Money Trail
```
