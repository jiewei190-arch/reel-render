# biz-demo-landscape-short-1: a biz3d Short cut from biz-demo-landscape

- Source: `finance/longform/biz-demo-landscape` (biz3d, landscape), words "2:It" to "9:dollars": 3.90-34.81 s of the source.
- Re-timed: source time - 3.805 s, so the first word lands at 0.10 s. Length 31.70 s, 86 words, 8 lines.
- Shots: a fresh hook shot (0-1.0 s, made by the biz3d clip adapter: hook "THE *$50* MILLION OFFER", stake "2000") + 11 source shot(s) (S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14).
- 35 time(s) stay anchored to words of the new timings; the rest are seconds.
- Rendered natively at 1080x1920 by the biz3d kit (portrait layout: its own hook, cards and captions), not cropped from the 16:9 video.
- Compiles: 12 shots, 31.70 s.

Next:
```
node tools/recipe_build.mjs biz-demo-landscape-short-1
npx remotion render src/index.biz.ts BizDemoLandscapeShort1Recipe out/biz-demo-landscape-short-1.mp4 --gl=angle
```
If the gate fails: pick another --from-word (no character names in the first 2 s, the stake early), or pass --hook / --stake.
