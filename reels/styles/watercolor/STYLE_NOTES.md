# watercolor: vertical journal-page module (1080x1920)
Our 2D-canvas re-implementation of the Lemo-Opuscar (MIT) "watercolor" grammar. Technique only; the leaf character and scenes are original.
Files: watercolor.js (kit), demo.html (?scene=hook|drain, leaf topic), still.py `python3 still.py <scene> <t> <out.jpg>`, fonts/ (Caveat, Cormorant Garamond Italic: OFL, licences included).
Contract: window.seek(t), window.DUR, window.ready/READY. Canvas is 1080x1920, shown at 540x960 (use DSF 2).

## API
- `R = createWC(canvas)`; per frame `R.begin(t)` (paper), draw, `R.finish()` (granulation multiply).
- `R.wash(pts, col, {a, seed, jit, blooms, br, edge, alpha, bx0,bx1,by0,by1})`: 3 jittered passes, pigment blooms, pooled inner and outer edge.
- `R.stroke(pts, {w, col, a, prof, bristles, seed, prog})`: variable ribbon plus bristle tracks (flying white); prog paints a moving tip.
- `R.bezier(...)`, `R.text(s,x,y,{size,font,col,reveal,rot,italic})` (paper halo, left-to-right reveal), `R.leader(pts,prog,col)`, `R.subtitle(s,y,reveal)` (Cormorant italic on paper, 2 balanced lines max).
- Helpers: `leafPoly`, `shrinkPoly`, `mix`, `rgba`, `PAL`, easing. demo.html has `leaf({...gF (green fraction), red, mood, hang})`: a cute painted leaf with face; drain scene shrinks the green wash toward the veins to reveal orange.

## Palette
Paper #f7efdf; ink #3a2d27; green #6fb23f / #3f8a35; yellow #f6c63c; orange #f08320; red #d63e2b; brown #8a5a3c; pink #f08a8a. Paper is the white: never paint white.

## Cost
About 25-40 ms per frame to draw (forced raster) plus about 80-90 ms screenshot at 1080x1920, so about 0.12 s/frame: a 70 s reel at 30 fps is roughly 4-5 min on 2 workers. Init 0.2 s. No WebGL.

## Pitfalls
- Sine-based per-pixel hash makes visible stripes in grain: use the integer hash `ih`.
- A multiplied grain layer that is too dark turns the paper grey: keep it 226-255 and alpha 0.5.
- Clip rect for revealed text needs about 90 px of slack for italic overhang, or the last glyph is cut.
- A hanging leaf needs `hang:true` (flips body, not the face) so the stem meets the branch.
- Washes are flat if blooms/pooled edges are weak; keep blooms >= 5 on big shapes.
- Not built yet: camera pan (paper is canvas-anchored), mist erase, page turn, sound events, a trunk and canopy.
