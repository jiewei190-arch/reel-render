# icecream (story-fable job, template #30): CHANGELOG

Story: why two rival ice-cream carts end up parked side by side in the middle of the beach (Hotelling's law). Red cart vs teal cart.
Compare sheets: `compare_vN.jpg`, reference frame left, ours right, matched by kind of shot (`compare.py`).

## v1 (Oct 29): own engine, built from the notes before the owner's module arrived
- Files: `reels/styles/storyfable/fable_h1_v1.js`, `reels/t_icecream_v1.js`. Full 67 s story, af_heart narration (`specs/icecream.json`), 1-2 word captions, loop on the "STEPS APART" sign.
- Sheet: `compare_v1.jpg` (from stills; the full v1 render was stopped when main sent the owner's `fable.js`: no point finishing a render of an engine we are replacing).
- Biggest gaps against the reference:
  1. **Sets far too plain:** flat sand and a thin sea band vs the reference's illustrated, detailed sets (castles, hills, trees, tiled floors, rows of soldiers, ruts and grass in perspective).
  2. **Characters too small and thin-lined:** outlines about 2-3 px vs the reference's 5-6 px; heads too small in the wide shots.
  3. **No real perspective lead line:** the reference always has a track/path/floor to the vanishing point between the rivals.
  4. **Top-down shot reads as a diagram,** not a painted overhead like the reference's armies on a field.
  5. **The time-lapse grade is too weak;** the blueprint is too empty (no desk, candle or perspective).
- Decision: switch to the owner's `fable.js` (commit 6b5e283) as main asked, and grow the owner's 10 s ice-cream test into the full reel.

## v2 (Oct 29): the owner's fable.js, full story, richer beach set
- Rebuilt on `reels/styles/storyfable/fable.js` (owner, 6b5e283), grown from `t_storytest.js` into the full 67 s reel (`reels/t_icecream.js`), af_heart. Render: `icecream_v2.mp4`. Sheet: `compare_v2.jpg`.
- Set: seaside town with red/teal roofs and a lighthouse on the headland, sailboats, a pier, beach huts, lifeguard towers, dune grass, palms, umbrellas coloured by side, bunting and distance posts along the boardwalk to the vanishing point, a beach ball and bucket in the foreground. Overhead: a painted plan view (sea, foam, sand, dunes, umbrellas, carts). Props: the 1929 journal on a towel with a stamp; a blueprint on a desk with a glowing pen and a "STUCK" stamp.
- Engine speed-ups marked "H1" in fable.js (same look): bounding-box sprites, batched DOF/haze layers, single-pass rim, one blur for the cloud layer. 112 s -> 1.6 s per frame on this CPU-only box.
- QA: WARN only. Blueprint reaches the right UI column (52.8-60.5 s); wide shot touches the frame edge (13.5-16 s).
- Biggest gaps against the reference (sheet):
  1. **Ground and colour bands:** our lower half is a flat orange boardwalk and plain sand. The reference has a varied ground: ruts, grass verges and flowers along the path, muted yellow-green earth. Measured: ground mid ours #b4884d (sat .57) vs ref #b69d5d (.49); ground low #a87641 (.61) vs #957541 (.56); the near-horizon band is umbrellas/sand (#b8a380) instead of a cream haze (#e2dbcd), because our horizon sits at 36% down vs about 44%.
  2. **Midground reads as noise:** the umbrella rows melt into a blurred stripe; the reference midground (soldiers, trees, castle) stays readable but hazed.
  3. The overhead looks like candy icons rather than a painted field. The time-lapse night is too weak (no stars or moon).
