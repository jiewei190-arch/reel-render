# homie-ep2-soundboard: storytime recipe QA (tools/storytime_build.mjs)

Composition `HomieEp2SoundboardRecipe` in `src/index.storytime.ts` (1080x1920, 30 fps, no motion blur). 33 shots, 76.70 s, black from 76.27 s.

## 3D clip QA: 0 clip(s)

- none: the two leads never intersect each other or a set blocker.

## Framing QA (screen space, 2289 frames, 0.14 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0. Frame-0 face: me 564 px.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Gate

| check | result | detail |
|---|---|---|
| first spoken word by 0.2 s | PASS | my at 0.00 s |
| frame 0 is a face close-up (closeup / punch_in) | PASS | closeup_me |
| first cut by 3.6 s | PASS | 2.62 s |
| shot length 0.7-6.5 s (average ~2.9 s): no shot over 6.5 s unless hold: true | PASS | longest 4.02 s; average 2.31 s over 33 shots |
| average shot 2.2-3.6 s (2.31 s) | PASS | 33 shots |
| no flash cuts under 0.7 s | PASS | none |
| almost no wides: wide_class <= 10 % of the runtime | PASS | 7.6 % |
| the narrator (me) is visible in ~60 % of shots (45-75 %; POV inserts count) | PASS | 15/33 shots (45 %) |
| face shots (close-up, punch-in, OTS) >= 50 % of the runtime | warn | 38.3 % |
| captions: 1-4 words per chunk | PASS | 49 chunks |
| captions: exactly one yellow accent word per chunk | PASS | all |
| captions: shout lines ALL CAPS | PASS | lines  |
| captions text-fit: every chunk on one line at >= 72 px | PASS | smallest 82.4 px |
| no shakes, punch zooms or flashes (low-poly: hard cuts only) | PASS | none |
| mouths never move (no lip-sync) | PASS | 0 kid-frame(s) with a voice-driven mouth |
| face decals never seen edge-on (55-62 deg; culled past 62 deg) | PASS | 0 edge-on lead-frame(s); 421 lead-frame(s) with the face culled |
| captions: one chunk at a time (no overlap in time) | PASS | 49 chunks, none overlap |
| captions: one baseline after the cold open | PASS | y 1267 px |
| the cafeteria windows end up cracked (shatter marks the break) | warn | no shatter fx in a cafeteria shot |
| hard cut to black (no fade) at the end | PASS | last picture frame 2288, black from frame 2289 (76.27 s) to 2300 |
| 1080x1920, plain 30 fps, no motion blur | PASS | one composition, no Sub |
| length 30-90 s | PASS | 76.70 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | me face 564 px (needs 307) |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |

## Shots

| shot | start | len | set | camera | note |
|---|---|---|---|---|---|
| S01 | 0.00 | 2.62 | classroom | closeup_me | hook: my homie is NOT okay, bro |
| S02 | 2.62 | 2.68 | classroom | closeup_homie | this dumb-ass downloaded a soundboard app |
| S03 | 5.30 | 2.62 | classroom | insert | the app over his shoulder: one big red button |
| S04 | 7.92 | 1.13 | classroom | pov_press | BRUH 8.67: thumb on the button |
| S05 | 9.05 | 1.81 | classroom | closeup_homie | hard cut: homie deadpan half-lid |
| S06 | 10.86 | 2.84 | classroom | setcam | teacher at the board: POP QUIZ |
| S07 | 13.70 | 1.13 | classroom | pov_press | BRUH 14.45: thumb on the button |
| S08 | 14.83 | 1.81 | classroom | closeup_homie | hard cut: homie deadpan half-lid |
| S09 | 16.64 | 3.48 | classroom | wide_class | the whole class loses it |
| S10 | 20.12 | 2.92 | classroom | setcam | her face goes purple |
| S11 | 23.04 | 2.92 | hallway | setcam | the principal stops him at the lockers |
| S12 | 25.96 | 2.81 | hallway | setcam | young man, where's your hall pass? |
| S13 | 28.77 | 1.13 | hallway | pov_press | BRUH 29.52: thumb on the button |
| S14 | 29.90 | 1.74 | hallway | closeup_homie | hard cut: homie deadpan half-lid |
| S15 | 31.64 | 2.64 | detention | setcam | detention: alone under the sign |
| S16 | 34.28 | 1.68 | hallway | setcam | the principal didn't even blink |
| S17 | 35.96 | 1.48 | cafeteria | two_shot | then lunch |
| S18 | 37.44 | 2.63 | cafeteria | pov_tray (homie) | ONE sad nugget drops on his tray |
| S19 | 40.07 | 1.13 | cafeteria | pov_press | BRUH 40.82: thumb on the button |
| S20 | 41.20 | 0.98 | cafeteria | closeup_homie | hard cut: homie deadpan half-lid |
| S21 | 42.18 | 3.30 | cafeteria | pov_tray (homie) | the lunch lady takes it back |
| S22 | 45.48 | 3.32 | cafeteria | closeup_me | bro, delete the damn app |
| S23 | 48.80 | 2.30 | cafeteria | closeup_homie | nah, it's connected to the Bluetooth |
| S24 | 51.10 | 1.80 | cafeteria | closeup_me | WHAT Bluetooth? |
| S25 | 52.90 | 2.32 | gym | wide_class | fifth period, school assembly |
| S26 | 55.22 | 3.76 | gym | setcam | principal at the mic: student of the month |
| S27 | 58.98 | 1.00 | gym | pov_press | the gym BRUH: thumb on the button |
| S28 | 59.98 | 2.14 | gym | setcam | BRUH through the BIG speakers: the gym frozen |
| S29 | 62.12 | 2.40 | gym | closeup_me | 700 kids, bro (mortified) |
| S30 | 64.52 | 2.00 | gym | closeup_homie | one stupid-ass button |
| S31 | 66.52 | 4.02 | gym | two_shot | never going back |
| S32 | 70.54 | 3.36 | gym | closeup_me | why the FUUUCK are you like this? |
| S33 | 73.90 | 2.37 | gym | closeup_homie | he slowly raises the phone... hard cut to black BEFORE it plays |

## Captions

- 0.00 s: My homie is **NOT** (96 px)
- 1.44 s: **okay** (96 px)
- 2.20 s: **bro** (96 px)
- 2.62 s: This dumb-ass **downloaded** (84 px)
- 4.20 s: a **soundboard** app last (96 px)
- 5.60 s: **night** (96 px)
- 6.04 s: One fucking **button** (96 px)
- 9.76 s: First **period** (96 px)
- 10.86 s: teacher goes pop **quiz** (96 px)
- 12.82 s: **phones** away (96 px)
- 16.64 s: The whole damn **class** (96 px)
- 18.96 s: **lost** it (96 px)
- 20.12 s: Teacher's face went **purple** (87 px)
- 21.82 s: as **fuck** (96 px)
- 23.04 s: **Hallway** (96 px)
- 24.46 s: **Principal** stops him like (96 px)
- 26.36 s: **young** man (96 px)
- 27.50 s: where's your hall **pass?** (96 px)
- 30.80 s: Bro got **detention** so (96 px)
- 32.86 s: **fucking** fast (96 px)
- 34.28 s: the **principal** didn't even (96 px)
- 35.56 s: **blink** (96 px)
- 35.96 s: Then **lunch** (96 px)
- 36.76 s: The **lunch** lady drops (96 px)
- 37.82 s: one sad-ass chicken **nugget** (82 px)
- 39.66 s: on his **tray** (96 px)
- 42.18 s: She **took** the fucking (96 px)
- 44.20 s: nugget **back** (96 px)
- 45.48 s: So I'm like **bro** (96 px)
- 47.32 s: **delete** the damn app (96 px)
- 48.80 s: **Nah** (96 px)
- 49.70 s: it's **connected** to the (96 px)
- 50.14 s: **Bluetooth** (96 px)
- 51.10 s: What **fuckin'** (96 px)
- 52.22 s: **Bluetooth?** (96 px)
- 52.90 s: Fifth **period** (96 px)
- 53.90 s: School **assembly** (96 px)
- 55.22 s: Principal taps the **mic** (96 px)
- 56.34 s: **Today** we honor our (96 px)
- 57.62 s: student of the **month** (96 px)
- 62.12 s: **700** kids (96 px)
- 64.06 s: **bro** (96 px)
- 64.52 s: One stupid-ass **button** (96 px)
- 66.52 s: We are **never** going (96 px)
- 68.04 s: back to that **shit-hole** (96 px)
- 69.10 s: **school** (96 px)
- 69.78 s: **bro** (96 px)
- 70.54 s: Why the **FUUUCK** are (96 px)
- 72.98 s: you **like** this? (96 px)
