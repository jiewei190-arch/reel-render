# riso (risograph) vertical module
- riso.js: createRiso(canvas) -> R with R.P = 3 plate contexts (0 blue #0078bf, 1 fluorescent pink #ff48b0, 2 yellow #ffe94e), R.begin(), R.finish(), R.reg (per-plate misregistration px), R.measure().
- Draw ink density as alpha (black fill, globalAlpha/rgba = density). Density >= 0.92 prints solid; lower prints as a rotated halftone dot screen (plates at 15/75/45 degrees, 8 px period).
- Overprint = same shape on two plates (multiply). Knockout = destination-out on plates (paper-white halos around characters, printed-knockout text).
- Registration is the rhythm: set R.reg per shot (1-3 px), kick on hits, large drift = "something is wrong", snap to 0 = "fixed".
- Fonts (OFL): Jost, Alfa Slab One.
- Pitfalls: 3 halftones overlapping = mud; keep at most 2 plates per area; characters on twos (12 fps), camera on ones.
- Test: python3 still.py <scene> <t> <out.jpg> (demo.html)
