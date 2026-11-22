# law-demo-landscape: law3d long-form recipe QA (tools/law_build.mjs + tools/kit_long.mjs)

Composition: `LawDemoLandscapeRecipe` in `src/index.law.ts` (1920x1080, 30 fps, plain composition: no motion blur). Kit law3d, format landscape. 16 shots, 35.00 s (0.58 min), 100 words, 3 chapters.

## Clip QA: 350 of 1050 frames (every 3th frame), 0 clip(s), 0.0 s

- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "$54 MILLION FOR PANTS" until 4.36 s |
| first spoken word by 0.5 s | PASS | A at 0.00 s |
| a sound punch + music at 0.00 s | PASS | suspense, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 3 chapters, first "A Judge Sues Over Pants" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | PASS | 1:10s 2:13s 3:12s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 4.06 s from 30.9 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 7.8 s from 27.2 s; 11 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | warn | mean 2.19 s over 16 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | warn | none before ch2 "The Missing Pants" |
| text readable: text >= 30 px tall at 1080p | warn | S05 folder "PEARSON v. CHUNG" 29 px at 5.0 s; S05 ticket "ALTERATION TICKET" 28 px at 8.0 s; S06 hanger "CLAIM TICKET" 14 px at 9.5 s; S11 sign1 "SATISFACTION GUARANTEED" 27 px at 21.0 s; S12 n2 "$54 MILLION PANTS SUIT" 30 px at 23.3 s; S12 n1 "JUDGE SUES CLEANERS" 30 px at 26.0 s |
| every landed text board / card fully inside the frame (1.5 % margin) | warn | S05 ticket "ALTERATION TICKET" x 1170-1712 y 362-1065 at 8.0 s; S16 plate "THE COURT" x 12-638 y 664-833 at 33.0 s |
| no text board or card in the lower-third caption band | warn | S05 folder "PEARSON v. CHUNG"@5.0s, S05 ticket "ALTERATION TICKET"@8.0s, S11 sign2 "SAME DAY SERVICE"@22.8s, S16 plate "THE COURT"@33.3s |
| length 8-12 min | warn | 0.58 min |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | **FAIL** | 1 clip(s) (see Framing QA) |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | **FAIL** | 2 (see Framing QA) |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | **FAIL** | 0 contrast, 3 size (see Framing QA) |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 5 counter(s) land and hold |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 20 line(s) fit |
| polish P3: chapter cards fully on screen at rest, one line, in their own region (no board / label over them) | PASS | 3 card(s) clear |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | PASS | faces clear |

Pacing: 42 visual-change marks, longest gap 4.06 s, mean shot 2.19 s, 11 beat marks.

## Framing QA (screen space, 346 frames, 0.02 s): 1 clip(s), 5 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 1, R2 subject/edge 0, R3 board past edge 2, R4 contrast 0, R4 text size 3, R5 frame 0 0.

- CLIP S07 prop pants is on mom's head on screen (behind the head; head box incl. antennae/hair; worst at 12.30 s): move it down 0.16 m (add -0.00,-0.16,+0.01 to its at) or 0.21 m to screen-right of mom (add +0.21,-0.00,+0.00 to its at), or move mom clear of it.
- FAIL S05 board folder 'PEARSON v. CHUNG' crosses the bottom frame edge (x 498-1335, y 194-1034; keep 58 px clear; worst at 8.90 s): move it 0.02 m into frame (add -0.01,+0.01,-0.02 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S16 board plate 'THE COURT' crosses the left frame edge (x -132-513, y 724-898; keep 58 px clear; worst at 34.90 s): move it 0.14 m into frame (add +0.14,-0.00,-0.02 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S05 board ticket 'ALTERATION TICKET': main line 'ALTERATION TICKET' is 40.8 px (font size; cap 29 px; median while on screen, e.g. at 8.50 s; needs 42 px to read on a phone): scale it up x1.08 ("s"), move the camera closer (cam.dist x0.92), or shorten the line 'ALTERATION TICKET' (long lines shrink to fit)
- FAIL S06 board hanger 'CLAIM TICKET': main line 'CLAIM TICKET' is 17.7 px (font size; cap 13 px; median while on screen, e.g. at 9.70 s; needs 42 px to read on a phone): scale it up x2.49 ("s"), move the camera much closer (cam.dist x0.40), or shorten the line 'CLAIM TICKET' (long lines shrink to fit)
- FAIL S11 board sign1 'SATISFACTION GUARANTEED': main line 'SATISFACTION' is 41.0 px (font size; cap 29 px; median while on screen, e.g. at 21.90 s; needs 42 px to read on a phone): scale it up x1.08 ("s"), move the camera closer (cam.dist x0.93), or shorten the line 'SATISFACTION' (long lines shrink to fit)

## Polish QA (tools/polish_qa.mjs, 0.02 s): 0 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 0. Rules: LONGFORM.md "Polish rules".

- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face.

Cards overlapping each other or the hook: none.

Caption-safe framing (lower third): no shot needed a lift; caption moved in no shot.

## chapters.txt

```
00:00 A Judge Sues Over Pants
00:10 The Missing Pants
00:23 Satisfaction Guaranteed
```
