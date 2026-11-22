# cyber-demo-landscape: cyber3d long-form recipe QA (tools/cyber_build.mjs + tools/kit_long.mjs)

Composition: `CyberDemoLandscapeRecipe` in `src/index.cyber.ts` (1920x1080, 30 fps, plain composition: no motion blur). Kit cyber3d, format landscape. 13 shots, 33.20 s (0.55 min), 92 words, 3 chapters.

## Clip QA: 996 of 996 frames (every frame), 0 clip(s), 0.1 s

- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "THE $100M EMAIL" until 3.94 s |
| first spoken word by 0.5 s | PASS | One at 0.00 s |
| a sound punch + music at 0.00 s | PASS | upbeat, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 3 chapters, first "The $100M Email" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | PASS | 1:10s 2:12s 3:11s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 1.94 s from 20.0 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 5.8 s from 27.4 s; 12 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | PASS | mean 2.55 s over 13 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | warn | none before ch2 "The Copycat Company" |
| text readable: text >= 30 px tall at 1080p | PASS | all readable |
| every landed text board / card fully inside the frame (1.5 % margin) | PASS | all inside |
| no text board or card in the lower-third caption band | PASS | none |
| length 8-12 min | warn | 0.55 min |
| flash safety: <= 2 glitch/alert events in any 1 s, glitch <= 0.6, alert wash <= 0.35, no white flash | PASS | 11 event(s), worst 1 in 1 s (at 0.71 s); peaks glitch 0.55, alert 0.32 |
| text off faces: no label, board or story card over a face | PASS | none |
| labels one at a time (>= 0.3 s apart) | PASS | ok |
| the camera moves on every frame | PASS | moves on every frame |

Pacing: 36 visual-change marks, longest gap 1.94 s, mean shot 2.55 s, 12 beat marks.

Caption-safe framing (lens face lifted, not baked): none. Lower third moved: none.

## chapters.txt

```
00:00 The $100M Email
00:10 The Copycat Company
00:21 The Money Trail
```
