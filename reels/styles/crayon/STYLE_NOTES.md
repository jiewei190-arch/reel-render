# Crayon picture book: vertical module notes

Our vertical version of the crayon-book grammar from Lemo-Opuscar (MIT). This is a re-implementation, not their code or characters.
It produces 1080×1920 output and uses Canvas2D plus a CPU compositor, so no WebGL is needed and it runs well on swiftshader boxes.

## Files
- `crayon.js`: the engine.
- `demo.html?scene=hook|eat`: the flamingo proof.
- `still.py <scene> <t> <out.jpg>`: renders 540×960 at DSF2, the same as reels/render.py.
- `fonts/`: Patrick Hand (subtitles) and Gaegu Bold (titles), both OFL. The licence files are included.

## API
- `R = createCrayon(canvas, {paper:'#f4efe3', wash:[r,g,b] multiply, emboss, vignette})` precomputes the paper tooth, emboss and vignette once (about 1 s).
- Per frame: `R.begin(t)`, then draw, then `R.compose()`.
  - `window.seek(t)` follows the reel engine contract (`window.ready`, `window.DUR`).
- Layers:
  - `R.bg`: background wax. The wash goes over it and white wax resists the wash.
  - `R.fg`: characters, composited after the wash so the wash can't hide them.
  - `R.wash`: density for the one watercolour.
  - `R.knock`: restores bare paper, for silhouettes and subtitle patches.
- Drawing functions:
  - `line(L, pts, {w, col|color, p|pressure, seed, t0, dur | draw, closed, boil})`
  - `fill(L, poly, {col, p, ang, gap, w, over, rev, cross, t0, dur | draw})`: zig-zag hatching that overshoots the outline. The draw progress is the colouring action.
  - `dab()`, `knock()`, `wash(L, poly, {p, t0, dur})`
  - `text(L, str, x, y, {font, size, colors[], reveal | t0})`
  - `subtitle(R, str, y, {reveal})`: the printed words on a ragged paper patch, never a dark box.
- Shape helpers: `ellipse`, `handCircle`, `fluff` (down feathers), `bez`, `smooth`, `tube` (necks, legs, beaks), `xf`.
- Clock: drawing steps at 12 fps (`CLOCK.td`), and the boil seed is `floor(t*12)`.

## Crayon box (flamingo)
| Use | Colour |
|---|---|
| Outline (never black) | plum `#4a2f5c` |
| Pinks | `#ff6f9c` and `#ee4f80` |
| Shrimp | coral `#ff8a5c` |
| Chick greys | `#a6abb3` and `#737886` |
| Mud | `#c08a5e` |
| Grass | green `#86c96f` |
| Water | teal `#4cb8c4` |
| Wax resist | white |
| Blush | `#ff9fbb` |
| Wash (multiply) | `[.50, .76, .90]`, lagoon blue |

## Cost
- About 180–300 ms per frame at 1080×1920. The compose step is the bulk of it (4 getImageData calls plus a 2M-pixel loop).
- A 75 s reel at 30 fps is about 2,250 frames, roughly 8 min on 2 workers.
- Because drawing steps at 12 fps, you can render at 12 fps and duplicate frames in ffmpeg (`-r 30` from 12) to cut that by 2.5×. The camera then also steps; that's fine for this look.

## Pitfalls (seen while building)
- Calling `knock()` for something drawn on `R.bg` erases it. Only knock fg things (the far flamingos first rendered white because of this).
- Outlines of overlapping parts must be occluded with `outsideP()` (point-in-polygon), or the neck and body lines show through.
- Small shrimp read as orange rings. Keep the arc at 2.75 rad or less, make the head end wide, and keep the antennae short.
- A thin-tube fill reads as a coil. Use `cross:true` with a small gap for beak tips.
- Paper is screen-anchored, so there's no camera pan yet. To add pans, offset the precomputed tooth index (TODO).
- Leave room under the subtitle patch for the Instagram UI. Keep key art above y ≈ 1500.
