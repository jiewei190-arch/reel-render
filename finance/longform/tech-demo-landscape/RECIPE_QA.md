# tech-demo-landscape: tech3d long-form recipe QA (tools/tech_build.mjs + tools/kit_long.mjs)

Composition: `TechDemoLandscapeRecipe` in `src/index.tech.ts` (1920x1080, 30 fps, plain composition: no motion blur). Kit tech3d, format landscape. 13 shots, 32.10 s (0.54 min), 92 words, 3 chapters.

## Clip QA: 963 of 963 frames (every frame), 0 clip(s), 0.1 s

- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "HOW DO PLANES LAND BLIND?" until 3.34 s |
| first spoken word by 0.5 s | PASS | How at 0.00 s |
| a sound punch + music at 0.00 s | PASS | upbeat, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 3 chapters, first "Flying Blind" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | PASS | 1:10s 2:10s 3:12s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 2.67 s from 29.4 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 10.1 s from 0.0 s; 5 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | warn | mean 2.47 s over 13 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | PASS | every chapter |
| text readable: text >= 30 px tall at 1080p | PASS | all readable |
| every landed text board / card fully inside the frame (1.5 % margin) | PASS | all inside |
| no text board or card in the lower-third caption band | PASS | none |
| length 8-12 min | warn | 0.54 min |

Pacing: 34 visual-change marks, longest gap 2.67 s, mean shot 2.47 s, 5 beat marks.

Layout: hook top-centre at 70 px (80 px type), cards between y 60-819 (below 235 while the hook shows), lower-third captions centred at 905 px unless BOLT's face sits in the band.

## chapters.txt

```
00:00 Flying Blind
00:10 The Invisible Beams
00:20 Two Signals, One Path
```
