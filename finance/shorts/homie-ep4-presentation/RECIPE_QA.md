# homie-ep4-presentation: storytime recipe QA (tools/storytime_build.mjs)

Composition `HomieEp4PresentationRecipe` in `src/index.storytime.ts` (1080x1920, 30 fps, no motion blur). 11 shots, 29.23 s, black from 28.82 s.

## 3D clip QA: 0 clip(s)

- none: the two leads never intersect each other or a set blocker.

## Framing QA (screen space, 865 frames, 0.04 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0. Frame-0 face: me 564 px.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Gate

| check | result | detail |
|---|---|---|
| first spoken word by 0.2 s | PASS | Bro. at 0.00 s |
| frame 0 is a face close-up (closeup / punch_in) | PASS | closeup_me |
| first cut by 3.6 s | PASS | 3.13 s |
| shot length 0.7-6.5 s (average ~2.9 s): no shot over 6.5 s unless hold: true | PASS | longest 4.09 s; average 2.62 s over 11 shots |
| average shot 2.2-3.6 s (2.62 s) | PASS | 11 shots |
| no flash cuts under 0.7 s | PASS | none |
| almost no wides: wide_class <= 10 % of the runtime | PASS | 0.0 % |
| the narrator (me) is visible in ~60 % of shots (45-75 %; POV inserts count) | warn | 4/11 shots (36 %) |
| face shots (close-up, punch-in, OTS) >= 50 % of the runtime | warn | 47.9 % |
| captions: 1-4 words per chunk | PASS | 19 chunks |
| captions: exactly one yellow accent word per chunk | PASS | all |
| captions: shout lines ALL CAPS | PASS | lines 4 |
| captions text-fit: every chunk on one line at >= 72 px | PASS | smallest 96.0 px |
| no shakes, punch zooms or flashes (low-poly: hard cuts only) | PASS | none |
| mouths never move (no lip-sync) | PASS | 0 kid-frame(s) with a voice-driven mouth |
| face decals never seen edge-on (55-62 deg; culled past 62 deg) | PASS | 0 edge-on lead-frame(s); 0 lead-frame(s) with the face culled |
| captions: one chunk at a time (no overlap in time) | PASS | 19 chunks, none overlap |
| captions: one baseline after the cold open | PASS | y 1267 px |
| the cafeteria windows end up cracked (shatter marks the break) | warn | no shatter fx in a cafeteria shot |
| hard cut to black (no fade) at the end | PASS | last picture frame 864, black from frame 865 (28.82 s) to 876 |
| 1080x1920, plain 30 fps, no motion blur | PASS | one composition, no Sub |
| length 30-90 s | warn | 29.23 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | me face 564 px (needs 307) |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |

## Shots

| shot | start | len | set | camera | note |
|---|---|---|---|---|---|
| S01 | 0.00 | 3.13 | classroom | closeup_me | Bro. Group project... (suspicious side-eye) |
| S02 | 3.13 | 2.87 | classroom | closeup_homie | I got the slides (homie at the board, smug) |
| S03 | 6.00 | 2.37 | classroom | setcam | First slide... a picture of HIMSELF |
| S04 | 8.37 | 1.16 | classroom | closeup_me | HIMSELF (shocked) |
| S05 | 9.53 | 4.09 | classroom | setcam | Next slide. Him AGAIN. In sunglasses |
| S06 | 13.62 | 1.83 | classroom | closeup_me | ...fucking sunglasses (furious) |
| S07 | 15.45 | 2.44 | classroom | closeup_homie | I'm the center of the universe, bitch (cocky, arms out) |
| S08 | 17.89 | 2.51 | classroom | setcam | teacher gave us a ZERO |
| S09 | 20.40 | 2.38 | classroom | closeup_me | A fat-ass zero (angry) |
| S10 | 22.78 | 3.29 | classroom | setcam | the whole damn class gave him a standing ovation |
| S11 | 26.07 | 2.75 | classroom | setcam | he bows; cut to black |

## Captions

- 0.00 s: **Bro** (96 px)
- 0.29 s: Group **project** on the (96 px)
- 1.87 s: **solar** system (96 px)
- 3.13 s: My **homie** goes (96 px)
- 4.26 s: I got the **slides** (96 px)
- 6.00 s: First **slide** (96 px)
- 7.47 s: a picture of **HIMSELF** (96 px)
- 9.53 s: Next **slide** (96 px)
- 10.47 s: Him **AGAIN** (96 px)
- 12.40 s: In fucking **sunglasses** (96 px)
- 15.45 s: I'M THE **CENTER** OF (100 px, shout)
- 16.19 s: THE **UNIVERSE** (100 px, shout)
- 17.05 s: **BITCH** (100 px, shout)
- 17.89 s: **Teacher** gave us a (96 px)
- 19.24 s: **ZERO** (96 px)
- 20.40 s: A fat-ass **zero** (96 px)
- 22.78 s: And the **whole** damn (96 px)
- 24.37 s: **class** gave him a (96 px)
- 26.07 s: standing **ovation** (96 px)
