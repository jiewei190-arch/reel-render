# homie-ep5-robot-principal: storytime recipe QA (tools/storytime_build.mjs)

Composition `HomieEp5RobotPrincipalRecipe` in `src/index.storytime.ts` (1080x1920, 30 fps, no motion blur). 11 shots, 30.10 s, black from 29.69 s.

## 3D clip QA: 0 clip(s)

- none: the two leads never intersect each other or a set blocker.

## Framing QA (screen space, 891 frames, 0.10 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0. Frame-0 face: me 564 px.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Gate

| check | result | detail |
|---|---|---|
| first spoken word by 0.2 s | PASS | My at 0.00 s |
| frame 0 is a face close-up (closeup / punch_in) | PASS | closeup_me |
| first cut by 3.6 s | PASS | 2.85 s |
| shot length 0.7-6.5 s (average ~2.9 s): no shot over 6.5 s unless hold: true | PASS | longest 5.35 s; average 2.70 s over 11 shots |
| average shot 2.2-3.6 s (2.70 s) | PASS | 11 shots |
| no flash cuts under 0.7 s | PASS | none |
| almost no wides: wide_class <= 10 % of the runtime | PASS | 6.9 % |
| the narrator (me) is visible in ~60 % of shots (45-75 %; POV inserts count) | PASS | 5/11 shots (45 %) |
| face shots (close-up, punch-in, OTS) >= 50 % of the runtime | warn | 46.5 % |
| captions: 1-4 words per chunk | PASS | 21 chunks |
| captions: exactly one yellow accent word per chunk | PASS | all |
| captions: shout lines ALL CAPS | PASS | lines  |
| captions text-fit: every chunk on one line at >= 72 px | PASS | smallest 88.3 px |
| no shakes, punch zooms or flashes (low-poly: hard cuts only) | PASS | none |
| mouths never move (no lip-sync) | PASS | 0 kid-frame(s) with a voice-driven mouth |
| face decals never seen edge-on (55-62 deg; culled past 62 deg) | PASS | 0 edge-on lead-frame(s); 124 lead-frame(s) with the face culled |
| captions: one chunk at a time (no overlap in time) | PASS | 21 chunks, none overlap |
| captions: one baseline after the cold open | PASS | y 1267 px |
| the cafeteria windows end up cracked (shatter marks the break) | warn | no shatter fx in a cafeteria shot |
| hard cut to black (no fade) at the end | PASS | last picture frame 890, black from frame 891 (29.69 s) to 902 |
| 1080x1920, plain 30 fps, no motion blur | PASS | one composition, no Sub |
| length 30-90 s | PASS | 30.10 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | me face 564 px (needs 307) |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |

## Shots

| shot | start | len | set | camera | note |
|---|---|---|---|---|---|
| S01 | 0.00 | 2.85 | gym | closeup_me | My homie told the WHOLE fucking school (annoyed -> furious on WHOLE) |
| S02 | 2.85 | 3.22 | gym | closeup_homie | ...the principal is a robot (homie smug) |
| S03 | 6.07 | 1.53 | gym | two_shot | Nobody believed his dumb ass |
| S04 | 7.60 | 2.04 | gym | wide_class | assembly |
| S05 | 9.63 | 1.79 | gym | setcam | the principal walks on stage |
| S06 | 11.43 | 1.87 | gym | setcam | ...trips over the mic cable |
| S07 | 13.29 | 2.17 | gym | closeup_me | Doesn't even put his hands out (shocked) |
| S08 | 15.46 | 5.35 | gym | setcam | goes DOWN, stiff as a plank |
| S09 | 20.82 | 2.43 | gym | closeup_homie | Told y'all. Low-ass battery. (smug, calm) |
| S10 | 23.25 | 3.32 | hallway | setcam | the sixth graders bow when he walks by |
| S11 | 26.57 | 3.12 | gym | closeup_me | What the FUCK (screaming); cut to black |

## Captions

- 0.00 s: My **homie** told the (96 px)
- 1.28 s: **WHOLE** fucking school the (91 px)
- 4.04 s: principal is a **robot** (96 px)
- 6.07 s: **Nobody** believed his dumb (88 px)
- 7.11 s: **ass** (96 px)
- 7.60 s: Then at **assembly** (96 px)
- 9.03 s: the **principal** walks on (96 px)
- 10.17 s: **stage** (96 px)
- 11.43 s: **trips** over the mic (96 px)
- 12.56 s: **cable** (96 px)
- 13.29 s: **Doesn't** even put his (96 px)
- 14.68 s: **hands** out (96 px)
- 15.46 s: Just goes **DOWN** (96 px)
- 17.44 s: **Stiff** as shit (96 px)
- 19.21 s: Like a **plank** (96 px)
- 20.82 s: **Told** y'all (96 px)
- 21.49 s: Low-ass **battery** (96 px)
- 23.25 s: Now the sixth **graders** (96 px)
- 24.41 s: **bow** when he walks (96 px)
- 25.48 s: **by** (96 px)
- 26.57 s: What the **FUCK** (96 px)
