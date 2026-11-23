# Render notes: shop-too-fast (landscape demo) and shop-too-fast-short-1

All proof renders ran on the cloud container's CPU with software GL (`--gl=swangle`) at `--scale=0.5`,
`--concurrency=4`, `--timeout=600000`, h264 crf 18. Both use the plain 30 fps composition (no motion blur).

| Render | Composition | Output | Frames | Wall time |
|---|---|---|---|---|
| Long-form demo (87.7 s, 34 shots, 4 chapters) | `ShopTooFastRecipe` | 960x540 | 2,630 | 5,069 s (84.5 min) |
| Short clipped from it (22.5 s, 9 shots) | `ShopTooFastShort1Recipe` | 540x960 | 674 | 1,373 s (22.9 min) |

Commands (from `finance/render-pc`, after `npx remotion bundle src/index.ts build`):

```bash
npx remotion render build ShopTooFastRecipe out/longform/shop-too-fast_v1.mp4 \
  --scale=0.5 --gl=swangle --concurrency=4 --timeout=600000 --codec=h264 --crf=18 --pixel-format=yuv420p
npx remotion render build ShopTooFastShort1Recipe out/longform/shop-too-fast-short-1_v1.mp4 \
  --scale=0.5 --gl=swangle --concurrency=4 --timeout=600000 --codec=h264 --crf=18 --pixel-format=yuv420p
```

About 1.9 s per frame on the long render. Each browser tab spends about 75 s compiling shaders on its first frame
under swangle. On the PC's GPU (`--gl=angle`) both renders should take minutes.

## Contact sheets

- `contact_sheet.jpg` (here): one frame every 3 s of the long-form render.
- `finance/shorts/shop-too-fast-short-1/contact_sheet.jpg`: one frame every second of the Short.

What to look at:
- The lower-third captions: 2 lines max with a highlighted word, clear of the boards.
- The chapter cards: "CHAPTER 1 / THE HOT LITTLE SHOP", 3 "THE SQUEEZE", 4 "THE LESSON".
- Boards readable at 16:9.
- The Short's fresh hook card at frame 0 ("4 SHOPS. HALF THE SALES." plus a "CASH: $0" stake) and boards
  refitted for 9:16.

## Shorts unchanged

The portrait stills from the old and the new code are identical (md5) at
RaiseTaxMyth frames 0 and 300, S2SamePaycheck frame 40 and MinimumPaymentTrap frame 450 (scale 0.25, swangle).
The last one varies between runs of the *old* bundle too, and the new one matches its second run. The recipe
builds of all 27 existing Shorts produce byte-identical outputs and exit codes.
