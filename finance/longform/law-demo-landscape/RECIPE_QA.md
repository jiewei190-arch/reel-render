# law-demo-landscape: law3d long-form recipe QA (tools/law_build.mjs + tools/kit_long.mjs)

Composition: `LawDemoLandscapeRecipe` in `src/index.law.ts` (1920x1080, 30 fps, plain composition: no motion blur). Kit law3d, format landscape. 16 shots, 35.00 s (0.58 min), 100 words, 3 chapters.

## Clip QA: 1050 of 1050 frames (every frame), 0 clip(s), 0.0 s

- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor.

## Long-form gate (0.0 s)

| check | result | detail |
|---|---|---|
| hook text on screen at frame 0 | PASS | "$54 MILLION FOR PANTS" until 4.36 s |
| first spoken word by 0.5 s | PASS | A at 0.00 s |
| a sound punch + music at 0.00 s | PASS | suspense, impact |
| YouTube chapters: >= 3, the first at the first word (00:00) | PASS | 3 chapters, first "A Judge Sues Over Pants" at 0.00 s |
| every chapter >= 10 s (YouTube minimum) | PASS | 1:10s 2:13s 3:12s |
| a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card) | PASS | longest gap 4.06 s from 30.9 s |
| a new beat at least every 40 s (chapter, set change or "beat": true) | PASS | longest 7.8 s from 27.2 s; 11 beat marks |
| lower-third captions: centre >= 75 % of the height on >= 90 % of caption time | PASS | 100 %; moved: none |
| shot length 3-6 s on average, none over 8 s | warn | mean 2.19 s over 16 shots |
| an open loop (a question or a tease) in the 25 s before each chapter | warn | none before ch2 "The Missing Pants" |
| text readable: text >= 30 px tall at 1080p | warn | S05 folder "PEARSON v. CHUNG" 29 px at 5.0 s; S05 ticket "ALTERATION TICKET" 28 px at 8.0 s; S06 hanger "CLAIM TICKET" 14 px at 9.5 s; S11 sign1 "SATISFACTION GUARANTEED" 27 px at 21.0 s; S12 n2 "$54 MILLION PANTS SUIT" 30 px at 23.3 s; S12 n1 "JUDGE SUES CLEANERS" 30 px at 26.0 s |
| every landed text board / card fully inside the frame (1.5 % margin) | warn | S05 ticket "ALTERATION TICKET" x 1170-1712 y 362-1065 at 8.0 s; S16 plate "THE COURT" x 13-635 y 662-829 at 33.0 s |
| no text board or card in the lower-third caption band | warn | S05 folder "PEARSON v. CHUNG"@5.0s, S05 ticket "ALTERATION TICKET"@8.0s, S11 sign2 "SAME DAY SERVICE"@22.8s, S16 plate "THE COURT"@33.3s |
| length 8-12 min | warn | 0.58 min |

Pacing: 42 visual-change marks, longest gap 4.06 s, mean shot 2.19 s, 11 beat marks.

Cards overlapping each other or the hook: none.

Caption-safe framing (lower third): no shot needed a lift; caption moved in no shot.

## chapters.txt

```
00:00 A Judge Sues Over Pants
00:10 The Missing Pants
00:23 Satisfaction Guaranteed
```
