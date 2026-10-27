# shadowpuppet (vertical 1080x1920, 2D canvas, original code)
Technique source: repos/lemo-opuscar/styles/shadow-puppet/STYLE.md (grammar only; no Lemo code or sign-offs).
- Hide layer starts white; every piece is drawn with `multiply` (dyes = transmitted colour). Lace is carved with one evenodd Path2D: outline + hole sub-paths (nested sub-paths flip parity, so rings/annuli work).
- Stage: lamp (radial warm lobe, ~7 Hz flicker, `R.dim` darkens/cools it) x hide x woven cloth pattern, then additive glows (`R.glow`), bloom (downsample + screen), warm vignette.
- Puppets: sun (lace star), moon (craters, `dark:1` = ink silhouette), earth, person, hill; rods run off-screen under the placard; hand tremor via `trem`.
- Titles/labels = carved plaques (`plaque`, `tag`); subtitles = dark-lacquer storyteller's placard (`placard`) in Cormorant Garamond Italic (OFL).
- Rules: keep art above y~1500 (placard sits at ~1690); sky-dark scenes use a dark sky piece with holes, not `R.dim`, so lit holes stay bright.
- Preview: `python3 still.py lineup 1 out.jpg` (scene lineup|sky).
