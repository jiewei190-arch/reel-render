# Engraving (copperplate) vertical module
Original 2D-canvas implementation of the Lemo-Opuscar engraving grammar (technique only). Used by t_honey.js.
- Tone = swelling hatch lines only (3 families, density from a tone field `sph`/`flat`); colour = multiplied hand-wash laid after ink (`E.wash`).
- API: `createEngraver(canvas)`, `part({poly,tone,sp,ang,fam,win})`, `linesPart`, `figure`, `E.fig(F,p,{dx,dy,s,rot,alpha})` (p<1 = live burin draw, p>=1 = baked), `E.plate`, `E.roundel`, `E.leader`, `E.label`, `E.script`, `E.slip`.
- Fonts: Bodoni Moda + Pinyon Script (OFL). ~0.12 s/frame at 1080x1920.
- Pitfall: never build `figure()` inside the per-frame scene (hatch regeneration); hoist/memoize.
