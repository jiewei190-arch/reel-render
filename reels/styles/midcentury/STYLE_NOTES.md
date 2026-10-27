# midcentury: vertical 1950s "classroom film" look (1080x1920)
Our re-implementation of the grammar in Lemo-Opuscar midcentury-toon (MIT): no Lemo code or characters. Canvas2D, deterministic, no WebGL.

Files: midcentury.js (kit), demo.html (`?scene=hook|reveal`, the turkey myth-bust), still.py `<scene> <t> <out.jpg>`, fonts/ (Alfa Slab One, Oleo Script, Jost; all OFL, licence files included). Facts: reels/sources_turkey.md.

## API
`M = createMC(canvas)`; per frame `M.begin(t)`, draw, `M.end()` (grain + vignette). Page contract: `window.DUR`, `seek(t)`, `ready`.
- `M.cel(pts, fill, {w, seed, off:[7,6], shade:{col,draw}, ink})`: flat fill printed off its ink line; offset jitters on the 12 fps clock.
- `M.ink(pts, {w, seed, closed})`: breathing-width line with small breaks. `M.shadow`, `M.clipped(pts, fn)` (flat shading plane).
- `M.text(str,x,y,{font,size,col,plate,po})`: ink text over an offset colour plate. `M.capCard(lines)`: caption slab with [text,colour] runs.
- `M.stamp('MYTH',x,y,{scale,rot})`: speckled double-border ink stamp; slam by scaling 2.6 to 1 with a shake.
- `M.set(wall, floor, horizon)`, `M.rays`, `M.dots`, `M.burst`, `M.sparkle`.
- `M.presenter(x,y,s,{flip, hand:[wx,wy], kind:'point'|'open'|'fist', stick:[wx,wy], mouth 0..1, look:[dx,dy], brow, blink})`: original bean-head presenter. Body is a held drawing; only the arm (2-bone IK), glove, eyes and mouth act.
- Geometry: `ellipsePts, rrectPts, capsulePts, smooth, quad, tubePts`; easing `backOut, easeOut, ramp`.

## Palette
paper #f6ead3, ink #3b2a24, tomato #e4572e, mustard #eaae3f, teal #3aa7a3 / light #86cbc4, olive #8a9a45, plum #6b3f5e, coral #f0b99a. One ground per scene; product keeps one colour (roast #cf6a2b).

## Cost
About 30 ms per frame at 1080x1920 (seek only), so an 80 s reel renders in minutes; the screenshot dominates.

## Pitfalls
- Alfa Slab One is wide: keep slab titles at 106 px or less for 11 characters per line (74 px for 17).
- The stamp uses multiply, so it tints whatever is under it. Keep it clear of faces.
- Keep Zs and sparkles out of cards and heads (they overlap easily in a narrow frame).
- Mirror the presenter with `flip`; hand targets are in world coordinates.
- Not built yet: iris wipes, colour-block wipes, numbered step medallion header, camera pan/zoom (wrap the scene in g.translate/scale).
