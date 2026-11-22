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
