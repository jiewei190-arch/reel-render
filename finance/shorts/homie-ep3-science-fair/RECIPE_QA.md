# homie-ep3-science-fair: storytime recipe QA (tools/storytime_build.mjs)

Composition `HomieEp3ScienceFairRecipe` in `src/index.storytime.ts` (1080x1920, 30 fps, no motion blur). 11 shots, 31.73 s, black from 31.32 s.

## 3D clip QA: 0 clip(s)

- none: the two leads never intersect each other or a set blocker.

## Framing QA (screen space, 940 frames, 0.06 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0. Frame-0 face: me 564 px.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Gate

| check | result | detail |
|---|---|---|
| first spoken word by 0.2 s | PASS | Bro... at 0.00 s |
| frame 0 is a face close-up (closeup / punch_in) | PASS | closeup_me |
| first cut by 3.6 s | PASS | 3.29 s |
| shot length 0.7-6.5 s (average ~2.9 s): no shot over 6.5 s unless hold: true | PASS | longest 4.06 s; average 2.85 s over 11 shots |
| average shot 2.2-3.6 s (2.85 s) | PASS | 11 shots |
| no flash cuts under 0.7 s | PASS | none |
| almost no wides: wide_class <= 10 % of the runtime | PASS | 0.0 % |
| the narrator (me) is visible in ~60 % of shots (45-75 %; POV inserts count) | PASS | 5/11 shots (45 %) |
| face shots (close-up, punch-in, OTS) >= 50 % of the runtime | PASS | 63.5 % |
| captions: 1-4 words per chunk | PASS | 20 chunks |
| captions: exactly one yellow accent word per chunk | PASS | all |
| captions: shout lines ALL CAPS | PASS | lines 5 |
| captions text-fit: every chunk on one line at >= 72 px | PASS | smallest 90.0 px |
| no shakes, punch zooms or flashes (low-poly: hard cuts only) | PASS | none |
| mouths never move (no lip-sync) | PASS | 0 kid-frame(s) with a voice-driven mouth |
| face decals never seen edge-on (55-62 deg; culled past 62 deg) | PASS | 0 edge-on lead-frame(s); 0 lead-frame(s) with the face culled |
| captions: one chunk at a time (no overlap in time) | PASS | 20 chunks, none overlap |
| captions: one baseline after the cold open | PASS | y 1267 px |
| the cafeteria windows end up cracked (shatter marks the break) | warn | no shatter fx in a cafeteria shot |
| hard cut to black (no fade) at the end | PASS | last picture frame 939, black from frame 940 (31.32 s) to 951 |
| 1080x1920, plain 30 fps, no motion blur | PASS | one composition, no Sub |
| length 30-90 s | PASS | 31.73 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | me face 564 px (needs 307) |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |

## Shots

| shot | start | len | set | camera | note |
|---|---|---|---|---|---|
| S01 | 0.00 | 3.29 | classroom | closeup_me | Bro... THREE fucking weeks (annoyed -> furious on THREE) |
| S02 | 3.29 | 3.13 | classroom | setcam | the crystal on our table |
| S03 | 6.42 | 4.06 | classroom | two_shot | the judges walk up |
| S04 | 10.47 | 1.60 | classroom | setcam | ...and the crystal is GONE |
| S05 | 12.07 | 2.24 | classroom | closeup_me | GONE (shocked) |
| S06 | 14.32 | 2.98 | classroom | closeup_homie | this dumbass is CHEWING (smug half-lid) |
| S07 | 17.30 | 3.10 | classroom | closeup_homie | homie: It was salt, bro. Shit was seasoned. (proud) |
| S08 | 20.40 | 2.70 | classroom | closeup_me | WHY THE FUCK would you EAT the project?! (screaming) |
| S09 | 23.10 | 2.65 | classroom | setcam | the ribbon: MOST DELICIOUS |
| S10 | 25.76 | 3.44 | classroom | closeup_me | flat: I hate it here (deadpan -> annoyed on hate) |
| S11 | 29.20 | 2.12 | classroom | closeup_homie | homie licks his lips, slow push, cut to black |

## Captions

- 0.00 s: **Bro** (96 px)
- 0.82 s: we spent **THREE** fucking (96 px)
- 3.29 s: weeks growing a **crystal** (96 px)
- 5.00 s: for the **science** fair (96 px)
- 6.42 s: The **judges** walk up (96 px)
- 7.79 s: to our **table** (96 px)
- 10.47 s: and that **shit** is (96 px)
- 12.07 s: **GONE** (96 px)
- 13.10 s: I **look** at my (96 px)
- 13.66 s: **homie** (96 px)
- 14.32 s: This dumbass is **CHEWING** (90 px)
- 17.30 s: It was **salt** (96 px)
- 18.04 s: **bro** (96 px)
- 18.60 s: Shit was **seasoned** (96 px)
- 20.40 s: WHY THE **FUCK** WOULD (100 px, shout)
- 21.36 s: YOU **EAT** THE PROJECT?! (100 px, shout)
- 23.10 s: The **judges** still gave (96 px)
- 24.56 s: us a **ribbon** (96 px)
- 25.76 s: Most **Delicious** (96 px)
- 27.92 s: I **hate** it here (96 px)
