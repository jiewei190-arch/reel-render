# framing-defects: recipe QA (tools/recipe_build.mjs)

Composition: `FramingDefectsRecipe` (+ `FramingDefectsRecipeSub`) in `src/index.toolkit.ts`. Style S1. 7 shots, 29.73 s.

## Clip QA: 892 frames x 4 sub-frames, 0 clip(s) + 2 framing clip(s)

- CLIP S02 board due 'MINIMUM DUE / $143 -> $90' is on spender's head on screen (at the head; head box incl. antennae/hair) at 2.90 s: move it up 0.16 m (add -0.00,+0.16,-0.02 to its at) or 0.49 m to screen-left of spender (add -0.49,+0.00,+0.07 to its at), or move spender clear of it
- CLIP S03 board yrs '16 YEARS' is on spender's head on screen (at the head; head box incl. antennae/hair) at 7.63 s: move it up 0.09 m (add +0.00,+0.09,-0.01 to its at) or 0.57 m to screen-right of spender (add +0.57,-0.00,+0.04 to its at), or move spender clear of it

## Framing QA (screen space, 892 frames, 0.09 s): 2 clip(s), 12 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 2, R2 subject/edge 3, R3 board past edge 5, R4 contrast 2, R4 text size 1, R5 frame 0 1. Frame-0 face: spender 245 px.

- CLIP S02 board due 'MINIMUM DUE / $143 -> $90' is on spender's head on screen (at the head; head box incl. antennae/hair) at 2.90 s: move it up 0.16 m (add -0.00,+0.16,-0.02 to its at) or 0.49 m to screen-left of spender (add -0.49,+0.00,+0.07 to its at), or move spender clear of it
- CLIP S03 board yrs '16 YEARS' is on spender's head on screen (at the head; head box incl. antennae/hair) at 7.63 s: move it up 0.09 m (add +0.00,+0.09,-0.01 to its at) or 0.57 m to screen-right of spender (add +0.57,-0.00,+0.04 to its at), or move spender clear of it
- FAIL S03 subject spender (camera target) is cut by the frame at 8.47 s: its head box (incl. antennae/hair) touches the right edge; head centre x 567 of 1080. Fix: move spender 0.01 m toward screen centre (add -0.01,+0.00,-0.00 to its at), or pull the camera back (cam.dist +0.4)
- FAIL S04 spender's head is sliced by the right frame edge at 11.40 s (35 % of it in frame): move spender 0.29 m into frame (add -0.29,+0.00,-0.00 to its at) or fully out of frame, or re-aim the camera
- FAIL S07 subject spender (camera target) is cut by the frame at 29.70 s: its head box (incl. antennae/hair) touches the top edge; head centre x 544 of 1080. Fix: lower the framing (cam.face +0.08), or pull the camera back (cam.dist +0.4)
- FAIL S02 board due 'MINIMUM DUE / $143 -> $90' crosses the left frame edge (x 22-935, y 156-642; keep 32 px clear) at 3.67 s: move it 0.02 m into frame (add +0.02,-0.00,-0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S03 board yrs '16 YEARS' crosses the right frame edge (x 200-1066, y 66-437; keep 32 px clear) at 7.93 s: move it 0.02 m into frame (add -0.02,+0.00,-0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S04 board b1 '$143' crosses the left frame edge (x -263-133, y 477-679; keep 32 px clear) at 11.63 s: move it 0.38 m into frame (add +0.38,-0.00,+0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S05 board owe 'OWE $4,950' crosses the left frame edge (x -981-77, y 709-968; keep 32 px clear) at 15.67 s: the board is wider/taller than the frame here: shrink its size (x0.91) or pull the camera back
- FAIL S06 board fine 'FINE PRINT / MIN 2% OR $25' crosses the right frame edge (x 746-1051, y 1151-1299; keep 32 px clear) at 21.57 s: move it 0.02 m into frame (add -0.02,+0.00,-0.00 to its at), or pull the camera back (cam.dist +0.5)
- FAIL S04 label b2 '$90': text #fff4c8 on fill #1f9e4f is 3.14:1 (needs 4.5:1, line '$90'): set its color to #197e3f (same hue, 4.6:1) or set its fg to #16121c
- FAIL S06 label fine 'FINE PRINT / MIN 2% OR $25': text #fff4c8 on fill #a89f8c is 2.38:1 (needs 4.5:1, line 'FINE PRINT'): set its color to #716b5f (same hue, 4.8:1) or set its fg to #16121c
- FAIL S06 board fine 'FINE PRINT / MIN 2% OR $25': main line 'FINE PRINT' is 32 px tall (cap height, median while on screen, e.g. at 21.37 s; needs 42 px to read on a phone): enlarge it to size [0.47, 0.21, 0.05] (x1.38), move the camera closer (cam.dist x0.72), or shorten the line 'FINE PRINT' (long lines shrink to fit)
- FAIL frame 0 subject spender's face is 245 px tall (13 % of the frame; a close shot needs 307 px): aim the frame-0 camera at "spender.face" and move it in (cam.dist x0.80), e.g. hookZoom with dist 1.7

## Frame-0 gate

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | spender 55 % |
| hook text on screen at frame 0, <= 5 words (day-1 fix 2) | PASS | "THE MINIMUM TRAP" (3 words, until 2.58 s) |
| who + what readable at frame 0 (a character >= 15 % and a prop in view) | **FAIL** | who: spender; what: none |
| the stake ($ or a time) on screen by 0.5 s | **FAIL** | no $/time text by 0.5 s |
| first spoken word by 0.2 s (day-1 fix 3) | PASS | Paying at 0.10 s |
| a sound punch at 0.00 s (impact/drop/crash/rip...) | PASS | impact |
| no character names in the first 2 s of speech (day-1 fix 1) | PASS | none |
| no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2) | PASS | no tag |
| 2-3 cuts or big moves in the first 3 s (day-1 fix 5) | PASS | cut 2.83, hit 2.83 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| an emotion change by 1.5 s | **FAIL** | no actor's emotion changes by 1.5 s |
| no wide or dark shot in the first 1 s | PASS | S01 medium/store |
| caption centre >= 65 % of the height on >= 90 % of caption time (faces framed above the bottom band) | PASS | 100 %; nudged: none |
| frame-0 board shot cuts away by ~1.0 s (first cut <= 1.25 s) | **FAIL** | first cut at 2.83 s |
| loop board lands on the last word (not before) | PASS | no board on the loop shot |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | **FAIL** | 3 (see Framing QA) |
| framing R3: every landed board inside the frame (3 % margin) | **FAIL** | 5 (see Framing QA) |
| framing R4: board text >= 4.5:1 on its fill; featured main lines >= 42 px | **FAIL** | 2 contrast, 1 size (see Framing QA) |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | **FAIL** | spender face 245 px (needs 307) |
| no text board in the caption band (recompose: raise the board or lower the target) | warn | S06@19.9s:fine |
| length 20-30 s | PASS | 29.73 s |

Frame-0 coverage by subject: spender 55 %.
