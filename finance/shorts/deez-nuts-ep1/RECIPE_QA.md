# deez-nuts-ep1: storytime recipe QA (tools/storytime_build.mjs)

Composition `DeezNutsEp1Recipe` in `src/index.storytime.ts` (1080x1920, 30 fps, no motion blur). 53 shots, 78.87 s, black from 78.06 s.

## 3D clip QA: 0 clip(s)

- none: the two leads never intersect each other or a set blocker.

## Framing QA (screen space, 2342 frames, 0.15 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0. Frame-0 face: homie 502 px.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Gate

| check | result | detail |
|---|---|---|
| first spoken word by 0.2 s | PASS | DEEZ at 0.00 s |
| frame 0 is a face close-up (closeup / punch_in) | PASS | closeup_homie |
| first cut by 1.25 s | PASS | 0.68 s |
| a cut every 1-3 s: no shot over 3.0 s unless hold: true | PASS | longest 2.80 s; average 1.47 s over 53 shots |
| no flash cuts under 0.4 s | PASS | none |
| almost no wides: wide_class <= 10 % of the runtime | PASS | 5.3 % |
| face shots (close-up, punch-in, OTS) >= 60 % of the runtime | PASS | 82.3 % |
| captions: 1-3 words per chunk | PASS | 56 chunks |
| captions: exactly one yellow accent word per chunk | PASS | all |
| captions: shout lines ALL CAPS | PASS | lines 1, 5, 6, 10, 11 |
| captions text-fit: every chunk on one line at >= 64 px | PASS | smallest 77.7 px |
| shouts get a punch-in and a shake | PASS | line 1: punch/shake, line 5: punch/shake, line 6: punch/shake, line 10: punch/shake, line 11: punch/shake |
| mouths: only the speaking character's mouth moves | PASS | 0 wrong frame(s); 1569 talking kid-frames |
| the cafeteria windows shatter | PASS | yes |
| hard cut to black (no fade) at the end | PASS | last picture frame 2341, black from frame 2342 (78.06 s) to 2365 |
| 1080x1920, plain 30 fps, no motion blur | PASS | one composition, no Sub |
| length 30-90 s | PASS | 78.87 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | homie face 502 px (needs 307) |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |

## Shots

| shot | start | len | set | camera | note |
|---|---|---|---|---|---|
| S01 | 0.00 | 0.68 | hallway | closeup_homie | cold open: homie yells DEEZ |
| S02 | 0.68 | 2.04 | hallway | punch_in (homie) |  |
| S03 | 2.72 | 0.54 | hallway | closeup_homie |  |
| S04 | 3.26 | 0.99 | hallway | punch_in (homie) |  |
| S05 | 4.25 | 1.81 | hallway | closeup_me | me, deadpan: BRUH |
| S06 | 6.06 | 1.36 | classroom | two_shot | in class: homie on his phone |
| S07 | 7.42 | 0.48 | classroom | insert | the phone |
| S08 | 7.90 | 1.34 | classroom | wide_class |  |
| S09 | 9.24 | 2.02 | classroom | closeup_homie | he turns to me |
| S10 | 11.26 | 1.44 | classroom | ots (homie) |  |
| S11 | 12.70 | 2.16 | classroom | closeup_homie |  |
| S12 | 14.86 | 1.68 | classroom | closeup_me |  |
| S13 | 16.54 | 2.14 | classroom | two_shot |  |
| S14 | 18.68 | 1.68 | classroom | insert |  |
| S15 | 20.36 | 1.40 | classroom | closeup_homie |  |
| S16 | 21.76 | 1.48 | classroom | closeup_me |  |
| S17 | 23.24 | 1.06 | classroom | punch_in (me) |  |
| S18 | 24.30 | 2.02 | classroom | ots (me) |  |
| S19 | 26.32 | 1.40 | classroom | punch_in (homie) | DEEZ NUTS IN YOUR MOUTH |
| S20 | 27.72 | 0.62 | classroom | punch_in (homie) |  |
| S21 | 28.34 | 1.94 | classroom | closeup_me |  |
| S22 | 30.28 | 1.14 | classroom | ots (homie) |  |
| S23 | 31.42 | 2.80 | classroom | wide_class | the whole class turns around |
| S24 | 34.22 | 1.16 | classroom | crowd | ... and laughs |
| S25 | 35.38 | 1.72 | classroom | closeup_me |  |
| S26 | 37.10 | 2.70 | classroom | punch_in (me) |  |
| S27 | 39.80 | 1.10 | classroom | closeup_me | deadpan stare |
| S28 | 40.90 | 0.98 | cafeteria | two_shot | lunch |
| S29 | 41.88 | 2.64 | cafeteria | closeup_homie |  |
| S30 | 44.52 | 1.94 | cafeteria | closeup_me |  |
| S31 | 46.46 | 1.40 | cafeteria | punch_in (me) |  |
| S32 | 47.86 | 0.58 | cafeteria | closeup_homie |  |
| S33 | 48.44 | 1.04 | cafeteria | closeup_me |  |
| S34 | 49.48 | 1.16 | cafeteria | punch_in (homie) |  |
| S35 | 50.64 | 2.14 | cafeteria | ots (homie) |  |
| S36 | 52.78 | 1.32 | cafeteria | closeup_homie |  |
| S37 | 54.10 | 1.52 | cafeteria | closeup_me |  |
| S38 | 55.62 | 1.60 | cafeteria | punch_in (homie) |  |
| S39 | 57.22 | 1.12 | cafeteria | closeup_me |  |
| S40 | 58.34 | 1.36 | cafeteria | punch_in (homie) |  |
| S41 | 59.70 | 1.16 | cafeteria | closeup_me |  |
| S42 | 60.86 | 2.64 | cafeteria | punch_in (homie) |  |
| S43 | 63.50 | 0.74 | cafeteria | punch_in (me) |  |
| S44 | 64.24 | 1.22 | cafeteria | closeup_me |  |
| S45 | 65.46 | 0.45 | cafeteria | punch_in (me) |  |
| S46 | 65.91 | 1.11 | cafeteria | closeup_homie |  |
| S47 | 67.02 | 1.10 | cafeteria | closeup_me |  |
| S48 | 68.12 | 2.18 | cafeteria | punch_in (me) |  |
| S49 | 70.30 | 2.08 | cafeteria | punch_in (me) | the held UUUP: a screaming close-up, sustained shake |
| S50 | 72.38 | 1.54 | cafeteria | closeup_homie |  |
| S51 | 73.92 | 1.88 | cafeteria | windows | the windows shatter |
| S52 | 75.80 | 1.18 | cafeteria | closeup_me |  |
| S53 | 76.98 | 1.08 | cafeteria | closeup_homie | smug homie: Deez nu- |

## Captions

- 0.00 s: DEEZ **NUTS!** (108 px, shout)
- 2.72 s: DEEZ **NUTS!** (108 px, shout)
- 5.32 s: **BRUH** (92 px)
- 6.06 s: My **homie** was (92 px)
- 7.12 s: watching **YouTube** in (85 px)
- 7.90 s: **class** the other (92 px)
- 8.46 s: **day** (92 px)
- 9.24 s: and he **turns** (92 px)
- 9.72 s: to me **like** (92 px)
- 11.26 s: **Bro** (92 px)
- 12.70 s: Do you **know** (92 px)
- 13.30 s: who **Deez** is? (92 px)
- 14.86 s: **And** me (92 px)
- 15.76 s: not **knowing** this (92 px)
- 16.54 s: **MOTHERFUUUCKER** was (78 px)
- 18.30 s: watching old-ASS **Vine** (78 px)
- 19.66 s: videos about **Deez** (92 px)
- 20.74 s: **Nuts** (92 px)
- 21.76 s: I **said** (92 px)
- 23.24 s: WHO THE **FUUUCK** (103 px, shout)
- 24.30 s: IS **DEEZ?!** (108 px, shout)
- 26.32 s: DEEZ **NUTS** IN (108 px, shout)
- 27.58 s: YOUR **MOUTH!** (108 px, shout)
- 28.34 s: LOUD AS **FUUUCK** (92 px)
- 30.28 s: **BRO!** (92 px)
- 31.42 s: The **ENTIRE** class (92 px)
- 32.90 s: **turned** around and (92 px)
- 34.22 s: started **DYING!** (92 px)
- 35.38 s: And I'm **like** (92 px)
- 37.10 s: THIS **SHIT** IS (92 px)
- 38.26 s: STUPID AS **FUUUCK** (92 px)
- 39.80 s: **BRUH!** (92 px)
- 40.90 s: Then at **lunch?!** (92 px)
- 41.88 s: This **BITCH-ASS** (92 px)
- 43.50 s: **MOTHERFUUUCKER** (92 px)
- 44.52 s: would **NOT!** (92 px)
- 46.46 s: **STOP!** (92 px)
- 47.86 s: **EVERY!** (92 px)
- 48.44 s: **DAMN!** (92 px)
- 49.48 s: **CHANCE!** (92 px)
- 50.64 s: Yo **bro** (92 px)
- 52.78 s: Deez **nuts** (92 px)
- 55.62 s: Deez **nuts** (92 px)
- 58.34 s: Deez **nuts!** (92 px)
- 60.86 s: DEEZ **NUTS!** (92 px)
- 63.50 s: **NON!** (108 px, shout)
- 64.24 s: **FUUUCKING!** (108 px, shout)
- 65.46 s: **STOP!** (108 px, shout)
- 67.02 s: **BRO** (108 px, shout)
- 68.12 s: SHUT THE **FUUUCK** (102 px, shout)
- 70.42 s: **UUUP!** (108 px, shout)
- 72.38 s: I **yelled** so (92 px)
- 73.42 s: FUUUCKING **LOUD** it (92 px)
- 74.90 s: **broke** the lunchroom (86 px)
- 75.80 s: **windows!** (92 px)
- 76.98 s: **Deez** nu— (92 px)
