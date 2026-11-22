# cyber-demo-landscape-short-1: cyber3d recipe QA (tools/cyber_build.mjs)

Composition: `CyberDemoLandscapeShort1Recipe` in `src/index.cyber.ts` (plain 30 fps). Kit cyber3d, format short, frame portrait 1080x1920. 12 shots, 29.67 s.

## Clip QA: 890 frames x 4 sub-frames, 0 clip(s)

- none: no part, figure, kit prop or set piece enters BOLT's shell or mitts; BOLT stays above the ground; grounded objects stay above the floor.

## Framing QA (screen space, 890 frames, 0.03 s): 0 clip(s), 0 fail(s)

Rules: RECIPE_GUIDE.md "Framing rules". R1 head clips 0, R2 subject/edge 0, R3 board past edge 0, R4 contrast 0, R4 text size 0, R5 frame 0 0.

- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close.

## Frame-0 opener (tools/frame0_hero.mjs): 0 fail(s)

- none: giant stake board "AT STAKE" 85 % of the width; hk faces the lens (73° off).

Hero props in S01: none. Number cards at 0.00 s: "AT STAKE" 85 % wide, 100 % opaque.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height (or the hero-prop / giant-board opener below) | PASS | hk 27 %; opener: giant stake board "AT STAKE" 85 % of the width |
| frame 0: no faceless figure from behind, and none without a hero prop or stake number beside it | PASS | hk 73° off its facing, with a stake number in frame |
| frame 0 opens on a hero prop close-up (>= 35 % of the height) or a giant stake board (>= 50 % of the width) | PASS | giant stake board "AT STAKE" 85 % of the width |
| frame 0: every number card on screen is fully opaque (no fade-in at 0.00 s) | PASS | "AT STAKE" 100 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *neon* word | PASS | "THE *$100M* EMAIL" (3 words, 2 line(s), widest ~624 px of 980, neon: *$100M*, until 2.50 s) |
| the stake: line 1 says money, a number or a question, and a $ figure is on screen by 0.5 s | PASS | line 1 "One man got Google and Facebook to wire him over $100 million." (stake spoken); $ on screen at 0.00 s |
| who or what at frame 0 (the figure or BOLT >= 15 % of the height, or the hero-prop / giant-board opener) | PASS | hk 27 %; opener: giant stake board "AT STAKE" 85 % of the width |
| first spoken word by 0.2 s | PASS | One at 0.10 s |
| a sound punch at 0.00 s | PASS | impact, beep |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, hit 0.45, cut 1.00, hit 1.00, cut 2.20, hit 2.30 |
| music + an SFX at frame 0 | PASS | upbeat, impact, beep |
| no wide shot in the first 1 s | PASS | S01 hookZoom |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 1.00 s |
| faces (BOLT's screen, the figure's hood) clear of the caption band >= 90 % of caption time | PASS | 100 % |
| labels: <= 3 words (compile-enforced), one at a time (>= 0.3 s apart) | PASS | 8 label(s) |
| text off faces: no label, board or device card over a face | PASS | none |
| the hook card never covers a face | PASS | clear |
| label cards never overlap a board or a story card | PASS | none |
| labels and story cards above the caption band | PASS | all above |
| no static frames: the camera moves on every frame | PASS | moves on every frame |
| flash safety: <= 2 glitch/alert events in any 1 s, glitch <= 0.6, alert wash <= 0.35, no white flash | PASS | 11 event(s), worst 1 in 1 s (at 0.94 s); peaks glitch 0.55, alert 0.32 |
| text readable at phone size (smallest kit type >= 40 px in a 1080-wide frame) | PASS | label 50, caption 80, hook 96 px |
| the landscape layout compiles too (1920x1080) | PASS | ok |
| story: a CASE FILE card, and the HOW TO SPOT IT checklist in the last 40 % | warn | case files 0; checklist none |
| BOLT (optional narrator) changes face within 1.5 s of frame 0 when on screen at 0 | PASS | no BOLT |
| loop ending: the hook comes back and the last shot frames the first shot's subject | warn | hook again not set; last target "board:0,-0.1,0" |
| length 30-55 s | warn | 29.67 s |
| framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat) | PASS | clear |
| framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge | PASS | all in frame |
| framing R3: every landed board / card inside the frame (3 % margin) | PASS | all inside |
| framing R4: text >= 4.5:1 on its fill; featured main lines >= 42 px (font size) | PASS | readable |
| framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height) | PASS | face rule replaced by the opener: giant stake board "AT STAKE" 85 % of the width |

Frame-0 coverage by subject: hk 27 %.
