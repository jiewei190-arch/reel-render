# cyber-fake-supplier: cyber3d recipe QA (tools/cyber_build.mjs)

Composition: `CyberFakeSupplierRecipe` in `src/index.cyber.ts` (plain 30 fps). Kit cyber3d, format short, frame portrait 1080x1920. 15 shots, 40.77 s.

## Clip QA: 1223 frames x 4 sub-frames, 0 clip(s)

- none: no part, figure, kit prop or set piece enters BOLT's shell or mitts; BOLT stays above the ground; grounded objects stay above the floor.

## Frame-0 gate and kit rules

| check | result | detail |
|---|---|---|
| frame 0 is close: a subject covers >= 50 % of the frame height | PASS | hk 68 % |
| hook at frame 0: <= 5 words, <= 2 lines that fit, exactly one *neon* word | PASS | "THE *$100M* EMAIL" (3 words, 2 line(s), widest ~624 px of 980, neon: *$100M*, until 3.94 s) |
| the dollar stake: line 1 says it, and a $ figure is on screen by 0.5 s | PASS | line 1 "One man got Google and Facebook to wire him over $100 million."; on screen at 0.00 s |
| who at frame 0 (the figure or BOLT >= 15 % of the height) | PASS | hk 68 % |
| first spoken word by 0.2 s | PASS | One at 0.00 s |
| a sound punch at 0.00 s | PASS | impact |
| 2-3 cuts or big moves in the first 3 s | PASS | hit 0.38, cut 0.77, hit 0.77, cut 2.10, hit 2.20 |
| music + an SFX at frame 0 | PASS | upbeat, impact |
| no wide shot in the first 1 s | PASS | S01 hookZoom, S02 pushIn |
| frame-0 shot cuts away by ~1.0 s (first cut <= 1.25 s) | PASS | first cut at 0.77 s |
| faces (BOLT's screen, the figure's hood) clear of the caption band >= 90 % of caption time | PASS | 100 % |
| labels: <= 3 words (compile-enforced), one at a time (>= 0.3 s apart) | PASS | 8 label(s) |
| text off faces: no label, board or device card over a face | PASS | none |
| the hook card never covers a face | PASS | clear |
| label cards never overlap a board or a story card | PASS | none |
| labels and story cards above the caption band | PASS | all above |
| no static frames: the camera moves on every frame | PASS | moves on every frame |
| flash safety: <= 2 glitch/alert events in any 1 s, glitch <= 0.6, alert wash <= 0.35, no white flash | PASS | 13 event(s), worst 1 in 1 s (at 0.71 s); peaks glitch 0.55, alert 0.32 |
| text readable at phone size (smallest kit type >= 40 px in a 1080-wide frame) | PASS | label 50, caption 80, hook 96 px |
| the landscape layout compiles too (1920x1080) | PASS | ok |
| story: a CASE FILE card, and the HOW TO SPOT IT checklist in the last 40 % | PASS | case files 1; checklist at 32.87 s (3 items) |
| BOLT (optional narrator) changes face within 1.5 s of frame 0 when on screen at 0 | PASS | no BOLT |
| loop ending: the hook comes back and the last shot frames the first shot's subject | PASS | hook again at 39.06 s; last target "hk.head" |
| length 30-55 s | PASS | 40.77 s |

Frame-0 coverage by subject: hk 68 %.
