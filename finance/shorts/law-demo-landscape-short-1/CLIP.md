# law-demo-landscape-short-1: a law3d Short cut from law-demo-landscape

- Source: `finance/longform/law-demo-landscape` (law3d, landscape), words "3:They" to "8:demands": 8.98-34.30 s of the source.
- Re-timed: source time - 8.880 s, so the first word lands at 0.10 s. Length 26.11 s, 73 words, 6 lines.
- Shots: a fresh hook shot (0-1.0 s, made by the law3d clip adapter: hook "A *JUDGE* SUES OVER PANTS", stake "$3,000") + 11 source shot(s) (S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16).
- 31 time(s) stay anchored to words of the new timings; the rest are seconds.
- Rendered natively at 1080x1920 by the law3d kit (portrait layout: its own hook, cards and captions), not cropped from the 16:9 video.
- Compiles: 12 shots, 26.10 s.

Next:
```
node tools/recipe_build.mjs law-demo-landscape-short-1
npx remotion render src/index.law.ts LawDemoLandscapeShort1Recipe out/law-demo-landscape-short-1.mp4 --gl=angle
```
If the gate fails: pick another --from-word (no character names in the first 2 s, the stake early), or pass --hook / --stake.
