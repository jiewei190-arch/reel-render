# pearson-doc: doc long-form QA (tools/doc_build.mjs)

Composition `PearsonDocDoc` in `src/index.doc.ts` (1920x1080, 30 fps, no motion blur). Theme law, 3D kit law3d. 34 scenes, 133.13 s (2.22 min), 3 chapters.

## Per chapter

| chapter | scenes | types | scene3d | fails |
|---|---|---|---|---|
| 1 The Missing Pants | 17 | 9: scene3d, stat, evidenceboard, document, map, compare, timeline, quote, recap | 24 % | 0 |
| 2 The $67 Million Demand | 9 | 6: chart, scene3d, document, compare, stat, recap | 31 % | 0 |
| 3 The Verdict | 8 | 5: timeline, scene3d, document, compare, recap | 32 % | 0 |

## Gates

| check | result | detail |
|---|---|---|
| variety V1: a new shot or scene type at least every 6 s (no scene longer) | PASS | longest 5.8 s |
| variety V2: no identical scene type + set + camera within 45 s | PASS | none |
| variety V3: scene3d <= 40 % of the runtime | PASS | 28 % |
| variety V4: every chapter uses >= 4 distinct scene types | PASS | ch1: 9, ch2: 6, ch3: 5 |
| variety V5: big beats use scene3d with people, or document / quote / compare (never an empty set) | PASS | 6 beat(s) ok |
| budget B1: no scene type or 3D set above 30 % of the shots | PASS | scene3d 10, document 4, timeline 4, map 3, compare 3, recap 3, stat 2, evidenceboard 2, chart 2, quote 1 / sets: courtroom 6, evidence 3, casefile 1 |
| budget B2: >= 8 distinct scene/set combinations per 10 min | PASS | 16 (needs 4) |
| budget B3: one hero set per chapter (its most-used 3D set, declared as "heroSet") | PASS | ch1: courtroom, ch2: evidence, ch3: courtroom |
| numbers N1: every spoken figure ($, digits, number words with a unit) has a board with that exact value within +-1.5 s | PASS | 15 of 15 shown |
| chapters C1: one card per chapter, the same style, none in the first 30 s, clear of the text under it | PASS | ch1 30.71 s top 130, ch2 65.43 s top 330, ch3 102.66 s top 130 |
| text T1: a callout never covers what it explains; no text 3 deep in the first 3 s; nothing under the hook | PASS | 0 callout, 0 stack, 0 hook |
| text T2: 2D text fits at >= 42 px (secondary >= 32), inside the frame, out of the caption band, >= 4.5:1 | PASS | 0 fit, 0 frame, 0 band, 0 contrast |
| sanity S1: names, places, dates and headlines on screen are in the script or sources; every number on screen is in them; maps show the story's region | PASS | 0 name/place/date, 0 number |
| legal S2: no verdict words the script does not say; pictures never contradict the line; callouts sit on what the voice names | PASS | clean |
| teases S3: every moment the cold open promises ("tease": "<id>") is shown later as a scene | PASS | 1 tease(s); cold-open people shots without "tease": S05 |
| 3D clip QA (law3d): no prop in a body, nobody below the floor, no two people overlapping | PASS | 0 clip(s) over 1108 sampled frames |
| 3D framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| 3D framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| 3D framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| 3D framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| 3D framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height) | PASS | clear |
| 3D polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 1 counter(s) land and hold |
| 3D polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 6 line(s) fit |
| 3D polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | PASS | faces clear |
| long-form: hook text on screen at frame 0 | PASS | "$54 MILLION FOR PANTS" until 4.85 s |
| long-form: first spoken word by 0.5 s | PASS | A at 0.00 s |
| long-form: a sound punch + music at 0.00 s | PASS | suspense, impact |
| long-form: YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 3 chapters, first "The Missing Pants" at 0.00 s |
| long-form: every chapter >= 10 s (YouTube minimum) | PASS | 1:65s 2:37s 3:30s |
| long-form: a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 5.81 s from 77.3 s |
| long-form: a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 7.7 s from 11.3 s; 31 beat marks |
| long-form: lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| long-form: shot length 3-6 s on average, none over 8 s | PASS | mean 3.92 s over 34 shots |
| long-form: an open loop (a question or a tease) in the 25 s before each chapter | PASS | every chapter |
| long-form: length 8-12 min | warn | 2.22 min |

## Lines to fix

- none

## Spoken figures

- 2.25 s line 1 "$54 million" = 54,000,000: shown by S01 scene3d '$54 MILLION FOR PANTS' at 0.75 s
- 5.76 s line 2 "Fifty-four million" = 54,000,000: shown by S01 scene3d '$54 MILLION FOR PANTS' at 4.26 s
- 30.95 s line 7 "2005" = 2,005: shown by S09 timeline '2005' at 31.05 s
- 44.35 s line 9 "$10.50" = 10.5: shown by S12 document 'Alteration: $10.50' at 42.95 s
- 68.04 s line 14 "$3,000" = 3,000: shown by S18 chart '$3,000' at 68.34 s
- 68.81 s line 14 "$4,600" = 4,600: shown by S18 chart '$4,600' at 69.11 s
- 69.58 s line 14 "$12,000" = 12,000: shown by S18 chart '$12,000' at 69.88 s
- 75.51 s line 16 "$67 million" = 67,000,000: shown by S20 document 'Damages sought: $67,000,000' at 74.01 s
- 88.55 s line 19 "$1,500" = 1,500: shown by S23 stat '$1,500' at 87.95 s
- 94.77 s line 20 "$54 million" = 54,000,000: shown by S24 (3D board) '$54,000,000' at 94.87 s
- 104.29 s line 22 "2007" = 2,007: shown by S27 timeline '2007' at 104.39 s
- 110.80 s line 24 "25" = 25: shown by S29 (3D board) 'JUNE 25, 2007' at 110.60 s
- 111.03 s line 24 "2007" = 2,007: shown by S29 (3D board) 'JUNE 25, 2007' at 110.53 s
- 121.53 s line 26 "$54 million" = 54,000,000: shown by S31 compare '$54,000,000' at 120.03 s
- 125.15 s line 27 "2008" = 2,008: shown by S32 timeline '2008' at 125.25 s

## Scenes

| id | ch | at | len | type | set | camera | beat |
|---|---|---|---|---|---|---|---|
| S01 | 1 | 0.00 s | 5.0 s | scene3d | courtroom | hookZoom |  |
| S02 | 1 | 4.95 s | 2.7 s | stat | number | push |  |
| S03 | 1 | 7.66 s | 3.7 s | evidenceboard | board | panR |  |
| S04 | 1 | 11.35 s | 2.7 s | scene3d | courtroom | orbit | yes |
| S05 | 1 | 14.07 s | 5.0 s | scene3d | courtroom | medium |  |
| S06 | 1 | 19.09 s | 4.3 s | document | article | push |  |
| S07 | 1 | 23.41 s | 4.2 s | map | usa | push |  |
| S08 | 1 | 27.57 s | 3.1 s | compare | split | drift |  |
| S09 | 1 | 30.71 s | 3.8 s | timeline | strip | drift |  |
| S10 | 1 | 34.47 s | 4.7 s | map | usa | drift |  |
| S11 | 1 | 39.19 s | 3.6 s | map | city | push |  |
| S12 | 1 | 42.82 s | 3.0 s | document | receipt | push |  |
| S13 | 1 | 45.77 s | 5.5 s | evidenceboard | board | push |  |
| S14 | 1 | 51.23 s | 2.9 s | scene3d | evidence | dolly |  |
| S15 | 1 | 54.10 s | 4.2 s | timeline | strip | rise |  |
| S16 | 1 | 58.32 s | 3.9 s | quote | quote | push | yes |
| S17 | 1 | 62.26 s | 3.2 s | recap | list | drift |  |
| S18 | 2 | 65.43 s | 5.0 s | chart | bar | rise |  |
| S19 | 2 | 70.42 s | 2.6 s | scene3d | courtroom | slamZoom | yes |
| S20 | 2 | 73.00 s | 4.2 s | document | filing | push |  |
| S21 | 2 | 77.25 s | 5.8 s | scene3d | evidence | pushIn |  |
| S22 | 2 | 83.06 s | 4.8 s | compare | split | drift |  |
| S23 | 2 | 87.83 s | 4.6 s | stat | number | push |  |
| S24 | 2 | 92.46 s | 3.1 s | scene3d | casefile | topDown |  |
| S25 | 2 | 95.54 s | 3.4 s | chart | bar | drift |  |
| S26 | 2 | 98.91 s | 3.7 s | recap | list | pull |  |
| S27 | 3 | 102.66 s | 4.1 s | timeline | strip | panL |  |
| S28 | 3 | 106.80 s | 3.4 s | scene3d | courtroom | closeUp | yes |
| S29 | 3 | 110.23 s | 3.5 s | scene3d | courtroom | medium |  |
| S30 | 3 | 113.75 s | 5.4 s | document | ruling | push | yes |
| S31 | 3 | 119.18 s | 5.0 s | compare | split | push | yes |
| S32 | 3 | 124.15 s | 2.9 s | timeline | strip | push |  |
| S33 | 3 | 127.08 s | 3.1 s | recap | list | drift |  |
| S34 | 3 | 130.19 s | 2.9 s | scene3d | evidence | crane |  |

## Framing QA (screen space, 1108 frames, 0.07 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0, R6 caption on face/neck 0.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks.

## Polish QA (tools/polish_qa.mjs, 0.06 s): 0 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 0. Rules: LONGFORM.md "Polish rules".

- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face.

Pacing: 53 visual-change marks, longest gap 5.81 s, mean shot 3.92 s.

## chapters.txt

```
00:00 The Missing Pants
01:05 The $67 Million Demand
01:42 The Verdict
```
