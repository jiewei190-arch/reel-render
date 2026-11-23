# cyber-demo-landscape-short-1: a cyber3d Short cut from cyber-demo-landscape

- Source: `finance/longform/cyber-demo-landscape` (cyber3d, landscape), words "1:One" to "8:authorities": 0.00-28.85 s of the source.
- Re-timed: source time - -0.100 s, so the first word lands at 0.10 s. Length 29.65 s, 82 words, 8 lines.
- Shots: a fresh hook shot (0-1.0 s, made by the cyber3d clip adapter: hook "THE *$100M* EMAIL", stake "$100") + 11 source shot(s) (S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12); 1 source shot(s) that would start inside the hook were folded into the first.
- 28 time(s) stay anchored to words of the new timings; the rest are seconds.
- Rendered natively at 1080x1920 by the cyber3d kit (portrait layout: its own hook, cards and captions), not cropped from the 16:9 video.
- Compiles: 12 shots, 29.67 s.

Next:
```
node tools/recipe_build.mjs cyber-demo-landscape-short-1
npx remotion render src/index.cyber.ts CyberDemoLandscapeShort1Recipe out/cyber-demo-landscape-short-1.mp4 --gl=angle
```
If the gate fails: pick another --from-word (no character names in the first 2 s, the stake early), or pass --hook / --stake.
