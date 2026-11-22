# deez-nuts-ep1: storytime recipe QA (tools/storytime_build.mjs)

Composition `DeezNutsEp1Recipe` in `src/index.storytime.ts` (1080x1920, 30 fps, no motion blur). 29 shots, 78.87 s, black from 78.06 s.

## 3D clip QA: 0 clip(s)

- none: the two leads never intersect each other or a set blocker.

## Framing QA (screen space, 2342 frames, 0.10 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0. Frame-0 face: homie 501 px.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Gate

| check | result | detail |
|---|---|---|
| first spoken word by 0.2 s | PASS | DEEZ at 0.00 s |
| frame 0 is a face close-up (closeup / punch_in) | PASS | closeup_homie |
| first cut by 3.6 s | PASS | 2.72 s |
| shot length 0.7-6.5 s (average ~2.9 s): no shot over 6.5 s unless hold: true | PASS | longest 4.12 s; average 2.69 s over 29 shots |
| average shot 2.2-3.6 s (2.69 s) | PASS | 29 shots |
| no flash cuts under 0.7 s | PASS | none |
| almost no wides: wide_class <= 10 % of the runtime | PASS | 5.1 % |
| the narrator (me) is visible in ~60 % of shots (45-75 %; POV inserts count) | PASS | 17/29 shots (59 %) |
| face shots (close-up, punch-in, OTS) >= 50 % of the runtime | PASS | 74.7 % |
| captions: 1-4 words per chunk | PASS | 52 chunks |
| captions: exactly one yellow accent word per chunk | PASS | all |
| captions: shout lines ALL CAPS | PASS | lines 1, 5, 6, 10, 11 |
| captions text-fit: every chunk on one line at >= 72 px | PASS | smallest 87.1 px |
| no shakes, punch zooms or flashes (low-poly: hard cuts only) | PASS | none |
| mouths never move (no lip-sync) | PASS | 0 kid-frame(s) with an open mouth |
| face decals never seen edge-on (55-62 deg; culled past 62 deg) | PASS | 0 edge-on lead-frame(s); 313 lead-frame(s) with the face culled |
| captions: one chunk at a time (no overlap in time) | PASS | 52 chunks, none overlap |
| captions: one baseline for the whole film | PASS | y 1421 px |
| the cafeteria windows end up cracked (shatter marks the break) | PASS | yes |
| hard cut to black (no fade) at the end | PASS | last picture frame 2341, black from frame 2342 (78.06 s) to 2365 |
| 1080x1920, plain 30 fps, no motion blur | PASS | one composition, no Sub |
| length 30-90 s | PASS | 78.87 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | homie face 501 px (needs 307) |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |

## Shots

| shot | start | len | set | camera | note |
|---|---|---|---|---|---|
| S01 | 0.00 | 2.72 | hallway | closeup_homie | cold open: homie yells DEEZ NUTS |
| S02 | 2.72 | 2.60 | hallway | closeup_homie | second DEEZ NUTS, tighter |
| S03 | 5.32 | 1.34 | classroom | closeup_me | me at my desk: Bruh |
| S04 | 6.66 | 2.58 | classroom | two_shot | my homie was watching a video in class |
| S05 | 9.24 | 2.02 | classroom | closeup_homie | he turns to me |
| S06 | 11.26 | 3.60 | classroom | ots (homie) | Bro. Do you know who Deez is? |
| S07 | 14.86 | 2.78 | classroom | closeup_me | And me, not knowing this mf |
| S08 | 17.64 | 4.12 | classroom | pov_phone | POV: his phone, VINES 2015 COMPILATION |
| S09 | 21.76 | 1.48 | classroom | closeup_me | I said... |
| S10 | 23.24 | 3.08 | classroom | closeup_me | who the fuck is Deez (tighter, annoyed) |
| S11 | 26.32 | 2.02 | classroom | closeup_homie | DEEZ NUTS IN YOUR MOUTH: tight hard cut |
| S12 | 28.34 | 3.08 | classroom | closeup_me | LOUD AS FUCK BRO |
| S13 | 31.42 | 3.96 | classroom | wide_class | the entire class turns, dying |
| S14 | 35.38 | 2.88 | classroom | closeup_me | and I'm like |
| S15 | 38.26 | 2.64 | classroom | closeup_me | stupid as fuck, bruh (tighter) |
| S16 | 40.90 | 1.78 | cafeteria | two_shot | then at lunch |
| S17 | 42.68 | 1.84 | cafeteria | closeup_homie | this bitch-ass mf |
| S18 | 44.52 | 3.34 | cafeteria | closeup_me | would NOT STOP |
| S19 | 47.86 | 2.78 | cafeteria | pov_tray | POV: my tray, the homie across the table |
| S20 | 50.64 | 2.14 | cafeteria | closeup_homie | Yo bro |
| S21 | 52.78 | 2.84 | cafeteria | closeup_me | Deez nuts #1 (me reacts) |
| S22 | 55.62 | 2.72 | cafeteria | closeup_homie | Deez nuts #2 tighter |
| S23 | 58.34 | 2.52 | cafeteria | closeup_me | Deez nuts #3 tighter |
| S24 | 60.86 | 2.64 | cafeteria | closeup_homie | DEEZ NUTS #4 tightest |
| S25 | 63.50 | 3.52 | cafeteria | closeup_me | NON FUCKING STOP |
| S26 | 67.02 | 5.36 | cafeteria | closeup_me | SHUT THE FUCK UP: one held close-up, slow push |
| S27 | 72.38 | 2.52 | cafeteria | two_shot | I yelled so loud |
| S28 | 74.90 | 1.98 | cafeteria | windows | hard cut: the cracked windows |
| S29 | 76.88 | 1.18 | cafeteria | closeup_homie | smug half-lid: Deez nu- |

## Captions

- 0.00 s: DEEZ **NUTS!** (100 px, shout)
- 2.72 s: DEEZ **NUTS!** (100 px, shout)
- 5.32 s: **BRUH** (96 px)
- 6.06 s: My **homie** was watching (96 px)
- 7.42 s: **YouTube** in class the (96 px)
- 8.34 s: **other** day (96 px)
- 9.24 s: and he **turns** to (96 px)
- 9.94 s: me **like** (96 px)
- 11.26 s: **Bro** (96 px)
- 12.70 s: Do you **know** who (96 px)
- 13.52 s: **Deez** is? (96 px)
- 14.86 s: **And** me (96 px)
- 15.76 s: not **knowing** this (96 px)
- 16.54 s: **MOTHERFUUUCKER** was (96 px)
- 18.30 s: watching old-ASS **Vine** (96 px)
- 19.66 s: videos about **Deez** Nuts (96 px)
- 21.76 s: I **said** (96 px)
- 23.24 s: WHO THE **FUUUCK** IS (100 px, shout)
- 24.84 s: **DEEZ?!** (100 px, shout)
- 26.32 s: DEEZ **NUTS** IN YOUR (100 px, shout)
- 27.72 s: **MOUTH!** (100 px, shout)
- 28.34 s: LOUD AS **FUUUCK** (96 px)
- 30.28 s: **BRO!** (96 px)
- 31.42 s: The **ENTIRE** class turned (96 px)
- 33.22 s: around and started **DYING!** (87 px)
- 35.38 s: And I'm **like** (96 px)
- 37.10 s: THIS **SHIT** IS STUPID (96 px)
- 38.74 s: AS **FUUUCK** (96 px)
- 39.80 s: **BRUH!** (96 px)
- 40.90 s: Then at **lunch?!** (96 px)
- 41.88 s: This **BITCH-ASS** (96 px)
- 43.50 s: **MOTHERFUUUCKER** would (93 px)
- 45.34 s: **NOT!** (96 px)
- 46.46 s: **STOP!** (96 px)
- 47.86 s: **EVERY!** (96 px)
- 48.44 s: **DAMN!** (96 px)
- 49.48 s: **CHANCE!** (96 px)
- 50.64 s: Yo **bro** (96 px)
- 52.78 s: Deez **nuts** (96 px)
- 55.62 s: Deez **nuts** (96 px)
- 58.34 s: Deez **nuts!** (96 px)
- 60.86 s: DEEZ **NUTS!** (96 px)
- 63.50 s: **NON!** (100 px, shout)
- 64.24 s: **FUUUCKING!** (100 px, shout)
- 65.46 s: **STOP!** (100 px, shout)
- 67.02 s: **BRO** (100 px, shout)
- 68.12 s: SHUT THE **FUUUCK** (100 px, shout)
- 70.42 s: **UUUP!** (100 px, shout)
- 72.38 s: I **yelled** so FUUUCKING (96 px)
- 73.92 s: **LOUD** it broke the (96 px)
- 75.38 s: lunchroom **windows!** (96 px)
- 76.98 s: **Deez** nu— (96 px)
