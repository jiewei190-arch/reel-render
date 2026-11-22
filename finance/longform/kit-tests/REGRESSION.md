# Kit regression renders (engine/all)

All renders ran on the cloud CPU: `--gl=swangle`, `--scale=0.5`, plain 30 fps composition (no motion blur).

## Portrait: each kit demo's first 3 s, before vs after

Frames 0-89 were rendered as JPEG stills twice: once from the kit's own branch (origin/kits/<kit>, before) and once
from engine/all (after, with landscape support, the shared long-form code and the bounded caches).

| kit | composition | before | after | identical frames | the rest |
|---|---|---|---|---|---|
| tech3d | TechDemoPlanesLandBlindRecipe | 321 s | 321 s | 90/90 | - |
| law3d | LawDemo54MillionPantsRecipe | 538 s | 424 s | 73/90 | mean abs diff <= 0.004, max 13/255 per channel, 0 % of pixels off by > 24 |
| biz3d | BizDemoBlockbusterPassedRecipe | 448 s | 356 s | 67/90 | mean abs diff <= 0.004, max 9/255, < 0.01 % of pixels off by > 24 |
| cyber3d | CyberFakeSupplierRecipe | 323 s | 329 s | 90/90 | - |

The law3d/biz3d differences are swangle run-to-run noise, not a code change. Rendering law3d frames 60-75 a second
time from the OLD branch gives the same kind of differences against the first old render on 8 of 16 frames.
LONGFORM's render notes report the same for Block Money.

## Compile regression (byte level)

Every recipe was rebuilt before and after the merge and the landscape port: 22 Block Money Shorts, shop-too-fast and
the 4 kit demos. The generated `.gen.ts` files, cue plans and RECIPE_QA.md files hash the same, and the exit codes match.
The kit registries only gained the new test recipes. `clip_short.mjs` regenerates `shop-too-fast-short-1`
byte for byte. All four kit demos pass `--check`.

## Landscape tests: one ~30-35 s test per kit

Each test is `finance/longform/<kit>-demo-landscape/`: 3 chapters, lower-third captions and `chapters.txt`, and it
passes the long-form hard gates. The tests run 30-35 s, not 20 s, because the gate wants at least 3 chapters of at
least 10 s each. Render: `--scale=0.5 --gl=swangle --concurrency=4`, plain 30 fps. Contact sheets show 1 frame every
2 s (the first 32 s).

| kit | frames | render time (cloud CPU) | per frame | sheet |
|---|---|---|---|---|
| tech3d | 963 (32.1 s) | 3,569 s | 3.7 s | tech-demo-landscape_sheet.jpg |
| law3d | 1,050 (35.0 s) | 4,660 s | 4.4 s | law-demo-landscape_sheet.jpg |
| biz3d | 1,065 (35.5 s) | 4,111 s | 3.9 s | biz-demo-landscape_sheet.jpg |
| cyber3d | 996 (33.2 s) | 3,546 s | 3.6 s | cyber-demo-landscape_sheet.jpg |

These ran one after another while other work used the same 4 cores, so the per-frame times are an upper bound. The
owner's PC renders on the GPU (`--gl=angle`).

Checked frame by frame:
- **law3d case card:** it fades in. It is full size and clear of the captions at 7-8 s.
- **biz3d THE DECISION:** the freeze card is in frame and above the caption band at 15.8 s.
- **cyber3d ALERT:** in frame.

Found and fixed: **the cyber3d `flyThrough` camera went inside a rack row** of the servers set at the end of the move
(x 1.08 vs racks at 1.05-1.95). About half the frame went dark around 26.9 s. The portrait demo `cyber-fake-supplier`
had the same problem; it predates the merge. The fix in `src/cyber/compile.ts` keeps a flyThrough camera 0.4 m clear of
the set's blocker boxes. Before and after: `cyber-flythrough-fix_landscape.jpg` and `cyber-flythrough-fix_portrait.jpg`
(frame 807, before on the left). The cyber sheet and `out/` mp4 were rendered before this fix. Compile output
(gen/cues/QA) and the framing findings are unchanged by it.

## After merging engine/qa-framing (another session pushed it to engine/all)

That branch adds screen-space framing QA (R1-R5) to every `--check`. It reports 597 recipe-caused findings across all
35 recipes (see `docs/FRAMING_QA_REPORT.md`), so every recipe below now exits 1:
- the kit demos;
- the landscape tests;
- the clipped Shorts;
- shop-too-fast.

No failure comes from another gate. The clip QA, frame-0 gate and long-form hard gates still pass for every one of
them: tech-demo-planes-land-blind, law-demo-54-million-pants, biz-demo-blockbuster-passed, cyber-fake-supplier, the 4
`*-demo-landscape` tests, their 4 `-short-1` clips, shop-too-fast and shop-too-fast-short-1. The framing findings are
recipe edits (move a board, scale a label), which the report leaves to the writer.
