# biz-demo-landscape: biz3d long-form recipe QA (tools/biz_build.mjs + tools/kit_long.mjs)

Composition: `BizDemoLandscapeRecipe` in `src/index.biz.ts` (1920x1080, 30 fps, plain composition: no motion blur). Kit biz3d, format landscape. 14 shots, 35.50 s (0.59 min), 95 words, 3 chapters.

## Clip QA: 355 of 1065 frames (every 3th frame), 0 clip(s), 0.0 s

- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "THE $50M NO" until 3.81 s |
| first spoken word by 0.5 s | PASS | Blockbuster at 0.00 s |
| a sound punch + music at 0.00 s | PASS | upbeat, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 3 chapters, first "The $50 Million Offer" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | PASS | 1:11s 2:12s 3:13s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 3.92 s from 31.6 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 5.2 s from 10.8 s; 11 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | PASS | mean 2.54 s over 14 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | warn | none before ch2 "The Laugh", ch3 "Streaming Kills the Store" |
| text readable: text >= 30 px tall at 1080p | PASS | all readable |
| every landed text board / card fully inside the frame (1.5 % margin) | PASS | all inside |
| no text board or card in the lower-third caption band | PASS | none |
| length 8-12 min | warn | 0.59 min |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | **FAIL** | 1 clip(s) (see Framing QA) |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | **FAIL** | 1 (see Framing QA) |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 4 counter(s) land and hold; 2 without an anchor word (warn) |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 18 line(s) fit |
| polish P3: chapter cards fully on screen at rest, one line, in their own region (no board / label over them) | PASS | 3 card(s) clear |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | PASS | faces clear |

Pacing: 41 visual-change marks, longest gap 3.92 s, mean shot 2.54 s, 11 beat marks.

## Framing QA (screen space, 351 frames, 0.02 s): 1 clip(s), 1 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 1, R2 subject/edge 1, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0.

- CLIP S07 card decision S07.dev0 'decision' covers ceo's head on screen (head box incl. hair) at 15.80 s (card x 80-1840, y 108-416; head x 789-1061, y 301-568): devices sit at fixed layout spots: frame the executive away from that spot (cam.face / cam.az), or move the device (pos / y)
- FAIL S06 subject ceo (camera target) is cut by the frame (worst at 14.80 s): its head box (incl. antennae/hair) touches the top edge; head centre x 938 of 1920. Fix: lower the framing (cam.face +0.08), or pull the camera back (cam.dist +0.3)

## Polish QA (tools/polish_qa.mjs, 0.02 s): 0 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 0. Rules: LONGFORM.md "Polish rules".

- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face.

- warn S04 counter 'Netflix losses, 2000' (target -$57M): no anchor word: the voice never says -$57M between 5.0 and 7.6 s, so it lands by 7.10 s (0.5 s before it leaves); say the number there or set "land" to the word that means it
- warn S13 counter 'debt' (target $1.46B): no anchor word: the voice never says $1.46B between 28.3 and 31.5 s, so it lands by 30.98 s (0.5 s before it leaves); say the number there or set "land" to the word that means it

## biz3d landscape notes

- Lens: the shared 16:9 rule (landscapeLens per preset; vertical fov kept). Caption-safe framing lifted 0 shot(s).
- Lower-third caption centre moved on: none (default 905 px).

## chapters.txt

```
00:00 The $50 Million Offer
00:10 The Laugh
00:22 Streaming Kills the Store
```
