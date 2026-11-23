# tech-demo-landscape-short-1: a tech3d Short cut from tech-demo-landscape

- Source: `finance/longform/tech-demo-landscape` (tech3d, landscape), words "1:how" to "7:watch": 0.00-31.41 s of the source.
- Re-timed: source time - -0.100 s, so the first word lands at 0.10 s. Length 32.21 s, 92 words, 7 lines.
- Shots: a fresh hook shot (0-1.0 s, made by the tech3d clip adapter: hook "HOW PLANES LAND *BLIND*") + 12 source shot(s) (S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13); 1 source shot(s) that would start inside the hook were folded into the first.
- 25 time(s) stay anchored to words of the new timings; the rest are seconds.
- Rendered natively at 1080x1920 by the tech3d kit (portrait layout: its own hook, cards and captions), not cropped from the 16:9 video.
- Compiles: 13 shots, 32.20 s.

Next:
```
node tools/recipe_build.mjs tech-demo-landscape-short-1
npx remotion render src/index.tech.ts TechDemoLandscapeShort1Recipe out/tech-demo-landscape-short-1.mp4 --gl=angle
```
If the gate fails: pick another --from-word (no character names in the first 2 s, the stake early), or pass --hook / --stake.
