# Impasto (vertical module)
Palette-knife oil painting on a 2D canvas, 1080x1920 world (540x960 CSS at DSF2). Deterministic: every stroke is seeded, `window.seek(t)` repaints from scratch.
Technique only was ported from the Lemo impasto idea (flat sharp-edged planes raked by light); no Lemo assets or sign-offs.

## Grammar
- `knife()`: one tilted flat stroke = cast shadow + flat fill + drag striations + lit ridge on upper-left edges + dark ridge on lower-right edges.
- `plane(poly, col)`: a big flat area made of many overlapping knives, clipped to the polygon, with a ridged outline. Use `ang` to rake the stroke direction.
- `ribbon(pts, wid, col)`: a line made of overlapping knife dabs (rays, rain, rainbow bands); `from/to` draws it on.
- Heavy static art (skies, buildings, hills) is rendered once with `R.cache()` and then moved by the camera; only moving things are repainted per frame.
- Transitions are knife sweeps (`wipe`): a ragged ridge of paint carries the next scene across.
- Characters: Dewy (round raindrop), a sun, a raincoat kid. Faces are simple dark dabs with white glints.
- Fonts: Cormorant Garamond Italic (captions), Caveat (labels), both OFL, in `fonts/`. Captions sit on a smeared cream knife patch, never a dark box.

## Rules learned
- Keep every plane edge crisp; blur kills the knife look. Camera zoom above ~1.3 on cached sets gets soft, so zoom only dynamic art or fade to a vector scene (rbow zoom into one drop).
- Keep art above y=1500 (caption zone below). Ray lengths and ground planes are trimmed to that.
- Refraction diagram is real Snell's law (entry b=0.86R, one internal reflection) but the refractive-index spread is exaggerated so the colour fan is visible (not to scale).
- Use `python3 still.py <scene> <t> <out.jpg>` for the swatch demo; the reel itself renders with `render.py rbow stills ...`.
