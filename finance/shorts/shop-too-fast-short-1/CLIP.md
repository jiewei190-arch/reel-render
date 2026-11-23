# shop-too-fast-short-1: a Short cut from shop-too-fast

- Source: `finance/longform/shop-too-fast` (landscape), words "11:the" to "15:upfront": 44.44-66.08 s of the source.
- Re-timed: source time - 44.335 s, so the first word lands at 0.10 s. Length 22.45 s, 66 words, 5 lines.
- Shots: a fresh hook shot (0-1.0 s: hookZoom on `sam`, hook "4 SHOPS. HALF THE SALES.", stake board "CASH: $0") + 8 source shot(s) (S21, S22, S23, S24, S25, S26, S27, S28).
- 18 time(s) stay anchored to words of the new timings; the rest are seconds.
- Portrait fit: the text boards of shot(s) 2, 4, 6, 8 moved halfway toward the lens target (absolute places), so they fit 9:16.
- Portrait fit: the camera pulled back so the 16:9 boards fit 9:16 on shot 2 (dist 5.4 -> 7.14), shot 4 (dist 4 -> 8), shot 6 (dist 4.2 -> 6.38), shot 8 (dist 2.9 -> 5.8).
- Loop rule: board(s) upfront on the last shot now land on the last word ("upfront.").
- Rendered natively at 1080x1920 (portrait framing from the same 3D scene), not cropped from the 16:9 video.

Next:
```
node tools/recipe_build.mjs shop-too-fast-short-1
npx remotion render src/index.toolkit.ts ShopTooFastShort1Recipe out/shop-too-fast-short-1.mp4 --gl=angle
```
If the gate fails: pick another --from-word (no character names in the first 2 s, the stake early), or pass --hook / --stake.
