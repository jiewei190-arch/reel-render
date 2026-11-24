# homie-ep2-soundboard: storytime recipe QA (tools/storytime_build.mjs)

Composition `HomieEp2SoundboardRecipe` in `src/index.storytime.ts` (1080x1920, 30 fps, no motion blur). 33 shots, 85.23 s, black from 84.83 s.

## 3D clip QA: 0 clip(s)

- none: the two leads never intersect each other or a set blocker.

## Framing QA (screen space, 2545 frames, 0.14 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0. Frame-0 face: me 563 px.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Gate

| check | result | detail |
|---|---|---|
| first spoken word by 0.2 s | PASS | Yo, at 0.00 s |
| frame 0 is a face close-up (closeup / punch_in) | PASS | closeup_me |
| first cut by 3.6 s | PASS | 3.44 s |
| shot length 0.7-6.5 s (average ~2.9 s): no shot over 6.5 s unless hold: true | PASS | longest 5.02 s; average 2.57 s over 33 shots |
| average shot 2.2-3.6 s (2.57 s) | PASS | 33 shots |
| no flash cuts under 0.7 s | PASS | none |
| almost no wides: wide_class <= 10 % of the runtime | PASS | 7.4 % |
| the narrator (me) is visible in ~60 % of shots (45-75 %; POV inserts count) | PASS | 15/33 shots (45 %) |
| face shots (close-up, punch-in, OTS) >= 50 % of the runtime | warn | 37.5 % |
| captions: 1-4 words per chunk | PASS | 50 chunks |
| captions: exactly one yellow accent word per chunk | PASS | all |
| captions: shout lines ALL CAPS | PASS | lines  |
| captions text-fit: every chunk on one line at >= 72 px | PASS | smallest 82.4 px |
| no shakes, punch zooms or flashes (low-poly: hard cuts only) | PASS | none |
| mouths never move (no lip-sync) | PASS | 0 kid-frame(s) with a voice-driven mouth |
| face decals never seen edge-on (55-62 deg; culled past 62 deg) | PASS | 0 edge-on lead-frame(s); 464 lead-frame(s) with the face culled |
| captions: one chunk at a time (no overlap in time) | PASS | 50 chunks, none overlap |
| captions: one baseline after the cold open | PASS | y 1267 px |
| the cafeteria windows end up cracked (shatter marks the break) | warn | no shatter fx in a cafeteria shot |
| hard cut to black (no fade) at the end | PASS | last picture frame 2544, black from frame 2545 (84.83 s) to 2556 |
| 1080x1920, plain 30 fps, no motion blur | PASS | one composition, no Sub |
| length 30-90 s | PASS | 85.23 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | me face 563 px (needs 307) |
| framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |

## Shots

| shot | start | len | set | camera | note |
|---|---|---|---|---|---|
| S01 | 0.00 | 3.44 | classroom | closeup_me | hook: my homie is NOT okay, bro |
| S02 | 3.44 | 2.04 | classroom | closeup_homie | this dumb-ass downloaded a soundboard app |
| S03 | 5.48 | 3.00 | classroom | insert | the app over his shoulder: one big red button |
| S04 | 8.48 | 1.13 | classroom | pov_press | BRUH 9.23: thumb on the button |
| S05 | 9.61 | 1.99 | classroom | closeup_homie | hard cut: homie deadpan half-lid |
| S06 | 11.60 | 3.38 | classroom | setcam | teacher at the board: POP QUIZ |
| S07 | 14.98 | 1.13 | classroom | pov_press | BRUH 15.73: thumb on the button |
| S08 | 16.11 | 1.45 | classroom | closeup_homie | hard cut: homie deadpan half-lid |
| S09 | 17.56 | 3.74 | classroom | wide_class | the whole class loses it |
| S10 | 21.30 | 4.18 | classroom | setcam | her face goes purple |
| S11 | 25.48 | 1.82 | hallway | setcam | the principal stops him at the lockers |
| S12 | 27.30 | 2.43 | hallway | setcam | young man, where's your hall pass? |
| S13 | 29.73 | 1.13 | hallway | pov_press | BRUH 30.48: thumb on the button |
| S14 | 30.86 | 2.10 | hallway | closeup_homie | hard cut: homie deadpan half-lid |
| S15 | 32.96 | 3.44 | detention | setcam | detention: alone under the sign |
| S16 | 36.40 | 2.52 | hallway | setcam | the principal didn't even blink |
| S17 | 38.92 | 2.48 | cafeteria | two_shot | then lunch |
| S18 | 41.40 | 2.91 | cafeteria | pov_tray (homie) | ONE sad nugget drops on his tray |
| S19 | 44.31 | 1.13 | cafeteria | pov_press | BRUH 45.06: thumb on the button |
| S20 | 45.44 | 1.16 | cafeteria | closeup_homie | hard cut: homie deadpan half-lid |
| S21 | 46.60 | 3.36 | cafeteria | pov_tray (homie) | the lunch lady takes it back |
| S22 | 49.96 | 4.68 | cafeteria | closeup_me | bro, delete the damn app |
| S23 | 54.64 | 1.34 | cafeteria | closeup_homie | nah, it's connected to the Bluetooth |
| S24 | 55.98 | 2.86 | cafeteria | closeup_me | WHAT Bluetooth? |
| S25 | 58.84 | 2.52 | gym | wide_class | fifth period, school assembly |
| S26 | 61.36 | 3.86 | gym | setcam | principal at the mic: student of the month |
| S27 | 65.22 | 1.00 | gym | pov_press | the gym BRUH: thumb on the button |
| S28 | 66.22 | 2.88 | gym | setcam | BRUH through the BIG speakers: the gym frozen |
| S29 | 69.10 | 2.18 | gym | closeup_me | 700 kids, bro (mortified) |
| S30 | 71.28 | 2.44 | gym | closeup_homie | one stupid-ass button |
| S31 | 73.72 | 5.02 | gym | two_shot | never going back |
| S32 | 78.74 | 3.72 | gym | closeup_me | why the FUUUCK are you like this? |
| S33 | 82.46 | 2.37 | gym | closeup_homie | he slowly raises the phone... hard cut to black BEFORE it plays |

## Captions

- 0.00 s: **Yo** (96 px)
- 0.46 s: my homie is **NOT** (96 px)
- 1.62 s: **okay** (96 px)
- 2.56 s: **bruh** (96 px)
- 3.44 s: This bro **downloaded** a (96 px)
- 4.66 s: **soundboard** app last night (88 px)
- 6.72 s: One fucking **button** (96 px)
- 10.76 s: First **period** (96 px)
- 11.60 s: **teacher** goes (96 px)
- 12.76 s: pop **quiz** (96 px)
- 14.16 s: **phones** away (96 px)
- 17.56 s: The whole damn **class** (96 px)
- 20.06 s: **lost** it (96 px)
- 21.30 s: Teacher's face went **purple** (87 px)
- 22.76 s: as **fuck** (96 px)
- 25.48 s: **Hallway** (96 px)
- 26.50 s: **principal** stops him like (96 px)
- 27.86 s: **young** man (96 px)
- 28.98 s: where's your hall **pass?** (96 px)
- 32.04 s: This bro got **detention** (96 px)
- 33.52 s: so **fucking** fast (96 px)
- 36.40 s: the **principal** didn't even (96 px)
- 37.80 s: **blink** (96 px)
- 38.92 s: Then **lunch** (96 px)
- 40.68 s: The **lunch** lady drops (96 px)
- 41.86 s: one sad-ass chicken **nugget** (82 px)
- 44.02 s: on his **tray** (96 px)
- 46.60 s: She **took** the fucking (96 px)
- 48.32 s: nugget **back** (96 px)
- 49.96 s: So I'm **like** (96 px)
- 51.38 s: **bro** (96 px)
- 52.58 s: **delete** the damn app (96 px)
- 54.64 s: **Nah** (96 px)
- 54.88 s: it's **connected** to the (96 px)
- 55.62 s: **Bluetooth** (96 px)
- 55.98 s: What fucking **Bluetooth?** (95 px)
- 58.84 s: Fifth **period** (96 px)
- 59.94 s: school **assembly** (96 px)
- 61.36 s: Principal taps the **mic** (96 px)
- 62.44 s: **Today** we honor our (96 px)
- 64.10 s: student of the **month** (96 px)
- 69.10 s: **700** kids (96 px)
- 70.78 s: **bro** (96 px)
- 71.28 s: One stupid-ass **button** (96 px)
- 73.72 s: We are **never** going (96 px)
- 76.18 s: back to that **shit-hole** (96 px)
- 77.28 s: **school** (96 px)
- 77.88 s: **bro** (96 px)
- 78.74 s: Why the **FUUUCK** are (96 px)
- 81.54 s: you **like** this? (96 px)
