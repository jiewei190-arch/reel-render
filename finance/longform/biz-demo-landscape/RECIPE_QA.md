# biz-demo-landscape: biz3d long-form recipe QA (tools/biz_build.mjs + tools/kit_long.mjs)

Composition: `BizDemoLandscapeRecipe` in `src/index.biz.ts` (1920x1080, 30 fps, plain composition: no motion blur). Kit biz3d, format landscape. 14 shots, 35.50 s (0.59 min), 95 words, 3 chapters.

## Clip QA: 1065 of 1065 frames (every frame), 0 clip(s), 0.0 s

- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "THE $50M NO" until 3.81 s |
| first spoken word by 0.5 s | PASS | Blockbuster at 0.00 s |
| a sound punch + music at 0.00 s | PASS | upbeat, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 3 chapters, first "The $50 Million Offer" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | PASS | 1:11s 2:12s 3:13s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 3.92 s from 31.6 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 5.2 s from 10.8 s; 11 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | PASS | mean 2.54 s over 14 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | warn | none before ch2 "The Laugh", ch3 "Streaming Kills the Store" |
| text readable: text >= 30 px tall at 1080p | PASS | all readable |
| every landed text board / card fully inside the frame (1.5 % margin) | PASS | all inside |
| no text board or card in the lower-third caption band | PASS | none |
| length 8-12 min | warn | 0.59 min |

Pacing: 41 visual-change marks, longest gap 3.92 s, mean shot 2.54 s, 11 beat marks.

## biz3d landscape notes

- Lens: the shared 16:9 rule (landscapeLens per preset; vertical fov kept). Caption-safe framing lifted 0 shot(s).
- Lower-third caption centre moved on: none (default 905 px).

## chapters.txt

```
00:00 The $50 Million Offer
00:10 The Laugh
00:22 Streaming Kills the Store
```
