# shop-too-fast: long-form recipe QA (tools/recipe_build.mjs + tools/longform_gate.mjs)

Composition: `ShopTooFastRecipe` (1920x1080, 30 fps, no Sub composition: long-form renders without motion blur) in `src/index.toolkit.ts`. 34 shots, 87.67 s (1.46 min), 264 words, 4 chapters.

## Clip QA: 2630 of 2630 frames (every frame), 0 clip(s), 0.1 s

- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "A WINNING SHOP WENT *BROKE*" until 5.63 s |
| first spoken word by 0.5 s | PASS | Your at 0.00 s |
| a sound punch + music at 0.00 s | PASS | upbeat, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 4 chapters, first "The Hot Little Shop" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | PASS | 1:26s 2:19s 3:25s 4:18s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, chapter card) | PASS | longest gap 4.26 s from 74.0 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 9.6 s from 74.0 s; 15 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | PASS | mean 2.58 s over 34 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | PASS | every chapter |
| text boards readable: text >= 30 px tall at 1080p | PASS | all readable |
| every landed text board fully inside its view (1.5 % margin) | warn | profit x -17-554 y 18-333 at 2.3 s; jar x -535-6 y 238-965 at 9.3 s; ok x -1-595 y 181-414 at 31.8 s; loanp x 1574-1921 y 288-442 at 53.3 s; apr x 74-487 y -48-199 at 62.5 s |
| no text board in the lower-third caption band | warn | S06@11.8s:jar, S17@34.8s:cal, S24@53.5s:jar1, S31@74.0s:slow |
| length 8-12 min | warn | 1.46 min |

Pacing: 66 visual-change marks, longest gap 4.26 s, mean shot 2.58 s, 15 beat marks.

## chapters.txt

```
00:00 The Hot Little Shop
00:25 The Big Loan
00:44 The Squeeze
01:09 The Lesson
```
