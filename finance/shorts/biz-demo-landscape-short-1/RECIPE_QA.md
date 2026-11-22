# biz-demo-landscape-short-1: biz3d recipe QA (tools/biz_build.mjs)

Composition: `BizDemoLandscapeShort1Recipe` in `src/index.biz.ts` (portrait 1080x1920, 30 fps, no motion blur). 12 shots, 31.70 s.

## Clip QA: 951 frames x 4 sub-frames, 0 clip(s)

- none: no executive's body or head enters a set blocker, a kit prop or another executive; nobody below the floor.

## Framing QA (screen space, 940 frames, 0.03 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close.

## Polish QA (tools/polish_qa.mjs, 0.03 s): 0 fail(s)

P1 counters 0, P2 text-fit 0, P3 chapter cards 0, P4 occlusion 0. Rules: LONGFORM.md "Polish rules".

- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face.

- warn S02 counter 'Netflix losses, 2000' (target -$57M): no anchor word: the voice never says -$57M between 1.2 and 3.8 s, so it lands by 3.29 s (0.5 s before it leaves); say the number there or set "land" to the word that means it
- warn S11 counter 'debt' (target $1.46B): no anchor word: the voice never says $1.46B between 24.4 and 27.7 s, so it lands by 27.18 s (0.5 s before it leaves); say the number there or set "land" to the word that means it

## Frame-0 opener (tools/frame0_hero.mjs): 0 fail(s)

- none: giant stake board "the stake" 85 % of the width; ceo faces the lens (0° off).

Hero props in S01: none. Number cards at 0.00 s: "the stake" 85 % wide, 100 % opaque.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height (or the hero-prop / giant-board opener below) | PASS | ceo 38 %; opener: giant stake board "the stake" 85 % of the width |
| frame 0: no faceless figure from behind, and none without a hero prop or stake number beside it | PASS | ceo 0° off its facing, with a stake number in frame |
| frame 0 opens on a hero prop close-up (>= 35 % of the height) or a giant stake board (>= 50 % of the width) | PASS | giant stake board "the stake" 85 % of the width |
| frame 0: every number card on screen is fully opaque (no fade-in at 0.00 s) | PASS | "the stake" 100 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *accent* word | PASS | "THE *$50* MILLION OFFER" (4 words, 2 line(s), widest ~883 px of 980, accent: *$50*, until 2.50 s) |
| the dollar stake / a number on screen by 0.5 s | PASS | at 0.00 s |
| first spoken word by 0.2 s | PASS | It at 0.10 s |
| a sound punch at 0.00 s | PASS | impact, ding |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, hit 0.45, cut 1.00, hit 1.00 |
| music + an SFX at frame 0 | PASS | upbeat, impact, ding |
| an acting beat by 1.5 s (a frame-0 executive changes pose) | PASS | at 0.40 s |
| no wide shot in the first 1 s | PASS | S01 hookZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 1.00 s |
| heads clear of the caption band on >= 90 % of caption time | PASS | 100 % |
| labels: <= 3 words (compile-enforced), one at a time (>= 0.3 s apart) | PASS | 1 label(s) |
| no label or device card over a head | PASS | none |
| the hook card never covers a head | PASS | clear |
| text cards never overlap each other or the hook | PASS | none |
| label and device cards above the caption band | PASS | all above |
| no static frames: the camera moves on every frame (freeze-frames included) | PASS | moves on every frame |
| the signature chart flythrough is used | PASS | S07 14.46-18.75 s, S08 18.75-20.82 s |
| story devices: a company card and THE DECISION | PASS | board, counter, decision, stamp, company, worth |
| loop ending: the hook comes back and the last shot frames the first shot's subject | warn | hook again not set; last target "chart" |
| length 30-55 s | PASS | 31.70 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | face rule replaced by the opener: giant stake board "the stake" 85 % of the width |
| polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point) | PASS | 3 counter(s) land and hold; 2 without an anchor word (warn) |
| polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped | PASS | 17 line(s) fit |
| polish P4: no set piece (chair, table, rack) over a featured face (>= 30 % for > 5 frames) | PASS | faces clear |

Frame-0 coverage by subject: ceo 38 %, backWall 0 %.
